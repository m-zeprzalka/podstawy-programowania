/**
 * Tablice i logika kodowań znaków dla „Generatora krzaczków”.
 *
 * Tablice bajtów 0x80–0xFF wygenerowano skryptem Pythona z modułu `codecs`
 * (cp1250, iso8859_2, cp852, cp437): `bytes([b]).decode(kodek)`, a bajty,
 * których kodek nie zna, zapisano jako `null`. Bajty 0x00–0x7F we wszystkich
 * kodowaniach to zwykłe ASCII. Plik nie ma importów, więc da się go
 * sprawdzić bezpośrednio w Node.
 *
 * Odtworzenie tablicy (Python 3):
 *   for b in range(0x80, 0x100):
 *       try: znak = bytes([b]).decode("cp1250")
 *       except UnicodeDecodeError: znak = None
 */

/** Windows-1250: bajty 0x80–0xFF (Python codecs „cp1250”). `null` = bajt niezdefiniowany. */
// prettier-ignore
export const CP1250_HIGH: readonly (string | null)[] = [
  /* 80 */ "€", null, "‚", null, "„", "…", "†", "‡", null, "‰", "Š", "‹", "Ś", "Ť", "Ž", "Ź",
  /* 90 */ null, "‘", "’", "“", "”", "•", "–", "—", null, "™", "š", "›", "ś", "ť", "ž", "ź",
  /* A0 */ "\u00A0", "ˇ", "˘", "Ł", "¤", "Ą", "¦", "§", "¨", "©", "Ş", "«", "¬", "\u00AD", "®", "Ż",
  /* B0 */ "°", "±", "˛", "ł", "´", "µ", "¶", "·", "¸", "ą", "ş", "»", "Ľ", "˝", "ľ", "ż",
  /* C0 */ "Ŕ", "Á", "Â", "Ă", "Ä", "Ĺ", "Ć", "Ç", "Č", "É", "Ę", "Ë", "Ě", "Í", "Î", "Ď",
  /* D0 */ "Đ", "Ń", "Ň", "Ó", "Ô", "Ő", "Ö", "×", "Ř", "Ů", "Ú", "Ű", "Ü", "Ý", "Ţ", "ß",
  /* E0 */ "ŕ", "á", "â", "ă", "ä", "ĺ", "ć", "ç", "č", "é", "ę", "ë", "ě", "í", "î", "ď",
  /* F0 */ "đ", "ń", "ň", "ó", "ô", "ő", "ö", "÷", "ř", "ů", "ú", "ű", "ü", "ý", "ţ", "˙",
]

/** ISO-8859-2: bajty 0x80–0xFF (Python codecs „iso8859_2”). `null` = bajt niezdefiniowany. */
// prettier-ignore
export const ISO_8859_2_HIGH: readonly (string | null)[] = [
  /* 80 */ "\u0080", "\u0081", "\u0082", "\u0083", "\u0084", "\u0085", "\u0086", "\u0087", "\u0088", "\u0089", "\u008A", "\u008B", "\u008C", "\u008D", "\u008E", "\u008F",
  /* 90 */ "\u0090", "\u0091", "\u0092", "\u0093", "\u0094", "\u0095", "\u0096", "\u0097", "\u0098", "\u0099", "\u009A", "\u009B", "\u009C", "\u009D", "\u009E", "\u009F",
  /* A0 */ "\u00A0", "Ą", "˘", "Ł", "¤", "Ľ", "Ś", "§", "¨", "Š", "Ş", "Ť", "Ź", "\u00AD", "Ž", "Ż",
  /* B0 */ "°", "ą", "˛", "ł", "´", "ľ", "ś", "ˇ", "¸", "š", "ş", "ť", "ź", "˝", "ž", "ż",
  /* C0 */ "Ŕ", "Á", "Â", "Ă", "Ä", "Ĺ", "Ć", "Ç", "Č", "É", "Ę", "Ë", "Ě", "Í", "Î", "Ď",
  /* D0 */ "Đ", "Ń", "Ň", "Ó", "Ô", "Ő", "Ö", "×", "Ř", "Ů", "Ú", "Ű", "Ü", "Ý", "Ţ", "ß",
  /* E0 */ "ŕ", "á", "â", "ă", "ä", "ĺ", "ć", "ç", "č", "é", "ę", "ë", "ě", "í", "î", "ď",
  /* F0 */ "đ", "ń", "ň", "ó", "ô", "ő", "ö", "÷", "ř", "ů", "ú", "ű", "ü", "ý", "ţ", "˙",
]

/** CP852 (IBM PC Latin 2): bajty 0x80–0xFF (Python codecs „cp852”). `null` = bajt niezdefiniowany. */
// prettier-ignore
export const CP852_HIGH: readonly (string | null)[] = [
  /* 80 */ "Ç", "ü", "é", "â", "ä", "ů", "ć", "ç", "ł", "ë", "Ő", "ő", "î", "Ź", "Ä", "Ć",
  /* 90 */ "É", "Ĺ", "ĺ", "ô", "ö", "Ľ", "ľ", "Ś", "ś", "Ö", "Ü", "Ť", "ť", "Ł", "×", "č",
  /* A0 */ "á", "í", "ó", "ú", "Ą", "ą", "Ž", "ž", "Ę", "ę", "¬", "ź", "Č", "ş", "«", "»",
  /* B0 */ "░", "▒", "▓", "│", "┤", "Á", "Â", "Ě", "Ş", "╣", "║", "╗", "╝", "Ż", "ż", "┐",
  /* C0 */ "└", "┴", "┬", "├", "─", "┼", "Ă", "ă", "╚", "╔", "╩", "╦", "╠", "═", "╬", "¤",
  /* D0 */ "đ", "Đ", "Ď", "Ë", "ď", "Ň", "Í", "Î", "ě", "┘", "┌", "█", "▄", "Ţ", "Ů", "▀",
  /* E0 */ "Ó", "ß", "Ô", "Ń", "ń", "ň", "Š", "š", "Ŕ", "Ú", "ŕ", "Ű", "ý", "Ý", "ţ", "´",
  /* F0 */ "\u00AD", "˝", "˛", "ˇ", "˘", "§", "÷", "¸", "°", "¨", "˙", "ű", "Ř", "ř", "■", "\u00A0",
]

/** CP437 (IBM PC, baza Mazovii): bajty 0x80–0xFF (Python codecs „cp437”). `null` = bajt niezdefiniowany. */
// prettier-ignore
export const CP437_HIGH: readonly (string | null)[] = [
  /* 80 */ "Ç", "ü", "é", "â", "ä", "à", "å", "ç", "ê", "ë", "è", "ï", "î", "ì", "Ä", "Å",
  /* 90 */ "É", "æ", "Æ", "ô", "ö", "ò", "û", "ù", "ÿ", "Ö", "Ü", "¢", "£", "¥", "₧", "ƒ",
  /* A0 */ "á", "í", "ó", "ú", "ñ", "Ñ", "ª", "º", "¿", "⌐", "¬", "½", "¼", "¡", "«", "»",
  /* B0 */ "░", "▒", "▓", "│", "┤", "╡", "╢", "╖", "╕", "╣", "║", "╗", "╝", "╜", "╛", "┐",
  /* C0 */ "└", "┴", "┬", "├", "─", "┼", "╞", "╟", "╚", "╔", "╩", "╦", "╠", "═", "╬", "╧",
  /* D0 */ "╨", "╤", "╥", "╙", "╘", "╒", "╓", "╫", "╪", "┘", "┌", "█", "▄", "▌", "▐", "▀",
  /* E0 */ "α", "ß", "Γ", "π", "Σ", "σ", "µ", "τ", "Φ", "Θ", "Ω", "δ", "∞", "φ", "ε", "∩",
  /* F0 */ "≡", "±", "≥", "≤", "⌠", "⌡", "÷", "≈", "°", "∙", "·", "√", "ⁿ", "²", "■", "\u00A0",
]

/**
 * Mazovia (CP 667) = CP437 z polskimi literami w miejscu części znaków
 * zachodnioeuropejskich. Pozycje zgodne z tabelą CP 667 w Wikipedii
 * („Mazovia encoding”).
 */
export const MAZOVIA_PL: Readonly<Record<number, string>> = {
  0x86: "ą",
  0x8d: "ć",
  0x8f: "Ą",
  0x90: "Ę",
  0x91: "ę",
  0x92: "ł",
  0x95: "Ć",
  0x98: "Ś",
  0x9c: "Ł",
  0x9e: "ś",
  0xa0: "Ź",
  0xa1: "Ż",
  0xa2: "ó",
  0xa3: "Ó",
  0xa4: "ń",
  0xa5: "Ń",
  0xa6: "ź",
  0xa7: "ż",
}

/** Mazovia: bajty 0x80–0xFF (CP437 + {@link MAZOVIA_PL}). */
export const MAZOVIA_HIGH: readonly (string | null)[] = CP437_HIGH.map(
  (znak, i) => MAZOVIA_PL[0x80 + i] ?? znak
)

export type KodowanieId =
  "utf-8" | "windows-1250" | "iso-8859-2" | "cp852" | "mazovia"

export const KODOWANIA: readonly {
  value: KodowanieId
  label: string
  opis: string
}[] = [
  {
    value: "utf-8",
    label: "UTF-8",
    opis: "współczesny standard, 1–4 bajty na znak",
  },
  {
    value: "windows-1250",
    label: "Windows-1250",
    opis: "strona kodowa Microsoft (Windows)",
  },
  {
    value: "iso-8859-2",
    label: "ISO-8859-2",
    opis: "Latin-2, norma PN-93/T-42118",
  },
  {
    value: "cp852",
    label: "CP852 (DOS Latin 2)",
    opis: "IBM PC Latin 2 (DOS)",
  },
  {
    value: "mazovia",
    label: "Mazovia",
    opis: "popularna w Polsce w czasach DOS",
  },
]

export function nazwaKodowania(id: KodowanieId): string {
  return KODOWANIA.find((k) => k.value === id)?.label ?? id
}

const TABLICE: Record<
  Exclude<KodowanieId, "utf-8">,
  readonly (string | null)[]
> = {
  "windows-1250": CP1250_HIGH,
  "iso-8859-2": ISO_8859_2_HIGH,
  cp852: CP852_HIGH,
  mazovia: MAZOVIA_HIGH,
}

const odwrotne = new Map<KodowanieId, Map<string, number>>()

/** Znak → bajt (0x80–0xFF) dla kodowania jednobajtowego. */
function tablicaOdwrotna(id: Exclude<KodowanieId, "utf-8">) {
  let mapa = odwrotne.get(id)
  if (!mapa) {
    mapa = new Map()
    TABLICE[id].forEach((znak, i) => {
      if (znak !== null && !mapa!.has(znak)) mapa!.set(znak, 0x80 + i)
    })
    odwrotne.set(id, mapa)
  }
  return mapa
}

/** Jeden znak tekstu źródłowego po zapisaniu w danym kodowaniu. */
export type ZapisanyZnak = {
  /** Znak (punkt kodowy) z tekstu źródłowego. */
  znak: string
  /** Bajty, którymi go zapisano. */
  bajty: number[]
  /** Indeks pierwszego bajtu w całym ciągu. */
  start: number
  /** Kodowanie nie zna tego znaku, więc zapisano „?” (0x3F). */
  brak: boolean
}

/** Zapisuje tekst jako bajty (każdy punkt kodowy osobno). */
export function zakoduj(tekst: string, id: KodowanieId): ZapisanyZnak[] {
  const wynik: ZapisanyZnak[] = []
  let start = 0
  const enc = id === "utf-8" ? new TextEncoder() : null
  for (const znak of tekst) {
    let bajty: number[]
    let brak = false
    if (enc) {
      bajty = Array.from(enc.encode(znak))
    } else {
      const cp = znak.codePointAt(0) ?? 0
      if (cp < 0x80) bajty = [cp]
      else {
        const b = tablicaOdwrotna(id as Exclude<KodowanieId, "utf-8">).get(znak)
        if (b === undefined) {
          bajty = [0x3f]
          brak = true
        } else bajty = [b]
      }
    }
    wynik.push({ znak, bajty, start, brak })
    start += bajty.length
  }
  return wynik
}

/** Jeden znak odczytany z bajtów. */
export type OdczytanyZnak = {
  znak: string
  /** Zakres bajtów [start, koniec). */
  start: number
  koniec: number
  /**
   * znak: zwykły znak; sterujacy: niewidoczny znak sterujący (C0/C1);
   * nieznany: bajt bez znaczenia w tej stronie kodowej;
   * bledny: niepoprawna sekwencja UTF-8 (odczytana jako U+FFFD).
   */
  rodzaj: "znak" | "sterujacy" | "nieznany" | "bledny"
}

const ZASTEPCZY = "�"

function rodzajZnaku(cp: number): OdczytanyZnak["rodzaj"] {
  return cp < 0x20 || (cp >= 0x7f && cp <= 0x9f) ? "sterujacy" : "znak"
}

/**
 * Odczytuje bajty według kodowania. UTF-8 dekodujemy ręcznie (algorytm
 * WHATWG, jak TextDecoder), żeby znać zakres bajtów każdego znaku.
 */
export function odczytaj(
  bajty: readonly number[],
  id: KodowanieId
): OdczytanyZnak[] {
  const wynik: OdczytanyZnak[] = []
  if (id !== "utf-8") {
    const tablica = TABLICE[id]
    bajty.forEach((b, i) => {
      if (b < 0x80) {
        wynik.push({
          znak: String.fromCharCode(b),
          start: i,
          koniec: i + 1,
          rodzaj: rodzajZnaku(b),
        })
      } else {
        const znak = tablica[b - 0x80]
        if (znak === null) {
          wynik.push({
            znak: ZASTEPCZY,
            start: i,
            koniec: i + 1,
            rodzaj: "nieznany",
          })
        } else {
          wynik.push({
            znak,
            start: i,
            koniec: i + 1,
            rodzaj: rodzajZnaku(znak.codePointAt(0) ?? 0),
          })
        }
      }
    })
    return wynik
  }

  let i = 0
  while (i < bajty.length) {
    const b = bajty[i]
    if (b < 0x80) {
      wynik.push({
        znak: String.fromCharCode(b),
        start: i,
        koniec: i + 1,
        rodzaj: rodzajZnaku(b),
      })
      i++
      continue
    }
    let potrzeba = 0
    let cp = 0
    let dolna = 0x80
    let gorna = 0xbf
    if (b >= 0xc2 && b <= 0xdf) {
      potrzeba = 1
      cp = b & 0x1f
    } else if (b >= 0xe0 && b <= 0xef) {
      if (b === 0xe0) dolna = 0xa0
      if (b === 0xed) gorna = 0x9f
      potrzeba = 2
      cp = b & 0x0f
    } else if (b >= 0xf0 && b <= 0xf4) {
      if (b === 0xf0) dolna = 0x90
      if (b === 0xf4) gorna = 0x8f
      potrzeba = 3
      cp = b & 0x07
    } else {
      wynik.push({ znak: ZASTEPCZY, start: i, koniec: i + 1, rodzaj: "bledny" })
      i++
      continue
    }
    let j = i + 1
    let mamy = 0
    while (mamy < potrzeba && j < bajty.length) {
      const c = bajty[j]
      if (c < dolna || c > gorna) break
      dolna = 0x80
      gorna = 0xbf
      cp = (cp << 6) | (c & 0x3f)
      j++
      mamy++
    }
    if (mamy === potrzeba) {
      wynik.push({
        znak: String.fromCodePoint(cp),
        start: i,
        koniec: j,
        rodzaj: rodzajZnaku(cp),
      })
    } else {
      // Ucięta sekwencja: jeden U+FFFD, a bajt, który ją przerwał, czytamy od nowa.
      wynik.push({ znak: ZASTEPCZY, start: i, koniec: j, rodzaj: "bledny" })
    }
    i = j
  }
  return wynik
}

/** Fragment, w którym granice znaków zapisu i odczytu się pokrywają. */
export type Segment = {
  start: number
  koniec: number
  /** Indeksy w tablicy znaków zapisu. */
  zapis: number[]
  /** Indeksy w tablicy znaków odczytu. */
  odczyt: number[]
  zgodne: boolean
}

export function segmentuj(
  zapis: readonly ZapisanyZnak[],
  odczyt: readonly OdczytanyZnak[]
): Segment[] {
  const segmenty: Segment[] = []
  let i = 0
  let j = 0
  let akt: Segment | null = null
  while (i < zapis.length && j < odczyt.length) {
    if (!akt)
      akt = {
        start: zapis[i].start,
        koniec: 0,
        zapis: [],
        odczyt: [],
        zgodne: false,
      }
    const koniecZ = zapis[i].start + zapis[i].bajty.length
    const koniecO = odczyt[j].koniec
    if (koniecZ === koniecO) {
      akt.zapis.push(i++)
      akt.odczyt.push(j++)
      akt.koniec = koniecZ
      const zrodlo = akt.zapis.map((k) => zapis[k].znak).join("")
      const wynik = akt.odczyt.map((k) => odczyt[k].znak).join("")
      akt.zgodne = zrodlo === wynik && akt.zapis.every((k) => !zapis[k].brak)
      segmenty.push(akt)
      akt = null
    } else if (koniecZ < koniecO) {
      akt.zapis.push(i++)
    } else {
      akt.odczyt.push(j++)
    }
  }
  return segmenty
}

/** Tekst zapisany w jednym kodowaniu i odczytany w drugim. */
export function przeklej(
  tekst: string,
  zapisano: KodowanieId,
  odczytano: KodowanieId
) {
  const bajty = zakoduj(tekst, zapisano).flatMap((z) => z.bajty)
  return odczytaj(bajty, odczytano)
    .map((o) => o.znak)
    .join("")
}
