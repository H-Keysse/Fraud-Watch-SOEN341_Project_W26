export function escapeHtml(unsafe) {
  return (unsafe || "")
    .toString()
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatDateISO(date) {
  return date.toISOString().split("T")[0];
}

export function formatWeekRange(mondayDate) {
  const endDate = new Date(mondayDate);
  endDate.setDate(endDate.getDate() + 6);
  return `${mondayDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
}

export function slotKey(dayOfWeek, mealType) {
  return `${dayOfWeek}-${mealType}`;
}

export function sanitizeIlikeSearchTerm(raw) {
  return (raw || "").trim().replace(/%/g, "").replace(/_/g, "");
}

export function normalizeMaxCostFilter(value) {
  const n = typeof value === "string" ? parseFloat(value) : Number(value);
  if (Number.isNaN(n) || n <= 0) return null;
  return n;
}

export function buildRecipeOrFilter(searchTerm) {
  const q = sanitizeIlikeSearchTerm(searchTerm);
  if (!q) return null;
  const pattern = `%${q}%`;
  return `name.ilike.${pattern},ingredients.ilike.${pattern},steps.ilike.${pattern}`;
}
