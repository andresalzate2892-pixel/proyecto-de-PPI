import "./Charts.css";

import { formatMoney } from "../../utils/cuentas";

const COLORS = [
  "#1e3a8a",
  "#3b5bb5",
  "#6d86cc",
  "#93a8dc",
  "#b9c6e8",
  "#dbe2f3"
];

const RADIUS = 60;
const STROKE = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Gráfica de dona. data = [{ label, value }]
// Muestra las 5 mayores y agrupa el resto en "Otros".
function DonutChart({ data, centerLabel }) {
  const sorted = [...data]
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value);

  const top = sorted.slice(0, 5);

  const othersValue = sorted
    .slice(5)
    .reduce((total, d) => total + d.value, 0);

  const segments =
    othersValue > 0
      ? [...top, { label: "Otros", value: othersValue }]
      : top;

  const total = segments.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return <p className="chart-empty">Aún no hay datos para mostrar.</p>;
  }

  let offset = 0;

  return (
    <div className="donut">

      <svg
        className="donut-svg"
        viewBox="0 0 160 160"
        role="img"
        aria-label={centerLabel}
      >
        <g transform="rotate(-90 80 80)">

          {segments.map((segment, index) => {
            const length = (segment.value / total) * CIRCUMFERENCE;

            const circle = (
              <circle
                key={segment.label}
                cx="80"
                cy="80"
                r={RADIUS}
                fill="none"
                stroke={COLORS[index % COLORS.length]}
                strokeWidth={STROKE}
                strokeDasharray={`${length} ${CIRCUMFERENCE - length}`}
                strokeDashoffset={-offset}
              >
                <title>
                  {segment.label}: {formatMoney(segment.value)}
                </title>
              </circle>
            );

            offset += length;

            return circle;
          })}

        </g>
      </svg>

      <ul className="donut-legend">
        {segments.map((segment, index) => (
          <li key={segment.label}>
            <span
              className="donut-dot"
              style={{
                backgroundColor: COLORS[index % COLORS.length]
              }}
            />

            <span className="donut-name">{segment.label}</span>

            <strong>
              {Math.round((segment.value / total) * 100)}%
            </strong>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default DonutChart;
