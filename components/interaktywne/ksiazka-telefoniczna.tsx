"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowLineRightIcon,
  PauseIcon,
  PhoneIcon,
  PlayIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

/** 32 strony książki — po jednym nazwisku, alfabetycznie (polska kolejność). */
const KSIAZKA = [
  "Adamczyk", "Bąk", "Chmielewska", "Czarnecki", "Dąbrowski", "Dudek",
  "Fijałkowska", "Górecka", "Grabowski", "Jabłońska", "Jankowski", "Kaczmarek",
  "Kowalska", "Krawczyk", "Lewandowski", "Łuczak", "Majewska", "Michalski",
  "Nowak", "Olszewska", "Pawlak", "Piotrowska", "Rutkowski", "Sikora",
  "Szymańska", "Śliwiński", "Tomaszewska", "Urbański", "Wieczorek", "Wójcik",
  "Zając", "Żak",
]
const SPOZA = "Mazur"

const OSOBY = [
  ...KSIAZKA.slice(0, 17).map((n) => ({ value: n, label: n })),
  { value: SPOZA, label: `${SPOZA} (brak w książce)` },
  ...KSIAZKA.slice(17).map((n) => ({ value: n, label: n })),
]

type KategoriaLinii = "funkcja" | "warunek" | "wyrazenie" | "petla"
type Czesc = string | { tekst: string; kat: KategoriaLinii }

const LINIE: { wciecie: boolean; czesci: Czesc[] }[] = [
  { wciecie: false, czesci: [{ tekst: "Weź książkę telefoniczną", kat: "funkcja" }] },
  { wciecie: false, czesci: [{ tekst: "Otwórz na środku książki", kat: "funkcja" }] },
  { wciecie: false, czesci: [{ tekst: "Spójrz na stronę", kat: "funkcja" }] },
  {
    wciecie: false,
    czesci: [
      { tekst: "Jeśli", kat: "warunek" },
      " ",
      { tekst: "osoba jest na stronie", kat: "wyrazenie" },
    ],
  },
  { wciecie: true, czesci: [{ tekst: "Zadzwoń do osoby", kat: "funkcja" }] },
  {
    wciecie: false,
    czesci: [
      { tekst: "W przeciwnym razie, jeśli", kat: "warunek" },
      " ",
      { tekst: "osoba jest wcześniej w książce", kat: "wyrazenie" },
    ],
  },
  { wciecie: true, czesci: [{ tekst: "Otwórz na środku lewej połowy książki", kat: "funkcja" }] },
  { wciecie: true, czesci: [{ tekst: "Wróć do linii 3", kat: "petla" }] },
  {
    wciecie: false,
    czesci: [
      { tekst: "W przeciwnym razie, jeśli", kat: "warunek" },
      " ",
      { tekst: "osoba jest później w książce", kat: "wyrazenie" },
    ],
  },
  { wciecie: true, czesci: [{ tekst: "Otwórz na środku prawej połowy książki", kat: "funkcja" }] },
  { wciecie: true, czesci: [{ tekst: "Wróć do linii 3", kat: "petla" }] },
  { wciecie: false, czesci: [{ tekst: "W przeciwnym razie", kat: "warunek" }] },
  { wciecie: true, czesci: [{ tekst: "Zakończ", kat: "funkcja" }] },
]

/** Kolory jak kategorie Scratcha: miękkie tło + podkreślenie, tekst bez zmian. */
const STYL_KATEGORII: Record<KategoriaLinii, { nazwa: string; klasa: string }> = {
  funkcja: {
    nazwa: "funkcje",
    klasa: "bg-scratch-wyglad/15 border-b-2 border-scratch-wyglad",
  },
  warunek: {
    nazwa: "warunki",
    klasa: "bg-scratch-kontrola/20 border-b-2 border-scratch-kontrola",
  },
  wyrazenie: {
    nazwa: "wyrażenia logiczne",
    klasa: "bg-scratch-wyrazenia/20 border-b-2 border-scratch-wyrazenia",
  },
  petla: {
    nazwa: "pętle",
    klasa: "bg-scratch-ruch/15 border-b-2 border-scratch-ruch",
  },
}

type Stan = {
  /** Linia do wykonania (1–13); 0 = koniec. */
  pc: number
  lo: number
  hi: number
  mid: number | null
  kroki: number
  otwarcia: number
  wynik: null | "znaleziono" | "brak"
  komunikat: string
}

const START: Stan = {
  pc: 1,
  lo: 0,
  hi: KSIAZKA.length - 1,
  mid: null,
  kroki: 0,
  otwarcia: 0,
  wynik: null,
  komunikat: "Naciśnij „Krok”, aby wykonać linię 1, albo „Uruchom”.",
}

/** Polska odmiana po liczebniku: 1 strona, 2 strony, 5 stron. */
function odmiana(n: number, [jeden, kilka, wiele]: [string, string, string]) {
  if (n === 1) return `${n} ${jeden}`
  const d = n % 10
  const s = n % 100
  return `${n} ${d >= 2 && d <= 4 && (s < 12 || s > 14) ? kilka : wiele}`
}
const STRONY: [string, string, string] = ["stronę", "strony", "stron"]

const porownaj = (a: string, b: string) => a.localeCompare(b, "pl")
const srodek = (lo: number, hi: number) => Math.floor((lo + hi) / 2)
const str = (i: number) => `str. ${i + 1} (${KSIAZKA[i]})`

function krok(s: Stan, osoba: string): Stan {
  if (s.wynik) return s
  const n: Stan = { ...s, kroki: s.kroki + 1 }
  const mid = s.mid ?? 0
  const cmp = porownaj(osoba, KSIAZKA[mid])

  switch (s.pc) {
    case 1:
      return { ...n, pc: 2, komunikat: "1: Bierzesz książkę — 32 strony, nazwiska alfabetycznie." }
    case 2: {
      const m = srodek(s.lo, s.hi)
      return {
        ...n,
        pc: 3,
        mid: m,
        otwarcia: s.otwarcia + 1,
        komunikat: `2: Otwierasz na środku książki: ${str(m)}.`,
      }
    }
    case 3:
      return { ...n, pc: 4, komunikat: `3: Na stronie ${mid + 1} jest „${KSIAZKA[mid]}”.` }
    case 4:
      return cmp === 0
        ? { ...n, pc: 5, komunikat: `4: Czy osoba „${osoba}” jest na tej stronie? Tak!` }
        : { ...n, pc: 6, komunikat: `4: Czy osoba „${osoba}” jest na tej stronie? Nie.` }
    case 5:
      return {
        ...n,
        pc: 0,
        wynik: "znaleziono",
        komunikat: `5: Dzwonisz! Osoba „${osoba}” jest na stronie ${mid + 1}. Otwarcia książki: ${s.otwarcia} (po kolei byłoby ${mid + 1}).`,
      }
    case 6:
      if (cmp < 0 && mid > s.lo)
        return { ...n, pc: 7, komunikat: `6: Osoba „${osoba}” jest wcześniej niż „${KSIAZKA[mid]}”. Prawa połowa odpada.` }
      return {
        ...n,
        pc: 9,
        komunikat:
          cmp < 0
            ? `6: Osoba „${osoba}” byłaby wcześniej, ale po lewej nie zostały już strony.`
            : `6: Czy osoba „${osoba}” jest wcześniej w książce? Nie.`,
      }
    case 7: {
      const hi = mid - 1
      const m = srodek(s.lo, hi)
      return {
        ...n,
        pc: 8,
        hi,
        mid: m,
        otwarcia: s.otwarcia + 1,
        komunikat: `7: Otwierasz środek lewej połowy (str. ${s.lo + 1}–${hi + 1}): ${str(m)}.`,
      }
    }
    case 8:
    case 11:
      return { ...n, pc: 3, komunikat: `${s.pc}: Wracasz do linii 3 — to jest pętla.` }
    case 9:
      if (cmp > 0 && mid < s.hi)
        return { ...n, pc: 10, komunikat: `9: Osoba „${osoba}” jest później niż „${KSIAZKA[mid]}”. Lewa połowa odpada.` }
      return {
        ...n,
        pc: 12,
        komunikat:
          cmp > 0
            ? `9: Osoba „${osoba}” byłaby później, ale po prawej nie zostały już strony.`
            : `9: Czy osoba „${osoba}” jest później w książce? Nie.`,
      }
    case 10: {
      const lo = mid + 1
      const m = srodek(lo, s.hi)
      return {
        ...n,
        pc: 11,
        lo,
        mid: m,
        otwarcia: s.otwarcia + 1,
        komunikat: `10: Otwierasz środek prawej połowy (str. ${lo + 1}–${s.hi + 1}): ${str(m)}.`,
      }
    }
    case 12:
      return { ...n, pc: 13, komunikat: "12: Żaden warunek nie pasuje — osoby nie ma w książce." }
    case 13:
      return {
        ...n,
        pc: 0,
        lo: 1,
        hi: 0,
        wynik: "brak",
        komunikat: `13: Kończysz. Nie ma osoby „${osoba}” w tej książce — sprawdzono ${odmiana(s.otwarcia, STRONY)} zamiast 32.`,
      }
    default:
      return s
  }
}

type Akcja = { typ: "krok"; osoba: string } | { typ: "reset" }

function reduktor(s: Stan, a: Akcja): Stan {
  return a.typ === "reset" ? START : krok(s, a.osoba)
}

function Linia({
  czesci,
  kategorie,
}: {
  czesci: Czesc[]
  kategorie: boolean
}) {
  return (
    <>
      {czesci.map((c, i) =>
        typeof c === "string" ? (
          <React.Fragment key={i}>{c}</React.Fragment>
        ) : (
          <span
            key={i}
            className={cn(
              "box-decoration-clone",
              kategorie && cn("px-0.5", STYL_KATEGORII[c.kat].klasa)
            )}
          >
            {c.tekst}
          </span>
        )
      )}
    </>
  )
}

/**
 * Pseudokod „książki telefonicznej” (wyszukiwanie binarne) wykonywany linia
 * po linii: podświetlenie bieżącej linii, licznik kroków i pasek 32 stron
 * z odrzucaną połową. Przełącznik koloruje funkcje, warunki, wyrażenia
 * logiczne i pętle jak kategorie Scratcha.
 *
 * @example <KsiazkaTelefoniczna />
 */
export function KsiazkaTelefoniczna() {
  const id = React.useId()
  const [osoba, setOsoba] = React.useState("Nowak")
  const [stan, dispatch] = React.useReducer(reduktor, START)
  const [biegnie, setBiegnie] = React.useState(false)
  const [kategorie, setKategorie] = React.useState(false)

  const aktywny = biegnie && stan.wynik === null
  React.useEffect(() => {
    if (!aktywny) return
    const t = window.setInterval(() => dispatch({ typ: "krok", osoba }), 600)
    return () => window.clearInterval(t)
  }, [aktywny, osoba])

  const reset = () => {
    setBiegnie(false)
    dispatch({ typ: "reset" })
  }

  const wKsiazce = KSIAZKA.indexOf(osoba)
  const zostalo = Math.max(0, stan.hi - stan.lo + 1)
  const koniec = stan.wynik !== null

  return (
    <Lab
      tytul="Książka telefoniczna"
      opis={
        <>
          Wykonaj pseudokod linia po linii. Każde „Otwórz na środku” odrzuca
          połowę stron, które zostały.
        </>
      }
      akcje={
        <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset">
          <ArrowCounterClockwiseIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <Field className="sm:w-60">
            <FieldLabel htmlFor={`${id}-osoba`}>Szukana osoba</FieldLabel>
            <Select
              items={OSOBY}
              value={osoba}
              onValueChange={(v) => {
                if (!v) return
                setOsoba(v as string)
                reset()
              }}
            >
              <SelectTrigger id={`${id}-osoba`} className="w-full text-sm data-[size=default]:h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OSOBY.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-sm">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="h-10 flex-1 sm:flex-none md:h-10"
              onClick={() => dispatch({ typ: "krok", osoba })}
              disabled={koniec || aktywny}
            >
              <ArrowLineRightIcon data-icon="inline-start" />
              Krok
            </Button>
            {koniec ? (
              <Button className="h-10 flex-1 sm:flex-none md:h-10" onClick={reset}>
                <ArrowCounterClockwiseIcon data-icon="inline-start" />
                Od nowa
              </Button>
            ) : (
              <Button
                className="h-10 flex-1 sm:flex-none md:h-10"
                onClick={() => setBiegnie((b) => !b)}
              >
                {aktywny ? (
                  <PauseIcon data-icon="inline-start" />
                ) : (
                  <PlayIcon data-icon="inline-start" />
                )}
                {aktywny ? "Pauza" : "Uruchom"}
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
            <LabLabel id={`${id}-kod`}>Pseudokod</LabLabel>
            <Field orientation="horizontal" className="min-h-10 w-auto">
              <Switch id={`${id}-kat`} checked={kategorie} onCheckedChange={setKategorie} />
              <FieldLabel htmlFor={`${id}-kat`} className="text-sm">
                Pokaż kategorie
              </FieldLabel>
            </Field>
          </div>
          <ol
            aria-labelledby={`${id}-kod`}
            className="border bg-muted/30 py-2 font-mono text-[0.8125rem]/relaxed"
          >
            {LINIE.map((l, i) => {
              const nr = i + 1
              const biezaca =
                stan.pc === nr ||
                (stan.wynik === "znaleziono" && nr === 5) ||
                (stan.wynik === "brak" && nr === 13)
              return (
                <li
                  key={nr}
                  aria-current={biezaca ? "step" : undefined}
                  className={cn(
                    "grid grid-cols-[2.25rem_1fr] items-baseline py-0.5 pr-3 transition-colors",
                    biezaca && "bg-signal-soft shadow-[inset_3px_0_0_var(--signal)]"
                  )}
                >
                  <span
                    className={cn(
                      "pr-2 text-right text-muted-foreground tabular-nums select-none",
                      biezaca && "font-semibold text-signal-ink"
                    )}
                  >
                    {nr}
                  </span>
                  <span className={cn(l.wciecie && "pl-6", biezaca && "font-semibold")}>
                    <Linia czesci={l.czesci} kategorie={kategorie} />
                  </span>
                </li>
              )
            })}
          </ol>
          {kategorie ? (
            <ul aria-label="Legenda kategorii" className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {(Object.keys(STYL_KATEGORII) as KategoriaLinii[]).map((k) => (
                <li key={k} className="flex items-center gap-2">
                  <span aria-hidden className={cn("h-3 w-5", STYL_KATEGORII[k].klasa)} />
                  {STYL_KATEGORII[k].nazwa}
                </li>
              ))}
              <li className="basis-full text-xs text-muted-foreground">
                W Scratchu warunki i pętle są w tej samej kategorii (Kontrola) —
                tu mają różne kolory dla czytelności.
              </li>
            </ul>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <LabLabel>Książka</LabLabel>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {zostalo === 0
                ? "nie zostały żadne strony"
                : zostalo === 1
                  ? `w grze: str. ${stan.lo + 1}`
                  : `w grze: str. ${stan.lo + 1}–${stan.hi + 1}`}
            </span>
          </div>
          <div
            role="img"
            aria-label={`Pasek 32 stron. W grze: ${zostalo}${
              stan.mid !== null ? `, otwarta strona ${stan.mid + 1}` : ""
            }.`}
            className="grid grid-cols-32 gap-px border bg-border"
          >
            {KSIAZKA.map((nazwisko, i) => {
              const wGrze = i >= stan.lo && i <= stan.hi
              const otwarta = stan.mid === i
              const trafiona = otwarta && stan.wynik === "znaleziono"
              return (
                <div
                  key={nazwisko}
                  className={cn(
                    "flex h-12 items-end justify-center pb-1 font-mono text-[0.625rem] transition-colors duration-200",
                    trafiona
                      ? "bg-signal font-semibold text-signal-foreground"
                      : otwarta && wGrze
                        ? "bg-amber font-semibold text-[color-mix(in_oklch,var(--amber)_35%,black)]"
                        : wGrze
                          ? "bg-card text-muted-foreground"
                          : "bg-muted text-muted-foreground/40 [background-image:repeating-linear-gradient(135deg,transparent_0_3px,var(--grid-line)_3px_5px)]"
                  )}
                >
                  <span className="hidden sm:inline">{nazwisko[0]}</span>
                </div>
              )
            })}
          </div>
          <div className="grid grid-cols-32 font-mono text-[0.625rem] text-muted-foreground tabular-nums">
            <span className="col-start-1">1</span>
            <span className="col-start-16 -ml-2 w-5 text-center whitespace-nowrap">16</span>
            <span className="col-start-32 justify-self-end whitespace-nowrap">32</span>
          </div>
        </div>

        <LabReadouts>
          <LabReadout label="Kroki" value={stan.kroki} hint="wykonane linie" />
          <LabReadout
            label="Otwarcia"
            value={stan.otwarcia}
            accent
            hint={`po kolei: ${wKsiazce >= 0 ? wKsiazce + 1 : 32}`}
          />
          <LabReadout label="W grze" value={zostalo} hint="z 32 stron" />
          <LabReadout
            label="Otwarta strona"
            value={stan.mid !== null ? stan.mid + 1 : "—"}
            hint={stan.mid !== null ? KSIAZKA[stan.mid] : "książka zamknięta"}
          />
        </LabReadouts>

        <p
          aria-live="polite"
          className={cn(
            "flex min-h-11 items-start gap-2 border-l-2 px-3 py-2 text-sm",
            stan.wynik === "znaleziono"
              ? "border-signal bg-signal-soft font-medium"
              : stan.wynik === "brak"
                ? "border-amber bg-amber-soft font-medium"
                : "border-border bg-muted/40"
          )}
        >
          {stan.wynik === "znaleziono" ? (
            <PhoneIcon aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0 text-signal-ink" />
          ) : stan.wynik === "brak" ? (
            <XCircleIcon aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0 text-amber-ink" />
          ) : null}
          <span>{stan.komunikat}</span>
        </p>
      </div>
    </Lab>
  )
}
