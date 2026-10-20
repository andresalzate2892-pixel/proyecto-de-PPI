import { useEffect, useState } from "react";
import "./Perfil.css";

function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem("usuario");

    if (usuarioGuardado) {
      try {
        const datos = JSON.parse(usuarioGuardado);

        setUsuario(datos);
        setNombre(datos.nombre || datos.name || "");
        setCorreo(datos.email || datos.correo || "");
      } catch (error) {
        console.error("Error al leer el usuario:", error);
      }
    }
  }, []);

  const guardarCambios = (e) => {
    e.preventDefault();
    setMensaje("");

    if (!usuario) {
      setMensaje("No se encontró una sesión de usuario.");
      return;
    }

    const usuarioActualizado = {
      ...usuario,
      nombre: nombre.trim(),
      email: correo.trim()
    };

    localStorage.setItem(
      "usuario",
      JSON.stringify(usuarioActualizado)
    );

    setUsuario(usuarioActualizado);
    setMensaje(
      "Cambios guardados en esta sesión del navegador."
    );
  };

  if (!usuario) {
    return (
      <div className="perfil-container">
        <h1>Mi perfil</h1>
        <p>No se encontraron datos de usuario. Inicia sesión nuevamente.</p>
      </div>
    );
  }

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <div className="perfil-avatar">
          {(nombre || correo || "U").charAt(0).toUpperCase()}
        </div>

        <div>
          <h1>Mi perfil</h1>
          <p>Administra tu información personal en EXACTUM.</p>
        </div>
      </div>

      <form className="perfil-form" onSubmit={guardarCambios}>
        <h2>Información personal</h2>

        <div className="perfil-campo">
          <label htmlFor="perfil-nombre">Nombre</label>
          <input
            id="perfil-nombre"
            type="text"
            maxLength="50"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>

        <div className="perfil-campo">
          <label htmlFor="perfil-correo">Correo electrónico</label>
          <input
            id="perfil-correo"
            type="email"
            maxLength="50"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="perfil-guardar">
          Guardar cambios
        </button>

        {mensaje && (
          <p className="perfil-mensaje" role="status">
            {mensaje}
          </p>
        )}
      </form>

      <section className="perfil-seguridad">
        <h2>Seguridad</h2>
        <p>
          Para cambiar la contraseña, primero debemos revisar
          cómo funciona el servicio de autenticación de EXACTUM.
        </p>
      </section>
    </div>
  );
}

export default Perfil;