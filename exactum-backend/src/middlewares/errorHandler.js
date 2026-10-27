const AppError = require('../utils/AppError');

// 404 para rutas que no existen
function notFound(req, res, next) {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// Manejo de errores centralizado: todas las respuestas de error tienen el mismo formato
// { status: "error", message: "...", details?: [...] }
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message;
  let details = err.details;

  if (err.type === 'entity.parse.failed') {
    statusCode = 400;
    message = 'El cuerpo de la petición no es un JSON válido';
  } else if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Datos inválidos';
    details = err.errors.map((e) => e.message);
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Ya existe un registro con esos datos';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'El usuario indicado en "userId" no existe';
  } else if (!(err instanceof AppError)) {
    statusCode = 500;
  }

  if (statusCode >= 500) {
    console.error(err);
    message = 'Error interno del servidor';
    details = undefined;
  }

  const body = { status: 'error', message };
  if (details) body.details = details;
  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
