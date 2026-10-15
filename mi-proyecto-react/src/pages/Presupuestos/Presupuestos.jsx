import { useEffect, useState } from "react";

import "./Presupuestos.css";

import {
  getBudgets,
  createBudget,
  deleteBudget as deleteBudgetService,
  updateBudget
} from "../../services/budgetService";

import { getMovements } from "../../services/movementService";

import { useSpace } from "../../context/SpaceContext";

function Presupuestos() {
  const [budgets, setBudgets] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [movements, setMovements] = useState([]);

  const { space } = useSpace();

  const categories = [
    "General",
    "Alimentación",
    "Transporte",
    "Vivienda",
    "Servicios",
    "Salud",
    "Educación",
    "Entretenimiento",
    "Trabajo",
    "Otros"
  ];

  const [form, setForm] = useState({
    name: "",
    limit: "",
    category: "General",
    startDate: "",
    endDate: ""
  });

  // ==============================
  // CARGAR DATOS DEL USUARIO
  // ==============================

  useEffect(() => {
    const loggedUser =
      JSON.parse(
        localStorage.getItem("usuario")
      );

    if (!loggedUser) {
      return;
    }

    getBudgets(loggedUser.id).then(
      (data) => {
        setBudgets(data);
      }
    );

    getMovements(loggedUser.id).then(
      (data) => {
        setMovements(data);
      }
    );
  }, []);

  // ==============================
  // CAMBIAR FORMULARIO
  // ==============================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value
    });
  };

  // ==============================
  // CREAR / ACTUALIZAR
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const loggedUser =
      JSON.parse(
        localStorage.getItem("usuario")
      );

    if (!loggedUser) {
      return;
    }

    const budgetData = {
      name: form.name,
      limit: Number(form.limit),
      category: form.category,
      startDate: form.startDate,
      endDate: form.endDate,
      userId: loggedUser.id,
      space: space
    };

    // ACTUALIZAR

    if (editingId) {
      const updatedBudget =
        await updateBudget(
          editingId,
          budgetData
        );

      setBudgets(
        budgets.map(
          (budget) =>
            budget.id === editingId
              ? updatedBudget
              : budget
        )
      );

      setEditingId(null);
    }

    // CREAR

    else {
      const savedBudget =
        await createBudget(
          budgetData
        );

      setBudgets([
        ...budgets,
        savedBudget
      ]);
    }

    // LIMPIAR

    setForm({
      name: "",
      limit: "",
      category: "General",
      startDate: "",
      endDate: ""
    });
  };

  // ==============================
  // ELIMINAR
  // ==============================

  const handleDeleteBudget =
    async (id) => {
      await deleteBudgetService(id);

      setBudgets(
        budgets.filter(
          (budget) =>
            budget.id !== id
        )
      );
    };

  // ==============================
  // EDITAR
  // ==============================

  const handleEditBudget =
    (budget) => {
      setEditingId(
        budget.id
      );

      setForm({
        name: budget.name,
        limit: budget.limit,
        category: budget.category,
        startDate: budget.startDate,
        endDate: budget.endDate
      });
    };

  // ==============================
  // CALCULAR GASTOS
  // ==============================

  const getSpent = (budget) => {
    const startDate =
      budget.startDate;

    const endDate =
      budget.endDate;

    return movements
      .filter((movement) => {

        const movementSpace =
          movement.space ||
          "Personal";

        if (
          movementSpace !==
          space
        ) {
          return false;
        }

        if (
          movement.type !==
          "Gasto"
        ) {
          return false;
        }

        if (
          startDate &&
          movement.date <
            startDate
        ) {
          return false;
        }

        if (
          endDate &&
          movement.date >
            endDate
        ) {
          return false;
        }

        if (
          budget.category ===
          "General"
        ) {
          return true;
        }

        return (
          movement.category ===
          budget.category
        );
      })
      .reduce(
        (total, movement) =>
          total +
          Number(
            movement.value
          ),
        0
      );
  };

  // ==============================
  // FORMATO DE DINERO
  // ==============================

  const formatMoney = (value) => {
    return `$${Number(
      value
    ).toLocaleString(
      "es-CO"
    )}`;
  };

  // ==============================
  // FILTRAR PRESUPUESTOS
  // ==============================

  const filteredBudgets =
    budgets.filter(
      (budget) =>
        (budget.space ||
          "Personal") ===
        space
    );

  // ==============================
  // INTERFAZ
  // ==============================

  return (
    <div className="budgets">

      {/* ENCABEZADO */}

      <div className="budgets-header">

        <div>
          <h1>
            Presupuestos
          </h1>

          <p>
            Controla tus límites de gasto
          </p>
        </div>

      </div>

      {/* FORMULARIO */}

      <div className="budget-form-card">

        <h2>
          {editingId
            ? "Editar presupuesto"
            : "Crear presupuesto"}
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          {/* NOMBRE */}

          <div className="form-group">

            <label>
              Nombre del presupuesto
            </label>

            <input
              type="text"
              name="name"
              placeholder="Ej: Presupuesto mensual"
              value={form.name}
              onChange={
                handleChange
              }
            />

          </div>

          {/* LÍMITE */}

          <div className="form-group">

            <label>
              Límite de gasto
            </label>

            <input
              type="number"
              name="limit"
              placeholder="Ej: 1000000"
              value={form.limit}
              onChange={
                handleChange
              }
            />

          </div>

          {/* CATEGORÍA */}

          <div className="form-group">

            <label>
              Categoría
            </label>

            <select
              name="category"
              value={form.category}
              onChange={
                handleChange
              }
            >

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

          {/* FECHAS */}

          <div className="form-row">

            <div className="form-group">

              <label>
                Fecha inicial
              </label>

              <input
                type="date"
                name="startDate"
                value={
                  form.startDate
                }
                onChange={
                  handleChange
                }
              />

            </div>

            <div className="form-group">

              <label>
                Fecha final
              </label>

              <input
                type="date"
                name="endDate"
                value={
                  form.endDate
                }
                onChange={
                  handleChange
                }
              />

            </div>

          </div>

          <button
            type="submit"
          >
            {editingId
              ? "Actualizar presupuesto"
              : "Crear presupuesto"}
          </button>

        </form>

      </div>

      {/* LISTA DE PRESUPUESTOS */}

      <div className="budget-list-card">

        <h2>
          Mis presupuestos -{" "}
          {space}
        </h2>

        {filteredBudgets.length ===
        0 ? (

          <p className="empty-message">
            No hay presupuestos registrados
            en {space}.
          </p>

        ) : (

          <div className="budget-list">

            {filteredBudgets.map(
              (budget) => {

                const spent =
                  getSpent(
                    budget
                  );

                const remaining =
                  Number(
                    budget.limit
                  ) -
                  spent;

                const percentage =
                  Number(
                    budget.limit
                  ) > 0
                    ? (
                        spent /
                        Number(
                          budget.limit
                        )
                      ) *
                      100
                    : 0;

                return (

                  <div
                    className="budget-card"
                    key={
                      budget.id
                    }
                  >

                    {/* CABECERA */}

                    <div className="budget-card-header">

                      <div>

                        <h3>
                          {
                            budget.name
                          }
                        </h3>

                        <p>
                          {
                            budget.category
                          }
                        </p>

                      </div>

                      <span>
                        {
                          formatMoney(
                            budget.limit
                          )
                        }
                      </span>

                    </div>

                    {/* FECHAS */}

                    <div className="budget-dates">

                      <span>
                        Desde:{" "}
                        {
                          budget.startDate
                        }
                      </span>

                      <span>
                        Hasta:{" "}
                        {
                          budget.endDate
                        }
                      </span>

                    </div>

                    {/* PROGRESO */}

                    <div className="budget-progress">

                      <div className="progress-info">

                        <span>
                          Gastado
                        </span>

                        <strong>
                          {
                            formatMoney(
                              spent
                            )
                          }
                        </strong>

                      </div>

                      <div className="progress-bar">

                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(
                              percentage,
                              100
                            )}%`
                          }}
                        >
                        </div>

                      </div>

                      <div className="progress-info">

                        <span>
                          Disponible
                        </span>

                        <strong>
                          {
                            formatMoney(
                              remaining
                            )
                          }
                        </strong>

                      </div>

                    </div>

                    {/* ALERTA */}

                    {percentage >=
                      100 && (

                      <div className="budget-alert danger">

                        Has superado el límite
                        del presupuesto.

                      </div>

                    )}

                    {percentage >= 80 &&
                      percentage < 100 && (

                      <div className="budget-alert warning">

                        Has utilizado el{" "}

                        {percentage.toFixed(
                          0
                        )}

                        % del presupuesto.

                      </div>

                    )}

                    {/* ACCIONES */}

                    <div className="budget-actions">

                      <button
                        onClick={() =>
                          handleEditBudget(
                            budget
                          )
                        }
                      >
                        Editar
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteBudget(
                            budget.id
                          )
                        }
                      >
                        Eliminar
                      </button>

                    </div>

                  </div>

                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default Presupuestos;