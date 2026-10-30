// Dirección de tu backend (el de exactum-backend, puerto 3000)
export const API_URL = "http://localhost:3000";

// Función común para llamar a la API.
// - Convierte el cuerpo a JSON.
// - Si el servidor responde con error, lanza un Error con su mensaje
//   (las pantallas ya muestran ese mensaje al usuario).
export async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor");
  }

  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.details?.join(", ") ||
        data?.message ||
        "Ocurrió un error en el servidor"
    );
  }

  return data;
}
