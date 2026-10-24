"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import {
  formatKrotko,
  odmiana,
  ograniczRuch,
  sup,
} from "@/components/interaktywne/liczby-dane"
import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { formatPL } from "@/lib/bity"
import { cn } from "@/lib/utils"

/** Suwak sięga 10¹⁰, żeby preset „4 mld” mieścił się w zakresie. */
const MAKS_WYKLADNIK = 10
const MAKS_N = 10 ** MAKS_WYKLADNIK
const DOMYSLNE_N = 1_000_000

const PRESETY = [
  { n: 1_000, label: formatPL(1_000) },
  { n: 1_000_000, label: formatPL(1_000_000) },
  { n: 4_000_000_000, label: "4 mld" },
]

const SERIE = [
  {
    id: "n",
    nazwa: "n",
    opis: "strona po stronie",
    kolor: "var(--chart-1)",
    tlo: "bg-chart-1",
  },
  {
    id: "pol",
    nazwa: "n/2",
    opis: "po dwie strony",
    kolor: "var(--chart-2)",
    tlo: "bg-chart-2",
  },
  {
    id: "log",
    nazwa: "log₂ n",
    opis: "od środka (binarnie)",
    kolor: "var(--chart-3)",
    tlo: "bg-chart-3",
  },
] as const

const KROKI = ["krok", "kroki", "kroków"] as const

/** Pozycja suwaka x → n = 10^x, zaokrąglone do 3 cyfr znaczących. */
function nZWykladnika(x: number) {
  if (x <= 0) return 1
  const v = 10 ** x
  if (v < 1000) return Math.max(1, Math.round(v))
  const p = 10 ** (Math.floor(Math.log10(v)) - 2)
  return Math.min(MAKS_N, Math.round(v / p) * p)
}

const kroki = (n: number) => (n <= 1 ? 0 : Math.ceil(Math.log2(n)))

/**
 * Wykres n, n/2 i log₂ n z suwakiem w skali logarytmicznej (1 … 10¹⁰).
 * Na osi liniowej log₂ n prawie przylega do osi; paski w skali
 * logarytmicznej pokazują, ile kroków to naprawdę.
 *
 * @example <WykresZlozonosci />
 */
export function WykresZlozonosci() {
  // Pozycja suwaka (wykładnik) i n osobno: przy małych n zaokrąglenie
  // nie może cofać suwaka (klawiatura), a presety ustawiają n dokładnie.
  const [stan, setStan] = React.useState({
    x: Math.log10(DOMYSLNE_N),
    n: DOMYSLNE_N,
  })
  const n = stan.n
  const [podwojenie, setPodwojenie] = React.useState<{
    z: number
    na: number
  } | null>(null)
  const animacja = React.useRef<number | undefined>(undefined)
  const suwakId = React.useId()

  React.useEffect(() => () => cancelAnimationFrame(animacja.current ?? 0), [])

  const animuj = (cel: number) => {
    cancelAnimationFrame(animacja.current ?? 0)
    const x1 = Math.log10(cel)
    if (ograniczRuch()) {
      setStan({ x: x1, n: cel })
      return
    }
    const start = performance.now()
    const x0 = stan.x
    const klatka = (t: number) => {
      const p = Math.min(1, (t - start) / 400)
      const e = 1 - (1 - p) ** 3
      const x = x0 + (x1 - x0) * e
      setStan(p < 1 ? { x, n: 10 ** x } : { x: x1, n: cel })
      if (p < 1) animacja.current = requestAnimationFrame(klatka)
    }
    animacja.current = requestAnimationFrame(klatka)
  }

  const nCalk = Math.max(1, Math.round(n))
  const log = kroki(nCalk)

  return (
    <Lab
      tytul="n, n/2 czy log₂ n?"
      opis={
        <>
          Ile kroków potrzeba, żeby znaleźć nazwisko w książce o n stronach?
          Przesuń suwak: proste n i n/2 rosną razem z danymi, a log₂ n prawie
          stoi w miejscu.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setPodwojenie(null)
            animuj(DOMYSLNE_N)
          }}
          aria-label="Przywróć milion stron"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>
          Podwojenie danych to tylko jeden krok więcej: log₂(2n) = log₂ n + 1.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <LabLabel id={suwakId}>
              Rozmiar danych n · skala logarytmiczna
            </LabLabel>
            <span className="font-mono text-sm font-medium tabular-nums">
              n = {formatPL(nCalk)}
            </span>
          </div>
          <Slider
            aria-labelledby={suwakId}
            min={0}
            max={MAKS_WYKLADNIK}
            step={0.01}
            largeStep={1}
            value={[stan.x]}
            onValueChange={(v) => {
              cancelAnimationFrame(animacja.current ?? 0)
              setPodwojenie(null)
              const x = Array.isArray(v) ? v[0] : (v as number)
              setStan({ x, n: nZWykladnika(x) })
            }}
            className="py-2"
          />
          <div
            className="relative h-4 font-mono text-[0.6875rem] text-muted-foreground"
            aria-hidden
          >
            {[0, 2, 4, 6, 8].map((w) => (
              <span
                key={w}
                className={cn("absolute", w > 0 && "-translate-x-1/2")}
                style={{ left: `${(w / MAKS_WYKLADNIK) * 100}%` }}
              >
                {w === 0 ? "1" : `10${sup(w)}`}
              </span>
            ))}
            <span className="absolute right-0">10{sup(MAKS_WYKLADNIK)}</span>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Gotowe rozmiary"
          >
            {PRESETY.map((p) => (
              <Button
                key={p.n}
                variant="outline"
                size="sm"
                aria-pressed={nCalk === p.n}
                onClick={() => {
                  setPodwojenie(null)
                  animuj(p.n)
                }}
                className="h-10 tabular-nums aria-pressed:border-foreground/40 aria-pressed:bg-muted md:h-8"
              >
                {p.label}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={nCalk * 2 > MAKS_N}
              onClick={() => {
                setPodwojenie({ z: log, na: kroki(nCalk * 2) })
                animuj(nCalk * 2)
              }}
              className="h-10 md:h-8"
            >
              Podwój n
            </Button>
          </div>
        </div>

        <div aria-live="polite" className="flex flex-col gap-2">
          <dl className="grid gap-px border bg-border sm:grid-cols-3">
            {[
              { label: "n", v: formatPL(nCalk), hint: "strona po stronie" },
              {
                label: "n/2",
                v: formatPL(nCalk / 2, { maximumFractionDigits: 1 }),
                hint: "po dwie strony",
              },
              {
                label: "⌈log₂ n⌉",
                v: formatPL(log),
                hint: "od środka",
                accent: true,
              },
            ].map((o) => (
              <div
                key={o.label}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 bg-card px-3 py-2 sm:grid-cols-1 sm:items-start sm:gap-1 sm:p-3"
              >
                <dt className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground">
                  {o.label}
                </dt>
                <dd
                  className={cn(
                    "col-start-2 row-span-2 row-start-1 font-mono text-xl font-medium whitespace-nowrap tabular-nums sm:col-start-1 sm:row-span-1 sm:row-start-2 sm:text-lg md:text-xl",
                    o.accent && "text-signal-ink"
                  )}
                >
                  {o.v}
                </dd>
                <dd className="font-mono text-xs text-muted-foreground">
                  {o.hint}
                </dd>
              </div>
            ))}
          </dl>
          {podwojenie ? (
            <p className="font-mono text-xs text-muted-foreground">
              n × 2: ⌈log₂ n⌉ z {podwojenie.z} na {podwojenie.na}, czyli +
              {podwojenie.na - podwojenie.z}{" "}
              {odmiana(podwojenie.na - podwojenie.z, KROKI)}.
            </p>
          ) : null}
        </div>

        <Wykres n={n} />

        <PaskiLog n={nCalk} />
      </div>
    </Lab>
  )
}

/** Wykres SVG trzech funkcji od 0 do n na osiach liniowych. */
function Wykres({ n }: { n: number }) {
  const ramka = React.useRef<HTMLDivElement>(null)
  const [szer, setSzer] = React.useState(600)
  const [hover, setHover] = React.useState<number | null>(null)

  React.useEffect(() => {
    const el = ramka.current
    if (!el) return
    const ro = new ResizeObserver(([wpis]) => {
      setSzer(Math.max(240, Math.round(wpis.contentRect.width)))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const wys = Math.round(Math.min(300, Math.max(220, szer * 0.55)))
  const ml = 46
  const mr = 58
  const mt = 12
  const mb = 26
  const w = szer - ml - mr
  const h = wys - mt - mb
  const nn = Math.max(n, 1)
  const X = (v: number) => ml + (v / nn) * w
  const Y = (v: number) => mt + h - (v / nn) * h

  // log₂ x próbkowany gęsto przy zerze (tam rośnie najszybciej).
  const punktyLog: string[] = []
  if (nn > 1) {
    for (let i = 0; i <= 160; i++) {
      const x = nn ** (i / 160)
      punktyLog.push(`${X(x).toFixed(1)},${Y(Math.log2(x)).toFixed(1)}`)
    }
  }

  const wartosci = [nn, nn / 2, Math.log2(nn)]
  // Etykiety na końcu linii bez nachodzenia na siebie.
  const etykiety = SERIE.map((s, i) => ({
    ...s,
    v: wartosci[i],
    y: Y(wartosci[i]),
  })).sort((a, b) => a.y - b.y)
  for (let i = 1; i < etykiety.length; i++) {
    etykiety[i].y = Math.max(etykiety[i].y, etykiety[i - 1].y + 14)
  }
  const nadmiar = etykiety[etykiety.length - 1].y - (mt + h + 4)
  if (nadmiar > 0) etykiety.forEach((e) => (e.y -= nadmiar))

  const naPozycji = (e: React.PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    const v = ((e.clientX - r.left) / r.width) * nn
    setHover(Math.min(nn, Math.max(0, v)))
  }

  return (
    <figure className="flex flex-col gap-2">
      <figcaption className="flex flex-col gap-2">
        <LabLabel>Liczba kroków dla danych od 0 do n · osie liniowe</LabLabel>
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {SERIE.map((s) => (
            <li key={s.id} className="flex items-center gap-1.5">
              <span className={cn("h-0.5 w-4", s.tlo)} aria-hidden />
              <span className="font-mono font-medium">{s.nazwa}</span>
              <span className="text-muted-foreground">{s.opis}</span>
            </li>
          ))}
        </ul>
      </figcaption>
      <p
        className="min-h-4 font-mono text-[0.6875rem] text-muted-foreground tabular-nums"
        aria-hidden
      >
        {hover === null
          ? "Najedź na wykres albo go dotknij, żeby odczytać wartości."
          : `dla ${formatKrotko(hover)}: n = ${formatKrotko(hover)} · n/2 = ${formatKrotko(hover / 2)} · log₂ = ${hover >= 1 ? formatPL(Math.log2(hover), { maximumFractionDigits: 1 }) : "—"}`}
      </p>
      <div ref={ramka} className="w-full">
        <svg
          viewBox={`0 0 ${szer} ${wys}`}
          width="100%"
          height={wys}
          role="img"
          aria-label={`Wykres dla n = ${formatPL(Math.round(nn))}: n i n/2 to proste, log₂ n = ${formatPL(Math.log2(nn), { maximumFractionDigits: 1 })} prawie przylega do osi poziomej.`}
          className="block overflow-visible font-mono"
        >
          {/* siatka i osie */}
          {[0, 0.5, 1].map((f) => (
            <g key={f}>
              <line
                x1={ml}
                x2={ml + w}
                y1={Y(f * nn)}
                y2={Y(f * nn)}
                className="stroke-border"
                strokeDasharray={f === 0 ? undefined : "3 4"}
              />
              <text
                x={ml - 6}
                y={Y(f * nn)}
                dy="0.32em"
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {formatKrotko(f * nn)}
              </text>
              <text
                x={X(f * nn)}
                y={mt + h + 16}
                textAnchor={f === 0 ? "start" : f === 1 ? "end" : "middle"}
                className={cn(
                  "text-[10px]",
                  f === 1
                    ? "fill-foreground font-semibold"
                    : "fill-muted-foreground"
                )}
              >
                {f === 1 ? `n = ${formatKrotko(nn)}` : formatKrotko(f * nn)}
              </text>
            </g>
          ))}
          <line x1={ml} x2={ml} y1={mt} y2={mt + h} className="stroke-border" />
          {/* znacznik bieżącego n */}
          <line
            x1={X(nn)}
            x2={X(nn)}
            y1={mt}
            y2={mt + h}
            className="stroke-foreground/40"
            strokeDasharray="2 3"
          />

          {/* linie */}
          <line
            x1={X(0)}
            y1={Y(0)}
            x2={X(nn)}
            y2={Y(nn)}
            stroke={SERIE[0].kolor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          <line
            x1={X(0)}
            y1={Y(0)}
            x2={X(nn)}
            y2={Y(nn / 2)}
            stroke={SERIE[1].kolor}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {punktyLog.length ? (
            <polyline
              points={punktyLog.join(" ")}
              fill="none"
              stroke={SERIE[2].kolor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ) : null}

          {/* punkty i etykiety na końcu */}
          {SERIE.map((s, i) => (
            <circle
              key={s.id}
              cx={X(nn)}
              cy={Y(wartosci[i])}
              r={4}
              fill={s.kolor}
              className="stroke-card"
              strokeWidth={2}
            />
          ))}
          {etykiety.map((e) => (
            <text
              key={e.id}
              x={X(nn) + 8}
              y={e.y}
              dy="0.32em"
              className="fill-foreground text-[10px] font-medium"
            >
              {e.id === "log"
                ? formatPL(e.v, { maximumFractionDigits: 1 })
                : formatKrotko(e.v)}
            </text>
          ))}

          {/* odczyt pod kursorem */}
          {hover !== null ? (
            <g pointerEvents="none">
              <line
                x1={X(hover)}
                x2={X(hover)}
                y1={mt}
                y2={mt + h}
                className="stroke-foreground/50"
              />
              {[hover, hover / 2, hover >= 1 ? Math.log2(hover) : 0].map(
                (v, i) => (
                  <circle
                    key={i}
                    cx={X(hover)}
                    cy={Y(v)}
                    r={4}
                    fill={SERIE[i].kolor}
                    className="stroke-card"
                    strokeWidth={2}
                  />
                )
              )}
            </g>
          ) : null}
          <rect
            x={ml}
            y={mt}
            width={w}
            height={h}
            fill="transparent"
            style={{ touchAction: "pan-y" }}
            onPointerMove={naPozycji}
            onPointerDown={naPozycji}
            onPointerLeave={() => setHover(null)}
          />
        </svg>
      </div>
    </figure>
  )
}

/** Poziome paski „liczba kroków” w skali logarytmicznej (1 … 10¹⁰). */
function PaskiLog({ n }: { n: number }) {
  const wiersze = [
    { ...SERIE[0], v: n },
    { ...SERIE[1], v: n / 2 },
    { ...SERIE[2], v: kroki(n) },
  ]
  const szerokosc = (v: number) =>
    v <= 1 ? 0 : (Math.log10(v) / MAKS_WYKLADNIK) * 100
  return (
    <div className="flex flex-col gap-3">
      <LabLabel>Liczba kroków · skala logarytmiczna</LabLabel>
      <ul className="flex flex-col gap-3">
        {wiersze.map((r) => (
          <li key={r.id} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span>
                <span className="font-mono font-medium">{r.nazwa}</span>{" "}
                <span className="text-muted-foreground">· {r.opis}</span>
              </span>
              <span className="font-mono tabular-nums">
                {formatPL(r.v, { maximumFractionDigits: 1 })}{" "}
                {Number.isInteger(r.v) ? odmiana(r.v, KROKI) : "kroku"}
              </span>
            </div>
            <div
              className="h-3 bg-muted bg-[repeating-linear-gradient(to_right,var(--border)_0_1px,transparent_1px_10%)]"
              aria-hidden
            >
              <div
                className={cn(
                  "h-full min-w-0.5 transition-[width] duration-300",
                  r.tlo
                )}
                style={{ width: `${szerokosc(r.v)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div
        className="relative h-4 font-mono text-[0.6875rem] text-muted-foreground"
        aria-hidden
      >
        {[0, 2, 4, 6, 8, 10].map((w) => (
          <span
            key={w}
            className={cn(
              "absolute",
              w === 0
                ? ""
                : w === MAKS_WYKLADNIK
                  ? "right-0"
                  : "-translate-x-1/2"
            )}
            style={
              w === MAKS_WYKLADNIK
                ? undefined
                : { left: `${(w / MAKS_WYKLADNIK) * 100}%` }
            }
          >
            {w === 0 ? "1" : `10${sup(w)}`}
          </span>
        ))}
      </div>
      <p className="text-xs/relaxed text-muted-foreground">
        Każda kreska to 10× więcej kroków. Na zwykłym wykresie pasek log₂ n
        byłby niewidoczny.
      </p>
    </div>
  )
}
