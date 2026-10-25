const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {
  if (!DATE_REGEX.test(value)) return false;
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

/**
 * Valida y limpia req.body según unas reglas.
 * rules = { campo: { type: 'string'|'number'|'date'|'email', required, min, max, minLength, maxLength, oneOf, positive } }
 * - Solo deja pasar los campos definidos en las reglas (evita que envíen "id", etc.).
 * - partial = true  → los campos son opcionales (PATCH), pero al menos uno debe venir.
 */
function validateBody(rules, { partial = false } = {}) {
  return (req, res, next) => {
    const body = req.body && typeof req.body === 'object' ? req.body : {};
    const errors = [];
    const clean = {};

    for (const [field, rule] of Object.entries(rules)) {
      let value = body[field];

      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        if (rule.required && !partial) errors.push(`El campo "${field}" es obligatorio`);
        else if (!rule.required && value !== undefined) clean[field] = null;
        continue;
      }

      switch (rule.type) {
        case 'number': {
          const num = typeof value === 'string' ? Number(value) : value;
          if (typeof num !== 'number' || !Number.isFinite(num)) {
            errors.push(`El campo "${field}" debe ser un número`);
            continue;
          }
          if (rule.positive && num <= 0) {
            errors.push(`El campo "${field}" debe ser mayor que 0`);
            continue;
          }
          value = num;
          break;
        }
        case 'date':
          if (typeof value !== 'string' || !isValidDate(value)) {
            errors.push(`El campo "${field}" debe ser una fecha válida con formato YYYY-MM-DD`);
            continue;
          }
          break;
        case 'email':
          if (typeof value !== 'string' || !EMAIL_REGEX.test(value.trim())) {
            errors.push(`El campo "${field}" debe ser un correo válido`);
            continue;
          }
          value = value.trim().toLowerCase();
          break;
        default: // string
          if (typeof value !== 'string') {
            errors.push(`El campo "${field}" debe ser texto`);
            continue;
          }
          if (!rule.noTrim) value = value.trim();
          if (rule.minLength && value.length < rule.minLength) {
            errors.push(`El campo "${field}" debe tener al menos ${rule.minLength} caracteres`);
            continue;
          }
          if (rule.maxLength && value.length > rule.maxLength) {
            errors.push(`El campo "${field}" no puede superar ${rule.maxLength} caracteres`);
            continue;
          }
          if (rule.oneOf && !rule.oneOf.includes(value)) {
            errors.push(`El campo "${field}" debe ser uno de: ${rule.oneOf.join(', ')}`);
            continue;
          }
      }

      clean[field] = value;
    }

    if (errors.length > 0) {
      return next(new AppError('Datos inválidos', 400, errors));
    }

    if (partial && Object.keys(clean).length === 0) {
      return next(new AppError('Debes enviar al menos un campo para actualizar', 400));
    }

    req.body = clean;
    next();
  };
}

module.exports = validateBody;
