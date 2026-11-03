const sequelize = require('../../config/db');
const { Venta, VentaItem, Pago } = require('../../models/emprendimiento');
const Producto = require('../../models/emprendimiento/Producto');
const Contacto = require('../../models/emprendimiento/Contacto');
const AppError = require('../../utils/AppError');
const { assertNegocio } = require('./helpers');
const {
  round,
  validateAbono,
  validateFormaDePago,
  formatPago,
} = require('./pagos.helper');

// Cómo se cargan las ventas: con su detalle y sus pagos
const INCLUDE = [
  { model: VentaItem, as: 'items' },
  { model: Pago, as: 'payments' },
];

const ORDER = [
  ['createdAt', 'ASC'],
  [{ model: VentaItem, as: 'items' }, 'position', 'ASC'],
  [{ model: Pago, as: 'payments' }, 'createdAt', 'ASC'],
];

// Devuelve la venta con la forma que espera el frontend
function format(venta) {
  return {
    id: venta.id,
    negocioId: venta.negocioId,
    date: venta.date,
    clienteId: venta.clienteId || '',
    clienteName: venta.clienteName || '',
    paymentType: venta.paymentType,
    dueDate: venta.dueDate || '',
    total: venta.total,
    items: (venta.items || []).map((item) => ({
      productoId: item.productoId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      cost: item.cost,
    })),
    payments: (venta.payments || []).map(formatPago),
  };
}

async function load(id, options = {}) {
  const venta = await Venta.findByPk(id, {
    include: INCLUDE,
    order: ORDER,
    ...options,
  });

  if (!venta) throw new AppError('Venta no encontrada', 404);

  return venta;
}

async function getAll(negocioId) {
  if (!negocioId) {
    throw new AppError('El parámetro "negocioId" es obligatorio', 400);
  }

  const ventas = await Venta.findAll({
    where: { negocioId },
    include: INCLUDE,
    order: ORDER,
  });

  return ventas.map(format);
}

async function getById(id) {
  return format(await load(id));
}

// body = { negocioId, date, clienteId, paymentType, dueDate,
//          items: [{ productoId, quantity, unitPrice }] }
async function create(body) {
  await assertNegocio(body.negocioId);

  const esCredito = validateFormaDePago(body, body.clienteId, {
    contacto: 'Una venta a crédito necesita un cliente',
    fechaLimite:
      'La fecha límite no puede ser anterior a la fecha de la venta',
  });

  if (!Array.isArray(body.items) || body.items.length === 0) {
    throw new AppError('Agrega al menos un producto a la venta', 400);
  }

  // Cliente (si se indicó): debe existir y ser de este negocio
  let cliente = null;

  if (body.clienteId) {
    cliente = await Contacto.findOne({
      where: { id: body.clienteId, type: 'clientes', negocioId: body.negocioId },
    });

    if (!cliente) {
      throw new AppError('El cliente indicado no existe', 400);
    }
  }

  // Validar cada producto de la venta y sumar lo pedido por producto
  const pedidos = {};

  for (const item of body.items) {
    const quantity = Number(item.quantity);
    const unitPrice = Number(item.unitPrice);

    if (!item.productoId) {
      throw new AppError('Falta el producto en uno de los renglones', 400);
    }

    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new AppError('La cantidad debe ser un número entero mayor a 0', 400);
    }

    if (Number.isNaN(unitPrice) || unitPrice < 0) {
      throw new AppError('El precio no es válido', 400);
    }

    pedidos[item.productoId] = (pedidos[item.productoId] || 0) + quantity;
  }

  // Todo ocurre en una transacción: si algo falla, no se descuenta nada
  const ventaId = await sequelize.transaction(async (t) => {
    const productos = {};

    for (const productoId of Object.keys(pedidos)) {
      const producto = await Producto.findOne({
        where: { id: productoId, negocioId: body.negocioId },
        transaction: t,
      });

      if (!producto) {
        throw new AppError('Uno de los productos ya no existe', 400);
      }

      if (pedidos[productoId] > producto.stock) {
        throw new AppError(
          `Stock insuficiente de "${producto.name}" (disponible: ${producto.stock})`,
          400
        );
      }

      productos[productoId] = producto;
    }

    const items = body.items.map((item, index) => ({
      productoId: item.productoId,
      name: productos[item.productoId].name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      cost: Number(productos[item.productoId].cost),
      position: index,
    }));

    const total = round(
      items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
    );

    const venta = await Venta.create(
      {
        negocioId: body.negocioId,
        date: body.date,
        clienteId: cliente ? cliente.id : null,
        clienteName: cliente ? cliente.name : '',
        paymentType: esCredito ? 'Crédito' : 'Contado',
        dueDate: esCredito ? body.dueDate : null,
        total,
      },
      { transaction: t }
    );

    for (const item of items) {
      await VentaItem.create({ ...item, ventaId: venta.id }, { transaction: t });
    }

    // De contado: queda pagada al instante. A crédito: sin abonos todavía.
    if (!esCredito) {
      await Pago.create(
        { ventaId: venta.id, date: body.date, amount: total },
        { transaction: t }
      );
    }

    // Descontar el stock
    for (const productoId of Object.keys(pedidos)) {
      await Producto.decrement('stock', {
        by: pedidos[productoId],
        where: { id: productoId },
        transaction: t,
      });

      // Doble verificación (por si dos ventas llegan al mismo tiempo)
      const actualizado = await Producto.findByPk(productoId, { transaction: t });

      if (actualizado.stock < 0) {
        throw new AppError(
          `Stock insuficiente de "${actualizado.name}"`,
          400
        );
      }
    }

    return venta.id;
  });

  return getById(ventaId);
}

// Al eliminar una venta, el stock vuelve al inventario
async function remove(id) {
  const venta = await load(id);

  await sequelize.transaction(async (t) => {
    for (const item of venta.items) {
      // Si el producto ya fue eliminado, no hay a dónde devolver el stock
      await Producto.increment('stock', {
        by: item.quantity,
        where: { id: item.productoId },
        transaction: t,
      });
    }

    await VentaItem.destroy({ where: { ventaId: id }, transaction: t });
    await Pago.destroy({ where: { ventaId: id }, transaction: t });
    await Venta.destroy({ where: { id }, transaction: t });
  });
}

// body = { date, amount }
async function addPago(id, body) {
  const venta = await load(id);

  const amount = validateAbono(venta, body);

  await Pago.create({ ventaId: id, date: body.date, amount });

  return getById(id);
}

async function removePago(id, pagoId) {
  const venta = await load(id);

  if (venta.paymentType !== 'Crédito') {
    throw new AppError(
      'No se puede quitar el pago de una venta de contado',
      400
    );
  }

  const pago = await Pago.findOne({ where: { id: pagoId, ventaId: id } });

  if (!pago) throw new AppError('Abono no encontrado', 404);

  await pago.destroy();

  return getById(id);
}

module.exports = { getAll, getById, create, remove, addPago, removePago };
