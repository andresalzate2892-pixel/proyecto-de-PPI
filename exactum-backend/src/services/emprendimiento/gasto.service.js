const sequelize = require('../../config/db');
const { Gasto, Pago } = require('../../models/emprendimiento');
const Contacto = require('../../models/emprendimiento/Contacto');
const AppError = require('../../utils/AppError');
const { assertNegocio } = require('./helpers');
const {
  round,
  validateAbono,
  validateFormaDePago,
  formatPago,
} = require('./pagos.helper');

const INCLUDE = [{ model: Pago, as: 'payments' }];

const ORDER = [
  ['createdAt', 'ASC'],
  [{ model: Pago, as: 'payments' }, 'createdAt', 'ASC'],
];

// Devuelve el gasto con la forma que espera el frontend
function format(gasto) {
  return {
    id: gasto.id,
    negocioId: gasto.negocioId,
    date: gasto.date,
    description: gasto.description,
    category: gasto.category || '',
    total: gasto.total,
    proveedorId: gasto.proveedorId || '',
    proveedorName: gasto.proveedorName || '',
    paymentType: gasto.paymentType,
    dueDate: gasto.dueDate || '',
    payments: (gasto.payments || []).map(formatPago),
  };
}

async function load(id) {
  const gasto = await Gasto.findByPk(id, { include: INCLUDE, order: ORDER });

  if (!gasto) throw new AppError('Gasto no encontrado', 404);

  return gasto;
}

async function getAll(negocioId) {
  if (!negocioId) {
    throw new AppError('El parámetro "negocioId" es obligatorio', 400);
  }

  const gastos = await Gasto.findAll({
    where: { negocioId },
    include: INCLUDE,
    order: ORDER,
  });

  return gastos.map(format);
}

async function getById(id) {
  return format(await load(id));
}

// body = { negocioId, date, description, category, total, proveedorId,
//          paymentType, dueDate }
async function create(body) {
  await assertNegocio(body.negocioId);

  const esCredito = validateFormaDePago(body, body.proveedorId, {
    contacto: 'Un gasto a crédito necesita un proveedor',
    fechaLimite:
      'La fecha límite no puede ser anterior a la fecha del gasto',
  });

  if (!body.description || !String(body.description).trim()) {
    throw new AppError('La descripción es obligatoria', 400);
  }

  const total = Number(body.total);

  if (Number.isNaN(total) || total <= 0) {
    throw new AppError('El valor debe ser mayor a 0', 400);
  }

  // Proveedor (si se indicó): debe existir y ser de este negocio
  let proveedor = null;

  if (body.proveedorId) {
    proveedor = await Contacto.findOne({
      where: {
        id: body.proveedorId,
        type: 'proveedores',
        negocioId: body.negocioId,
      },
    });

    if (!proveedor) {
      throw new AppError('El proveedor indicado no existe', 400);
    }
  }

  const gastoId = await sequelize.transaction(async (t) => {
    const gasto = await Gasto.create(
      {
        negocioId: body.negocioId,
        date: body.date,
        description: String(body.description).trim(),
        category: String(body.category || '').trim(),
        total: round(total),
        proveedorId: proveedor ? proveedor.id : null,
        proveedorName: proveedor ? proveedor.name : '',
        paymentType: esCredito ? 'Crédito' : 'Contado',
        dueDate: esCredito ? body.dueDate : null,
      },
      { transaction: t }
    );

    // De contado: queda pagado al instante. A crédito: sin abonos todavía.
    if (!esCredito) {
      await Pago.create(
        { gastoId: gasto.id, date: body.date, amount: round(total) },
        { transaction: t }
      );
    }

    return gasto.id;
  });

  return getById(gastoId);
}

async function remove(id) {
  await load(id);

  await sequelize.transaction(async (t) => {
    await Pago.destroy({ where: { gastoId: id }, transaction: t });
    await Gasto.destroy({ where: { id }, transaction: t });
  });
}

// body = { date, amount }
async function addPago(id, body) {
  const gasto = await load(id);

  const amount = validateAbono(gasto, body);

  await Pago.create({ gastoId: id, date: body.date, amount });

  return getById(id);
}

async function removePago(id, pagoId) {
  const gasto = await load(id);

  if (gasto.paymentType !== 'Crédito') {
    throw new AppError(
      'No se puede quitar el pago de un gasto de contado',
      400
    );
  }

  const pago = await Pago.findOne({ where: { id: pagoId, gastoId: id } });

  if (!pago) throw new AppError('Abono no encontrado', 404);

  await pago.destroy();

  return getById(id);
}

module.exports = { getAll, getById, create, remove, addPago, removePago };
