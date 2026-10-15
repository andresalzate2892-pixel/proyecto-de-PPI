import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import "./ForgotPassword.css";

import {
  getUsers
} from "../../services/authService";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [userFound, setUserFound] =
    useState(false);

  const handleSearchUser = async (e) => {
    e.preventDefault();

    setMessage("");

    if (email === "") {
      setMessage(
        "Ingresa tu correo electrónico."
      );
      return;
    }

    const users = await getUsers();

    const user = users.find(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!user) {
      setMessage(
        "No existe una cuenta con este correo."
      );
      setUserFound(false);
      return;
    }

    setUserFound(true);

    setMessage(
      "Usuario encontrado. Ingresa una nueva contraseña."
    );
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (newPassword === "") {
      setMessage(
        "Ingresa una nueva contraseña."
      );
      return;
    }

    const users = await getUsers();

    const user = users.find(
      (user) =>
        user.email.toLowerCase() ===
        email.trim().toLowerCase()
    );

    if (!user) {
      setMessage(
        "No se encontró el usuario."
      );
      return;
    }

    await fetch(
      `http://localhost:3000/usuarios/${user.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          password: newPassword
        })
      }
    );

    setMessage(
      "Contraseña actualizada correctamente."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="forgot-password-page">

      <div className="forgot-password-container">

        <div className="forgot-password-header">

          <h1>
            EXACTUM
          </h1>

          <p>
            Recuperar contraseña
          </p>

        </div>

        {!userFound ? (

          <form
            className="forgot-password-form"
            onSubmit={handleSearchUser}
          >

            <div className="form-group">

              <label>
                Correo electrónico
              </label>

              <input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) =>
                  setEmail(
                    e.target.value
                  )
                }
              />

            </div>

            <button type="submit">
              Buscar cuenta
            </button>

          </form>

        ) : (

          <form
            className="forgot-password-form"
            onSubmit={
              handleChangePassword
            }
          >

            <div className="form-group">

              <label>
                Nueva contraseña
              </label>

              <input
                type="password"
                placeholder="Ingresa tu nueva contraseña"
                value={newPassword}
                onChange={(e) =>
                  setNewPassword(
                    e.target.value
                  )
                }
              />

            </div>

            <button type="submit">
              Cambiar contraseña
            </button>

          </form>

        )}

        {message && (
          <p className="forgot-password-message">
            {message}
          </p>
        )}

        <div className="forgot-password-login">

          <Link to="/login">
            Volver al inicio de sesión
          </Link>

        </div>

      </div>

    </div>
  );
}

export default ForgotPassword;