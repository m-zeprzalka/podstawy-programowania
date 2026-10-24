"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUUpLeftIcon,
  CheckIcon,
  CrosshairIcon,
  PlayIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import {
  formatLiczba,
  odmiana,
  sup,
} from "@/components/interaktywne/liczby-dane"
import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Odp = "wiecej" | "mniej" | "trafione"
type Strzal = { liczba: number; odp: Odp }
type Tryb = "ty" | "komputer"

const PYTANIA = ["pytanie", "pytania", "pytań"] as const
const LICZBY = ["liczba", "liczby", "liczb"] as const

/** Przedział zgodny ze wszystkimi odpowiedziami (lo > hi oznacza sprzeczność). */
function przedzial(strzaly: Strzal[], max: number) {
  let lo = 1
  let hi = max
  for (const s of strzaly) {
    if (s.odp === "wiecej") lo = Math.max(lo, s.liczba + 1)
    else if (s.odp === "mniej") hi = Math.min(hi, s.liczba - 1)
    else {
      lo = Math.max(lo, s.liczba)
      hi = Math.min(hi, s.liczba)
    }
  }
  return { lo, hi }
}

const srodek = (lo: number, hi: number) => Math.floor((lo + hi) / 2)

/** Ile pytań zadaje wyszukiwanie binarne (zawsze środek), żeby trafić x. */
function pytaniaBinarnie(x: number, max: number) {
  let lo = 1
  let hi = max
  let ile = 0
  while (lo <= hi) {
    ile++
    const m = srodek(lo, hi)
    if (m === x) return ile
    if (m < x) lo = m + 1
    else hi = m - 1
  }
  return ile
}

/** Opis sprzeczności: która para odpowiedzi się wyklucza. */
function opiszSprzecznosc(strzaly: Strzal[], max: number) {
  const wiecej = strzaly.filter((s) => s.odp === "wiecej")
  const mniej = strzaly.filter((s) => s.odp === "mniej")
  const dol = wiecej.length ? Math.max(...wiecej.map((s) => s.liczba)) : null
  const gora = mniej.length ? Math.min(...mniej.map((s) => s.liczba)) : null
  if (dol !== null && dol >= max)
    return `„więcej niż ${formatLiczba(dol)}”, a zakres kończy się na ${formatLiczba(max)}.`
  if (gora !== null && gora <= 1)
    return `„mniej niż ${formatLiczba(gora)}”, a zakres zaczyna się od 1.`
  if (dol !== null && gora !== null)
    return `„więcej niż ${formatLiczba(dol)}” i „mniej niż ${formatLiczba(gora)}”: między nimi nie ma żadnej liczby całkowitej.`
  return "odpowiedzi wykluczają się nawzajem."
}

/**
 * Gra „Zgadnij liczbę” w dwóch trybach: zgadujesz Ty (komputer odpowiada
 * „więcej / mniej / trafione”) albo zgaduje komputer, dzieląc przedział na
 * pół (wyszukiwanie binarne). Pasek pokazuje kurczący się przedział.
 *
 * @example <ZgadnijLiczbe max={1000} />
 */
export function ZgadnijLiczbe({
  max = 1000,
}: {
  /** Górna granica zakresu 1…max (2–1 000 000). */
  max?: number
}) {
  const M = Math.min(1_000_000, Math.max(2, Math.round(max) || 1000))
  const limit = Math.ceil(Math.log2(M + 1))
  const sufit = Math.ceil(Math.log2(M))

  const [tryb, setTryb] = React.useState<Tryb>("ty")

  // Tryb „Ty zgadujesz”.
  const [sekret, setSekret] = React.useState<number | null>(null)
  const [strzalyTy, setStrzalyTy] = React.useState<Strzal[]>([])
  const [wpis, setWpis] = React.useState("")
  const [bladWpisu, setBladWpisu] = React.useState<string | null>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()

  // Tryb „Komputer zgaduje”.
  const [graKomputera, setGraKomputera] = React.useState(false)
  const [strzalyK, setStrzalyK] = React.useState<Strzal[]>([])

  const startTy = () => {
    setSekret(1 + Math.floor(Math.random() * M))
    setStrzalyTy([])
    setWpis("")
    setBladWpisu(null)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }

  const startKomputer = () => {
    setGraKomputera(true)
    setStrzalyK([])
  }

  const reset = () => {
    if (tryb === "ty") {
      setSekret(null)
      setStrzalyTy([])
      setWpis("")
      setBladWpisu(null)
    } else {
      setGraKomputera(false)
      setStrzalyK([])
    }
  }

  const strzaly = tryb === "ty" ? strzalyTy : strzalyK
  const { lo, hi } = przedzial(strzaly, M)
  const sprzecznosc = lo > hi
  const koniec = strzaly.some((s) => s.odp === "trafione")

  const zgadnij = (e: React.FormEvent) => {
    e.preventDefault()
    if (sekret === null || koniec) return
    const liczba = Number(wpis.trim().replace(/[\s ]/g, ""))
    if (!Number.isInteger(liczba) || liczba < 1 || liczba > M) {
      setBladWpisu(`Wpisz liczbę całkowitą od 1 do ${formatLiczba(M)}.`)
      return
    }
    setBladWpisu(null)
    const odp: Odp =
      liczba === sekret ? "trafione" : liczba < sekret ? "wiecej" : "mniej"
    setStrzalyTy((s) => [...s, { liczba, odp }])
    setWpis("")
  }

  const propozycja = sprzecznosc ? null : srodek(lo, hi)
  const odpowiedz = (odp: Odp) => {
    if (propozycja === null || koniec) return
    setStrzalyK((s) => [...s, { liczba: propozycja, odp }])
  }

  const ostatni = strzaly.at(-1)
  const trafiona = strzaly.find((s) => s.odp === "trafione")?.liczba ?? null
  const aktywna = tryb === "ty" ? sekret !== null : graKomputera

  return (
    <Lab
      tytul="Zgadnij liczbę"
      opis={
        <>
          Liczba od 1 do {formatLiczba(M)}, odpowiedzi tylko „więcej”, „mniej”
          albo „trafione”. Pytanie o środek odrzuca połowę możliwości.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={reset}
          aria-label="Zacznij od nowa"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>
          Maksymalnie{" "}
          {sufit === limit
            ? `⌈log₂ ${formatLiczba(M)}⌉`
            : `⌊log₂ ${formatLiczba(M)}⌋ + 1`}{" "}
          = {limit} {odmiana(limit, PYTANIA)}, bo 2{sup(limit)} ={" "}
          {formatLiczba(2 ** limit)} ≥ {formatLiczba(M)}.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <ToggleGroup
          aria-label="Kto zgaduje"
          variant="outline"
          spacing={0}
          className="w-full sm:w-fit"
          value={[tryb]}
          onValueChange={(v) => {
            if (v[0]) setTryb(v[0] as Tryb)
          }}
        >
          <ToggleGroupItem value="ty" className="flex-1 px-4">
            Ty zgadujesz
          </ToggleGroupItem>
          <ToggleGroupItem value="komputer" className="flex-1 px-4">
            Komputer zgaduje
          </ToggleGroupItem>
        </ToggleGroup>

        {!aktywna ? (
          <div className="flex flex-col items-start gap-3 border border-dashed p-4">
            <p className="text-sm/relaxed">
              {tryb === "ty" ? (
                <>
                  Komputer wylosuje liczbę od 1 do {formatLiczba(M)}. Zgadnij ją
                  w jak najmniejszej liczbie prób.
                </>
              ) : (
                <>
                  Pomyśl liczbę od 1 do {formatLiczba(M)} (zapisz ją na kartce).
                  Komputer zgadnie ją w maksymalnie {limit}{" "}
                  {odmiana(limit, PYTANIA)}.
                </>
              )}
            </p>
            <Button onClick={tryb === "ty" ? startTy : startKomputer}>
              <PlayIcon data-icon="inline-start" weight="fill" />
              {tryb === "ty" ? "Wylosuj liczbę" : "Mam liczbę, zaczynaj"}
            </Button>
          </div>
        ) : (
          <>
            <PasekPrzedzialu
              lo={lo}
              hi={hi}
              max={M}
              strzaly={strzaly}
              sprzecznosc={sprzecznosc}
            />

            <div aria-live="polite" className="flex flex-col gap-3">
              {tryb === "ty" ? (
                <KomunikatTy
                  ostatni={ostatni}
                  proby={strzaly.length}
                  limit={limit}
                />
              ) : sprzecznosc ? (
                <div className="flex items-start gap-2 border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  <WarningIcon
                    weight="fill"
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <p>
                    <span className="font-medium">Sprzeczne odpowiedzi.</span>{" "}
                    Żadna liczba nie pasuje do wszystkich:{" "}
                    {opiszSprzecznosc(strzaly, M)}
                  </p>
                </div>
              ) : koniec ? (
                <p className="flex items-center gap-2 text-base font-medium text-signal-ink">
                  <CheckIcon weight="bold" className="size-5" />
                  Zgadłem: {formatLiczba(trafiona ?? 0)}. Liczba pytań:{" "}
                  {strzaly.length}.
                </p>
              ) : (
                <div className="flex flex-col gap-1">
                  <LabLabel>
                    Pytanie {strzaly.length + 1} · maks. {limit}
                  </LabLabel>
                  <p className="text-lg">
                    Czy to{" "}
                    <span className="font-mono text-3xl font-semibold text-signal-ink tabular-nums">
                      {formatLiczba(propozycja ?? 0)}
                    </span>
                    ?
                  </p>
                </div>
              )}
            </div>

            {tryb === "ty" && !koniec ? (
              <form onSubmit={zgadnij} className="flex flex-col gap-2">
                <Field data-invalid={bladWpisu ? true : undefined}>
                  <FieldLabel htmlFor={inputId}>Twój strzał</FieldLabel>
                  <div className="flex gap-2">
                    <Input
                      ref={inputRef}
                      id={inputId}
                      value={wpis}
                      onChange={(e) => setWpis(e.target.value)}
                      inputMode="numeric"
                      autoComplete="off"
                      enterKeyHint="go"
                      placeholder={`1–${M}`}
                      aria-invalid={bladWpisu ? true : undefined}
                      className="h-10 max-w-40 font-mono text-base tabular-nums md:h-9 md:text-sm"
                    />
                    <Button type="submit">Sprawdź</Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => {
                        setWpis(String(srodek(lo, hi)))
                        inputRef.current?.focus()
                      }}
                      aria-label={`Wpisz środek przedziału: ${srodek(lo, hi)}`}
                      className="px-2.5"
                    >
                      <CrosshairIcon data-icon="inline-start" />
                      <span className="hidden sm:inline">Środek</span>
                    </Button>
                  </div>
                  {bladWpisu ? <FieldError>{bladWpisu}</FieldError> : null}
                </Field>
              </form>
            ) : null}

            {tryb === "komputer" && !koniec ? (
              sprzecznosc ? (
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setStrzalyK((s) => s.slice(0, -1))}
                  >
                    <ArrowUUpLeftIcon data-icon="inline-start" />
                    Cofnij ostatnią odpowiedź
                  </Button>
                  <Button variant="ghost" onClick={startKomputer}>
                    Zacznij od nowa
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => odpowiedz("wiecej")}
                    aria-label={`Więcej niż ${propozycja}`}
                  >
                    <ArrowUpIcon data-icon="inline-start" />
                    Więcej
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => odpowiedz("mniej")}
                    aria-label={`Mniej niż ${propozycja}`}
                  >
                    <ArrowDownIcon data-icon="inline-start" />
                    Mniej
                  </Button>
                  <Button size="lg" onClick={() => odpowiedz("trafione")}>
                    <CheckIcon data-icon="inline-start" />
                    Trafione
                  </Button>
                </div>
              )
            ) : null}

            {strzaly.length > 0 ? <Historia strzaly={strzaly} /> : null}

            {koniec && trafiona !== null ? (
              <Podsumowanie
                tryb={tryb}
                liczba={trafiona}
                pytania={strzaly.length}
                max={M}
                limit={limit}
                onJeszcze={tryb === "ty" ? startTy : startKomputer}
              />
            ) : null}
          </>
        )}
      </div>
    </Lab>
  )
}

function KomunikatTy({
  ostatni,
  proby,
  limit,
}: {
  ostatni: Strzal | undefined
  proby: number
  limit: number
}) {
  if (!ostatni) {
    return (
      <p className="text-sm text-muted-foreground">
        Liczba jest wylosowana. Wpisz pierwszy strzał (podpowiedź: środek).
      </p>
    )
  }
  if (ostatni.odp === "trafione") {
    return (
      <p className="flex items-center gap-2 text-base font-medium text-signal-ink">
        <CheckIcon weight="bold" className="size-5" />
        Trafione: {formatLiczba(ostatni.liczba)}. Liczba prób: {proby}.
      </p>
    )
  }
  const wiecej = ostatni.odp === "wiecej"
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <p className="flex items-center gap-2 text-lg font-medium">
        {wiecej ? (
          <ArrowUpIcon weight="bold" className="size-5 text-amber-ink" />
        ) : (
          <ArrowDownIcon weight="bold" className="size-5 text-amber-ink" />
        )}
        {wiecej ? "Więcej" : "Mniej"} niż {formatLiczba(ostatni.liczba)}
      </p>
      <p className="font-mono text-xs text-muted-foreground tabular-nums">
        próba {proby} ·{" "}
        {proby >= limit ? "ponad limit binarny" : `limit binarny ${limit}`}
      </p>
    </div>
  )
}

function PasekPrzedzialu({
  lo,
  hi,
  max,
  strzaly,
  sprzecznosc,
}: {
  lo: number
  hi: number
  max: number
  strzaly: Strzal[]
  sprzecznosc: boolean
}) {
  const left = ((Math.min(lo, max) - 1) / max) * 100
  const width = sprzecznosc ? 0 : ((hi - lo + 1) / max) * 100
  const ile = Math.max(0, hi - lo + 1)
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <LabLabel>Możliwe liczby</LabLabel>
        <span className="font-mono text-sm tabular-nums">
          {sprzecznosc ? (
            <span className="text-destructive">brak</span>
          ) : (
            <>
              {formatLiczba(lo)}–{formatLiczba(hi)}{" "}
              <span className="text-muted-foreground">
                · {formatLiczba(ile)} {odmiana(ile, LICZBY)}
              </span>
            </>
          )}
        </span>
      </div>
      <div
        role="img"
        aria-label={
          sprzecznosc
            ? "Żadna liczba nie pasuje"
            : `Możliwe liczby od ${lo} do ${hi}, czyli ${ile} z ${max}`
        }
        className="relative h-10 overflow-hidden border bg-[repeating-linear-gradient(135deg,var(--border)_0_1.5px,transparent_1.5px_7px)]"
      >
        <div
          className={cn(
            "absolute inset-y-0 min-w-1 border-x-2 border-signal bg-signal-soft transition-[left,width] duration-300 ease-out",
            sprzecznosc && "opacity-0"
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
        {strzaly.map((s, i) => (
          <span
            key={i}
            aria-hidden
            className={cn(
              "absolute inset-y-0 w-0.5 -translate-x-1/2",
              s.odp === "trafione" ? "bg-signal" : "bg-amber"
            )}
            style={{ left: `${((s.liczba - 0.5) / max) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-xs text-muted-foreground tabular-nums">
        <span>1</span>
        <span>{formatLiczba(max)}</span>
      </div>
    </div>
  )
}

function Historia({ strzaly }: { strzaly: Strzal[] }) {
  return (
    <div className="flex flex-col gap-2">
      <LabLabel>Historia</LabLabel>
      <ol className="flex flex-wrap gap-1.5">
        {strzaly.map((s, i) => (
          <li
            key={i}
            className={cn(
              "flex items-center gap-1 border px-2 py-1 font-mono text-sm tabular-nums",
              s.odp === "trafione"
                ? "border-signal bg-signal-soft text-signal-ink"
                : "bg-background"
            )}
          >
            <span className="text-[0.625rem] text-muted-foreground">
              {i + 1}.
            </span>
            {formatLiczba(s.liczba)}
            {s.odp === "wiecej" ? (
              <ArrowUpIcon
                className="size-3.5 text-amber-ink"
                aria-label="więcej"
              />
            ) : s.odp === "mniej" ? (
              <ArrowDownIcon
                className="size-3.5 text-amber-ink"
                aria-label="mniej"
              />
            ) : (
              <CheckIcon className="size-3.5" aria-label="trafione" />
            )}
          </li>
        ))}
      </ol>
    </div>
  )
}

function Podsumowanie({
  tryb,
  liczba,
  pytania,
  max,
  limit,
  onJeszcze,
}: {
  tryb: Tryb
  liczba: number
  pytania: number
  max: number
  limit: number
  onJeszcze: () => void
}) {
  const binarnie = pytaniaBinarnie(liczba, max)
  const wiersze = [
    {
      nazwa: tryb === "ty" ? "Ty" : "Komputer (binarnie)",
      n: pytania,
      klasa: "bg-chart-1",
    },
    ...(tryb === "ty"
      ? [
          {
            nazwa: "Binarnie (zawsze środek)",
            n: binarnie,
            klasa: "bg-chart-3",
          },
        ]
      : []),
    { nazwa: "Liniowo (1, 2, 3, …)", n: liczba, klasa: "bg-chart-2" },
  ]
  const najwiecej = Math.max(...wiersze.map((w) => w.n), 1)
  return (
    <div className="flex flex-col gap-3 border border-dashed p-3">
      <LabLabel>Porównanie z wyszukiwaniem liniowym</LabLabel>
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 text-sm">
        {wiersze.map((w) => (
          <React.Fragment key={w.nazwa}>
            <span className="min-w-0">{w.nazwa}</span>
            <span className="text-right font-mono tabular-nums">
              {formatLiczba(w.n)} {odmiana(w.n, PYTANIA)}
            </span>
            <span className="col-span-2 mb-1.5 h-2 bg-muted" aria-hidden>
              <span
                className={cn("block h-full min-w-0.5", w.klasa)}
                style={{ width: `${(w.n / najwiecej) * 100}%` }}
              />
            </span>
          </React.Fragment>
        ))}
      </div>
      <p className="text-sm/relaxed text-muted-foreground">
        Liniowo średnio ok. {formatLiczba(Math.round(max / 2))}, w najgorszym
        razie {formatLiczba(max)} pytań. Binarnie nigdy więcej niż {limit}.
      </p>
      <Button variant="outline" onClick={onJeszcze} className="self-start">
        <ArrowCounterClockwiseIcon data-icon="inline-start" />
        Jeszcze raz
      </Button>
    </div>
  )
}
