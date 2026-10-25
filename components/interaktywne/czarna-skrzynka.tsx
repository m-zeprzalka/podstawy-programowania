"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatPL, groupBits } from "@/lib/bity"
import { cn } from "@/lib/utils"

import { odmiana } from "./wstep-dane"

type Algorytm = "litery" | "wielkie" | "odwroc" | "dwojkowy"

/** Linia pseudokodu; `poziom` to głębokość wcięcia (0, 1, 2). */
type Linia = { tekst: string; poziom?: number }

const ALGORYTMY: {
  id: Algorytm
  etykieta: string
  pseudokod: Linia[]
}[] = [
  {
    id: "litery",
    etykieta: "Policz litery",
    pseudokod: [
      { tekst: "Weź tekst z wejścia" },
      { tekst: "Ustaw licznik na 0" },
      { tekst: "Dla każdego znaku tekstu, od lewej do prawej:" },
      { tekst: "Jeśli znak jest literą", poziom: 1 },
      { tekst: "Dodaj 1 do licznika", poziom: 2 },
      { tekst: "Podaj licznik na wyjście" },
    ],
  },
  {
    id: "wielkie",
    etykieta: "WIELKIE LITERY",
    pseudokod: [
      { tekst: "Weź tekst z wejścia" },
      { tekst: "Zacznij od pustego wyniku" },
      { tekst: "Dla każdego znaku tekstu, od lewej do prawej:" },
      { tekst: "Jeśli znak jest małą literą", poziom: 1 },
      { tekst: "Dopisz do wyniku tę literę, ale wielką", poziom: 2 },
      { tekst: "W przeciwnym razie", poziom: 1 },
      { tekst: "Dopisz do wyniku znak bez zmian", poziom: 2 },
      { tekst: "Podaj wynik na wyjście" },
    ],
  },
  {
    id: "odwroc",
    etykieta: "Odwróć tekst",
    pseudokod: [
      { tekst: "Weź tekst z wejścia" },
      { tekst: "Zacznij od pustego wyniku" },
      { tekst: "Dla każdego znaku tekstu, od prawej do lewej:" },
      { tekst: "Dopisz znak na koniec wyniku", poziom: 1 },
      { tekst: "Podaj wynik na wyjście" },
    ],
  },
  {
    id: "dwojkowy",
    etykieta: "Na dwójkowy",
    pseudokod: [
      { tekst: "Weź liczbę z wejścia" },
      { tekst: "Zacznij od pustego wyniku" },
      { tekst: "Podziel liczbę przez 2" },
      { tekst: "Dopisz resztę z dzielenia (0 albo 1) na początek wyniku" },
      { tekst: "Wynik dzielenia, bez reszty, to teraz nowa liczba" },
      { tekst: "Jeśli liczba jest większa od 0" },
      { tekst: "Wróć do linii 3", poziom: 1 },
      { tekst: "Podaj wynik na wyjście" },
    ],
  },
]

const CZAS_PRZETWARZANIA = 350
/** Tyle kroków pokazuje tabela „krok po kroku”; resztę streszczamy. */
const MAKS_KROKOW = 10

type Wynik =
  { ok: true; tekst: string; dopisek?: string } | { ok: false; blad: string }

/** Dzieli tekst na znaki widoczne dla człowieka (także emoji z łącznikami). */
function znaki(tekst: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("pl", { granularity: "grapheme" })
    return Array.from(seg.segment(tekst), (s) => s.segment)
  }
  return Array.from(tekst)
}

const jestLitera = (z: string) => /\p{L}/u.test(z)
const jestMala = (z: string) => z !== z.toLocaleUpperCase("pl-PL")

/** Poprawna liczba z wejścia albo komunikat błędu. */
function liczbaZWejscia(liczba: string): number | string {
  const s = liczba.trim()
  if (s === "") return "Wpisz liczbę, np. 50."
  if (!/^\d+$/.test(s))
    return "Tylko cyfry 0–9: liczba całkowita, bez minusa i przecinka."
  const n = Number(s)
  if (!Number.isSafeInteger(n))
    return `Za duża liczba (maks. ${formatPL(Number.MAX_SAFE_INTEGER)}).`
  return n
}

function uruchom(alg: Algorytm, tekst: string, liczba: string): Wynik {
  switch (alg) {
    case "litery": {
      const n = tekst.match(/\p{L}/gu)?.length ?? 0
      return {
        ok: true,
        tekst: String(n),
        dopisek: odmiana(n, "litera", "litery", "liter"),
      }
    }
    case "wielkie":
      return { ok: true, tekst: tekst.toLocaleUpperCase("pl-PL") }
    case "odwroc":
      return { ok: true, tekst: znaki(tekst).reverse().join("") }
    case "dwojkowy": {
      const n = liczbaZWejscia(liczba)
      if (typeof n === "string") return { ok: false, blad: n }
      const bin = n.toString(2)
      return {
        ok: true,
        tekst: groupBits(bin),
        dopisek: `${bin.length} ${odmiana(bin.length, "bit", "bity", "bitów")}`,
      }
    }
  }
}

/* ---------- Krok po kroku ---------- */

/** Komórka tabeli: tekst albo znak, który trzeba pokazać wprost (np. spacja). */
type Komorka = string | { znak: string }

type Slad = {
  kolumny: string[]
  wiersze: Komorka[][]
  /** Ile kroków nie zmieściło się w tabeli. */
  pominiete: number
  /** Wynik ostatniego kroku, gdy tabela jest przycięta. */
  koniec?: Komorka
  /** Gdy nie ma kroków do pokazania. */
  pusty?: string
}

const takNie = (b: boolean) => (b ? "tak" : "nie")

/** Pokazuje najwyżej `MAKS_KROKOW` wierszy, ale zapamiętuje wynik końcowy. */
function przytnij(
  kolumny: string[],
  wiersze: Komorka[][],
  pusty?: string
): Slad {
  const pominiete = Math.max(0, wiersze.length - MAKS_KROKOW)
  return {
    kolumny,
    wiersze: wiersze.slice(0, MAKS_KROKOW),
    pominiete,
    koniec: pominiete > 0 ? wiersze.at(-1)?.at(-1) : undefined,
    pusty,
  }
}

/** Ten sam algorytm co w `uruchom`, ale zapisuje każdy obrót pętli. */
function slad(alg: Algorytm, tekst: string, liczba: string): Slad {
  if (alg === "dwojkowy") {
    const kolumny = ["liczba", "÷ 2", "reszta", "wynik"]
    let n = liczbaZWejscia(liczba)
    if (typeof n === "string")
      return {
        kolumny,
        wiersze: [],
        pominiete: 0,
        pusty: "Popraw wejście, żeby zobaczyć kroki.",
      }
    const wiersze: Komorka[][] = []
    let wynik = ""
    do {
      const reszta = n % 2
      const iloraz = Math.floor(n / 2)
      wynik = String(reszta) + wynik
      wiersze.push([formatPL(n), formatPL(iloraz), String(reszta), wynik])
      n = iloraz
    } while (n > 0)
    return przytnij(kolumny, wiersze)
  }

  const z = znaki(tekst)
  const pusty =
    z.length === 0 ? "Pusty tekst: pętla nie wykona się ani razu." : undefined
  const wiersze: Komorka[][] = []
  let kolumny: string[]

  if (alg === "litery") {
    kolumny = ["znak", "litera?", "licznik"]
    let licznik = 0
    for (const znak of z) {
      if (jestLitera(znak)) licznik += 1
      wiersze.push([{ znak }, takNie(jestLitera(znak)), String(licznik)])
    }
  } else if (alg === "wielkie") {
    kolumny = ["znak", "mała litera?", "wynik"]
    let wynik = ""
    for (const znak of z) {
      wynik += jestMala(znak) ? znak.toLocaleUpperCase("pl-PL") : znak
      wiersze.push([{ znak }, takNie(jestMala(znak)), { znak: wynik }])
    }
  } else {
    kolumny = ["znak", "wynik"]
    let wynik = ""
    for (const znak of [...z].reverse()) {
      wynik += znak
      wiersze.push([{ znak }, { znak: wynik }])
    }
  }

  return przytnij(kolumny, wiersze, pusty)
}

/** Spacje jako „␣”, żeby było je widać w tabeli. */
function Widoczny({ znak }: { znak: string }) {
  if (znak === " ")
    return (
      <>
        <span className="text-muted-foreground" aria-hidden>
          ␣
        </span>
        <span className="sr-only">spacja</span>
      </>
    )
  return <span className="whitespace-pre">{znak.replace(/ /g, "␣")}</span>
}

/** Pogrubia słowa sterujące, żeby było widać szkielet algorytmu. */
const STERUJACE = /^(Dla każdego|Jeśli|W przeciwnym razie|Wróć do linii \d+)/

function Pseudokod({ linie }: { linie: Linia[] }) {
  return (
    <ol className="flex flex-col font-mono text-xs/relaxed sm:text-[0.8125rem]/relaxed">
      {linie.map((l, i) => {
        const m = l.tekst.match(STERUJACE)
        const wisi = (l.poziom ?? 0) * 4
        return (
          <li key={i} className="grid grid-cols-[2.5ch_minmax(0,1fr)] gap-x-3">
            <span
              className="text-right text-amber-ink/70 select-none"
              aria-hidden
            >
              {i + 1}
            </span>
            <span style={{ paddingLeft: `${wisi}ch` }}>
              {m ? (
                <>
                  <span className="font-semibold text-amber-ink">{m[0]}</span>
                  {l.tekst.slice(m[0].length)}
                </>
              ) : (
                l.tekst
              )}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function KrokPoKroku({ dane }: { dane: Slad }) {
  if (dane.pusty && dane.wiersze.length === 0)
    return <p className="text-xs/relaxed text-muted-foreground">{dane.pusty}</p>
  return (
    <div className="flex flex-col gap-1.5">
      <Table className="font-mono">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10 text-muted-foreground">krok</TableHead>
            {dane.kolumny.map((k) => (
              <TableHead key={k} className="text-muted-foreground">
                {k}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {dane.wiersze.map((w, i) => (
            <TableRow key={i}>
              <TableCell className="text-muted-foreground tabular-nums">
                {i + 1}
              </TableCell>
              {w.map((k, j) => (
                <TableCell
                  key={j}
                  className={cn(
                    "tabular-nums",
                    j === w.length - 1 && "font-semibold text-signal-ink"
                  )}
                >
                  {typeof k === "string" ? k : <Widoczny znak={k.znak} />}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {dane.pominiete > 0 ? (
        <p className="text-xs text-muted-foreground">
          … i jeszcze {dane.pominiete}{" "}
          {odmiana(dane.pominiete, "krok", "kroki", "kroków")} według tego
          samego schematu.
          {dane.koniec !== undefined ? (
            <>
              {" "}
              Na końcu:{" "}
              <span className="font-mono font-semibold text-signal-ink">
                {typeof dane.koniec === "string" ? (
                  dane.koniec
                ) : (
                  <Widoczny znak={dane.koniec.znak} />
                )}
              </span>
            </>
          ) : null}
        </p>
      ) : null}
    </div>
  )
}

/**
 * Model „wejście → czarna skrzynka → wyjście”. Wybierz algorytm, zmień
 * wejście i obserwuj wyjście; „Zajrzyj do środka” odsłania pseudokod
 * i tabelę pokazującą, jak algorytm krok po kroku przetwarza wejście.
 *
 * @example <CzarnaSkrzynka />
 */
export function CzarnaSkrzynka() {
  const [alg, setAlg] = React.useState<Algorytm>("litery")
  const [tekst, setTekst] = React.useState("Zażółć")
  const [liczba, setLiczba] = React.useState("50")
  const [otwarta, setOtwarta] = React.useState(false)
  const [przetwarza, setPrzetwarza] = React.useState(false)
  const [takt, setTakt] = React.useState(0)
  const timer = React.useRef<number | undefined>(undefined)
  const inputId = React.useId()
  const bladId = React.useId()
  const kodId = React.useId()

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  /** Krótka animacja „mielenia” po każdej zmianie. */
  const przetwarzaj = () => {
    setTakt((t) => t + 1)
    setPrzetwarza(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(
      () => setPrzetwarza(false),
      CZAS_PRZETWARZANIA
    )
  }

  const liczbowy = alg === "dwojkowy"
  const wynik = uruchom(alg, tekst, liczba)
  const opis = ALGORYTMY.find((a) => a.id === alg)!

  return (
    <Lab
      tytul="Czarna skrzynka"
      opis="Wejście trafia do skrzynki, a ze skrzynki wychodzi wyjście. Wybierz algorytm, zmień wejście i zgadnij, co dzieje się w środku. Potem zajrzyj do środka i sprawdź, czy dobrze zgadujesz."
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setAlg("litery")
            setTekst("Zażółć")
            setLiczba("50")
            setOtwarta(false)
            przetwarzaj()
          }}
          aria-label="Przywróć przykład"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <LabLabel id={`${kodId}-alg`}>Algorytm w skrzynce</LabLabel>
          <ToggleGroup
            aria-labelledby={`${kodId}-alg`}
            value={[alg]}
            onValueChange={(v) => {
              const nowy = v[0] as Algorytm | undefined
              if (!nowy) return
              setAlg(nowy)
              przetwarzaj()
            }}
            variant="outline"
            className="grid w-full grid-cols-2 sm:grid-cols-4"
          >
            {ALGORYTMY.map((a) => (
              <ToggleGroupItem key={a.id} value={a.id} className="w-full px-2">
                {a.etykieta}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto_minmax(0,1fr)] sm:gap-3">
          {/* Wejście */}
          <div className="flex min-w-0 flex-col gap-1.5">
            <label
              htmlFor={inputId}
              className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase"
            >
              Wejście
            </label>
            <Input
              id={inputId}
              value={liczbowy ? liczba : tekst}
              onChange={(e) => {
                if (liczbowy) setLiczba(e.target.value)
                else setTekst(e.target.value)
                przetwarzaj()
              }}
              inputMode={liczbowy ? "numeric" : "text"}
              autoComplete="off"
              spellCheck={false}
              placeholder={liczbowy ? "np. 50" : "np. Zażółć"}
              aria-invalid={!wynik.ok || undefined}
              aria-describedby={!wynik.ok ? bladId : undefined}
              className="h-10 font-mono text-sm md:h-10 md:text-sm"
            />
            {!wynik.ok ? (
              <p id={bladId} className="text-xs text-destructive">
                {wynik.blad}
              </p>
            ) : null}
          </div>

          <Strzalka />

          {/* Skrzynka */}
          <div className="flex flex-col items-center gap-1.5 py-1 sm:py-0">
            <LabLabel aria-hidden>Skrzynka</LabLabel>
            <div
              className={cn(
                "relative flex size-24 flex-col items-center justify-center gap-1 overflow-hidden shadow-[0_6px_0_-2px_var(--border)] transition-colors sm:size-28",
                otwarta
                  ? "bg-amber-soft text-amber-ink outline-2 outline-offset-4 outline-amber outline-dashed"
                  : "bg-primary text-primary-foreground"
              )}
              aria-hidden
            >
              <span
                className={cn(
                  "font-mono text-2xl font-semibold tracking-widest sm:text-3xl",
                  przetwarza && "animate-pulse"
                )}
              >
                {otwarta ? "↓" : "???"}
              </span>
              <span className="font-mono text-[0.625rem] tracking-widest uppercase opacity-70">
                {otwarta ? "zajrzyj niżej" : "algorytm"}
              </span>
              {przetwarza ? (
                <span
                  key={takt}
                  className="absolute inset-x-0 bottom-0 h-1 animate-in bg-signal duration-300 slide-in-from-left-full"
                />
              ) : null}
            </div>
          </div>

          <Strzalka />

          {/* Wyjście */}
          <div className="flex min-w-0 flex-col gap-1.5">
            <LabLabel>Wyjście</LabLabel>
            <output
              htmlFor={inputId}
              aria-live="polite"
              aria-busy={przetwarza}
              className={cn(
                "flex min-h-10 flex-wrap items-baseline gap-x-2 border px-3 py-2 font-mono text-sm break-all transition-colors",
                wynik.ok ? "bg-muted/40" : "border-dashed bg-destructive/10"
              )}
            >
              {przetwarza ? (
                <span className="animate-pulse text-muted-foreground">…</span>
              ) : wynik.ok ? (
                wynik.tekst === "" ? (
                  <span className="text-muted-foreground">(pusto)</span>
                ) : (
                  <>
                    <span className="font-semibold text-signal-ink">
                      {wynik.tekst}
                    </span>
                    {wynik.dopisek ? (
                      <span className="text-xs text-muted-foreground">
                        {wynik.dopisek}
                      </span>
                    ) : null}
                  </>
                )
              ) : (
                <span className="text-destructive">błąd wejścia</span>
              )}
            </output>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="self-start"
            onClick={() => setOtwarta((o) => !o)}
            aria-expanded={otwarta}
            aria-controls={kodId}
          >
            {otwarta ? (
              <EyeSlashIcon data-icon="inline-start" />
            ) : (
              <EyeIcon data-icon="inline-start" />
            )}
            {otwarta ? "Zamknij skrzynkę" : "Zajrzyj do środka"}
          </Button>
          <div id={kodId} hidden={!otwarta}>
            {otwarta ? (
              <div className="flex flex-col gap-4 border-l-2 border-amber bg-amber-soft p-3 sm:p-4">
                <section className="flex flex-col gap-2" aria-label="Pseudokod">
                  <LabLabel>Pseudokod · {opis.etykieta}</LabLabel>
                  <Pseudokod linie={opis.pseudokod} />
                </section>
                <section
                  className="flex flex-col gap-2"
                  aria-label="Krok po kroku dla twojego wejścia"
                >
                  <LabLabel>Krok po kroku dla twojego wejścia</LabLabel>
                  <KrokPoKroku dane={slad(alg, tekst, liczba)} />
                </section>
                <p className="text-xs/relaxed text-muted-foreground">
                  Pseudokod to algorytm zapisany zwykłymi zdaniami, krok po
                  kroku. Wrócimy do niego w module{" "}
                  <Link
                    href="/kurs/lekcja-0/pseudokod"
                    className="text-foreground underline underline-offset-2 hover:decoration-signal"
                  >
                    Pseudokod
                  </Link>
                  .
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </Lab>
  )
}

function Strzalka() {
  return (
    <div
      className="flex justify-center text-muted-foreground sm:pt-6"
      aria-hidden
    >
      <ArrowDownIcon className="size-5 sm:hidden" />
      <ArrowRightIcon className="hidden size-5 sm:block" />
    </div>
  )
}
