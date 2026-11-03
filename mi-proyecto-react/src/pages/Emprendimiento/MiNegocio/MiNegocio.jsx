import { useEffect, useState } from "react";

import "./MiNegocio.css";

import {
  getNegocioByUser,
  createNegocio,
  updateNegocio
} from "../../../services/negocioService";

const emptyForm = {
  name: "",
  activity: "",
  nit: "",
  address: "",
  phone: "",
  email: "",
  startDate: ""
};

// Esta página NO va dentro de NegocioGate: es justo donde se registra el negocio.
function MiNegocio() {
  const [negocio, setNegocio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadNegocio = async () => {
      const loggedUser = JSON.parse(localStorage.getItem("usuario"));

      if (!loggedUser) {
        setLoading(false);
        return;
      }

      try {
        const data = await getNegocioByUser(loggedUser.id);
        setNegocio(data);
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setLoading(false);
      }
    };

    loadNegocio();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleEdit = () => {
    setForm({
      name: negocio.name || "",
      activity: negocio.activity || "",
      nit: negocio.nit || "",
      address: negocio.address || "",
      phone: negocio.phone || "",
      email: negocio.email || "",
      startDate: negocio.startDate || ""
    });

    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem("usuario"));

    if (!loggedUser) {
      return;
    }

    if (form.name.trim() === "" || form.activity.trim() === "") {
      setError("El nombre y el tipo de actividad son obligatorios.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (negocio) {
        const updated = await updateNegocio(negocio.id, form);
        setNegocio(updated);
        setEditing(false);
      } else {
        const created = await createNegocio({
          ...form,
          userId: loggedUser.id
        });
        setNegocio(created);
        setForm(emptyForm);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="negocio-empty">Cargando...</p>;
  }

  const showForm = !negocio || editing;

  return (
    <div className="negocio">

      <div className="negocio-header">
        <h1>Mi negocio</h1>
        <p>Información general de tu emprendimiento</p>
      </div>

      {!negocio && (
        <div className="negocio-alert">
          <strong>Negocio no registrado.</strong> Registra tu negocio para
          desbloquear el resto del espacio de Emprendimiento.
        </div>
      )}

      {showForm ? (

        <div className="negocio-card">

          <h2>
            {negocio ? "Editar negocio" : "Registrar negocio"}
          </h2>

          <form onSubmit={handleSubmit}>

            <div className="negocio-row">

              <div className="negocio-group">
                <label>Nombre del negocio *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Ej: Tienda Luna"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="negocio-group">
                <label>Tipo de actividad *</label>
                <input
                  type="text"
                  name="activity"
                  placeholder="Ej: Venta de ropa"
                  value={form.activity}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="negocio-row">

              <div className="negocio-group">
                <label>NIT (opcional)</label>
                <input
                  type="text"
                  name="nit"
                  value={form.nit}
                  onChange={handleChange}
                />
              </div>

              <div className="negocio-group">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="negocio-row">

              <div className="negocio-group">
                <label>Teléfono</label>
                <input
                  type="text"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="negocio-group">
                <label>Correo del negocio</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

            </div>

            <div className="negocio-group">
              <label>Dirección</label>
              <input
                type="text"
                name="address"
                value={form.address}
                onChange={handleChange}
              />
            </div>

            {error && <p className="negocio-error">{error}</p>}

            <div className="negocio-actions">

              <button type="submit" disabled={saving}>
                {saving
                  ? "Guardando..."
                  : negocio
                    ? "Guardar cambios"
                    : "Registrar negocio"}
              </button>

              {negocio && (
                <button
                  type="button"
                  className="negocio-secondary"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </div>

      ) : (

        <div className="negocio-card">

          <h2>{negocio.name}</h2>

          <div className="negocio-info">

            <div>
              <span>Actividad</span>
              <p>{negocio.activity}</p>
            </div>

            <div>
              <span>NIT</span>
              <p>{negocio.nit || "—"}</p>
            </div>

            <div>
              <span>Fecha de inicio</span>
              <p>{negocio.startDate || "—"}</p>
            </div>

            <div>
              <span>Teléfono</span>
              <p>{negocio.phone || "—"}</p>
            </div>

            <div>
              <span>Correo</span>
              <p>{negocio.email || "—"}</p>
            </div>

            <div>
              <span>Dirección</span>
              <p>{negocio.address || "—"}</p>
            </div>

          </div>

          <div className="negocio-actions">
            <button onClick={handleEdit}>Editar negocio</button>
          </div>

        </div>

      )}

    </div>
  );
}

export default MiNegocio;
