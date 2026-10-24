/**
 * Dokładna arytmetyka dziesiętna (BigInt) i rozkład liczby IEEE 754 (64 bity)
 * do przykładu „0.1 + 0.2”.
 */

const B0 = BigInt(0)
const B1 = BigInt(1)
const B5 = BigInt(5)
const B10 = BigInt(10)

/** Liczba dziesiętna: n / 10^s (dokładnie). */
export type Dziesietna = { n: bigint; s: number }

/**
 * Parsuje zapis dziesiętny („0,1”, „0.1”, „-2.5e3”, „1 000”) bez zaokrągleń.
 * Zwraca null dla niepoprawnego zapisu.
 */
export function parsujDziesietna(tekst: string): Dziesietna | null {
  const t = tekst
    .trim()
    .replace(/[\s ]/g, "")
    .replace(",", ".")
    .replace("−", "-")
  const m = /^([+-]?)(\d*)(?:\.(\d*))?(?:e([+-]?\d{1,4}))?$/i.exec(t)
  if (!m) return null
  const calk = m[2] ?? ""
  const ulamek = m[3] ?? ""
  if (calk === "" && ulamek === "") return null
  const wykl = m[4] ? Number(m[4]) : 0
  if (Math.abs(wykl) > 400 || calk.length + ulamek.length > 400) return null
  let n = BigInt((calk || "0") + ulamek)
  let s = ulamek.length - wykl
  if (s < 0) {
    n *= B10 ** BigInt(-s)
    s = 0
  }
  if (m[1] === "-") n = -n
  return uprosc({ n, s })
}

/** Usuwa zbędne zera na końcu: 10/10² → 1/10¹. */
function uprosc(d: Dziesietna): Dziesietna {
  let { n, s } = d
  while (s > 0 && n % B10 === B0) {
    n /= B10
    s--
  }
  return { n, s }
}

function wyrownaj(a: Dziesietna, b: Dziesietna) {
  const s = Math.max(a.s, b.s)
  return {
    an: a.n * B10 ** BigInt(s - a.s),
    bn: b.n * B10 ** BigInt(s - b.s),
    s,
  }
}

export function dodaj(a: Dziesietna, b: Dziesietna): Dziesietna {
  const { an, bn, s } = wyrownaj(a, b)
  return uprosc({ n: an + bn, s })
}

export function odejmij(a: Dziesietna, b: Dziesietna): Dziesietna {
  const { an, bn, s } = wyrownaj(a, b)
  return uprosc({ n: an - bn, s })
}

/** Zapis w notacji JS (kropka dziesiętna, bez wykładnika). */
export function dziesietnaNaTekst(d: Dziesietna): string {
  const ujemna = d.n < B0
  const cyfry = (ujemna ? -d.n : d.n).toString().padStart(d.s + 1, "0")
  const calk = d.s ? cyfry.slice(0, -d.s) : cyfry
  const ulamek = d.s ? cyfry.slice(-d.s) : ""
  return `${ujemna ? "-" : ""}${calk}${ulamek ? "." + ulamek : ""}`
}

/**
 * Wartość bezwzględna w notacji naukowej z 3 cyframi znaczącymi:
 * 4,44 × 10⁻¹⁷ → { mantysa: "4,44", wykladnik: -17 }.
 */
export function naukowo(
  d: Dziesietna
): { mantysa: string; wykladnik: number } | null {
  const abs = d.n < B0 ? -d.n : d.n
  if (abs === B0) return null
  const cyfry = abs.toString()
  const wykladnik = cyfry.length - 1 - d.s
  const znaczace = cyfry.slice(0, 3).replace(/0+$/, "")
  const mantysa =
    znaczace.length > 1 ? `${znaczace[0]},${znaczace.slice(1)}` : znaczace
  return { mantysa, wykladnik }
}

/** Rozkład 64-bitowej liczby zmiennoprzecinkowej (IEEE 754, binary64). */
export function rozloz(x: number) {
  const dv = new DataView(new ArrayBuffer(8))
  dv.setFloat64(0, x)
  const hi = dv.getUint32(0)
  const lo = dv.getUint32(4)
  const bity =
    hi.toString(2).padStart(32, "0") + lo.toString(2).padStart(32, "0")
  const znak = hi >>> 31
  const wykladnik = (hi >>> 20) & 0x7ff
  const mantysa = (BigInt(hi & 0xfffff) << BigInt(32)) | BigInt(lo)
  return { bity, znak, wykladnik, mantysa }
}

/**
 * Dokładna wartość przechowywana w double jako liczba dziesiętna,
 * np. 0.1 → 0.1000000000000000055511151231257827021181583404541015625.
 * Dla NaN i ±Infinity zwraca null.
 */
export function dokladnie(x: number): Dziesietna | null {
  if (!Number.isFinite(x)) return null
  const { znak, wykladnik, mantysa } = rozloz(x)
  let m: bigint
  let e: number
  if (wykladnik === 0) {
    m = mantysa
    e = -1074
  } else {
    m = mantysa | (B1 << BigInt(52))
    e = wykladnik - 1075
  }
  let wynik: Dziesietna
  if (e >= 0) wynik = { n: m << BigInt(e), s: 0 }
  else wynik = { n: m * B5 ** BigInt(-e), s: -e }
  if (znak) wynik.n = -wynik.n
  return uprosc(wynik)
}

/** Czy dwie liczby dziesiętne są równe. */
export function rowne(a: Dziesietna, b: Dziesietna) {
  const { an, bn } = wyrownaj(a, b)
  return an === bn
}
