const { Movimiento } = require('../models');
const AppError = require('../utils/AppError');

// Filtros permitidos en GET /movimientos?userId=...&space=...
const FILTERS = ['userId', 'space', 'type', 'category'];

async function list(query = {}) {
  const where = {};
  for (const key of FILTERS) {
    if (query[key]) where[key] = query[key];
  }
  return Movimiento.findAll({ where, order: [['createdAt', 'ASC']] });
}

async function getById(id) {
  const movimiento = await Movimiento.findByPk(id);
  if (!movimiento) throw new AppError('Movimiento no encontrado', 404);
  return movimiento;
}

async function create(data) {
  return Movimiento.create(data);
}

async function update(id, data) {
  const movimiento = await getById(id);
  await movimiento.update(data);
  return movimiento;
}

async function remove(id) {
  const movimiento = await getById(id);
  await movimiento.destroy();
}

module.exports = { list, getById, create, update, remove };
