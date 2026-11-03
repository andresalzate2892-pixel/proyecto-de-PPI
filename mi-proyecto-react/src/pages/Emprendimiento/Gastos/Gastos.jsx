import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../Emprendimiento.css";
import "../Transacciones.css";

import {
  getGastos,
  createGasto,
  deleteGasto
} from "../../../services/gastoService";

import { getContactos } from "../../../services/contactoService";

import {
  todayString,
  formatMoney,
  getBalance,
  getEstado
} from "../../../utils/cuentas";

const emptyForm = {
  date: todayString(),
  description: "",
  category: "",
  total: "",
  paymentType: "Contado",
  proveedorId: "",
  dueDate: ""
};

function Gastos() {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [gastos, setGastos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  useEffect(() => {
    const loadData = async () => {
      const [gastosData, proveedoresData] = await Promise.all([
        getGastos(negocio.id),
        getContactos(negocio.id, "proveedores")
      ]);

      setGastos(gastosData);
      setProveedores(proveedoresData);
      setLoading(false);
    };

    loadData();
  }, [negocio.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const proveedor = proveedores.find(
        (item) => item.id === form.proveedorId
      );

      const created = await createGasto(negocio.id, {
        ...form,
        proveedorName: proveedor ? proveedor.name : ""
      });

      setGastos([...gastos, created]);

      setForm({ ...emptyForm, date: todayString() });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("¿Eliminar este gasto?");

    if (!ok) {
      return;
    }

    await deleteGasto(negocio.id, id);

    setGastos(gastos.filter((item) => item.id !== id));
  };

  const categories = [
    ...new Set(
      gastos.map((item) => item.category).filter(Boolean)
    )
  ];

  const filteredGastos = [...gastos]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    )
    .filter((gasto) => {
      const text = search.toLowerCase();

      const matchesSearch =
        gasto.description.toLowerCase().includes(text) ||
        gasto.category.toLowerCase().includes(text) ||
        gasto.proveedorName.toLowerCase().includes(text);

      const matchesStatus =
        filterStatus === "Todos" ||
        getEstado(gasto) === filterStatus;

      return matchesSearch && matchesStatus;
    });

  const totalGastado = gastos.reduce(
    (sum, gasto) => sum + gasto.total,
    0
  );

  const porPagar = gastos.reduce(
    (sum, gasto) => sum + getBalance(gasto),
    0
  );

  if (loading) {
    return <p>Cargando gastos...</p>;
  }

  return (
    <div className="emp-page">

      <div className="emp-header">
        <div>
          <h1>Gastos</h1>
          <p>Registra los gastos y compras de {negocio.name}</p>
        </div>
      </div>

      <div className="tx-summary">

        <div className="tx-summary-card">
          <span>Total gastado</span>
          <strong>{formatMoney(totalGastado)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>Por pagar</span>
          <strong>{formatMoney(porPagar)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>Número de gastos</span>
          <strong>{gastos.length}</strong>
        </div>

      </div>

      <div className="emp-card">

        <h2>Registrar gasto</h2>

        <form onSubmit={handleSubmit}>

          <div className="tx-row">

            <div className="tx-group">
              <label>Fecha *</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
            </div>

            <div className="tx-group">
              <label>Descripción *</label>
              <input
                type="text"
                name="description"
                placeholder="Ej: Compra de tela"
                value={form.description}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="tx-row tx-row-3">

            <div className="tx-group">
              <label>Categoría</label>
              <input
                type="text"
                name="category"
                placeholder="Ej: Materia prima"
                list="gasto-categories"
                value={form.category}
                onChange={handleChange}
              />

              <datalist id="gasto-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

            <div className="tx-group">
              <label>Valor *</label>
              <input
                type="number"
                name="total"
                min="0"
                placeholder="0"
                value={form.total}
                onChange={handleChange}
              />
            </div>

            <div className="tx-group">
              <label>Forma de pago *</label>
              <select
                name="paymentType"
                value={form.paymentType}
                onChange={handleChange}
              >
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>

          </div>

          <div className="tx-row">

            <div className="tx-group">
              <label>
                Proveedor{" "}
                {form.paymentType === "Crédito" ? "*" : "(opcional)"}
              </label>
              <select
                name="proveedorId"
                value={form.proveedorId}
                onChange={handleChange}
              >
                <option value="">Sin proveedor</option>
                {proveedores.map((proveedor) => (
                  <option key={proveedor.id} value={proveedor.id}>
                    {proveedor.name}
                  </option>
                ))}
              </select>
            </div>

            {form.paymentType === "Crédito" && (
              <div className="tx-group">
                <label>Fecha límite de pago *</label>
                <input
                  type="date"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleChange}
                />
              </div>
            )}

          </div>

          {error && <p className="tx-error">{error}</p>}

          <div className="tx-actions">
            <button type="submit">Registrar gasto</button>
          </div>

        </form>

      </div>

      <div className="emp-card">

        <h2>Historial de gastos</h2>

        <div className="tx-filters">

          <input
            type="text"
            placeholder="Buscar por descripción, categoría o proveedor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Pagada">Pagado</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vencida">Vencido</option>
          </select>

        </div>

        {filteredGastos.length === 0 ? (

          <p>
            {gastos.length === 0
              ? "Aún no has registrado gastos."
              : "No hay gastos que coincidan con la búsqueda."}
          </p>

        ) : (

          <div className="tx-table-wrapper">

            <table className="tx-table">

              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Categoría</th>
                  <th>Proveedor</th>
                  <th>Valor</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {filteredGastos.map((gasto) => {
                  const estado = getEstado(gasto);

                  return (
                    <tr key={gasto.id}>

                      <td>{gasto.date}</td>

                      <td>{gasto.description}</td>

                      <td>{gasto.category || "—"}</td>

                      <td>{gasto.proveedorName || "—"}</td>

                      <td>{formatMoney(gasto.total)}</td>

                      <td>
                        {gasto.paymentType}
                        {gasto.dueDate && (
                          <small className="tx-detail">
                            Vence: {gasto.dueDate}
                          </small>
                        )}
                      </td>

                      <td>
                        <span
                          className={`tx-status tx-status-${estado.toLowerCase()}`}
                        >
                          {estado === "Pagada"
                            ? "Pagado"
                            : estado === "Vencida"
                              ? "Vencido"
                              : estado}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          className="tx-row-button"
                          onClick={() => handleDelete(gasto.id)}
                        >
                          Eliminar
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

export default Gastos;
