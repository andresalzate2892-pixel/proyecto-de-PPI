// SERVICIO DE VENTAS (conectado al backend)
//
// El backend se encarga de descontar el stock al crear una venta, de
// devolverlo al eliminarla y de guardar los abonos.

import { request } from "./api";

export async function getVentas(negocioId) {
  return request(
    `/ventas?negocioId=${encodeURIComponent(negocioId)}`
  );
}

// venta = { date, clienteId, paymentType, dueDate,
//           items: [{ productoId, quantity, unitPrice }] }
export async function createVenta(negocioId, venta) {
  return request("/ventas", {
    method: "POST",
    body: { ...venta, negocioId }
  });
}

// Al eliminar una venta, el stock vuelve al inventario
export async function deleteVenta(negocioId, id) {
  await request(`/ventas/${id}`, {
    method: "DELETE"
  });
}

// Registra un abono: pago = { date, amount }. Devuelve la venta actualizada.
export async function addPago(negocioId, id, pago) {
  return request(`/ventas/${id}/pagos`, {
    method: "POST",
    body: pago
  });
}

// Quita un abono. Devuelve la venta actualizada.
export async function removePago(negocioId, id, pagoId) {
  return request(`/ventas/${id}/pagos/${pagoId}`, {
    method: "DELETE"
  });
}
