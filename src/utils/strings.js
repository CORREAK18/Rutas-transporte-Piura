export function normalizeText(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function formatMoney(value) {
  const amount = Number(value ?? 0);
  return `S/ ${amount.toFixed(2)}`.replace(".00", "");
}

export function formatDistance(value) {
  return `${Number(value ?? 0).toFixed(1)} km`;
}

export function formatMinutes(value) {
  return `${Math.round(Number(value ?? 0))} min`;
}

export function formatStopCount(value) {
  const total = Number(value ?? 0);
  return `${total} ${total === 1 ? "paradero" : "paraderos"}`;
}
