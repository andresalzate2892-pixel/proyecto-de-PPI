const { Presupuesto } = require('../models');
const AppError = require('../utils/AppError');

// Filtros permitidos en GET /presupuestos?userId=...&space=...
const FILTERS = ['userId', 'space', 'category'];

function checkDates(startDate, endDate) {
  if (startDate && endDate && endDate < startDate) {
    throw new AppError('La fecha final no puede ser anterior a la fecha inicial', 400);
  }
}

async function list(query = {}) {
  const where = {};
  for (const key of FILTERS) {
    if (query[key]) where[key] = query[key];
  }
  return Presupuesto.findAll({ where, order: [['createdAt', 'ASC']] });
}

async function getById(id) {
  const presupuesto = await Presupuesto.findByPk(id);
  if (!presupuesto) throw new AppError('Presupuesto no encontrado', 404);
  return presupuesto;
}

async function create(data) {
  checkDates(data.startDate, data.endDate);
  return Presupuesto.create(data);
}

async function update(id, data) {
  const presupuesto = await getById(id);
  checkDates(data.startDate || presupuesto.startDate, data.endDate || presupuesto.endDate);
  await presupuesto.update(data);
  return presupuesto;
}

async function remove(id) {
  const presupuesto = await getById(id);
  await presupuesto.destroy();
}

module.exports = { list, getById, create, update, remove };
