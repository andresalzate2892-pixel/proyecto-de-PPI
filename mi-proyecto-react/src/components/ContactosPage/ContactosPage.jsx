import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import "../../pages/Emprendimiento/Emprendimiento.css";
import "./ContactosPage.css";

import {
  getContactos,
  createContacto,
  updateContacto,
  deleteContacto
} from "../../services/contactoService";

const emptyForm = {
  name: "",
  document: "",
  phone: "",
  email: "",
  address: "",
  notes: ""
};

// Página reutilizable para Clientes y Proveedores.
// Props:
//   tipo:        "clientes" | "proveedores"  (clave de almacenamiento)
//   titulo:      título de la página, ej. "Clientes"
//   singular:    ej. "cliente"
//   descripcion: texto bajo el título
function ContactosPage({ tipo, titulo, singular, descripcion }) {
  // El negocio lo entrega NegocioGate
  const { negocio } = useOutletContext();

  const [contactos, setContactos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadContactos = async () => {
      const data = await getContactos(negocio.id, tipo);
      setContactos(data);
      setLoading(false);
    };

    loadContactos();
  }, [negocio.id, tipo]);

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
        const updated = await updateContacto(
          negocio.id,
          tipo,
          editingId,
          form
        );

        setContactos(
          contactos.map((item) =>
            item.id === editingId ? updated : item
          )
        );

        setEditingId(null);
      } else {
        const created = await createContacto(
          negocio.id,
          tipo,
          form
        );

        setContactos([...contactos, created]);
      }

      setForm(emptyForm);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (contacto) => {
    setEditingId(contacto.id);

    setForm({
      name: contacto.name,
      document: contacto.document,
      phone: contacto.phone,
      email: contacto.email,
      address: contacto.address,
      notes: contacto.notes
    });

    setError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const handleDelete = async (id) => {
    await deleteContacto(negocio.id, tipo, id);

    setContactos(contactos.filter((item) => item.id !== id));

    if (editingId === id) {
      handleCancelEdit();
    }
  };

  const filteredContactos = contactos.filter((contacto) => {
    const text = search.toLowerCase();

    return (
      contacto.name.toLowerCase().includes(text) ||
      contacto.document.toLowerCase().includes(text) ||
      contacto.phone.toLowerCase().includes(text)
    );
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

      <div className="emp-card">

        <h2>
          {editingId
            ? `Editar ${singular}`
            : `Agregar ${singular}`}
        </h2>

        <form onSubmit={handleSubmit}>

          <div className="con-row">

            <div className="con-group">
              <label>Nombre *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
              />
            </div>

            <div className="con-group">
              <label>Documento / NIT</label>
              <input
                type="text"
                name="document"
                value={form.document}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="con-row">

            <div className="con-group">
              <label>Teléfono</label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div className="con-group">
              <label>Correo</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
              />
            </div>

          </div>

          <div className="con-group">
            <label>Dirección</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="con-group">
            <label>Notas</label>
            <input
              type="text"
              name="notes"
              placeholder="Cualquier dato útil"
              value={form.notes}
              onChange={handleChange}
            />
          </div>

          {error && <p className="con-error">{error}</p>}

          <div className="con-actions">

            <button type="submit">
              {editingId
                ? `Actualizar ${singular}`
                : `Agregar ${singular}`}
            </button>

            {editingId && (
              <button
                type="button"
                className="con-secondary"
                onClick={handleCancelEdit}
              >
                Cancelar
              </button>
            )}

          </div>

        </form>

      </div>

      <div className="emp-card">

        <h2>
          {titulo} ({contactos.length})
        </h2>

        <div className="con-search">
          <input
            type="text"
            placeholder="Buscar por nombre, documento o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredContactos.length === 0 ? (

          <p>
            {contactos.length === 0
              ? `Aún no has agregado ${titulo.toLowerCase()}.`
              : "No hay resultados para la búsqueda."}
          </p>

        ) : (

          <div className="con-table-wrapper">

            <table className="con-table">

              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Correo</th>
                  <th>Dirección</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>

                {filteredContactos.map((contacto) => (
                  <tr key={contacto.id}>

                    <td>
                      {contacto.name}
                      {contacto.notes && (
                        <small className="con-notes">
                          {contacto.notes}
                        </small>
                      )}
                    </td>

                    <td>{contacto.document || "—"}</td>

                    <td>{contacto.phone || "—"}</td>

                    <td>{contacto.email || "—"}</td>

                    <td>{contacto.address || "—"}</td>

                    <td>

                      <button
                        type="button"
                        className="con-row-button"
                        onClick={() => handleEdit(contacto)}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        className="con-row-button"
                        onClick={() => handleDelete(contacto.id)}
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ContactosPage;
