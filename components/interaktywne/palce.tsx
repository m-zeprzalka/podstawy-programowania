"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  SmileyWinkIcon,
  TargetIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { formatPL, groupBits, toBin } from "@/lib/bity"
import { cn } from "@/lib/utils"

/* Geometria stylizowanej dłoni w jednostkach viewBox 272 × 280. */
const W = 272
const H = 280
const DLON_GORA = 150 // górna krawędź dłoni (podstawa palców)
const PALEC_SZER = 40
const ZGIETY = 40 // wysokość zgiętego palca (≥ 40 px celu dotykowego)

type Palec = {
  /** Numer bitu w obrębie dłoni (0 = kciuk). */
  bit: number
  nazwa: string
  x: number
  /** Wysokość podniesionego palca. */
  wys: number
}

/** Od lewej do prawej: mały, serdeczny, środkowy, wskazujący, kciuk. */
const PALCE: Palec[] = [
  { bit: 4, nazwa: "Mały palec", x: 0, wys: 84 },
  { bit: 3, nazwa: "Palec serdeczny", x: 50, wys: 112 },
  { bit: 2, nazwa: "Palec środkowy", x: 100, wys: 126 },
  { bit: 1, nazwa: "Palec wskazujący", x: 150, wys: 112 },
  { bit: 0, nazwa: "Kciuk", x: 206, wys: 92 },
]
const KCIUK_DOL = 208 // kciuk wyrasta z niższego „kłębu” po prawej stronie dłoni
const KLAB_PRAWA = 254

const px = (v: number) => `${(v / W) * 100}%`
const py = (v: number) => `${(v / H) * 100}%`

function Dlon({
  wartosc,
  przesuniecie,
  podpis,
  onPrzelacz,
}: {
  wartosc: number
  /** 0 dla pierwszej dłoni (wagi 1–16), 5 dla drugiej (32–512). */
  przesuniecie: number
  podpis?: string
  onPrzelacz: (bit: number) => void
}) {
  const prefiks = przesuniecie > 0 ? "Druga dłoń: " : ""

  return (
    <div className="flex w-full max-w-[17rem] flex-col items-center gap-2">
      <div
        role="group"
        aria-label={podpis ?? "Dłoń"}
        className="relative aspect-[272/280] w-full"
      >
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="absolute inset-0 size-full overflow-visible"
          aria-hidden
        >
          <path
            d={`M0 ${DLON_GORA} H196 V${KCIUK_DOL} H${KLAB_PRAWA} V${H} H0 Z`}
            className="fill-muted stroke-input"
            strokeWidth={1.5}
          />
          {PALCE.map((p) => {
            const wl = (wartosc >> (p.bit + przesuniecie)) & 1
            return (
              <text
                key={p.bit}
                x={p.x + PALEC_SZER / 2}
                y={H - 14}
                textAnchor="middle"
                className={cn(
                  "font-mono text-[20px] font-semibold",
                  wl ? "fill-signal-ink" : "fill-muted-foreground/70"
                )}
              >
                {wl}
              </text>
            )
          })}
        </svg>

        {PALCE.map((p) => {
          const bit = p.bit + przesuniecie
          const waga = 2 ** bit
          const gora = Boolean((wartosc >> bit) & 1)
          const kciuk = p.bit === 0
          return (
            <button
              key={p.bit}
              type="button"
              onClick={() => onPrzelacz(bit)}
              aria-pressed={gora}
              aria-label={`${prefiks}${p.nazwa}, waga ${formatPL(waga)}, ${gora ? "podniesiony" : "opuszczony"}`}
              className={cn(
                "group/palec absolute border transition-colors duration-200 select-none",
                kciuk && "origin-bottom rotate-[14deg]",
                gora
                  ? "border-signal"
                  : "border-dashed border-input hover:border-foreground/40 hover:bg-muted/50"
              )}
              style={{
                left: px(p.x),
                width: px(PALEC_SZER),
                bottom: py(H - (kciuk ? KCIUK_DOL : DLON_GORA)),
                height: py(p.wys),
              }}
            >
              <span
                className={cn(
                  "absolute inset-x-0 bottom-0 flex justify-center pt-1.5 font-mono text-[0.8125rem] font-semibold tabular-nums transition-[height,background-color,box-shadow,color] duration-200",
                  gora
                    ? "bg-signal text-signal-foreground shadow-[0_0_18px_-4px_var(--signal)]"
                    : "border-t border-input bg-background text-muted-foreground group-hover/palec:text-foreground"
                )}
                style={{ height: gora ? "100%" : `${(ZGIETY / p.wys) * 100}%` }}
              >
                {formatPL(waga)}
              </span>
            </button>
          )
        })}
      </div>
      {podpis ? (
        <p className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground">
          {podpis}
        </p>
      ) : null}
    </div>
  )
}

/** 21 → [16, 4, 1] */
function skladniki(v: number) {
  const out: number[] = []
  for (let b = 9; b >= 0; b--) if ((v >> b) & 1) out.push(2 ** b)
  return out
}

/**
 * Liczenie dwójkowe na palcach: kciuk = 1, wskazujący = 2, środkowy = 4,
 * serdeczny = 8, mały = 16. Jedna dłoń liczy do 31, dwie do 1023.
 *
 * @example <Palce />
 * @example <Palce dwieRece />
 */
export function Palce({
  dwieRece = false,
}: {
  /** Dwie dłonie: 10 bitów, maksimum 1023. */
  dwieRece?: boolean
}) {
  const bity = dwieRece ? 10 : 5
  const max = 2 ** bity - 1
  const [wartosc, setWartosc] = React.useState(0)
  const [cel, setCel] = React.useState<number | null>(null)

  const v = wartosc & max
  const zadania = dwieRece ? [10, 21, 31, 1023] : [10, 21, 31]
  const sklad = skladniki(v)
  const podniesione = sklad.length
  const srodkowy = v === 4 || (dwieRece && (v === 128 || v === 132))
  const sukces = cel !== null && v === cel

  const przelacz = (bit: number) => setWartosc((w) => (w & max) ^ (1 << bit))

  return (
    <Lab
      tytul={dwieRece ? "Palce: dwie dłonie" : "Palce: 31 na jednej dłoni"}
      opis={
        <>
          Kliknij palec, żeby go podnieść (1) albo opuścić (0). Każdy palec ma
          wagę – potęgę dwójki. Wartość to suma wag podniesionych palców.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setWartosc(0)
            setCel(null)
          }}
          aria-label="Opuść wszystkie palce"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          className={cn(
            "flex flex-col items-center gap-6",
            dwieRece && "sm:flex-row sm:items-start sm:justify-center sm:gap-4"
          )}
        >
          {dwieRece ? (
            <Dlon
              wartosc={v}
              przesuniecie={5}
              podpis="Druga dłoń · wagi 32–512"
              onPrzelacz={przelacz}
            />
          ) : null}
          <Dlon
            wartosc={v}
            przesuniecie={0}
            podpis={dwieRece ? "Pierwsza dłoń · wagi 1–16" : undefined}
            onPrzelacz={przelacz}
          />
        </div>

        <LabReadouts>
          <LabReadout label="Dziesiętnie" value={v} accent />
          <LabReadout
            label="Dwójkowo"
            value={
              <span className="text-base md:text-lg">
                {groupBits(toBin(v, bity), 5)}
              </span>
            }
          />
          <LabReadout
            label="Palce w górze"
            value={`${podniesione} z ${bity}`}
          />
          <LabReadout
            label="Zakres"
            value={`0–${formatPL(max)}`}
            hint={`2${dwieRece ? "¹⁰" : "⁵"} − 1`}
          />
        </LabReadouts>

        <p
          className="font-mono text-sm break-words text-muted-foreground tabular-nums"
          aria-live="polite"
        >
          {sklad.length === 0 ? (
            <>Wszystkie palce opuszczone = 0</>
          ) : (
            <>
              {sklad.length === 1
                ? "Jeden palec w górze"
                : sklad.map((x) => formatPL(x)).join(" + ")}{" "}
              ={" "}
              <span className="font-semibold text-signal-ink">
                {formatPL(v)}
              </span>
            </>
          )}
        </p>

        {srodkowy ? (
          <p className="flex items-start gap-2 border-l-2 border-amber bg-amber-soft px-3 py-2 text-sm/relaxed">
            <SmileyWinkIcon
              className="mt-0.5 size-5 shrink-0 text-amber-ink"
              aria-hidden
            />
            <span>
              {v === 132 ? "Oba środkowe palce naraz" : "Sam środkowy palec"},
              czyli {formatPL(v)}. Matematycznie wszystko się zgadza,
              towarzysko… lepiej uprzedzić salę, zanim się to pokaże.
            </span>
          </p>
        ) : null}

        <div className="flex flex-col gap-2 border border-dashed p-3">
          <LabLabel>Szybkie zadania</LabLabel>
          <div className="flex flex-wrap gap-2">
            {zadania.map((z) => (
              <Button
                key={z}
                variant={cel === z ? "default" : "outline"}
                aria-pressed={cel === z}
                onClick={() => {
                  setCel(z)
                  setWartosc(0)
                }}
              >
                <TargetIcon data-icon="inline-start" />
                Pokaż {formatPL(z)}
              </Button>
            ))}
          </div>
          <p className="min-h-6 text-sm" aria-live="polite">
            {cel === null ? (
              <span className="text-muted-foreground">
                Wybierz liczbę i ułóż ją na palcach.
              </span>
            ) : sukces ? (
              <span className="flex items-center gap-2 font-medium text-signal-ink">
                <CheckCircleIcon
                  weight="fill"
                  className="size-5 shrink-0"
                  aria-hidden
                />
                Udało się! {formatPL(cel)} ={" "}
                {skladniki(cel)
                  .map((x) => formatPL(x))
                  .join(" + ")}
                .
              </span>
            ) : (
              <span>
                Pokaż{" "}
                <span className="font-mono font-semibold">{formatPL(cel)}</span>
                .{" "}
                <span className="text-muted-foreground">
                  Zacznij od największej wagi, która się mieści.
                </span>
              </span>
            )}
          </p>
        </div>
      </div>
    </Lab>
  )
}
