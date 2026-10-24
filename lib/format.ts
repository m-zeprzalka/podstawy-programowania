/** Czas w minutach po polsku: 45 → „45 min”, 150 → „2 h 30 min”. */
export function formatCzas(min: number) {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h} h ${m} min` : `${h} h`
}

export function pad2(n: number) {
  return String(n).padStart(2, "0")
}

/**
 * Polska odmiana rzeczownika po liczebniku.
 * odmiana(1, ["moduł", "moduły", "modułów"]) → „1 moduł”, 3 → „3 moduły”, 5 → „5 modułów”.
 */
export function odmiana(n: number, [jeden, kilka, wiele]: [string, string, string]) {
  const d = n % 10
  const s = n % 100
  const forma = n === 1 ? jeden : d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele
  return `${n} ${forma}`
}

export const MODULY: [string, string, string] = ["moduł", "moduły", "modułów"]
