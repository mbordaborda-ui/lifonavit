const COLOMBIA_OFFSET = "-05:00";

/**
 * Acepta "2026-12-31T23:59" (datetime-local) o una fecha ISO con zona.
 * Si no trae zona, asume hora de Colombia.
 */
export function normalizePromoEnd(value: string | undefined | null): string | null {
  const raw = value?.trim();
  if (!raw) return null;

  if (/[zZ]$|[+-]\d{2}:\d{2}$/.test(raw)) return raw;

  const withSeconds = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(raw) ? `${raw}:00` : raw;
  return `${withSeconds}${COLOMBIA_OFFSET}`;
}

export function formatPromoEnd(value: string | undefined | null): string {
  const iso = normalizePromoEnd(value);
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "America/Bogota",
  }).format(date);
}
