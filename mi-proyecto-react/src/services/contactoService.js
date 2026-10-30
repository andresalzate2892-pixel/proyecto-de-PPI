// SERVICIO DE CONTACTOS: clientes y proveedores (conectado al backend)
//
// El parámetro "tipo" es "clientes" o "proveedores" y coincide con la
// ruta de la API: /clientes y /proveedores.

import { request } from "./api";

export async function getContactos(negocioId, tipo) {
  return request(
    `/${tipo}?negocioId=${encodeURIComponent(negocioId)}`
  );
}

export async function createContacto(negocioId, tipo, contacto) {
  return request(`/${tipo}`, {
    method: "POST",
    body: { ...contacto, negocioId }
  });
}

export async function updateContacto(negocioId, tipo, id, contacto) {
  return request(`/${tipo}/${id}`, {
    method: "PATCH",
    body: contacto
  });
}

export async function deleteContacto(negocioId, tipo, id) {
  await request(`/${tipo}/${id}`, {
    method: "DELETE"
  });
}
