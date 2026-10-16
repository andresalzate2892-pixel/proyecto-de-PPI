
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import "./Reports.css";
import { getMovements } from "../../services/movementService";
import { useSpace } from "../../context/SpaceContext";

function Reports() {
  const [movements, setMovements] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { space } = useSpace();

  useEffect(() => {
    const loggedUser = JSON.parse(
      localStorage.getItem("usuario")
    );

    if (!loggedUser) {
      setMovements([]);
      return;
    }

    getMovements(loggedUser.id)
      .then((data) => {
        const filteredBySpace = data.filter(
          (movement) =>
            (movement.space || "Personal") === space
        );

        setMovements(filteredBySpace);
      })
      .catch((error) => {
        console.error("Error cargando movimientos:", error);
        setMovements([]);
      });
  }, [space]);

  const filteredMovements = movements.filter((movement) => {
    if (startDate && movement.date < startDate) {
      return false;
    }

    if (endDate && movement.date > endDate) {
      return false;
    }

    return true;
  });

  const totalIncome = filteredMovements
    .filter((movement) => movement.type === "Ingreso")
    .reduce(
      (total, movement) => total + Number(movement.value || 0),
      0
    );

  const totalExpenses = filteredMovements
    .filter((movement) => movement.type === "Gasto")
    .reduce(
      (total, movement) => total + Number(movement.value || 0),
      0
    );

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = filteredMovements
    .filter((movement) => movement.type === "Gasto")
    .reduce((categories, movement) => {
      const category = movement.category || "Sin categoría";
      const value = Number(movement.value || 0);

      categories[category] =
        (categories[category] || 0) + value;

      return categories;
    }, {});

  const formatMoney = (value) =>
    `$${Number(value || 0).toLocaleString("es-CO")}`;

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text("EXACTUM", 14, 18);

      doc.setFontSize(15);
      doc.text("Reporte financiero", 14, 28);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.text(`Espacio: ${space}`, 14, 38);
      doc.text(
        `Fecha inicial: ${startDate || "Sin límite"}`,
        14,
        45
      );
      doc.text(
        `Fecha final: ${endDate || "Sin límite"}`,
        14,
        52
      );
      doc.text(
        `Generado: ${new Date().toLocaleDateString("es-CO")}`,
        pageWidth - 14,
        38,
        { align: "right" }
      );

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Resumen financiero", 14, 64);

      autoTable(doc, {
        startY: 69,
        head: [["Concepto", "Valor"]],
        body: [
          ["Ingresos", formatMoney(totalIncome)],
          ["Gastos", formatMoney(totalExpenses)],
          ["Balance", formatMoney(balance)],
          ["Cantidad de movimientos", String(filteredMovements.length)],
        ],
        theme: "grid",
        headStyles: { fillColor: [40, 70, 110] },
        styles: { fontSize: 10 },
      });

      let nextY = doc.lastAutoTable.finalY + 12;

      doc.setFont("helvetica", "bold");
      doc.text("Gastos por categoría", 14, nextY);

      const categoryRows = Object.entries(expensesByCategory).map(
        ([category, value]) => [category, formatMoney(value)]
      );

      autoTable(doc, {
        startY: nextY + 5,
        head: [["Categoría", "Total"]],
        body: categoryRows.length
          ? categoryRows
          : [["Sin gastos registrados", formatMoney(0)]],
        theme: "grid",
        headStyles: { fillColor: [40, 70, 110] },
        styles: { fontSize: 10 },
      });

      nextY = doc.lastAutoTable.finalY + 12;

      doc.setFont("helvetica", "bold");
      doc.text("Detalle de movimientos", 14, nextY);

      const movementRows = filteredMovements.map((movement) => [
        movement.type || "",
        movement.date || "",
        movement.description || "Sin descripción",
        formatMoney(movement.value),
        movement.category || "Sin categoría",
      ]);

      autoTable(doc, {
        startY: nextY + 5,
        head: [[
          "Tipo",
          "Fecha",
          "Descripción",
          "Valor",
          "Categoría",
        ]],
        body: movementRows.length
          ? movementRows
          : [["-", "-", "Sin movimientos", "-", "-"]],
        theme: "striped",
        headStyles: { fillColor: [40, 70, 110] },
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: "linebreak",
        },
        columnStyles: {
          2: { cellWidth: 48 },
        },
      });

      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        doc.text(
          `EXACTUM - Página ${page} de ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 8,
          { align: "center" }
        );
      }

      const safeSpace = space
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-");

      doc.save(`reporte-exactum-${safeSpace}.pdf`);
    } catch (error) {
      console.error("Error generando el PDF:", error);
      alert("No se pudo generar el PDF. Revisa la consola del navegador.");
    }
  };

  return (
    <div className="reports">
      <div className="reports-header">
        <div>
          <h1>Reportes</h1>
          <p>Consulta y analiza tu información financiera</p>
        </div>
      </div>

      <div className="report-filters">
        <div className="form-group">
          <label>Fecha inicial</label>
          <input
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Fecha final</label>
          <input
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <button type="button" onClick={clearFilters}>
          Limpiar
        </button>
      </div>

      <div className="report-summary">
        <div className="report-summary-card">
          <span>Ingresos</span>
          <strong>{formatMoney(totalIncome)}</strong>
        </div>

        <div className="report-summary-card">
          <span>Gastos</span>
          <strong>{formatMoney(totalExpenses)}</strong>
        </div>

        <div className="report-summary-card">
          <span>Balance</span>
          <strong>{formatMoney(balance)}</strong>
        </div>

        <div className="report-summary-card">
          <span>Movimientos</span>
          <strong>{filteredMovements.length}</strong>
        </div>
      </div>

      <div className="report-card">
        <h2>Gastos por categoría</h2>

        {Object.keys(expensesByCategory).length === 0 ? (
          <p className="empty-message">
            No hay gastos para el período seleccionado.
          </p>
        ) : (
          <div className="category-report">
            {Object.entries(expensesByCategory).map(
              ([category, value]) => (
                <div className="category-report-item" key={category}>
                  <span>{category}</span>
                  <strong>{formatMoney(value)}</strong>
                </div>
              )
            )}
          </div>
        )}
      </div>

      <div className="report-card">
        <div className="report-card-header">
          <h2>Detalle de movimientos</h2>

          <button type="button" onClick={exportPDF}>
            Exportar PDF
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
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td>{movement.type}</td>
                    <td>{movement.date}</td>
                    <td>{movement.description}</td>
                    <td>{formatMoney(movement.value)}</td>
                    <td>{movement.category || "Sin categoría"}</td>
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

export default Reports;
