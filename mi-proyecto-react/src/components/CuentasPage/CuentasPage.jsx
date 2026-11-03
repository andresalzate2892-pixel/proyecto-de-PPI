import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../../pages/Emprendimiento/Emprendimiento.css";
import "../../pages/Emprendimiento/Transacciones.css";
import "./CuentasPage.css";

import {
  todayString,
  formatMoney,
  getPaid,
  getBalance,
  getEstado
} from "../../utils/cuentas";

// Página reutilizable para Cuentas por cobrar y Cuentas por pagar.
// Props:
//   titulo, descripcion:  textos de la página
//   contactoLabel:        "Cliente" o "Proveedor"
//   resumenLabel:         "Total por cobrar" o "Total por pagar"
//   getItems(negocioId):  carga las ventas o los gastos
//   addPago, removePago:  funciones del servicio
//   getContacto(item):    nombre del cliente o proveedor de la cuenta
//   getDetalle(item):     texto corto que describe la cuenta
function CuentasPage({
  titulo,
  descripcion,
  contactoLabel,
  resumenLabel,
  getItems,
  addPago,
  removePago,
  getContacto,
  getDetalle
}) {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Por pagar");
  const [selectedId, setSelectedId] = useState(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayString());
  const [error, setError] = useState("");

  useEffect(() => {
    const loadItems = async () => {
      const data = await getItems(negocio.id);

      // Solo las cuentas a crédito forman parte de esta página
      setItems(data.filter((item) => item.paymentType === "Crédito"));
      setLoading(false);
    };

    loadItems();
  }, [negocio.id, getItems]);

  const replaceItem = (updated) => {
    setItems(
      items.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleSelect = (item) => {
    setSelectedId(item.id);
    setAmount(String(getBalance(item)));
    setDate(todayString());
    setError("");
  };

  const handleClose = () => {
    setSelectedId(null);
    setError("");
  };

  const handleAddPago = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const updated = await addPago(negocio.id, selectedId, {
        date,
        amount
      });

      replaceItem(updated);

      // Si ya quedó pagada, se cierra el panel
      if (getBalance(updated) <= 0) {
        setSelectedId(null);
      } else {
        setAmount(String(getBalance(updated)));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemovePago = async (pagoId) => {
    const ok = window.confirm("¿Quitar este abono?");

    if (!ok) {
      return;
    }

    const updated = await removePago(negocio.id, selectedId, pagoId);

    replaceItem(updated);
    setAmount(String(getBalance(updated)));
  };

  const selected = items.find((item) => item.id === selectedId);

  const pendientes = items.filter((item) => getBalance(item) > 0);

  const vencidas = items.filter(
    (item) => getEstado(item) === "Vencida"
  );

  const totalPendiente = pendientes.reduce(
    (sum, item) => sum + getBalance(item),
    0
  );

  const totalVencido = vencidas.reduce(
    (sum, item) => sum + getBalance(item),
    0
  );

  // Saldo agrupado por cliente o proveedor
  const saldoPorContacto = Object.values(
    pendientes.reduce((groups, item) => {
      const name = getContacto(item) || "Sin nombre";

      if (!groups[name]) {
        groups[name] = { name, balance: 0, count: 0 };
      }

      groups[name].balance += getBalance(item);
      groups[name].count += 1;

      return groups;
    }, {})
  ).sort((a, b) => b.balance - a.balance);

  const filteredItems = [...items]
    .sort(
      (a, b) =>
        (a.dueDate || "").localeCompare(b.dueDate || "") ||
        a.id.localeCompare(b.id)
    )
    .filter((item) => {
      const estado = getEstado(item);

      if (filter === "Por pagar") {
        return estado !== "Pagada";
      }

      if (filter === "Todas") {
        return true;
      }

      return estado === filter;
    });

  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <div className="emp-page">

      <div className="emp-header">
        <div>
          <h1>{titulo}</h1>
          <p>{descripcion}</p>
        </div>
      </div>

      <div className="tx-summary">

        <div className="tx-summary-card">
          <span>{resumenLabel}</span>
          <strong>{formatMoney(totalPendiente)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>De eso, vencido</span>
          <strong>{formatMoney(totalVencido)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>Cuentas pendientes</span>
          <strong>{pendientes.length}</strong>
        </div>

      </div>

      <div className="emp-card">

        <h2>Saldo por {contactoLabel.toLowerCase()}</h2>

        {saldoPorContacto.length === 0 ? (

          <p>No hay saldos pendientes. ¡Todo al día!</p>

        ) : (

          <div className="cu-contactos">

            {saldoPorContacto.map((contacto) => (
              <div className="cu-contacto" key={contacto.name}>
                <div>
                  <strong>{contacto.name}</strong>
                  <small>
                    {contacto.count}{" "}
                    {contacto.count === 1 ? "cuenta" : "cuentas"}
                  </small>
                </div>

                <span>{formatMoney(contacto.balance)}</span>
              </div>
            ))}

          </div>

        )}

      </div>

      {selected && (

        <div className="emp-card cu-detail">

          <div className="cu-detail-header">
            <div>
              <h2>
                Abonar a {getContacto(selected) || "esta cuenta"}
              </h2>
              <p>{getDetalle(selected)}</p>
            </div>

            <button
              type="button"
              className="tx-row-button"
              onClick={handleClose}
            >
              Cerrar
            </button>
          </div>

          <div className="cu-detail-numbers">
            <div>
              <span>Total</span>
              <strong>{formatMoney(selected.total)}</strong>
            </div>

            <div>
              <span>Abonado</span>
              <strong>{formatMoney(getPaid(selected))}</strong>
            </div>

            <div>
              <span>Saldo</span>
              <strong>{formatMoney(getBalance(selected))}</strong>
            </div>
          </div>

          {getBalance(selected) > 0 && (

            <form onSubmit={handleAddPago}>

              <div className="tx-row">

                <div className="tx-group">
                  <label>Valor del abono</label>
                  <input
                    type="number"
                    min="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <div className="tx-group">
                  <label>Fecha del abono</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

              </div>

              {error && <p className="tx-error">{error}</p>}

              <div className="tx-actions">
                <button type="submit">Registrar abono</button>
              </div>

            </form>

          )}

          <h3 className="cu-history-title">Abonos registrados</h3>

          {(selected.payments || []).length === 0 ? (

            <p>Todavía no hay abonos.</p>

          ) : (

            <ul className="cu-history">
              {selected.payments.map((pago) => (
                <li key={pago.id}>
                  <span>
                    {pago.date} — {formatMoney(pago.amount)}
                  </span>

                  <button
                    type="button"
                    className="tx-row-button"
                    onClick={() => handleRemovePago(pago.id)}
                  >
                    Quitar
                  </button>
                </li>
              ))}
            </ul>

          )}

        </div>

      )}

      <div className="emp-card">

        <h2>Cuentas</h2>

        <div className="tx-filters">

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="Por pagar">Pendientes y vencidas</option>
            <option value="Vencida">Solo vencidas</option>
            <option value="Pagada">Pagadas</option>
            <option value="Todas">Todas</option>
          </select>

        </div>

        {filteredItems.length === 0 ? (

          <p>No hay cuentas para mostrar.</p>

        ) : (

          <div className="tx-table-wrapper">

            <table className="tx-table">

              <thead>
                <tr>
                  <th>{contactoLabel}</th>
                  <th>Detalle</th>
                  <th>Fecha</th>
                  <th>Vence</th>
                  <th>Total</th>
                  <th>Abonado</th>
                  <th>Saldo</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>

                {filteredItems.map((item) => {
                  const estado = getEstado(item);

                  return (
                    <tr key={item.id}>

                      <td>{getContacto(item) || "—"}</td>

                      <td>{getDetalle(item)}</td>

                      <td>{item.date}</td>

                      <td>{item.dueDate || "—"}</td>

                      <td>{formatMoney(item.total)}</td>

                      <td>{formatMoney(getPaid(item))}</td>

                      <td>{formatMoney(getBalance(item))}</td>

                      <td>
                        <span
                          className={`tx-status tx-status-${estado.toLowerCase()}`}
                        >
                          {estado}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="tx-row-button"
                          onClick={() => handleSelect(item)}
                        >
                          {estado === "Pagada" ? "Ver abonos" : "Abonar"}
                        </button>
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

export default CuentasPage;
