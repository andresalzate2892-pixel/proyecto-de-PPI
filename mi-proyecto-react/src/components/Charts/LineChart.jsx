import "./Charts.css";

import { formatMoney } from "../../utils/cuentas";

const WIDTH = 640;
const HEIGHT = 260;
const PAD = { top: 20, right: 20, bottom: 34, left: 56 };

// Redondea el máximo a un número "bonito" para el eje Y
function niceMax(max) {
  if (max <= 0) {
    return 100;
  }

  const exponent = Math.pow(10, Math.floor(Math.log10(max)));
  const fraction = max / exponent;

  const steps = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];
  const step = steps.find((s) => s >= fraction) || 10;

  return step * exponent;
}

const compact = new Intl.NumberFormat("es-CO", {
  notation: "compact",
  maximumFractionDigits: 1
});

// Gráfica de línea con área. data = [{ label, value }]
function LineChart({ data }) {
  const maxValue = niceMax(Math.max(...data.map((d) => d.value), 0));

  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;

  const x = (index) =>
    PAD.left +
    (data.length === 1
      ? innerWidth / 2
      : (index * innerWidth) / (data.length - 1));

  const y = (value) =>
    PAD.top + innerHeight - (value / maxValue) * innerHeight;

  const points = data.map((d, i) => `${x(i)},${y(d.value)}`);

  const linePath = `M ${points.join(" L ")}`;

  const areaPath =
    `${linePath} L ${x(data.length - 1)},${PAD.top + innerHeight}` +
    ` L ${x(0)},${PAD.top + innerHeight} Z`;

  const ticks = [0, 1, 2, 3, 4].map((i) => (maxValue / 4) * i);

  return (
    <svg
      className="chart-svg"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label="Tendencia de ventas"
    >
      <defs>
        <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={y(tick)}
            y2={y(tick)}
            className="chart-grid"
          />

          <text
            x={PAD.left - 8}
            y={y(tick) + 4}
            textAnchor="end"
            className="chart-axis"
          >
            {compact.format(tick)}
          </text>
        </g>
      ))}

      <path d={areaPath} fill="url(#chart-area)" />

      <path d={linePath} className="chart-line" />

      {data.map((d, i) => (
        <g key={d.label}>
          <circle cx={x(i)} cy={y(d.value)} r="4" className="chart-dot">
            <title>
              {d.label}: {formatMoney(d.value)}
            </title>
          </circle>

          <text
            x={x(i)}
            y={HEIGHT - 10}
            textAnchor="middle"
            className="chart-axis"
          >
            {d.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default LineChart;
