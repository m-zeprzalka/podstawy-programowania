/** Pomocnicze funkcje do zapisu liczb i znaków (wspólne dla przykładów interaktywnych). */

/** Zapis dwójkowy z dopełnieniem zerami, np. toBin(5, 8) → "00000101". */
export function toBin(value: number, bits = 8): string {
  return (value >>> 0).toString(2).padStart(bits, "0").slice(-bits)
}

/** Zapis szesnastkowy wielkimi literami, np. toHex(42) → "2A". */
export function toHex(value: number, digits = 2): string {
  return (value >>> 0).toString(16).toUpperCase().padStart(digits, "0")
}

/** Grupuje ciąg bitów po 4 dla czytelności: "01001000" → "0100 1000". */
export function groupBits(bits: string, size = 4): string {
  const out: string[] = []
  for (let i = bits.length; i > 0; i -= size) {
    out.unshift(bits.slice(Math.max(0, i - size), i))
  }
  return out.join(" ")
}

const CONTROL_NAMES: Record<number, string> = {
  0: "NUL",
  7: "BEL",
  8: "BS",
  9: "TAB",
  10: "LF",
  13: "CR",
  27: "ESC",
  32: "spacja",
  127: "DEL",
}

/**
 * Czytelna etykieta kodu ASCII: znak drukowalny albo nazwa znaku sterującego.
 * Dla wartości > 127 zwraca null (poza ASCII).
 */
export function asciiLabel(code: number): string | null {
  if (code < 0 || code > 127) return null
  if (CONTROL_NAMES[code]) return CONTROL_NAMES[code]
  if (code < 32) return `^${String.fromCharCode(code + 64)}`
  return String.fromCharCode(code)
}

/** Formatowanie liczb po polsku (spacja jako separator tysięcy). */
export function formatPL(value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat("pl-PL", options).format(value)
}
