import { useEffect, useState, useCallback } from "react";
import { Outlet, Link } from "react-router-dom";

import { getNegocioByUser } from "../../services/negocioService";

import "./NegocioGate.css";

// Envuelve las páginas de Emprendimiento que necesitan un negocio registrado.
// Si el usuario no tiene negocio, muestra "Negocio no registrado" en vez de la página.
// Las páginas hijas pueden leer el negocio con: const { negocio } = useOutletContext();
function NegocioGate() {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadNegocio = useCallback(async () => {
    const loggedUser = JSON.parse(localStorage.getItem("usuario"));

    if (!loggedUser) {
      setLoading(false);
      return;
    }

    try {
      setError("");
      const data = await getNegocioByUser(loggedUser.id);
      setNegocio(data);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNegocio();
  }, [loadNegocio]);

  if (loading) {
    return <p className="gate-message">Cargando negocio...</p>;
  }

  if (error) {
    return (
      <div className="gate-card">
        <h2>Algo salió mal</h2>
        <p>{error}</p>
        <button onClick={loadNegocio}>Reintentar</button>
      </div>
    );
  }

  if (!negocio) {
    return (
      <div className="gate-card">
        <h2>Negocio no registrado</h2>
        <p>
          Para usar el espacio de Emprendimiento primero debes registrar tu
          negocio.
        </p>
        <Link to="/emprendimiento/mi-negocio" className="gate-link">
          Registrar mi negocio
        </Link>
      </div>
    );
  }

  return <Outlet context={{ negocio, reloadNegocio: loadNegocio }} />;
}

export default NegocioGate;
