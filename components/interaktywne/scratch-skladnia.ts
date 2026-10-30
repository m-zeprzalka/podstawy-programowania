/**
 * Parser tekstowej, polskiej składni skryptów Scratcha używanej w lekcjach.
 *
 * Składnia (jedna linia = jeden blok):
 * - `[tekst]` — pole tekstowe (albo rozwijana lista ▾ w blokach z menu),
 * - `(liczba)` — owalne pole liczbowe; `(odpowiedź)`, `(połącz […] i (…))` — owalny reporter,
 * - `<warunek>` — sześciokątne wyrażenie logiczne; `< >` / `<…>` — pusty slot,
 * - wcięcie (4 spacje) — dzieci bloku C („powtórz”, „zawsze”, „jeżeli … to”, „powtarzaj aż”),
 *   „w przeciwnym razie” na poziomie „jeżeli” otwiera drugą gałąź,
 * - pusta linia — nowy stos (skrypt); linia „kiedy …”/„definiuj …” też zaczyna nowy stos,
 * - `blok  (komentarz)` — co najmniej 2 spacje + nawias na końcu linii = komentarz;
 *   w linii kapelusza nazwa duszka („(duszek Oscar)”, „(Kot)”) staje się etykietą stosu,
 * - `(analogicznie: …)` — cała linia w nawiasie ze słowem i dwukropkiem = notka tekstowa,
 * - `definiuj nazwa (param) …` — własny blok; jego wywołania w tym samym kodzie są różowe.
 */

import {
  czyBlokC,
  czyKomentarzKategorii,
  KOLEJNOSC_KATEGORII,
  rozpoznajBlok,
  type KategoriaScratch,
  type KsztaltScratch,
} from "./scratch-kategorie"

/* ---------- Tokenizacja ---------- */

type Token =
  | { t: "tekst"; v: string }
  | { t: "pole"; v: string }
  | { t: "grupa"; nawias: "(" | "<"; surowy: string; dzieci: Token[] }

function tokenizuj(s: string): Token[] {
  let i = 0

  const czytaj = (zamyk: ")" | ">" | null): Token[] => {
    const out: Token[] = []
    let buf = ""
    const flush = () => {
      if (buf) out.push({ t: "tekst", v: buf })
      buf = ""
    }
    while (i < s.length) {
      const c = s[i]
      if (zamyk === ")" && c === ")") {
        i++
        flush()
        return out
      }
      // „>” otoczone spacjami to operator porównania, nie koniec warunku.
      if (
        zamyk === ">" &&
        c === ">" &&
        !(s[i - 1] === " " && s[i + 1] === " ")
      ) {
        i++
        flush()
        return out
      }
      if (c === "[") {
        const koniec = s.indexOf("]", i + 1)
        if (koniec < 0) {
          buf += s.slice(i)
          i = s.length
          break
        }
        flush()
        out.push({ t: "pole", v: s.slice(i + 1, koniec) })
        i = koniec + 1
        continue
      }
      if (c === "(") {
        flush()
        const start = ++i
        const dzieci = czytaj(")")
        out.push({
          t: "grupa",
          nawias: "(",
          surowy: s.slice(start, i - 1),
          dzieci,
        })
        continue
      }
      if (c === "<") {
        // Pusty slot: „< >” albo „<>”.
        const pusty = /^<\s*>/.exec(s.slice(i))
        if (pusty) {
          flush()
          out.push({ t: "grupa", nawias: "<", surowy: "", dzieci: [] })
          i += pusty[0].length
          continue
        }
        // „<” ze spacją za sobą to operator „mniejsze niż”.
        if (s[i + 1] !== " " && s[i + 1] !== undefined) {
          flush()
          const start = ++i
          const dzieci = czytaj(">")
          out.push({
            t: "grupa",
            nawias: "<",
            surowy: s.slice(start, i - 1),
            dzieci,
          })
          continue
        }
      }
      buf += c
      i++
    }
    flush()
    return out
  }

  return czytaj(null)
}

/** Tekst bloku z polami zastąpionymi przez `_`, np. `zmień _ o _`. */
function sygnatura(tokeny: Token[]) {
  return tokeny
    .map((t) => (t.t === "tekst" ? t.v : " _ "))
    .join("")
    .replace(/\s+/g, " ")
    .replace(/ \?/g, "?")
    .trim()
    .toLowerCase()
}

/* ---------- Model ---------- */

export type ElementScratch =
  | { typ: "tekst"; tekst: string }
  | { typ: "flaga"; tekst: string }
  | { typ: "pole"; tekst: string }
  | { typ: "menu"; tekst: string }
  | { typ: "liczba"; tekst: string }
  | { typ: "slot" }
  | {
      typ: "reporter"
      ksztalt: "reporter" | "warunek"
      kat: KategoriaScratch
      elementy: ElementScratch[]
    }

export type KomentarzScratch = { tekst: string; nr: number }

export type WezelScratch =
  | {
      typ: "blok"
      kat: KategoriaScratch
      ksztalt: KsztaltScratch
      elementy: ElementScratch[]
      /** Dla „definiuj”: prototyp własnego bloku. */
      prototyp?: ElementScratch[]
      komentarz?: KomentarzScratch
      dzieci?: WezelScratch[]
      /** Gałąź „w przeciwnym razie” (tylko „jeżeli”). */
      inaczej?: WezelScratch[]
      /** Komentarz przy linii „w przeciwnym razie”. */
      komentarzInaczej?: KomentarzScratch
      /** Tekst linii „w przeciwnym razie” / „else”. */
      etykietaInaczej?: string
      zrodlo: string
    }
  | {
      typ: "samodzielny"
      element: Extract<ElementScratch, { typ: "reporter" }>
      komentarz?: KomentarzScratch
      zrodlo: string
    }
  | { typ: "notka"; tekst: string }

export type StosScratch = {
  etykieta?: { duszek: string; opis?: string }
  wezly: WezelScratch[]
  komentarze: KomentarzScratch[]
}

export type SkryptScratch = {
  stosy: StosScratch[]
  /** Kod po usunięciu wspólnego wcięcia (do trybu „Pokaż tekst”). */
  tekst: string
  kategorie: KategoriaScratch[]
}

type Kontekst = {
  wlasne: Set<string>
  parametry: Set<string>
  kategorie: Set<KategoriaScratch>
}

/* ---------- Rozwiązywanie elementów ---------- */

const LICZBA = /^-?\d+(?:[.,]\d+)?$/

function tekstNaElementy(tekst: string): ElementScratch[] {
  const czesci = tekst.split(/(zieloną flagę|green flag)/i)
  const out: ElementScratch[] = []
  for (const c of czesci) {
    if (/^(zieloną flagę|green flag)$/i.test(c)) out.push({ typ: "flaga", tekst: c })
    else if (c.trim()) out.push({ typ: "tekst", tekst: c.trim() })
  }
  return out
}

function rozwiaz(
  tokeny: Token[],
  ctx: Kontekst,
  menu: boolean
): ElementScratch[] {
  return tokeny.flatMap((t): ElementScratch[] => {
    if (t.t === "tekst") return tekstNaElementy(t.v)
    if (t.t === "pole") return [{ typ: menu ? "menu" : "pole", tekst: t.v }]
    return [rozwiazGrupe(t, ctx)]
  })
}

function rozwiazGrupe(
  g: Extract<Token, { t: "grupa" }>,
  ctx: Kontekst
): ElementScratch {
  const surowy = g.surowy.trim()
  const ksztaltGrupy = g.nawias === "<" ? "warunek" : "reporter"

  if (g.nawias === "(" && (surowy === "" || LICZBA.test(surowy))) {
    return { typ: "liczba", tekst: surowy }
  }
  if (
    g.nawias === "<" &&
    (surowy === "" || surowy === "…" || surowy === "...")
  ) {
    return { typ: "slot" }
  }

  const sam = g.dzieci.length === 1 && g.dzieci[0].t === "tekst"
  const nazwa = sam ? surowy : ""
  let kat: KategoriaScratch = "nieznana"
  let ksztalt: "reporter" | "warunek" = ksztaltGrupy
  let menu = false

  if (sam && ctx.parametry.has(nazwa)) {
    kat = "bloki"
  } else {
    const r = rozpoznajBlok(sygnatura(g.dzieci))
    if (r) {
      kat = r.kat
      menu = r.menu
      if (r.ksztalt === "warunek") ksztalt = "warunek"
    } else if (sam && g.nawias === "(") {
      // Samo słowo w nawiasie, np. (wynik) — zmienna.
      kat = "zmienne"
    }
  }
  ctx.kategorie.add(kat)
  return {
    typ: "reporter",
    ksztalt,
    kat,
    elementy: rozwiaz(g.dzieci, ctx, menu),
  }
}

/* ---------- Linie ---------- */

type Linia = { wciecie: number; kod: string; komentarz?: string }

const KOMENTARZ = /^(.*?\S)\s{2,}\(([^()]+)\)\s*$/
const NOTKA = /^\(\s*[\p{L}]+:.*\)$/u

function naLinie(kod: string): { linie: (Linia | null)[]; tekst: string } {
  const surowe = kod.replace(/\t/g, "    ").replace(/\r/g, "").split("\n")
  while (surowe.length && !surowe[0].trim()) surowe.shift()
  while (surowe.length && !surowe[surowe.length - 1].trim()) surowe.pop()
  const wciecia = surowe
    .filter((l) => l.trim())
    .map((l) => l.length - l.trimStart().length)
  const wspolne = wciecia.length ? Math.min(...wciecia) : 0
  const przyciete = surowe.map((l) => l.slice(wspolne).trimEnd())
  const linie = przyciete.map((l): Linia | null => {
    if (!l.trim()) return null
    const wciecie = l.length - l.trimStart().length
    const tresc = l.trim()
    const m = KOMENTARZ.exec(tresc)
    if (m && !NOTKA.test(tresc))
      return { wciecie, kod: m[1], komentarz: m[2].trim() }
    return { wciecie, kod: tresc }
  })
  return { linie, tekst: przyciete.join("\n") }
}

const czyKapelusz = (kod: string) =>
  /^(kiedy|definiuj|when|define)\s/i.test(kod)
const DEFINICJA = /^(definiuj|define)\s+(.+)$/i

/* ---------- Parser ---------- */

/** Parsuje tekst skryptu na stosy bloków. Nie rzuca wyjątków. */
export function parsujSkrypt(kod: string): SkryptScratch {
  const { linie, tekst } = naLinie(kod)
  const ctx: Kontekst = {
    wlasne: new Set(),
    parametry: new Set(),
    kategorie: new Set(),
  }

  // 1. Własne bloki: sygnatury i nazwy parametrów.
  for (const l of linie) {
    const m = l && DEFINICJA.exec(l.kod)
    if (!m) continue
    const tokeny = tokenizuj(m[2])
    ctx.wlasne.add(sygnatura(tokeny))
    for (const t of tokeny) {
      if (t.t === "grupa") ctx.parametry.add(t.surowy.trim())
      if (t.t === "pole") ctx.parametry.add(t.v.trim())
    }
  }

  // 2. Podział na stosy.
  const grupy: Linia[][] = []
  let biezaca: Linia[] = []
  for (const l of linie) {
    if (!l || (czyKapelusz(l.kod) && l.wciecie === 0 && biezaca.length)) {
      if (biezaca.length) grupy.push(biezaca)
      biezaca = []
    }
    if (l) biezaca.push(l)
  }
  if (biezaca.length) grupy.push(biezaca)

  // 3. Drzewo bloków.
  let nr = 0
  const stosy = grupy.map((g): StosScratch => {
    const stos: StosScratch = { wezly: [], komentarze: [] }

    const zrobWezel = (l: Linia): WezelScratch => {
      if (NOTKA.test(l.kod))
        return { typ: "notka", tekst: l.kod.slice(1, -1).trim() }
      const wezel = zrobBlok(l.kod, ctx)

      if (l.komentarz && wezel.typ !== "notka") {
        const k = l.komentarz
        const kapelusz =
          wezel.typ === "blok" &&
          (wezel.ksztalt === "kapelusz" || wezel.ksztalt === "definicja")
        const duszek =
          kapelusz &&
          !stos.etykieta &&
          !czyKomentarzKategorii(k) &&
          (/^duszek\s/i.test(k) || /^\p{Lu}/u.test(k))
        if (duszek) {
          const bez = k.replace(/^duszek\s+/i, "")
          const [nazwa, ...opis] = bez.split(":")
          stos.etykieta = {
            duszek: nazwa.trim(),
            opis: opis.join(":").trim() || undefined,
          }
        } else {
          const komentarz = { tekst: k, nr: ++nr }
          wezel.komentarz = komentarz
          stos.komentarze.push(komentarz)
        }
      }
      return wezel
    }

    const sekwencja = (
      start: number,
      baza: number
    ): [WezelScratch[], number] => {
      const out: WezelScratch[] = []
      let i = start
      while (i < g.length && g[i].wciecie >= baza) {
        const l = g[i]
        if (l.wciecie > baza) {
          // Wcięcie bez bloku C: traktujemy jak dalszy ciąg stosu.
          const [pod, j] = sekwencja(i, l.wciecie)
          out.push(...pod)
          i = j
          continue
        }
        const wezel = zrobWezel(l)
        i++
        if (wezel.typ === "blok" && czyBlokC(wezel.ksztalt)) {
          wezel.dzieci = []
          if (i < g.length && g[i].wciecie > baza) {
            const [dzieci, j] = sekwencja(i, g[i].wciecie)
            wezel.dzieci = dzieci
            i = j
          }
          const jezeli = /^(jeżeli|if)\s/i.test(wezel.zrodlo)
          if (
            jezeli &&
            i < g.length &&
            g[i].wciecie === baza &&
            /^(w przeciwnym razie|else)$/i.test(g[i].kod)
          ) {
            wezel.etykietaInaczej = g[i].kod
            const k = g[i].komentarz
            if (k) {
              wezel.komentarzInaczej = { tekst: k, nr: ++nr }
              stos.komentarze.push(wezel.komentarzInaczej)
            }
            i++
            wezel.inaczej = []
            if (i < g.length && g[i].wciecie > baza) {
              const [inaczej, j] = sekwencja(i, g[i].wciecie)
              wezel.inaczej = inaczej
              i = j
            }
          }
        }
        out.push(wezel)
      }
      return [out, i]
    }

    stos.wezly = sekwencja(0, g[0]?.wciecie ?? 0)[0]
    return stos
  })

  return {
    stosy,
    tekst,
    kategorie: KOLEJNOSC_KATEGORII.filter((k) => ctx.kategorie.has(k)),
  }
}

function zrobBlok(kod: string, ctx: Kontekst): WezelScratch {
  // Definicja własnego bloku.
  const def = DEFINICJA.exec(kod)
  if (def) {
    ctx.kategorie.add("bloki")
    return {
      typ: "blok",
      kat: "bloki",
      ksztalt: "definicja",
      elementy: [{ typ: "tekst", tekst: def[1] }],
      prototyp: rozwiaz(tokenizuj(def[2]), ctx, false),
      zrodlo: kod,
    }
  }

  const tokeny = tokenizuj(kod)

  // Cała linia to jeden reporter/warunek, np. „<dotyka [Oscar]?>”.
  if (tokeny.length === 1 && tokeny[0].t === "grupa") {
    const el = rozwiazGrupe(tokeny[0], ctx)
    if (el.typ === "reporter")
      return { typ: "samodzielny", element: el, zrodlo: kod }
  }

  const syg = sygnatura(tokeny)

  if (ctx.wlasne.has(syg)) {
    ctx.kategorie.add("bloki")
    return {
      typ: "blok",
      kat: "bloki",
      ksztalt: "stos",
      elementy: rozwiaz(tokeny, ctx, false),
      zrodlo: kod,
    }
  }

  const r = rozpoznajBlok(syg)
  if (r && (r.ksztalt === "reporter" || r.ksztalt === "warunek")) {
    ctx.kategorie.add(r.kat)
    return {
      typ: "samodzielny",
      element: {
        typ: "reporter",
        ksztalt: r.ksztalt,
        kat: r.kat,
        elementy: rozwiaz(tokeny, ctx, r.menu),
      },
      zrodlo: kod,
    }
  }

  const kat = r?.kat ?? "nieznana"
  ctx.kategorie.add(kat)
  return {
    typ: "blok",
    kat,
    ksztalt: r?.ksztalt ?? "stos",
    elementy: rozwiaz(tokeny, ctx, r?.menu ?? false),
    zrodlo: kod,
  }
}
