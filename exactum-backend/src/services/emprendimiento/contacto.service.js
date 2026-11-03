const Contacto = require('../../models/emprendimiento/Contacto');
const AppError = require('../../utils/AppError');
const { assertNegocio } = require('./helpers');

const CAMPOS = ['name', 'document', 'phone', 'email', 'address', 'notes'];

function validate(c) {
  if (!c.name || !String(c.name).trim()) {
    throw new AppError('El nombre es obligatorio', 400);
  }

  if (c.email && !/^\S+@\S+\.\S+$/.test(c.email)) {
    throw new AppError('El correo no es válido', 400);
  }
}

function normalize(c) {
  return {
    name: String(c.name).trim(),
    document: String(c.document || '').trim(),
    phone: String(c.phone || '').trim(),
    email: String(c.email || '').trim(),
    address: String(c.address || '').trim(),
    notes: String(c.notes || '').trim(),
  };
}

function pick(body) {
  const data = {};
  for (const campo of CAMPOS) {
    if (body[campo] !== undefined) data[campo] = body[campo];
  }
  return data;
}

// Todas las funciones reciben "type": "clientes" o "proveedores"

async function getAll(type, negocioId) {
  if (!negocioId) {
    throw new AppError('El parámetro "negocioId" es obligatorio', 400);
  }

  return Contacto.findAll({
    where: { type, negocioId },
    order: [['createdAt', 'ASC']],
  });
}

async function getById(type, id) {
  const contacto = await Contacto.findOne({ where: { id, type } });
  if (!contacto) throw new AppError('Registro no encontrado', 404);
  return contacto;
}

async function create(type, body) {
  await assertNegocio(body.negocioId);

  const data = pick(body);

  validate(data);

  return Contacto.create({
    ...normalize(data),
    type,
    negocioId: body.negocioId,
  });
}

async function update(type, id, body) {
  const contacto = await getById(type, id);

  const merged = { ...contacto.toJSON(), ...pick(body) };

  validate(merged);

  return contacto.update(normalize(merged));
}

async function remove(type, id) {
  const contacto = await getById(type, id);
  await contacto.destroy();
}

module.exports = { getAll, getById, create, update, remove };
