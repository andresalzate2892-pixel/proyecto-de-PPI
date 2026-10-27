const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');
const AppError = require('../utils/AppError');

async function list() {
  return Usuario.findAll({ order: [['createdAt', 'ASC']] });
}

async function getById(id) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) throw new AppError('Usuario no encontrado', 404);
  return usuario;
}

async function create({ name, email, password }) {
  const existing = await Usuario.findOne({ where: { email } });
  if (existing) throw new AppError('El correo ya está registrado', 409);

  const hash = await bcrypt.hash(password, 10);
  const usuario = await Usuario.create({ name, email, password: hash });
  // Se vuelve a consultar para devolverlo sin la contraseña
  return Usuario.findByPk(usuario.id);
}

async function update(id, data) {
  const usuario = await getById(id);

  if (data.email && data.email !== usuario.email) {
    const existing = await Usuario.findOne({ where: { email: data.email } });
    if (existing) throw new AppError('El correo ya está registrado', 409);
  }
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  await usuario.update(data);
  return Usuario.findByPk(id);
}

async function remove(id) {
  const usuario = await getById(id);
  await usuario.destroy();
}

async function login(email, password) {
  const usuario = await Usuario.scope('withPassword').findOne({ where: { email } });
  const ok = usuario && (await bcrypt.compare(password, usuario.password));
  if (!ok) throw new AppError('Correo o contraseña incorrectos', 401);
  return Usuario.findByPk(usuario.id);
}

module.exports = { list, getById, create, update, remove, login };
