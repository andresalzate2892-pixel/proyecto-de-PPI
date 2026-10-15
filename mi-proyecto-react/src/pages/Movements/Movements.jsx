import { useState, useEffect } from "react";

import "./Movements.css";

import {
  getMovements,
  createMovement,
  deleteMovement as deleteMovementService,
  updateMovement
} from "../../services/movementService";

import { useSpace } from "../../context/SpaceContext";

function Movements() {
  const [movements, setMovements] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const { space } = useSpace();

  const [filterType, setFilterType] =
    useState("Todos");

  const [filterCategory, setFilterCategory] =
    useState("Todas");

  const [search, setSearch] = useState("");
  const [filterDate, setFilterDate] =
    useState("");

  const [minValue, setMinValue] =
    useState("");

  const [maxValue, setMaxValue] =
    useState("");

  const [categories, setCategories] =
    useState([
      "Alimentación",
      "Transporte",
      "Vivienda",
      "Servicios",
      "Salud",
      "Educación",
      "Entretenimiento",
      "Trabajo",
      "Otros"
    ]);

  const [showCategoryForm, setShowCategoryForm] =
    useState(false);

  const [newCategory, setNewCategory] =
    useState("");

  const [form, setForm] = useState({
    type: "Gasto",
    date: "",
    description: "",
    value: "",
    category: ""
  });

  const loadMovements = async (selectedSpace) => {
    const loggedUser =
      JSON.parse(
        localStorage.getItem("usuario")
      );

    if (!loggedUser) {
      return;
    }

    const data =
      await getMovements(
        loggedUser.id
      );

    const filteredBySpace =
      data.filter((movement) => {
        const movementSpace =
          movement.space ||
          "Personal";

        return (
          movementSpace ===
          selectedSpace
        );
      });

    setMovements(
      filteredBySpace
    );
  };

  useEffect(() => {
    loadMovements(space);
  }, [space]);

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedUser =
      JSON.parse(
        localStorage.getItem("usuario")
      );

    if (!loggedUser) {
      return;
    }

    const movementData = {
      type: form.type,
      date: form.date,
      description: form.description,
      value: Number(form.value),
      category: form.category,
      userId: loggedUser.id,
      space: space
    };

    if (editingId) {
      const updatedMovement =
        await updateMovement(
          editingId,
          movementData
        );

      setMovements(
        movements.map(
          (movement) =>
            movement.id === editingId
              ? updatedMovement
              : movement
        )
      );

      setEditingId(null);
    } else {
      const savedMovement =
        await createMovement(
          movementData
        );

      setMovements([
        ...movements,
        savedMovement
      ]);
    }

    setForm({
      type: "Gasto",
      date: "",
      description: "",
      value: "",
      category: ""
    });
  };

  const handleDeleteMovement =
    async (id) => {
      await deleteMovementService(id);

      setMovements(
        movements.filter(
          (movement) =>
            movement.id !== id
        )
      );
    };

  const handleEditMovement =
    (movement) => {
      setEditingId(
        movement.id
      );

      setForm({
        type: movement.type,
        date: movement.date,
        description:
          movement.description,
        value: movement.value,
        category: movement.category
      });
    };

  const handleAddCategory =
    (e) => {
      e.preventDefault();

      const category =
        newCategory.trim();

      if (category === "") {
        return;
      }

      if (
        categories.includes(
          category
        )
      ) {
        return;
      }

      setCategories([
        ...categories,
        category
      ]);

      setForm({
        ...form,
        category: category
      });

      setNewCategory("");
      setShowCategoryForm(false);
    };

  const filteredMovements =
    movements.filter(
      (movement) => {
        const matchesType =
          filterType === "Todos" ||
          movement.type ===
            filterType;

        const matchesCategory =
          filterCategory ===
            "Todas" ||
          movement.category ===
            filterCategory;

        const matchesSearch =
          (
            movement.description ||
            ""
          )
            .toLowerCase()
            .includes(
              search.toLowerCase()
            );

        const matchesDate =
          filterDate === "" ||
          movement.date ===
            filterDate;

        const matchesMinValue =
          minValue === "" ||
          Number(
            movement.value
          ) >=
            Number(minValue);

        const matchesMaxValue =
          maxValue === "" ||
          Number(
            movement.value
          ) <=
            Number(maxValue);

        return (
          matchesType &&
          matchesCategory &&
          matchesSearch &&
          matchesDate &&
          matchesMinValue &&
          matchesMaxValue
        );
      }
    );

  const handleClearFilters =
    () => {
      setFilterType("Todos");
      setFilterCategory("Todas");
      setSearch("");
      setFilterDate("");
      setMinValue("");
      setMaxValue("");
    };

  return (
    <div className="movements">

      <div className="movements-header">

        <div>
          <h1>
            Movimientos
          </h1>

          <p>
            Administra tus ingresos y gastos
          </p>
        </div>

      </div>

      <div className="movement-form-card">

        <h2>
          {editingId
            ? "Editar movimiento"
            : `Registrar movimiento - ${space}`}
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          <div className="form-row">

            <div className="form-group">

              <label>
                Tipo
              </label>

              <select
                name="type"
                value={form.type}
                onChange={
                  handleChange
                }
              >

                <option value="Gasto">
                  Gasto
                </option>

                <option value="Ingreso">
                  Ingreso
                </option>

              </select>

            </div>

            <div className="form-group">

              <label>
                Fecha
              </label>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>
                Descripción
              </label>

              <input
                type="text"
                name="description"
                placeholder="Ej: Compra de alimentos"
                value={
                  form.description
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="form-group">

              <label>
                Valor
              </label>

              <input
                type="number"
                name="value"
                placeholder="0"
                value={form.value}
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          <div className="form-group">

            <label>
              Categoría
            </label>

            <select
              name="category"
              value={
                form.category
              }
              onChange={
                handleChange
              }
            >

              <option value="">
                Selecciona una categoría
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

            <button
              type="button"
              className="add-category-button"
              onClick={() =>
                setShowCategoryForm(
                  !showCategoryForm
                )
              }
            >
              + Agregar categoría
            </button>

          </div>

          {showCategoryForm && (

            <div className="new-category">

              <h3>
                Nueva categoría
              </h3>

              <div className="new-category-row">

                <input
                  type="text"
                  placeholder="Ej: Gimnasio"
                  value={
                    newCategory
                  }
                  onChange={(e) =>
                    setNewCategory(
                      e.target.value
                    )
                  }
                />

                <button
                  type="button"
                  onClick={
                    handleAddCategory
                  }
                >
                  Crear
                </button>

                <button
                  type="button"
                  onClick={() => {

                    setNewCategory(
                      ""
                    );

                    setShowCategoryForm(
                      false
                    );

                  }}
                >
                  Cancelar
                </button>

              </div>

            </div>

          )}

          <button type="submit">

            {editingId
              ? "Actualizar movimiento"
              : "Registrar movimiento"}

          </button>

        </form>

      </div>

      <div className="movement-list-card">

        <h2>
          Historial de movimientos -{" "}
          {space}
        </h2>

        <div className="filters">

          <div className="form-group">

            <label>
              Tipo
            </label>

            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value
                )
              }
            >

              <option value="Todos">
                Todos
              </option>

              <option value="Gasto">
                Gastos
              </option>

              <option value="Ingreso">
                Ingresos
              </option>

            </select>

          </div>

          <div className="form-group">

            <label>
              Categoría
            </label>

            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(
                  e.target.value
                )
              }
            >

              <option value="Todas">
                Todas
              </option>

              {categories.map(
                (category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                )
              )}

            </select>

          </div>

          <div className="form-group">

            <label>
              Buscar
            </label>

            <input
              type="text"
              placeholder="Buscar por descripción..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Fecha
            </label>

            <input
              type="date"
              value={filterDate}
              onChange={(e) =>
                setFilterDate(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Valor mínimo
            </label>

            <input
              type="number"
              placeholder="0"
              value={minValue}
              onChange={(e) =>
                setMinValue(
                  e.target.value
                )
              }
            />

          </div>

          <div className="form-group">

            <label>
              Valor máximo
            </label>

            <input
              type="number"
              placeholder="0"
              value={maxValue}
              onChange={(e) =>
                setMaxValue(
                  e.target.value
                )
              }
            />

          </div>

          <button
            type="button"
            onClick={
              handleClearFilters
            }
          >
            Limpiar filtros
          </button>

        </div>

        {filteredMovements.length ===
        0 ? (

          <p className="empty-message">
            No hay movimientos en{" "}
            {space}.
          </p>

        ) : (

          <table>

            <thead>

              <tr>
                <th>Tipo</th>
                <th>Fecha</th>
                <th>
                  Descripción
                </th>
                <th>Valor</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>

            </thead>

            <tbody>

              {filteredMovements.map(
                (movement) => (

                  <tr
                    key={
                      movement.id
                    }
                  >

                    <td>
                      {movement.type}
                    </td>

                    <td>
                      {movement.date}
                    </td>

                    <td>
                      {
                        movement.description
                      }
                    </td>

                    <td>
                      $
                      {Number(
                        movement.value
                      ).toLocaleString(
                        "es-CO"
                      )}
                    </td>

                    <td>
                      {
                        movement.category
                      }
                    </td>

                    <td>

                      <button
                        onClick={() =>
                          handleEditMovement(
                            movement
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteMovement(
                            movement.id
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </td>

                  </tr>

                )
              )}

            </tbody>

          </table>

        )}

      </div>

    </div>
  );
}

export default Movements;