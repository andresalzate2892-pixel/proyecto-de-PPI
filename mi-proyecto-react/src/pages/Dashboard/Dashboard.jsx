import { useEffect, useState } from "react";

import "./Dashboard.css";

import { getMovements } from "../../services/movementService";
import { getBudgets } from "../../services/budgetService";
import { useSpace } from "../../context/SpaceContext";

function Dashboard() {
  const [allMovements, setAllMovements] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [movements, setMovements] = useState([]);
  const [userName, setUserName] = useState("");
  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const { space, setSpace } = useSpace();

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const storedUser = localStorage.getItem("usuario");

        if (!storedUser) {
          return;
        }

        const loggedUser = JSON.parse(storedUser);

        if (active) {
          setUserName(
            loggedUser.name || loggedUser.nombre || ""
          );
        }

        const [movementResult, budgetResult] =
          await Promise.allSettled([
            getMovements(loggedUser.id),
            getBudgets(loggedUser.id)
          ]);

        if (!active) return;

        if (movementResult.status === "fulfilled") {
          setAllMovements(
            Array.isArray(movementResult.value)
              ? movementResult.value
              : []
          );
        } else {
          console.error(
            "Error cargando movimientos:",
            movementResult.reason
          );
        }

        if (budgetResult.status === "fulfilled") {
          setBudgets(
            Array.isArray(budgetResult.value)
              ? budgetResult.value
              : []
          );
        } else {
          console.error(
            "Error cargando presupuestos:",
            budgetResult.reason
          );
        }
      } catch (error) {
        console.error("Error cargando el Dashboard:", error);
      } finally {
        if (active) {
          setLoadingNotifications(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const filteredMovements = allMovements.filter(
      (movement) =>
        (movement.space || "Personal") === space
    );

    setMovements(filteredMovements);
  }, [allMovements, space]);

  const handleSpaceChange = (e) => {
    setSpace(e.target.value);
  };

  const totalIncome = movements
    .filter((movement) => movement.type === "Ingreso")
    .reduce(
      (total, movement) => total + Number(movement.value || 0),
      0
    );

  const totalExpenses = movements
    .filter((movement) => movement.type === "Gasto")
    .reduce(
      (total, movement) => total + Number(movement.value || 0),
      0
    );

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = movements
    .filter((movement) => movement.type === "Gasto")
    .reduce((categories, movement) => {
      const category = movement.category || "Sin categoría";
      const value = Number(movement.value || 0);

      categories[category] =
        (categories[category] || 0) + value;

      return categories;
    }, {});

  const formatMoney = (value) => {
    return `$${Number(value).toLocaleString("es-CO")}`;
  };

  // Calcula el gasto que corresponde a cada presupuesto.
  const getBudgetSpent = (budget) => {
    const startDate =
      budget.startDate || budget.start || "";

    const endDate =
      budget.endDate || budget.end || "";

    const category = budget.category || "General";

    return movements
      .filter((movement) => {
        if (movement.type !== "Gasto") {
          return false;
        }

        const movementDate =
          movement.date || movement.fecha || "";

        // Si hay fechas definidas, respeta el período.
        if (
          startDate &&
          movementDate &&
          movementDate < startDate
        ) {
          return false;
        }

        if (
          endDate &&
          movementDate &&
          movementDate > endDate
        ) {
          return false;
        }

        // Un presupuesto General incluye todas las categorías.
        if (
          category !== "General" &&
          category !== "Todas" &&
          movement.category !== category
        ) {
          return false;
        }

        return true;
      })
      .reduce(
        (total, movement) =>
          total + Number(movement.value || 0),
        0
      );
  };

  // Genera las alertas del espacio financiero activo.
  const notifications = budgets
    .filter(
      (budget) =>
        (budget.space || "Personal") === space
    )
    .map((budget) => {
      const limit = Number(
        budget.limit ?? budget.amount ?? budget.value ?? 0
      );

      const spent = getBudgetSpent(budget);

      const percentage =
        limit > 0 ? (spent / limit) * 100 : 0;

      return {
        id: budget.id,
        name:
          budget.name ||
          (budget.category && budget.category !== "General"
            ? `Presupuesto de ${budget.category}`
            : "Presupuesto general"),
        limit,
        spent,
        percentage
      };
    })
    .filter(
      (budget) =>
        budget.limit > 0 &&
        budget.percentage >= 80
    )
    .sort((a, b) => b.percentage - a.percentage);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Hola, {userName} 👋</h1>

          <p>
            Resumen de tus finanzas en{" "}
            <strong>{space}</strong>
          </p>
        </div>

        <div>
          <label htmlFor="financial-space">
            Espacio financiero
          </label>

          <select
            id="financial-space"
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

      {/* PANEL DE NOTIFICACIONES */}
      <section
        className="notifications-panel"
        aria-live="polite"
      >
        <div className="notifications-header">
          <div>
            <h2>
              <span aria-hidden="true">🔔</span>{" "}
              Notificaciones
            </h2>

            <p>
              Alertas de tus presupuestos en {space}
            </p>
          </div>

          <span className="notifications-count">
            {loadingNotifications
              ? "..."
              : notifications.length}
          </span>
        </div>

        {loadingNotifications ? (
          <p className="notifications-empty">
            Consultando tus presupuestos...
          </p>
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <span aria-hidden="true">✓</span>
            <p>
              No tienes alertas de presupuesto en este
              espacio financiero.
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => {
              const critical =
                notification.percentage >= 100;

              return (
                <article
                  className={`notification-item ${
                    critical
                      ? "notification-critical"
                      : "notification-warning"
                  }`}
                  key={notification.id}
                >
                  <div className="notification-icon">
                    {critical ? "!" : "⚠"}
                  </div>

                  <div className="notification-content">
                    <h3>
                      {critical
                        ? "Presupuesto alcanzado o excedido"
                        : "Presupuesto próximo al límite"}
                    </h3>

                    <p>{notification.name}</p>

                    <p>
                      Has gastado{" "}
                      <strong>
                        {formatMoney(notification.spent)}
                      </strong>{" "}
                      de{" "}
                      <strong>
                        {formatMoney(notification.limit)}
                      </strong>
                      .
                    </p>

                    <div className="notification-progress">
                      <div
                        className="notification-progress-bar"
                        style={{
                          width: `${Math.min(
                            notification.percentage,
                            100
                          )}%`
                        }}
                      />
                    </div>

                    <span className="notification-percentage">
                      {notification.percentage.toLocaleString(
                        "es-CO",
                        {
                          maximumFractionDigits: 2
                        }
                      )}
                      % utilizado
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Ingresos</h3>
          <p>{formatMoney(totalIncome)}</p>
        </div>

        <div className="summary-card">
          <h3>Gastos</h3>
          <p>{formatMoney(totalExpenses)}</p>
        </div>

        <div className="summary-card">
          <h3>Balance</h3>
          <p>{formatMoney(balance)}</p>
        </div>
      </div>

      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h2>Gastos por categoría</h2>

          {Object.keys(expensesByCategory).length === 0 ? (
            <p>
              Aún no hay gastos registrados en {space}.
            </p>
          ) : (
            <div className="category-list">
              {Object.entries(expensesByCategory).map(
                ([category, value]) => (
                  <div
                    className="category-item"
                    key={category}
                  >
                    <span>{category}</span>
                    <strong>{formatMoney(value)}</strong>
                  </div>
                )
              )}
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Resumen financiero</h2>

          <div className="financial-summary">
            <div>
              <span>Total de movimientos</span>
              <strong>{movements.length}</strong>
            </div>

            <div>
              <span>Ingresos registrados</span>
              <strong>
                {
                  movements.filter(
                    (movement) =>
                      movement.type === "Ingreso"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>Gastos registrados</span>
              <strong>
                {
                  movements.filter(
                    (movement) =>
                      movement.type === "Gasto"
                  ).length
                }
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;