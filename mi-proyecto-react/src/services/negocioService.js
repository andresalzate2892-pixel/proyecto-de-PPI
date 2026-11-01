// SERVICIO DE NEGOCIO (conectado al backend)

import { request } from "./api";

// Devuelve el negocio del usuario, o null si todavía no ha registrado uno
export async function getNegocioByUser(userId) {
  const data = await request(
    `/negocios?userId=${encodeURIComponent(userId)}`
  );

  return data.length > 0 ? data[0] : null;
}

export async function createNegocio(negocio) {
  return request("/negocios", {
    method: "POST",
    body: negocio
  });
}

export async function updateNegocio(id, negocio) {
  return request(`/negocios/${id}`, {
    method: "PATCH",
    body: negocio
  });
}
