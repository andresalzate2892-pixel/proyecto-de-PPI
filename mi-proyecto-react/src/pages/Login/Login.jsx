import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./Login.css";

import { loginUser } from "../../services/authService";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
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

    setMessage("");

    if (
      form.email === "" ||
      form.password === ""
    ) {
      setMessage(
        "Ingresa tu correo y contraseña."
      );
      return;
    }

    const user = await loginUser(
      form.email.trim(),
      form.password
    );

    if (!user) {
      localStorage.removeItem("usuario");

      setMessage(
        "Correo o contraseña incorrectos."
      );

      return;
    }

    localStorage.removeItem("usuario");

    localStorage.setItem(
      "usuario",
      JSON.stringify(user)
    );

    navigate("/dashboard");
  };

  return (
    <div className="login-page">

      <div className="login-container">

        <div className="login-header">

          <h1>
            EXACTUM
          </h1>

          <p>
            Organiza tus finanzas de forma sencilla
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

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
              placeholder="Ingresa tu contraseña"
              value={form.password}
              onChange={handleChange}
            />

          </div>

          <button type="submit">
            Iniciar sesión
          </button>

          {message && (
            <p className="login-message">
              {message}
            </p>
          )}

          <Link to="/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>

          <Link to="/register">
            ¿No tienes una cuenta? Crear cuenta
          </Link>

        </form>

      </div>

    </div>
  );
}

export default Login;