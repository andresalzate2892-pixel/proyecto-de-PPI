const Producto = require('../../models/emprendimiento/Producto');
const AppError = require('../../utils/AppError');
const { assertNegocio } = require('./helpers');

const CAMPOS = ['name', 'category', 'price', 'cost', 'stock', 'minStock'];

function validate(p) {
  if (!p.name || !String(p.name).trim()) {
    throw new AppError('El nombre del producto es obligatorio', 400);
  }

  const price = Number(p.price);
  const cost = Number(p.cost || 0);
  const stock = Number(p.stock);
  const minStock = Number(p.minStock);

  if (Number.isNaN(price) || price < 0) {
    throw new AppError('El precio de venta no es válido', 400);
  }

  if (Number.isNaN(cost) || cost < 0) {
    throw new AppError('El costo no es válido', 400);
  }

  if (!Number.isInteger(stock) || stock < 0) {
    throw new AppError('El stock debe ser un número entero mayor o igual a 0', 400);
  }

  if (!Number.isInteger(minStock) || minStock < 0) {
    throw new AppError(
      'El stock mínimo debe ser un número entero mayor o igual a 0',
      400
    );
  }
}

function normalize(p) {
  return {
    name: String(p.name).trim(),
    category: String(p.category || '').trim(),
    price: Number(p.price),
    cost: Number(p.cost || 0),
    stock: Number(p.stock),
    minStock: Number(p.minStock),
  };
}

// Solo deja pasar los campos permitidos
function pick(body) {
  const data = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
}

async function getAll(negocioId) {
  if (!negocioId) {
    throw new AppError('El parámetro "negocioId" es obligatorio', 400);
  }

  return Producto.findAll({
    where: { negocioId },
    order: [['createdAt', 'ASC']],
  });
}

async function getById(id) {
  const producto = await Producto.findByPk(id);
  if (!producto) throw new AppError('Producto no encontrado', 404);
  return producto;
}

async function create(body) {
  await assertNegocio(body.negocioId);

  const data = {
    minStock: 5,
    cost: 0,
    ...pick(body),
  };

  validate(data);

  return Producto.create({ ...normalize(data), negocioId: body.negocioId });
}

async function update(id, body) {
  const producto = await getById(id);

  // Se combina lo que ya existe con lo que llega (por ejemplo, solo { stock })
  const merged = { ...producto.toJSON(), ...pick(body) };

  validate(merged);

  return producto.update(normalize(merged));
}

async function remove(id) {
  const producto = await getById(id);
  await producto.destroy();
}

module.exports = { getAll, getById, create, update, remove };
