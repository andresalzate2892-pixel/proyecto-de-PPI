import { useEffect, useState } from "react";

import "./Reports.css";

import { getMovements } from "../../services/movementService";

import { useSpace } from "../../context/SpaceContext";

function Reports() {
  const [movements, setMovements] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { space } = useSpace();

  useEffect(() => {
    const loggedUser =
      JSON.parse(localStorage.getItem("usuario"));

    if (!loggedUser) {
      return;
    }

    getMovements(loggedUser.id).then(
      (data) => {
        const filteredBySpace =
          data.filter((movement) => {
            const movementSpace =
              movement.space ||
              "Personal";

            return (
              movementSpace ===
              space
            );
          });

        setMovements(
          filteredBySpace
        );
      }
    );
  }, [space]);

  const filteredMovements =
    movements.filter((movement) => {
      if (
        startDate &&
        movement.date < startDate
      ) {
        return false;
      }

      if (
        endDate &&
        movement.date > endDate
      ) {
        return false;
      }

      return true;
    });

  const totalIncome =
    filteredMovements
      .filter(
        (movement) =>
          movement.type === "Ingreso"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(movement.value),
        0
      );

  const totalExpenses =
    filteredMovements
      .filter(
        (movement) =>
          movement.type === "Gasto"
      )
      .reduce(
        (total, movement) =>
          total +
          Number(movement.value),
        0
      );

  const balance =
    totalIncome - totalExpenses;

  const expensesByCategory =
    filteredMovements
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

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const exportCSV = () => {
    const headers = [
      "Tipo",
      "Fecha",
      "Descripción",
      "Valor",
      "Categoría"
    ];

    const rows =
      filteredMovements.map(
        (movement) => [
          movement.type,
          movement.date,
          movement.description,
          movement.value,
          movement.category
        ]
      );

    const csvContent = [
      headers,
      ...rows
    ]
      .map(
        (row) =>
          row
            .map(
              (value) =>
                `"${String(value).replace(
                  /"/g,
                  '""'
                )}"`
            )
            .join(",")
      )
      .join("\n");

    const blob =
      new Blob(
        [csvContent],
        {
          type: "text/csv;charset=utf-8;"
        }
      );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      "reporte-exactum.csv";

    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports">

      <div className="reports-header">

        <div>

          <h1>
            Reportes
          </h1>

          <p>
            Consulta y analiza tu información
            financiera
          </p>

        </div>

      </div>

      <div className="report-filters">

        <div className="form-group">

          <label>
            Fecha inicial
          </label>

          <input
            type="date"
            value={startDate}
            onChange={(e) =>
              setStartDate(
                e.target.value
              )
            }
          />

        </div>

        <div className="form-group">

          <label>
            Fecha final
          </label>

          <input
            type="date"
            value={endDate}
            onChange={(e) =>
              setEndDate(
                e.target.value
              )
            }
          />

        </div>

        <button
          type="button"
          onClick={clearFilters}
        >
          Limpiar
        </button>

      </div>

      <div className="report-summary">

        <div className="report-summary-card">

          <span>
            Ingresos
          </span>

          <strong>
            {formatMoney(totalIncome)}
          </strong>

        </div>

        <div className="report-summary-card">

          <span>
            Gastos
          </span>

          <strong>
            {formatMoney(totalExpenses)}
          </strong>

        </div>

        <div className="report-summary-card">

          <span>
            Balance
          </span>

          <strong>
            {formatMoney(balance)}
          </strong>

        </div>

        <div className="report-summary-card">

          <span>
            Movimientos
          </span>

          <strong>
            {filteredMovements.length}
          </strong>

        </div>

      </div>

      <div className="report-card">

        <h2>
          Gastos por categoría
        </h2>

        {Object.keys(
          expensesByCategory
        ).length === 0 ? (

          <p className="empty-message">
            No hay gastos para el período
            seleccionado.
          </p>

        ) : (

          <div className="category-report">

            {Object.entries(
              expensesByCategory
            ).map(
              ([category, value]) => (

                <div
                  className="category-report-item"
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

      <div className="report-card">

        <div className="report-card-header">

          <h2>
            Detalle de movimientos
          </h2>

          <button
            type="button"
            onClick={exportCSV}
          >
            Exportar CSV
          </button>

        </div>

        {filteredMovements.length === 0 ? (

          <p className="empty-message">
            No hay movimientos para mostrar.
          </p>

        ) : (

          <div className="report-table-container">

            <table>

              <thead>

                <tr>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Valor</th>
                  <th>Categoría</th>
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
                        {formatMoney(
                          movement.value
                        )}
                      </td>

                      <td>
                        {
                          movement.category
                        }
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default Reports;