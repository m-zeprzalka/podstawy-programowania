"use client"

import * as React from "react"
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatPL, groupBits } from "@/lib/bity"
import { cn } from "@/lib/utils"

import { odmiana } from "./wstep-dane"

type Algorytm = "litery" | "wielkie" | "odwroc" | "dwojkowy"

const ALGORYTMY: {
  id: Algorytm
  etykieta: string
  pseudokod: string
}[] = [
  {
    id: "litery",
    etykieta: "Policz litery",
    pseudokod:
      "licznik ← 0; dla każdego znaku: jeśli to litera, licznik ← licznik + 1; zwróć licznik",
  },
  {
    id: "wielkie",
    etykieta: "WIELKIE LITERY",
    pseudokod:
      "dla każdego znaku: jeśli to mała litera, zamień ją na wielką; zwróć wynik",
  },
  {
    id: "odwroc",
    etykieta: "Odwróć tekst",
    pseudokod:
      "wynik ← pusty; dla każdego znaku od ostatniego do pierwszego: dopisz go do wyniku; zwróć wynik",
  },
  {
    id: "dwojkowy",
    etykieta: "Na dwójkowy",
    pseudokod:
      "dopóki n > 0: zapisz resztę z dzielenia n przez 2, n ← n div 2; odczytaj reszty od końca",
  },
]

const CZAS_PRZETWARZANIA = 350

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
      const s = liczba.trim()
      if (s === "") return { ok: false, blad: "Wpisz liczbę, np. 50." }
      if (!/^\d+$/.test(s))
        return {
          ok: false,
          blad: "Tylko cyfry 0–9: liczba całkowita, bez minusa i przecinka.",
        }
      const n = Number(s)
      if (!Number.isSafeInteger(n))
        return {
          ok: false,
          blad: `Za duża liczba (maks. ${formatPL(Number.MAX_SAFE_INTEGER)}).`,
        }
      const bin = n.toString(2)
      return {
        ok: true,
        tekst: groupBits(bin),
        dopisek: `${bin.length} ${odmiana(bin.length, "bit", "bity", "bitów")}`,
      }
    }
  }
}

/**
 * Model „wejście → czarna skrzynka → wyjście”. Wybierz algorytm, zmień
 * wejście i obserwuj wyjście; „Zajrzyj do środka” odsłania pseudokod.
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
      opis="Wejście trafia do skrzynki, a ze skrzynki wychodzi wyjście. Wybierz algorytm, zmień wejście i zgadnij, co dzieje się w środku."
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
                "relative flex size-24 flex-col items-center justify-center gap-1 overflow-hidden bg-primary text-primary-foreground shadow-[0_6px_0_-2px_var(--border)] sm:size-28",
                otwarta &&
                  "outline-2 outline-offset-4 outline-amber outline-dashed"
              )}
              aria-hidden
            >
              <span
                className={cn(
                  "font-mono text-2xl font-semibold tracking-widest sm:text-3xl",
                  przetwarza && "animate-pulse"
                )}
              >
                ???
              </span>
              <span className="font-mono text-[0.625rem] tracking-widest uppercase opacity-70">
                algorytm
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

        <div className="flex flex-col gap-2">
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
              <p className="border-l-2 border-amber bg-amber-soft px-3 py-2 font-mono text-xs/relaxed sm:text-[0.8125rem]/relaxed">
                <span className="text-amber-ink select-none" aria-hidden>
                  {"> "}
                </span>
                <span className="sr-only">Pseudokod: </span>
                {opis.pseudokod}
              </p>
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
