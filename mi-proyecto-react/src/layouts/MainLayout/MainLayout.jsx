import {
  Link,
  Outlet,
  useNavigate
} from "react-router-dom";

import { useEffect } from "react";
import { useSpace } from "../../context/SpaceContext";

import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();
  const { space } = useSpace();

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

          {space === "Emprendimiento" ? (
            <>
              <Link to="/emprendimiento/dashboard">
                Dashboard
              </Link>

              <Link to="/emprendimiento/ventas">
                Ventas
              </Link>

              <Link to="/emprendimiento/gastos">
                Gastos
              </Link>

              <Link to="/emprendimiento/cuentas-por-cobrar">
                Por cobrar
              </Link>

              <Link to="/emprendimiento/cuentas-por-pagar">
                Por pagar
              </Link>

              <Link to="/emprendimiento/inventario">
                Inventario
              </Link>

              <Link to="/emprendimiento/clientes">
                Clientes
              </Link>

              <Link to="/emprendimiento/proveedores">
                Proveedores
              </Link>

              <Link to="/emprendimiento/reportes">
                Reportes
              </Link>

              <Link to="/emprendimiento/mi-negocio">
                Mi negocio
              </Link>

              <Link to="/perfil">
                Mi perfil
              </Link>
            </>
          ) : (
            <>
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
            </>
          )}

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