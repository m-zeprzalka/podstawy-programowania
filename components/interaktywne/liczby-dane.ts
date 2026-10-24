/**
 * Pomocnicze funkcje dla przykładów o liczbach (moduły 9–10 lekcji 0):
 * formatowanie po polsku, jednostki dziesiętne, odmiana, indeksy górne.
 */
import { formatPL } from "@/lib/bity"

/** Typograficzny minus (U+2212). */
export const MINUS = "−"

/** Liczba po polsku z typograficznym minusem: -2147483648 → "−2 147 483 648". */
export function formatLiczba(
  value: number,
  options?: Intl.NumberFormatOptions
) {
  return formatPL(value, options).replace("-", MINUS)
}

const SUPERSCRIPT: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "-": "⁻",
  "−": "⁻",
}

/** Indeks górny: sup(-4) → "⁻⁴", sup(10) → "¹⁰". */
export function sup(value: number | string) {
  return String(value)
    .split("")
    .map((c) => SUPERSCRIPT[c] ?? c)
    .join("")
}

/**
 * Polska odmiana rzeczownika po liczbie całkowitej:
 * odmiana(1, ["krok", "kroki", "kroków"]) → "krok", 3 → "kroki", 12 → "kroków".
 */
export function odmiana(n: number, formy: readonly [string, string, string]) {
  const abs = Math.abs(Math.trunc(n))
  if (abs === 1) return formy[0]
  const d = abs % 10
  const s = abs % 100
  if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return formy[1]
  return formy[2]
}

const BAJTY = ["B", "kB", "MB", "GB", "TB", "PB"] as const
const BITY = ["bit/s", "kbit/s", "Mbit/s", "Gbit/s", "Tbit/s"] as const

/** Wybiera jednostkę dziesiętną (1 k = 1000) i formatuje z 1 miejscem po przecinku. */
function wJednostkach(
  value: number,
  jednostki: readonly string[],
  prog = 1000
) {
  let i = 0
  let v = value
  while (v >= prog && i < jednostki.length - 1) {
    v /= 1000
    i++
  }
  const tekst = `${formatPL(v, { maximumFractionDigits: i === 0 ? 0 : 1 })}\u00a0${jednostki[i]}`
  const zaokraglone = Number(v.toFixed(i === 0 ? 0 : 1))
  return { tekst, dokladnie: Math.abs(zaokraglone - v) < 1e-9 }
}

/**
 * Rozmiar w jednostkach dziesiętnych (1 MB = 10⁶ B), np. 6 220 800 → "6,2 MB".
 * `dokladnie` mówi, czy zaokrąglenie nic nie zmieniło (wtedy „=”, inaczej „≈”).
 */
export function formatBajty(bajty: number) {
  return wJednostkach(bajty, BAJTY)
}

/**
 * Przepływność w jednostkach dziesiętnych, do 4 cyfr przed przecinkiem
 * (jak w tabelach audio): 1 411 200 → "1411,2 kbit/s".
 */
export function formatBitrate(bityNaSekunde: number) {
  return wJednostkach(bityNaSekunde, BITY, 10_000)
}

/** Czas w sekundach jako „45 s”, „1 min”, „2 min 30 s”. */
export function formatCzas(sekundy: number) {
  const s = Math.round(sekundy)
  if (s < 60) return `${s} s`
  const min = Math.floor(s / 60)
  const reszta = s % 60
  return reszta ? `${min} min ${reszta} s` : `${min} min`
}

/** Krótki zapis dużych liczb: 4 000 000 000 → "4 mld", 1 500 000 → "1,5 mln". */
export function formatKrotko(value: number) {
  const opcje = { maximumFractionDigits: 1 }
  if (value >= 1e9) return `${formatPL(value / 1e9, opcje)} mld`
  if (value >= 1e6) return `${formatPL(value / 1e6, opcje)} mln`
  if (value >= 1e4) return `${formatPL(value / 1e3, opcje)} tys.`
  return formatPL(value, opcje)
}

/** Data w UTC, deterministycznie: "2038-01-19 03:14:07 UTC". */
export function formatDataUTC(sekundyOd1970: number) {
  const d = new Date(sekundyOd1970 * 1000)
  if (Number.isNaN(d.getTime())) return "—"
  return `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`
}

/** Czy użytkownik prosi o ograniczenie animacji (tylko w przeglądarce). */
export function ograniczRuch() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}
