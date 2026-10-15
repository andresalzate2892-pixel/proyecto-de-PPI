const API_URL = "http://localhost:3000/presupuestos";

export async function getBudgets(userId) {
  const response = await fetch(
    `${API_URL}?userId=${userId}`
  );

  return response.json();
}

export async function createBudget(budget) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(budget)
  });

  return response.json();
}

export async function deleteBudget(id) {
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE"
  });
}

export async function updateBudget(id, budget) {
  const response = await fetch(
    `${API_URL}/${id}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(budget)
    }
  );

  return response.json();
}