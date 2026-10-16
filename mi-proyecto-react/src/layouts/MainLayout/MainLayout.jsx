import {
  Link,
  Outlet,
  useNavigate
} from "react-router-dom";

import { useEffect } from "react";

import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();

  const loggedUser =
    JSON.parse(
      localStorage.getItem("usuario")
    );

  useEffect(() => {
    if (!loggedUser) {
      navigate("/login");
    }
  }, [loggedUser, navigate]);

  if (!loggedUser) {
    return null;
  }

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="layout">

      <aside className="sidebar">

        <h2 className="logo">
          EXACTUM
        </h2>

        <nav>

          <Link to="/dashboard">
            Dashboard
          </Link>

          <Link to="/movements">
            Movimientos
          </Link>

          <Link to="/presupuestos">
            Presupuestos
          </Link>

          <Link to="/reports">
            Reportes
          </Link>

          <Link to="/perfil">
            Mi perfil
          </Link>
        </nav>

        <button
          className="logout"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>

      </aside>

      <main className="main-content">
        <Outlet />
      </main>

    </div>
  );
}

export default MainLayout;