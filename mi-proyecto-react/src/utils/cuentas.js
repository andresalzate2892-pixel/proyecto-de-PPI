// Funciones compartidas por Ventas, Gastos y (más adelante) las cuentas
// por cobrar y por pagar. Sirven para ventas y gastos porque ambos
// guardan: total, dueDate (fecha límite) y payments (pagos / abonos).

export function todayString() {
  // Fecha de hoy en formato AAAA-MM-DD, en la hora local
  return new Date().toLocaleDateString("en-CA");
}

export function formatMoney(value) {
  const number = Number(value || 0);

  const formatted = Math.abs(number).toLocaleString("es-CO");

  // Los negativos se muestran como -$20.000
  return number < 0 ? `-$${formatted}` : `$${formatted}`;
}

export function getTotal(item) {
  return Number(item.total || 0);
}

export function getPaid(item) {
  return (item.payments || []).reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );
}

export function getBalance(item) {
  return Math.max(getTotal(item) - getPaid(item), 0);
}

// Pagada, Pendiente o Vencida (calculado automáticamente)
export function getEstado(item) {
  if (getBalance(item) <= 0) {
    return "Pagada";
  }

  if (item.dueDate && item.dueDate < todayString()) {
    return "Vencida";
  }

  return "Pendiente";
}
