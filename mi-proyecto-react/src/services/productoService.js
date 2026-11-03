// SERVICIO DE PRODUCTOS (conectado al backend)

import { request } from "./api";

export async function getProductos(negocioId) {
  return request(
    `/productos?negocioId=${encodeURIComponent(negocioId)}`
  );
}

export async function createProducto(negocioId, producto) {
  return request("/productos", {
    method: "POST",
    body: { ...producto, negocioId }
  });
}

export async function updateProducto(negocioId, id, producto) {
  return request(`/productos/${id}`, {
    method: "PATCH",
    body: producto
  });
}

export async function deleteProducto(negocioId, id) {
  await request(`/productos/${id}`, {
    method: "DELETE"
  });
}
