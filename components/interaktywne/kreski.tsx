"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { formatPL, toBin } from "@/lib/bity"
import { cn } from "@/lib/utils"

import { odmiana } from "./wstep-dane"

const MAKS = 9999
const MAKS_KRESEK = 200
const SKALE = [10, 20, 50, 100, 200, 500, 1000, 2000, 5000, 10000]

const ogranicz = (n: number) => Math.min(MAKS, Math.max(0, Math.round(n)))

/** Liczba cyfr dwójkowych potrzebna do zapisu n (dla 0 – jedna cyfra). */
const bityDla = (n: number) => (n === 0 ? 1 : Math.floor(Math.log2(n)) + 1)

/** Grupa do pięciu kresek: cztery pionowe i piąta na ukos. */
function Grupa({ ile }: { ile: number }) {
  return (
    <svg
      viewBox="0 0 30 34"
      className="h-10 w-9 shrink-0 overflow-visible"
      aria-hidden
    >
      {[5, 11, 17, 23].slice(0, Math.min(ile, 4)).map((x) => (
        <line
          key={x}
          x1={x}
          y1={3}
          x2={x}
          y2={31}
          className="stroke-foreground"
          strokeWidth={2.5}
          strokeLinecap="square"
        />
      ))}
      {ile >= 5 ? (
        <line
          x1={1}
          y1={25}
          x2={28}
          y2={9}
          className="stroke-signal"
          strokeWidth={2.75}
          strokeLinecap="square"
        />
      ) : null}
    </svg>
  )
}

/**
 * System jedynkowy (kreski) i porównanie długości zapisu
 * jedynkowego, dwójkowego i dziesiętnego tej samej liczby.
 *
 * @example <Kreski wartosc={7} />
 */
export function Kreski({
  wartosc = 7,
}: {
  /** Wartość początkowa (0–9999). */
  wartosc?: number
}) {
  const [n, setN] = React.useState(() => ogranicz(wartosc))

  const zmien = (o: number) => setN((v) => ogranicz(v + o))

  const pokazane = Math.min(n, MAKS_KRESEK)
  const pelne = Math.floor(pokazane / 5)
  const reszta = pokazane % 5
  const ukryte = n - pokazane

  const bin = toBin(n, bityDla(n))
  const dec = String(n)
  const skala = SKALE.find((s) => s >= n) ?? MAKS + 1

  const wiersze = [
    {
      id: "jedynkowo",
      etykieta: "Jedynkowo",
      zapis:
        n === 0
          ? "(pusto)"
          : `${formatPL(n)} ${odmiana(n, "kreska", "kreski", "kresek")}`,
      dlugosc: n,
      jednostka: odmiana(n, "symbol", "symbole", "symboli"),
      pasek: "bg-signal",
    },
    {
      id: "dwojkowo",
      etykieta: "Dwójkowo",
      zapis: bin,
      dlugosc: bin.length,
      jednostka: odmiana(bin.length, "symbol", "symbole", "symboli"),
      pasek: "bg-chart-3",
    },
    {
      id: "dziesietnie",
      etykieta: "Dziesiętnie",
      zapis: dec,
      dlugosc: dec.length,
      jednostka: odmiana(dec.length, "cyfra", "cyfry", "cyfr"),
      pasek: "bg-amber",
    },
  ]

  return (
    <Lab
      tytul="Kreski: system jedynkowy"
      opis="Jedna kreska to jedna rzecz – jak liczenie po jednym palcu na osobę. Dodawaj kreski i patrz, jak rośnie długość zapisu."
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setN(0)}
          aria-label="Wyzeruj"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={`Zakres 0–${formatPL(MAKS)}. Rysujemy do ${MAKS_KRESEK} kresek, resztę tylko liczymy.`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="lg"
            className="h-11 min-w-12 font-mono tabular-nums"
            onClick={() => zmien(-1)}
            disabled={n === 0}
            aria-label="Odejmij jedną kreskę"
          >
            −1
          </Button>
          <div
            className="flex h-11 min-w-20 flex-1 items-center justify-center border bg-background px-3 font-mono text-2xl font-semibold tabular-nums sm:flex-none"
            aria-live="polite"
            aria-atomic
          >
            <span className="sr-only">Liczba: </span>
            {formatPL(n)}
          </div>
          <Button
            variant="outline"
            size="lg"
            className="h-11 min-w-12 font-mono tabular-nums"
            onClick={() => zmien(1)}
            disabled={n >= MAKS}
            aria-label="Dodaj jedną kreskę"
          >
            +1
          </Button>
          <Button
            size="lg"
            className="h-11 min-w-14 font-mono tabular-nums"
            onClick={() => zmien(10)}
            disabled={n >= MAKS}
            aria-label="Dodaj dziesięć kresek"
          >
            +10
          </Button>
        </div>

        <div
          role="img"
          aria-label={`${formatPL(n)} ${odmiana(n, "kreska", "kreski", "kresek")} w grupach po pięć`}
          className="flex min-h-24 flex-wrap content-start items-center gap-x-3 gap-y-2 border bg-background bg-grid p-3"
        >
          {n === 0 ? (
            <span className="font-mono text-xs text-muted-foreground">
              Zero kresek – w systemie jedynkowym zero to pusty zapis.
            </span>
          ) : null}
          {Array.from({ length: pelne }, (_, i) => (
            <Grupa key={i} ile={5} />
          ))}
          {reszta > 0 ? <Grupa ile={reszta} /> : null}
          {ukryte > 0 ? (
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              … i jeszcze {formatPL(ukryte)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <LabLabel>Długość zapisu</LabLabel>
            <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
              skala: 0–{formatPL(skala)} symboli
            </span>
          </div>
          <ul className="flex flex-col gap-3">
            {wiersze.map((w) => (
              <li key={w.id} className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <span className="w-24 shrink-0 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
                    {w.etykieta}
                  </span>
                  <span className="min-w-0 font-mono font-medium break-all tabular-nums">
                    {w.zapis}
                  </span>
                  <span className="ml-auto font-mono text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                    {formatPL(w.dlugosc)} {w.jednostka}
                  </span>
                </div>
                <div className="h-2.5 bg-muted" aria-hidden>
                  <div
                    className={cn(
                      "h-full transition-[width] duration-200",
                      w.pasek
                    )}
                    style={{
                      width: `${(w.dlugosc / skala) * 100}%`,
                      minWidth: w.dlugosc > 0 ? 2 : 0,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm/relaxed text-muted-foreground">
            Zapis jedynkowy rośnie liniowo: dwa razy większa liczba to dwa razy
            więcej kresek. W dwójkowym przybywa jeden symbol dopiero wtedy, gdy
            liczba się podwoi.
          </p>
        </div>
      </div>
    </Lab>
  )
}
