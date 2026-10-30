import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../Emprendimiento.css";
import "../Transacciones.css";
import "./EmprendimientoReportes.css";

import { getVentas } from "../../../services/ventaService";
import { getGastos } from "../../../services/gastoService";

import {
  todayString,
  formatMoney,
  getBalance
} from "../../../utils/cuentas";

import { monthStartString } from "../../../utils/fechas";

// Suma los valores por clave y devuelve [{ name, value, extra }]
// ordenado de mayor a menor
function groupBy(list, getName, getValue, getExtra) {
  const groups = {};

  list.forEach((item) => {
    const name = getName(item);

    if (!name) {
      return;
    }

    if (!groups[name]) {
      groups[name] = { name, value: 0, extra: 0 };
    }

    groups[name].value += getValue(item);
    groups[name].extra += getExtra ? getExtra(item) : 0;
  });

  return Object.values(groups).sort((a, b) => b.value - a.value);
}

function RankingTable({ title, nameLabel, rows, extraLabel }) {
  return (
    <div className="emp-card">

      <h2>{title}</h2>

      {rows.length === 0 ? (

        <p>No hay datos en este período.</p>

      ) : (

        <table className="rep-table">

          <thead>
            <tr>
              <th>{nameLabel}</th>
              {extraLabel && <th>{extraLabel}</th>}
              <th>Valor</th>
            </tr>
          </thead>

          <tbody>
            {rows.slice(0, 5).map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                {extraLabel && <td>{row.extra}</td>}
                <td>{formatMoney(row.value)}</td>
              </tr>
            ))}
          </tbody>

        </table>

      )}

    </div>
  );
}

function EmprendimientoReportes() {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [from, setFrom] = useState(monthStartString());
  const [to, setTo] = useState(todayString());

  useEffect(() => {
    const loadData = async () => {
      const [ventasData, gastosData] = await Promise.all([
        getVentas(negocio.id),
        getGastos(negocio.id)
      ]);

      setVentas(ventasData);
      setGastos(gastosData);
      setLoading(false);
    };

    loadData();
  }, [negocio.id]);

  if (loading) {
    return <p>Cargando reportes...</p>;
  }

  const invalidRange = from && to && from > to;

  const inRange = (item) =>
    (!from || item.date >= from) && (!to || item.date <= to);

  const ventasRango = invalidRange ? [] : ventas.filter(inRange);
  const gastosRango = invalidRange ? [] : gastos.filter(inRange);

  const totalVentas = ventasRango.reduce((s, v) => s + v.total, 0);
  const totalGastos = gastosRango.reduce((s, g) => s + g.total, 0);
  const balance = totalVentas - totalGastos;

  // Una fila por producto vendido (sumando todas las ventas)
  const itemsVendidos = ventasRango.flatMap((venta) => venta.items);

  const topProductos = groupBy(
    itemsVendidos,
    (item) => item.name,
    (item) => item.quantity * item.unitPrice,
    (item) => item.quantity
  );

  const topClientes = groupBy(
    ventasRango,
    (venta) => venta.clienteName,
    (venta) => venta.total,
    () => 1
  );

  const gastosPorCategoria = groupBy(
    gastosRango,
    (gasto) => gasto.category || "Sin categoría",
    (gasto) => gasto.total,
    () => 1
  );

  const gastosPorProveedor = groupBy(
    gastosRango,
    (gasto) => gasto.proveedorName,
    (gasto) => gasto.total,
    () => 1
  );

  // Cuentas pendientes (a hoy, sin importar el período)
  const porCobrar = ventas.reduce((s, v) => s + getBalance(v), 0);
  const porPagar = gastos.reduce((s, g) => s + getBalance(g), 0);

  return (
    <div className="emp-page">

      <div className="emp-header">
        <div>
          <h1>Reportes</h1>
          <p>Reporte financiero de {negocio.name}</p>
        </div>
      </div>

      <div className="emp-card">

        <h2>Período</h2>

        <div className="rep-period">

          <div className="tx-group">
            <label>Desde</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="tx-group">
            <label>Hasta</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

        </div>

        {invalidRange && (
          <p className="tx-error">
            La fecha "Desde" no puede ser posterior a "Hasta".
          </p>
        )}

      </div>

      <div className="tx-summary">

        <div className="tx-summary-card">
          <span>Ventas del período</span>
          <strong>{formatMoney(totalVentas)}</strong>
          <small className="rep-note">
            {ventasRango.length}{" "}
            {ventasRango.length === 1 ? "venta" : "ventas"}
          </small>
        </div>

        <div className="tx-summary-card">
          <span>Gastos del período</span>
          <strong>{formatMoney(totalGastos)}</strong>
          <small className="rep-note">
            {gastosRango.length}{" "}
            {gastosRango.length === 1 ? "gasto" : "gastos"}
          </small>
        </div>

        <div className="tx-summary-card">
          <span>Balance (ventas − gastos)</span>
          <strong className={balance < 0 ? "rep-negative" : ""}>
            {formatMoney(balance)}
          </strong>
          <small className="rep-note">
            Solo del período, sin saldo acumulado
          </small>
        </div>

      </div>

      <div className="rep-grid">

        <RankingTable
          title="Productos más vendidos"
          nameLabel="Producto"
          extraLabel="Unidades"
          rows={topProductos}
        />

        <RankingTable
          title="Mejores clientes"
          nameLabel="Cliente"
          extraLabel="Compras"
          rows={topClientes}
        />

        <RankingTable
          title="Gastos por categoría"
          nameLabel="Categoría"
          extraLabel="Gastos"
          rows={gastosPorCategoria}
        />

        <RankingTable
          title="Gastos por proveedor"
          nameLabel="Proveedor"
          extraLabel="Gastos"
          rows={gastosPorProveedor}
        />

      </div>

      <div className="emp-card">

        <h2>Cuentas pendientes (a hoy)</h2>

        <div className="rep-accounts">

          <div>
            <span>Por cobrar a clientes</span>
            <strong>{formatMoney(porCobrar)}</strong>
          </div>

          <div>
            <span>Por pagar a proveedores</span>
            <strong>{formatMoney(porPagar)}</strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default EmprendimientoReportes;
