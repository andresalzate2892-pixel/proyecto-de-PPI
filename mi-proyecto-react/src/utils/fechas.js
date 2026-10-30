// Ayudas para trabajar con fechas en formato AAAA-MM-DD (hora local)

export function toDateString(date) {
  return date.toLocaleDateString("en-CA");
}

// Primer día del mes actual
export function monthStartString() {
  const now = new Date();

  return toDateString(
    new Date(now.getFullYear(), now.getMonth(), 1)
  );
}

// Lista de los últimos n días (el último es hoy), más antiguo primero
export function lastDays(n) {
  const days = [];

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    days.push(toDateString(date));
  }

  return days;
}

// "2026-10-28" -> "mié 28"
export function shortDayLabel(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  const weekday = date
    .toLocaleDateString("es-CO", { weekday: "short" })
    .replace(".", "");

  return `${weekday} ${day}`;
}
