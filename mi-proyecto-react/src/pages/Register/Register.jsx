import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Register.css";

import {
  getUsers,
  createUser
} from "../../services/authService";

function Register() {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      form.name === "" ||
      form.email === "" ||
      form.password === ""
    ) {
      setMessage(
        "Todos los campos son obligatorios."
      );

      return;
    }

    const users = await getUsers();

    const existingUser = users.find(
      (user) =>
        user.email.toLowerCase() ===
        form.email.toLowerCase()
    );

    if (existingUser) {
      setMessage(
        "Ya existe una cuenta con este correo."
      );

      return;
    }

    await createUser({
      name: form.name,
      email: form.email,
      password: form.password
    });

    setMessage(
      "Cuenta creada correctamente."
    );

    setForm({
      name: "",
      email: "",
      password: ""
    });

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="register-page">

      <div className="register-container">

        <div className="register-header">
          <h1>EXACTUM</h1>
          <p>Crea tu cuenta</p>
        </div>

        <form
          className="register-form"
          onSubmit={handleSubmit}
        >

          <div className="form-group">

            <label htmlFor="name">
              Nombre completo
            </label>

            <input
              type="text"
              id="name"
              name="name"
              placeholder="Ingresa tu nombre"
              value={form.name}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              type="email"
              id="email"
              name="email"
              placeholder="correo@ejemplo.com"
              value={form.email}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              type="password"
              id="password"
              name="password"
              placeholder="Crea una contraseña"
              value={form.password}
              onChange={handleChange}
            />

          </div>

          <button type="submit">
            Crear cuenta
          </button>

        </form>

        {message && (
          <p className="register-message">
            {message}
          </p>
        )}

        <div className="register-login">

          <p>
            ¿Ya tienes una cuenta?
          </p>

          <Link to="/login">
            Iniciar sesión
          </Link>

        </div>

      </div>

    </div>
  );
}

export default Register;