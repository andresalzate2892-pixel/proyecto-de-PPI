const API_URL = "http://localhost:3000/movimientos";

export async function getMovements(userId) {
  const response = await fetch(
    `${API_URL}?userId=${userId}`
  );

  return response.json();
}

export async function createMovement(movement) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(movement)
  });

  return response.json();
}

export async function deleteMovement(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

export async function updateMovement(id, movement) {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(movement)
    }
  );

  return response.json();
}