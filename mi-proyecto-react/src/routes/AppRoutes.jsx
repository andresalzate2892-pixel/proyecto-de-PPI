import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

import Login from "../pages/Login/Login";
import Register from "../pages/Register/Register";
import ForgotPassword from "../pages/ForgotPassword/ForgotPassword";

import Dashboard from "../pages/Dashboard/Dashboard";
import Movements from "../pages/Movements/Movements";
import Categories from "../pages/Categories/Categories";
import Presupuestos from "../pages/Presupuestos/Presupuestos";
import Reports from "../pages/Reports/Reports";
import Perfil from "../pages/Perfil/Perfil";
import EmprendimientoDashboard from "../pages/Emprendimiento/EmprendimientoDashboard/EmprendimientoDashboard";
import MiNegocio from "../pages/Emprendimiento/MiNegocio/MiNegocio";
import NegocioGate from "../components/NegocioGate/NegocioGate";
import Inventario from "../pages/Emprendimiento/Inventario/Inventario";
import Clientes from "../pages/Emprendimiento/Clientes/Clientes";
import Proveedores from "../pages/Emprendimiento/Proveedores/Proveedores";
import Ventas from "../pages/Emprendimiento/Ventas/Ventas";
import Gastos from "../pages/Emprendimiento/Gastos/Gastos";
import CuentasPorCobrar from "../pages/Emprendimiento/CuentasPorCobrar/CuentasPorCobrar";
import CuentasPorPagar from "../pages/Emprendimiento/CuentasPorPagar/CuentasPorPagar";
import EmprendimientoReportes from "../pages/Emprendimiento/EmprendimientoReportes/EmprendimientoReportes";



import MainLayout from "../layouts/MainLayout/MainLayout";

import { SpaceProvider } from "../context/SpaceContext";

function AppRoutes() {
  return (
    <BrowserRouter>
      <SpaceProvider>
        <Routes>

          <Route
            path="/"
            element={
              <Navigate to="/login" replace />
            }
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route element={<MainLayout />}>

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/movements"
              element={<Movements />}
            />

            <Route
              path="/categories"
              element={<Categories />}
            />

            <Route
              path="/presupuestos"
              element={<Presupuestos />}
            />

            <Route
              path="/reports"
              element={<Reports />}
            />

            <Route
              path="/perfil"
              element={<Perfil />}
            />

            <Route
              path="/emprendimiento/mi-negocio"
              element={<MiNegocio />}
            />

            <Route element={<NegocioGate />}>

              <Route
                path="/emprendimiento/dashboard"
                element={<EmprendimientoDashboard />}
              />

              <Route
                path="/emprendimiento/inventario"
                element={<Inventario />}
              />

              <Route
                path="/emprendimiento/clientes"
                element={<Clientes />}
              />

              <Route
                path="/emprendimiento/proveedores"
                element={<Proveedores />}
              />

              <Route
                path="/emprendimiento/ventas"
                element={<Ventas />}
              />

              <Route
                path="/emprendimiento/gastos"
                element={<Gastos />}
              />

              <Route
                path="/emprendimiento/cuentas-por-cobrar"
                element={<CuentasPorCobrar />}
              />

              <Route
                path="/emprendimiento/cuentas-por-pagar"
                element={<CuentasPorPagar />}
              />

              <Route 
                path="/emprendimiento/reportes" 
                element={<EmprendimientoReportes />} 
              />


            </Route>

          </Route>

        </Routes>
      </SpaceProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;