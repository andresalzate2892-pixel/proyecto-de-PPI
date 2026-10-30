import { useEffect, useState } from "react";
import { Navigate, useOutletContext } from "react-router-dom";

import "../Emprendimiento.css";
import "./EmprendimientoDashboard.css";

import { useSpace } from "../../../context/SpaceContext";

import LineChart from "../../../components/Charts/LineChart";
import DonutChart from "../../../components/Charts/DonutChart";

import { getVentas } from "../../../services/ventaService";
import { getGastos } from "../../../services/gastoService";
import { getProductos } from "../../../services/productoService";

import {
  todayString,
  formatMoney,
  getBalance,
  getEstado
} from "../../../utils/cuentas";

import {
  lastDays,
  monthStartString,
  shortDayLabel
} from "../../../utils/fechas";

function getStockStatus(producto) {
  if (producto.stock <= 0) {
    return "Agotado";
  }

  if (producto.stock <= producto.minStock) {
    return "Bajo";
  }

  return "Disponible";
}

const STATUS_ORDER = { Agotado: 0, Bajo: 1, Disponible: 2 };

function EmprendimientoDashboard() {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const { space, setSpace } = useSpace();

  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const [ventasData, gastosData, productosData] =
        await Promise.all([
          getVentas(negocio.id),
          getGastos(negocio.id),
          getProductos(negocio.id)
        ]);

      setVentas(ventasData);
      setGastos(gastosData);
      setProductos(productosData);
      setLoading(false);
    };

    loadData();
  }, [negocio.id]);

  const loggedUser = JSON.parse(localStorage.getItem("usuario"));

  const userName = loggedUser?.name || loggedUser?.nombre || "";

  // Si el usuario vuelve a Personal, lo mandamos al dashboard personal
  if (space !== "Emprendimiento") {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSpaceChange = (e) => {
    setSpace(e.target.value);
  };

  if (loading) {
    return <p>Cargando dashboard...</p>;
  }

  const today = todayString();
  const monthStart = monthStartString();

  const sum = (list) =>
    list.reduce((total, item) => total + item.total, 0);

  const ventasHoy = sum(ventas.filter((v) => v.date === today));

  const ventasMes = sum(
    ventas.filter((v) => v.date >= monthStart && v.date <= today)
  );

  const gastosMes = sum(
    gastos.filter((g) => g.date >= monthStart && g.date <= today)
  );

  const costoVendidoMes = ventas
  .filter((v) => v.date >= monthStart && v.date <= today)
  .reduce(
    (total, v) =>
      total + v.items.reduce((s, i) => s + i.quantity * (i.cost || 0), 0),
    0
  );

  const utilidadMes = ventasMes - costoVendidoMes;

  // Tendencia de los últimos 7 días
  const trend = lastDays(7).map((day) => ({
    label: shortDayLabel(day),
    value: sum(ventas.filter((v) => v.date === day))
  }));

  // Gastos del mes por categoría
  const gastosPorCategoria = Object.entries(
    gastos
      .filter((g) => g.date >= monthStart && g.date <= today)
      .reduce((groups, gasto) => {
        const category = gasto.category || "Sin categoría";

        groups[category] = (groups[category] || 0) + gasto.total;

        return groups;
      }, {})
  ).map(([label, value]) => ({ label, value }));

  // Cuentas
  const porCobrar = ventas.reduce(
    (total, v) => total + getBalance(v),
    0
  );

  const porPagar = gastos.reduce(
    (total, g) => total + getBalance(g),
    0
  );

  const vencidasCobrar = ventas.filter(
    (v) => getEstado(v) === "Vencida"
  ).length;

  const vencidasPagar = gastos.filter(
    (g) => getEstado(g) === "Vencida"
  ).length;

  // Inventario: primero lo que necesita atención
  const stockAlert = productos.filter(
    (p) => getStockStatus(p) !== "Disponible"
  ).length;

  const productosOrdenados = [...productos]
    .sort(
      (a, b) =>
        STATUS_ORDER[getStockStatus(a)] -
          STATUS_ORDER[getStockStatus(b)] || a.stock - b.stock
    )
    .slice(0, 6);

  return (
    <div className="emp-page">

      <div className="emp-header">

        <div>
          <h1>Hola, {userName} </h1>

          <p>
            Resumen de <strong>{negocio.name}</strong>
          </p>
        </div>

        <div className="emp-space-selector">

          <label htmlFor="emp-space">
            Espacio financiero
          </label>

          <select
            id="emp-space"
            value={space}
            onChange={handleSpaceChange}
          >
            <option value="Personal">Personal</option>
            <option value="Emprendimiento">
              Emprendimiento
            </option>
          </select>

        </div>

      </div>

      <div className="dsh-stats">

        <div className="dsh-stat">
          <span>Ventas de hoy</span>
          <strong>{formatMoney(ventasHoy)}</strong>
        </div>

        <div className="dsh-stat">
         <span>Ventas del mes</span>
         <strong>{formatMoney(ventasMes)}</strong>
        </div>

        <div className="dsh-stat">
         <span>Gastos del mes</span>
         <strong>{formatMoney(gastosMes)}</strong>
        </div>

        <div className="dsh-stat">
         <span>Utilidad del mes</span>
          <strong className={utilidadMes < 0 ? "dsh-negative" : ""}>
           {formatMoney(utilidadMes)}
          </strong>
        </div>

      </div>

      <div className="dsh-charts">

        <div className="emp-card">
          <h2>Tendencia de ventas</h2>

          <p className="dsh-subtitle">Últimos 7 días</p>

          <LineChart data={trend} />
        </div>

        <div className="emp-card">
          <h2>Gastos por categoría</h2>

          <p className="dsh-subtitle">Este mes</p>

          <DonutChart
            data={gastosPorCategoria}
            centerLabel="Gastos por categoría"
          />
        </div>

      </div>

      <div className="dsh-alerts">

        <div className="dsh-alert">
          <span>Por cobrar</span>
          <strong>{formatMoney(porCobrar)}</strong>
          {vencidasCobrar > 0 && (
            <small className="dsh-warning">
              {vencidasCobrar}{" "}
              {vencidasCobrar === 1 ? "vencida" : "vencidas"}
            </small>
          )}
        </div>

        <div className="dsh-alert">
          <span>Por pagar</span>
          <strong>{formatMoney(porPagar)}</strong>
          {vencidasPagar > 0 && (
            <small className="dsh-warning">
              {vencidasPagar}{" "}
              {vencidasPagar === 1 ? "vencida" : "vencidas"}
            </small>
          )}
        </div>

        <div className="dsh-alert">
          <span>Productos con stock bajo o agotado</span>
          <strong>{stockAlert}</strong>
          <small>de {productos.length} productos</small>
        </div>

      </div>

      <div className="emp-card">

        <h2>Estado del inventario</h2>

        {productosOrdenados.length === 0 ? (

          <p>Aún no has agregado productos.</p>

        ) : (

          <div className="tx-table-wrapper">

            <table className="dsh-table">

              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>

              <tbody>

                {productosOrdenados.map((producto) => {
                  const status = getStockStatus(producto);

                  return (
                    <tr key={producto.id}>
                      <td>{producto.name}</td>
                      <td>{producto.category || "—"}</td>
                      <td>{formatMoney(producto.price)}</td>
                      <td>{producto.stock}</td>
                      <td>
                        <span
                          className={`dsh-status dsh-status-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default EmprendimientoDashboard;
