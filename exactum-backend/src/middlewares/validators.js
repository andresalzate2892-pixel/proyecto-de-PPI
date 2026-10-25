const validateBody = require('./validate');

const SPACES = ['Personal', 'Emprendimiento'];
const TYPES = ['Ingreso', 'Gasto'];

// ---------- Usuarios ----------
const usuarioRules = {
  name: { type: 'string', required: true, minLength: 2, maxLength: 100 },
  email: { type: 'email', required: true, maxLength: 150 },
  password: { type: 'string', required: true, minLength: 6, maxLength: 60, noTrim: true },
};

const loginRules = {
  email: { type: 'email', required: true },
  password: { type: 'string', required: true, noTrim: true },
};

// ---------- Movimientos ----------
const movimientoRules = {
  type: { type: 'string', required: true, oneOf: TYPES },
  date: { type: 'date', required: true },
  description: { type: 'string', required: false, maxLength: 255 },
  value: { type: 'number', required: true, positive: true },
  category: { type: 'string', required: true, maxLength: 60 },
  space: { type: 'string', required: true, oneOf: SPACES },
  userId: { type: 'string', required: true, maxLength: 20 },
};

// ---------- Presupuestos ----------
const presupuestoRules = {
  name: { type: 'string', required: true, maxLength: 100 },
  limit: { type: 'number', required: true, positive: true },
  category: { type: 'string', required: true, maxLength: 60 },
  startDate: { type: 'date', required: true },
  endDate: { type: 'date', required: true },
  space: { type: 'string', required: true, oneOf: SPACES },
  userId: { type: 'string', required: true, maxLength: 20 },
};

// Al actualizar no se permite cambiar de dueño (userId)
const withoutUserId = ({ userId, ...rest }) => rest;

module.exports = {
  // usuarios
  validateCreateUsuario: validateBody(usuarioRules),
  validatePutUsuario: validateBody(usuarioRules),
  validatePatchUsuario: validateBody(usuarioRules, { partial: true }),
  validateLogin: validateBody(loginRules),
  // movimientos
  validateCreateMovimiento: validateBody(movimientoRules),
  validatePutMovimiento: validateBody(withoutUserId(movimientoRules)),
  validatePatchMovimiento: validateBody(withoutUserId(movimientoRules), { partial: true }),
  // presupuestos
  validateCreatePresupuesto: validateBody(presupuestoRules),
  validatePutPresupuesto: validateBody(withoutUserId(presupuestoRules)),
  validatePatchPresupuesto: validateBody(withoutUserId(presupuestoRules), { partial: true }),
};
