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

          </Route>

        </Routes>
      </SpaceProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;