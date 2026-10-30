// SERVICIO DE GASTOS (conectado al backend)

import { request } from "./api";

export async function getGastos(negocioId) {
  return request(
    `/gastos?negocioId=${encodeURIComponent(negocioId)}`
  );
}

// gasto = { date, description, category, total, proveedorId,
//           paymentType, dueDate }
export async function createGasto(negocioId, gasto) {
  return request("/gastos", {
    method: "POST",
    body: { ...gasto, negocioId }
  });
}

export async function deleteGasto(negocioId, id) {
  await request(`/gastos/${id}`, {
    method: "DELETE"
  });
}

// Registra un abono: pago = { date, amount }. Devuelve el gasto actualizado.
export async function addPago(negocioId, id, pago) {
  return request(`/gastos/${id}/pagos`, {
    method: "POST",
    body: pago
  });
}

// Quita un abono. Devuelve el gasto actualizado.
export async function removePago(negocioId, id, pagoId) {
  return request(`/gastos/${id}/pagos/${pagoId}`, {
    method: "DELETE"
  });
}
