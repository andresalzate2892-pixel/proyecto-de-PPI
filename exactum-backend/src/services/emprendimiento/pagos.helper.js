const AppError = require('../../utils/AppError');

// Redondea a 2 decimales para evitar errores de coma flotante
function round(value) {
  return Math.round(Number(value) * 100) / 100;
}

function sumPagos(payments) {
  return round((payments || []).reduce((t, p) => t + Number(p.amount), 0));
}

function getBalance(total, payments) {
  return Math.max(round(Number(total) - sumPagos(payments)), 0);
}

// Valida un abono. "registro" es la venta o el gasto (con sus pagos).
function validateAbono(registro, body) {
  if (registro.paymentType !== 'Crédito') {
    throw new AppError('Solo se pueden registrar abonos en cuentas a crédito', 400);
  }

  const amount = Number(body.amount);

  if (Number.isNaN(amount) || amount <= 0) {
    throw new AppError('El abono debe ser mayor a 0', 400);
  }

  if (round(amount) > getBalance(registro.total, registro.payments)) {
    throw new AppError('El abono no puede ser mayor al saldo pendiente', 400);
  }

  if (!body.date) {
    throw new AppError('La fecha del abono es obligatoria', 400);
  }

  if (body.date < registro.date) {
    throw new AppError(
      'La fecha del abono no puede ser anterior a la fecha del registro',
      400
    );
  }

  return round(amount);
}

// Valida lo que tienen en común una venta y un gasto: fecha, forma de pago,
// contacto (cliente o proveedor) y fecha límite si es a crédito.
// messages = { contacto, fechaLimite }
function validateFormaDePago(body, contactoId, messages) {
  if (!body.date) {
    throw new AppError('La fecha es obligatoria', 400);
  }

  const esCredito = body.paymentType === 'Crédito';

  if (esCredito) {
    if (!contactoId) {
      throw new AppError(messages.contacto, 400);
    }

    if (!body.dueDate) {
      throw new AppError('Indica la fecha límite de pago', 400);
    }

    if (body.dueDate < body.date) {
      throw new AppError(messages.fechaLimite, 400);
    }
  }

  return esCredito;
}

// Formato de un pago hacia el frontend
function formatPago(pago) {
  return { id: pago.id, date: pago.date, amount: pago.amount };
}

module.exports = {
  round,
  sumPagos,
  getBalance,
  validateAbono,
  validateFormaDePago,
  formatPago,
};
