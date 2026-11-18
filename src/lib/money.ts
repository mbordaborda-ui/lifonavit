export const COP = new Intl.NumberFormat("es-CO", {
  maximumFractionDigits: 0,
});

/** Formatea pesos colombianos: 109900 → "$ 109.900" */
export function formatCop(value: number): string {
  return `$ ${COP.format(Math.round(value))}`;
}

/** Precio por unidad con dos decimales solo si aporta información. */
export function formatCopPerUnit(total: number, units: number): string {
  if (units <= 0) return formatCop(total);
  const perUnit = total / units;
  const rounded = Math.round(perUnit);
  return Math.abs(perUnit - rounded) < 1 ? formatCop(rounded) : formatCop(perUnit);
}

export function percentOff(price: number, compareAt?: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function saturateInt(value: unknown, fallback = 0): number {
  const n = typeof value === "number" ? value : Number.parseInt(String(value), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.trunc(n));
}
