import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../Emprendimiento.css";
import "../Transacciones.css";

import {
  getVentas,
  createVenta,
  deleteVenta
} from "../../../services/ventaService";

import { getProductos } from "../../../services/productoService";
import { getContactos } from "../../../services/contactoService";

import {
  todayString,
  formatMoney,
  getBalance,
  getEstado
} from "../../../utils/cuentas";

function Ventas() {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Datos de la venta
  const [date, setDate] = useState(todayString());
  const [clienteId, setClienteId] = useState("");
  const [paymentType, setPaymentType] = useState("Contado");
  const [dueDate, setDueDate] = useState("");

  // Producto que se está agregando al detalle
  const [selectedProducto, setSelectedProducto] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");

  // Detalle de la venta (productos agregados)
  const [items, setItems] = useState([]);

  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todas");

  useEffect(() => {
    const loadData = async () => {
      const [ventasData, productosData, clientesData] =
        await Promise.all([
          getVentas(negocio.id),
          getProductos(negocio.id),
          getContactos(negocio.id, "clientes")
        ]);

      setVentas(ventasData);
      setProductos(productosData);
      setClientes(clientesData);
      setLoading(false);
    };

    loadData();
  }, [negocio.id]);

  const handleSelectProducto = (e) => {
    const id = e.target.value;

    setSelectedProducto(id);

    const producto = productos.find((item) => item.id === id);

    // Al elegir un producto se llena su precio, pero se puede cambiar
    setUnitPrice(producto ? String(producto.price) : "");
  };

  const handleAddItem = () => {
    setError("");

    const producto = productos.find(
      (item) => item.id === selectedProducto
    );

    if (!producto) {
      setError("Elige un producto");
      return;
    }

    const qty = Number(quantity);

    if (!Number.isInteger(qty) || qty <= 0) {
      setError("La cantidad debe ser un número entero mayor a 0");
      return;
    }

    if (unitPrice === "" || Number(unitPrice) < 0) {
      setError("El precio no es válido");
      return;
    }

    const yaAgregado = items
      .filter((item) => item.productoId === producto.id)
      .reduce((total, item) => total + item.quantity, 0);

    if (yaAgregado + qty > producto.stock) {
      setError(
        `Stock insuficiente de "${producto.name}" (disponible: ${producto.stock})`
      );
      return;
    }

    setItems([
      ...items,
      {
        productoId: producto.id,
        name: producto.name,
        quantity: qty,
        unitPrice: Number(unitPrice)
      }
    ]);

    setSelectedProducto("");
    setQuantity("1");
    setUnitPrice("");
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const total = items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const cliente = clientes.find((item) => item.id === clienteId);

      const created = await createVenta(negocio.id, {
        date,
        clienteId,
        clienteName: cliente ? cliente.name : "",
        paymentType,
        dueDate,
        items
      });

      setVentas([...ventas, created]);

      // El stock cambió: recargar productos
      setProductos(await getProductos(negocio.id));

      setItems([]);
      setClienteId("");
      setPaymentType("Contado");
      setDueDate("");
      setDate(todayString());
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (venta) => {
    const ok = window.confirm(
      "¿Eliminar esta venta? Los productos volverán al inventario."
    );

    if (!ok) {
      return;
    }

    await deleteVenta(negocio.id, venta.id);

    setVentas(ventas.filter((item) => item.id !== venta.id));
    setProductos(await getProductos(negocio.id));
  };

  const filteredVentas = [...ventas]
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    )
    .filter((venta) => {
      const text = search.toLowerCase();

      const matchesSearch =
        venta.clienteName.toLowerCase().includes(text) ||
        venta.items.some((item) =>
          item.name.toLowerCase().includes(text)
        );

      const matchesStatus =
        filterStatus === "Todas" ||
        getEstado(venta) === filterStatus;

      return matchesSearch && matchesStatus;
    });

  const totalVendido = ventas.reduce(
    (sum, venta) => sum + venta.total,
    0
  );

  const porCobrar = ventas.reduce(
    (sum, venta) => sum + getBalance(venta),
    0
  );

  if (loading) {
    return <p>Cargando ventas...</p>;
  }

  return (
    <div className="emp-page">

      <div className="emp-header">
        <div>
          <h1>Ventas</h1>
          <p>Registra las ventas de {negocio.name}</p>
        </div>
      </div>

      <div className="tx-summary">

        <div className="tx-summary-card">
          <span>Total vendido</span>
          <strong>{formatMoney(totalVendido)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>Por cobrar</span>
          <strong>{formatMoney(porCobrar)}</strong>
        </div>

        <div className="tx-summary-card">
          <span>Número de ventas</span>
          <strong>{ventas.length}</strong>
        </div>

      </div>

      <div className="emp-card">

        <h2>Registrar venta</h2>

        <form onSubmit={handleSubmit}>

          <div className="tx-row tx-row-3">

            <div className="tx-group">
              <label>Fecha *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div className="tx-group">
              <label>Forma de pago *</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
              >
                <option value="Contado">Contado</option>
                <option value="Crédito">Crédito</option>
              </select>
            </div>

            <div className="tx-group">
              <label>
                Cliente {paymentType === "Crédito" ? "*" : "(opcional)"}
              </label>
              <select
                value={clienteId}
                onChange={(e) => setClienteId(e.target.value)}
              >
                <option value="">Sin cliente</option>
                {clientes.map((cliente) => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.name}
                  </option>
                ))}
              </select>
            </div>

          </div>

          {paymentType === "Crédito" && (
            <div className="tx-group">
              <label>Fecha límite de pago *</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}

          <div className="tx-items-box">

            <h3>Productos de la venta</h3>

            {productos.length === 0 ? (

              <p>
                Aún no tienes productos. Agrégalos primero en
                Inventario.
              </p>

            ) : (

              <div className="tx-items-add">

                <div className="tx-group">
                  <label>Producto</label>
                  <select
                    value={selectedProducto}
                    onChange={handleSelectProducto}
                  >
                    <option value="">Selecciona un producto</option>
                    {productos.map((producto) => (
                      <option
                        key={producto.id}
                        value={producto.id}
                        disabled={producto.stock === 0}
                      >
                        {producto.name} (stock: {producto.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="tx-group">
                  <label>Cantidad</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>

                <div className="tx-group">
                  <label>Precio unitario</label>
                  <input
                    type="number"
                    min="0"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="tx-add-button"
                  onClick={handleAddItem}
                >
                  Agregar
                </button>

              </div>

            )}

            {items.length > 0 && (

              <div className="tx-items-list">

                <table className="tx-table">

                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{formatMoney(item.unitPrice)}</td>
                        <td>
                          {formatMoney(item.quantity * item.unitPrice)}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="tx-row-button"
                            onClick={() => handleRemoveItem(index)}
                          >
                            Quitar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>

                <p className="tx-total">
                  Total: <strong>{formatMoney(total)}</strong>
                </p>

              </div>

            )}

          </div>

          {error && <p className="tx-error">{error}</p>}

          <div className="tx-actions">
            <button type="submit">Registrar venta</button>
          </div>

        </form>

      </div>

      <div className="emp-card">

        <h2>Historial de ventas</h2>

        <div className="tx-filters">

          <input
            type="text"
            placeholder="Buscar por cliente o producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todas">Todos los estados</option>
            <option value="Pagada">Pagada</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Vencida">Vencida</option>
          </select>

        </div>

        {filteredVentas.length === 0 ? (

          <p>
            {ventas.length === 0
              ? "Aún no has registrado ventas."
              : "No hay ventas que coincidan con la búsqueda."}
          </p>

        ) : (

          <div className="tx-table-wrapper">

            <table className="tx-table">

              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Pago</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {filteredVentas.map((venta) => {
                  const estado = getEstado(venta);

                  return (
                    <tr key={venta.id}>

                      <td>{venta.date}</td>

                      <td>{venta.clienteName || "—"}</td>

                      <td>
                        {venta.items
                          .map(
                            (item) => `${item.quantity} × ${item.name}`
                          )
                          .join(", ")}
                      </td>

                      <td>{formatMoney(venta.total)}</td>

                      <td>
                        {venta.paymentType}
                        {venta.dueDate && (
                          <small className="tx-detail">
                            Vence: {venta.dueDate}
                          </small>
                        )}
                      </td>

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
                          onClick={() => handleDelete(venta)}
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

export default Ventas;
