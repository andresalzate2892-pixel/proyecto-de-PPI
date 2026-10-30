import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../Emprendimiento.css";
import "./Inventario.css";

import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto
} from "../../../services/productoService";

const emptyForm = {
  name: "",
  category: "",
  price: "",
  cost: "",
  stock: "",
  minStock: "5"
};

function getStatus(producto) {
  if (producto.stock <= 0) {
    return "Agotado";
  }

  if (producto.stock <= producto.minStock) {
    return "Bajo";
  }

  return "Disponible";
}

function formatMoney(value) {
  return `$${Number(value).toLocaleString("es-CO")}`;
}

function Inventario() {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Todos");

  useEffect(() => {
    const loadProductos = async () => {
      const data = await getProductos(negocio.id);
      setProductos(data);
      setLoading(false);
    };

    loadProductos();
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

      if (editingId) {
        const updated = await updateProducto(
          negocio.id,
          editingId,
          form
        );

        setProductos(
          productos.map((item) =>
            item.id === editingId ? updated : item
          )
        );

        setEditingId(null);
      } else {
        const created = await createProducto(negocio.id, form);

        setProductos([...productos, created]);
      }

      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (producto) => {
    setEditingId(producto.id);

    setForm({
      name: producto.name,
      category: producto.category,
      price: producto.price,
      cost: producto.cost,
      stock: producto.stock,
      minStock: producto.minStock
    });

    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = async (id) => {
    await deleteProducto(negocio.id, id);

    setProductos(productos.filter((item) => item.id !== id));

    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const handleStockChange = async (producto, change) => {
    const newStock = producto.stock + change;

    if (newStock < 0) {
      return;
    }

    const updated = await updateProducto(negocio.id, producto.id, {
      stock: newStock
    });

    setProductos(
      productos.map((item) =>
        item.id === producto.id ? updated : item
      )
    );
  };

  const categories = [
    ...new Set(
      productos.map((item) => item.category).filter(Boolean)
    )
  ];

  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      producto.name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      producto.category
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "Todos" ||
      getStatus(producto) === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const lowCount = productos.filter(
    (item) => getStatus(item) === "Bajo"
  ).length;

  const outCount = productos.filter(
    (item) => getStatus(item) === "Agotado"
  ).length;

  const inventoryValue = productos.reduce(
    (total, item) => total + item.cost * item.stock,
    0
  );

  if (loading) {
    return <p>Cargando inventario...</p>;
  }

  return (
    <div className="emp-page">

      <div className="emp-header">
        <div>
          <h1>Inventario</h1>
          <p>Productos y stock de {negocio.name}</p>
        </div>
      </div>

      <div className="inv-summary">

        <div className="inv-summary-card">
          <span>Total de productos</span>
          <strong>{productos.length}</strong>
        </div>

        <div className="inv-summary-card">
          <span>Stock bajo</span>
          <strong>{lowCount}</strong>
        </div>

        <div className="inv-summary-card">
          <span>Agotados</span>
          <strong>{outCount}</strong>
        </div>

        <div className="inv-summary-card">
          <span>Valor del inventario</span>
          <strong>{formatMoney(inventoryValue)}</strong>
        </div>

      </div>

      <div className="emp-card">

        <h2>
          {editingId ? "Editar producto" : "Agregar producto"}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="inv-row">

            <div className="inv-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="name"
                placeholder="Ej: Camiseta negra"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="inv-group">
              <label>Categoría</label>
              <input
                type="text"
                name="category"
                placeholder="Ej: Ropa"
                list="inv-categories"
                value={form.category}
                onChange={handleChange}
              />

              <datalist id="inv-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>

          </div>

          <div className="inv-row inv-row-4">

            <div className="inv-group">
              <label>Precio de venta *</label>
              <input
                type="number"
                name="price"
                min="0"
                placeholder="0"
                value={form.price}
                onChange={handleChange}
              />
            </div>

            <div className="inv-group">
              <label>Costo</label>
              <input
                type="number"
                name="cost"
                min="0"
                placeholder="0"
                value={form.cost}
                onChange={handleChange}
              />
            </div>

            <div className="inv-group">
              <label>Stock *</label>
              <input
                type="number"
                name="stock"
                min="0"
                placeholder="0"
                value={form.stock}
                onChange={handleChange}
              />
            </div>

            <div className="inv-group">
              <label>Stock mínimo</label>
              <input
                type="number"
                name="minStock"
                min="0"
                value={form.minStock}
                onChange={handleChange}
              />
            </div>

          </div>

          {error && <p className="inv-error">{error}</p>}

          <div className="inv-actions">

            <button type="submit">
              {editingId ? "Actualizar producto" : "Agregar producto"}
            </button>

            {editingId && (
              <button
                type="button"
                className="inv-secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="emp-card">

        <h2>Productos</h2>

        <div className="inv-filters">

          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="Todos">Todos los estados</option>
            <option value="Disponible">Disponible</option>
            <option value="Bajo">Bajo</option>
            <option value="Agotado">Agotado</option>
          </select>

        </div>

        {filteredProductos.length === 0 ? (

          <p>
            {productos.length === 0
              ? "Aún no has agregado productos."
              : "No hay productos que coincidan con la búsqueda."}
          </p>

        ) : (

          <div className="inv-table-wrapper">

            <table className="inv-table">

              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Costo</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {filteredProductos.map((producto) => {
                  const status = getStatus(producto);

                  return (
                    <tr key={producto.id}>

                      <td>{producto.name}</td>

                      <td>{producto.category || "—"}</td>

                      <td>{formatMoney(producto.price)}</td>

                      <td>{formatMoney(producto.cost)}</td>

                      <td>

                        <div className="inv-stock">

                          <button
                            type="button"
                            onClick={() =>
                              handleStockChange(producto, -1)
                            }
                            disabled={producto.stock === 0}
                          >
                            −
                          </button>

                          <span>{producto.stock}</span>

                          <button
                            type="button"
                            onClick={() =>
                              handleStockChange(producto, 1)
                            }
                          >
                            +
                          </button>

                        </div>

                      </td>

                      <td>
                        <span
                          className={`inv-status inv-status-${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>

                        <button
                          type="button"
                          className="inv-row-button"
                          onClick={() => handleEdit(producto)}
                        >
                          Editar
                        </button>

                        <button
                          type="button"
                          className="inv-row-button"
                          onClick={() => handleDelete(producto.id)}
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

export default Inventario;
