import { useEffect, useState } from "react";

import "./Dashboard.css";

import { getMovements } from "../../services/movementService";

import { useSpace } from "../../context/SpaceContext";

function Dashboard() {
  const [allMovements, setAllMovements] = useState([]);
  const [movements, setMovements] = useState([]);
  const [userName, setUserName] = useState("");

  const { space, setSpace } = useSpace();

  useEffect(() => {
    const loggedUser = JSON.parse(
      localStorage.getItem("usuario")
    );

    if (!loggedUser) {
      return;
    }

    setUserName(loggedUser.name);

    getMovements(loggedUser.id).then((data) => {
      setAllMovements(data);
    });
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
    .filter(
      (movement) =>
        movement.type === "Ingreso"
    )
    .reduce(
      (total, movement) =>
        total + Number(movement.value),
      0
    );

  const totalExpenses = movements
    .filter(
      (movement) =>
        movement.type === "Gasto"
    )
    .reduce(
      (total, movement) =>
        total + Number(movement.value),
      0
    );

  const balance =
    totalIncome - totalExpenses;

  const expensesByCategory = movements
    .filter(
      (movement) =>
        movement.type === "Gasto"
    )
    .reduce(
      (categories, movement) => {
        const category =
          movement.category ||
          "Sin categoría";

        const value =
          Number(movement.value);

        if (!categories[category]) {
          categories[category] = 0;
        }

        categories[category] += value;

        return categories;
      },
      {}
    );

  const formatMoney = (value) => {
    return `$${Number(value).toLocaleString(
      "es-CO"
    )}`;
  };

  return (
    <div className="dashboard">

      <div className="dashboard-header">

        <div>
          <h1>
            Hola, {userName} 👋
          </h1>

          <p>
            Resumen de tus finanzas en{" "}
            <strong>{space}</strong>
          </p>
        </div>

        <div>
          <label>
            Espacio financiero
          </label>

          <select
            value={space}
            onChange={handleSpaceChange}
          >
            <option value="Personal">
              Personal
            </option>

            <option value="Emprendimiento">
              Emprendimiento
            </option>
          </select>
        </div>

      </div>

      <div className="summary-cards">

        <div className="summary-card">
          <h3>Ingresos</h3>

          <p>
            {formatMoney(totalIncome)}
          </p>
        </div>

        <div className="summary-card">
          <h3>Gastos</h3>

          <p>
            {formatMoney(totalExpenses)}
          </p>
        </div>

        <div className="summary-card">
          <h3>Balance</h3>

          <p>
            {formatMoney(balance)}
          </p>
        </div>

      </div>

      <div className="dashboard-sections">

        <div className="dashboard-card">

          <h2>
            Gastos por categoría
          </h2>

          {Object.keys(
            expensesByCategory
          ).length === 0 ? (
            <p>
              Aún no hay gastos registrados
              en {space}.
            </p>
          ) : (
            <div className="category-list">

              {Object.entries(
                expensesByCategory
              ).map(
                ([category, value]) => (
                  <div
                    className="category-item"
                    key={category}
                  >

                    <span>
                      {category}
                    </span>

                    <strong>
                      {formatMoney(value)}
                    </strong>

                  </div>
                )
              )}

            </div>
          )}

        </div>

        <div className="dashboard-card">

          <h2>
            Resumen financiero
          </h2>

          <div className="financial-summary">

            <div>
              <span>
                Total de movimientos
              </span>

              <strong>
                {movements.length}
              </strong>
            </div>

            <div>
              <span>
                Ingresos registrados
              </span>

              <strong>
                {
                  movements.filter(
                    (movement) =>
                      movement.type ===
                      "Ingreso"
                  ).length
                }
              </strong>
            </div>

            <div>
              <span>
                Gastos registrados
              </span>

              <strong>
                {
                  movements.filter(
                    (movement) =>
                      movement.type ===
                      "Gasto"
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

