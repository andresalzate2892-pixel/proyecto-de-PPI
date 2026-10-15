const API_URL = "http://localhost:3000/usuarios";

export async function getUsers() {
  const response = await fetch(API_URL);
  return response.json();
}

export async function createUser(user) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(user)
  });

  return response.json();
}

export async function loginUser(email, password) {
  const users = await getUsers();

  const user = users.find(
    (user) =>
      user.email === email &&
      user.password === password
  );

  return user || null;
}