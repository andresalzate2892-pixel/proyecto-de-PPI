const sequelize = require('../../config/db');
const Negocio = require('../../models/emprendimiento/Negocio');
const AppError = require('../../utils/AppError');

const CAMPOS = ['name', 'activity', 'nit', 'address', 'phone', 'email', 'startDate'];

// Solo deja pasar los campos permitidos y convierte "" en null
function limpiar(body) {
  const data = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) {
      data[campo] = typeof body[campo] === 'string' ? body[campo].trim() : body[campo];
      if (data[campo] === '') data[campo] = null;
    }
  }
  return data;
}

async function getAll(userId) {
  const where = userId ? { userId } : undefined;
  return Negocio.findAll({ where });
}

async function getById(id) {
  const negocio = await Negocio.findByPk(id);
  if (!negocio) throw new AppError('Negocio no encontrado', 404);
  return negocio;
}

async function create(body) {
  if (!body.userId) throw new AppError('El campo "userId" es obligatorio', 400);

  if (!body.name || !String(body.name).trim()) {
    throw new AppError('El nombre del negocio es obligatorio', 400);
  }
  if (!body.activity || !String(body.activity).trim()) {
    throw new AppError('El tipo de actividad es obligatorio', 400);
  }

  // Verifica que el usuario exista (el modelo Usuario ya está definido en Sequelize)
  const usuario = await sequelize.models.Usuario.findByPk(body.userId);
  if (!usuario) throw new AppError('El usuario indicado en "userId" no existe', 400);

  const existente = await Negocio.findOne({ where: { userId: body.userId } });
  if (existente) throw new AppError('Este usuario ya tiene un negocio registrado', 409);

  return Negocio.create({ ...limpiar(body), userId: body.userId });
}

async function update(id, body) {
  const negocio = await getById(id);
  // userId no se puede cambiar
  return negocio.update(limpiar(body));
}

async function remove(id) {
  const negocio = await getById(id);
  await negocio.destroy();
}

module.exports = { getAll, getById, create, update, remove };
