"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  ShuffleIcon,
  TimerIcon,
  XCircleIcon,
} from "@phosphor-icons/react"

import { Lab, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { asciiLabel, groupBits, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹"
const sup = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUPERSCRIPT[Number(d)])
    .join("")

/** Znacznik czasu i losowanie poza renderem (wołane tylko z handlerów i efektów). */
const teraz = () => performance.now()
const losowa = (max: number) => Math.floor(Math.random() * (max + 1))

type Challenge =
  | { state: "idle" }
  | { state: "running"; startedAt: number }
  | { state: "won"; ms: number }
  | { state: "lost" }

/**
 * Rząd klikalnych żarówek (bitów). Pokazuje wartość dziesiętną,
 * szesnastkową, dwójkową i (dla 8 bitów) znak ASCII.
 *
 * @example <Zarowki bity={8} wyzwanie={42} />
 */
export function Zarowki({
  bity = 8,
  wartosc = 0,
  wyzwanie,
  czas = 10,
  tytul = "Żarówki",
}: {
  /** Liczba bitów (1–16). */
  bity?: number
  /** Wartość początkowa. */
  wartosc?: number
  /** Liczba do ustawienia w trybie wyzwania. */
  wyzwanie?: number
  /** Limit czasu wyzwania w sekundach. */
  czas?: number
  tytul?: string
}) {
  const n = Math.min(16, Math.max(1, Math.round(bity)))
  const max = 2 ** n - 1
  const [value, setValue] = React.useState(() =>
    Math.min(max, Math.max(0, wartosc))
  )
  const [challenge, setChallenge] = React.useState<Challenge>({ state: "idle" })
  const [now, setNow] = React.useState(0)

  const limitMs = czas * 1000
  const running = challenge.state === "running"

  // Odliczanie czasu wyzwania.
  React.useEffect(() => {
    if (challenge.state !== "running") return
    const id = window.setInterval(() => {
      const t = teraz()
      setNow(t)
      if (t - challenge.startedAt >= limitMs) setChallenge({ state: "lost" })
    }, 50)
    return () => window.clearInterval(id)
  }, [challenge, limitMs])

  const update = (next: number) => {
    setValue(next)
    if (
      challenge.state === "running" &&
      wyzwanie !== undefined &&
      next === wyzwanie
    ) {
      setChallenge({
        state: "won",
        ms: teraz() - challenge.startedAt,
      })
    }
  }

  const toggleBit = (bit: number) => update(value ^ (1 << bit))

  const startChallenge = () => {
    setValue(0)
    const t = teraz()
    setNow(t)
    setChallenge({ state: "running", startedAt: t })
  }

  const remaining =
    challenge.state === "running"
      ? Math.max(0, limitMs - (now - challenge.startedAt))
      : 0

  const ascii = n === 8 ? asciiLabel(value) : null
  const bits = Array.from({ length: n }, (_, i) => n - 1 - i)

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Kliknij żarówkę, żeby ją włączyć (1) lub wyłączyć (0). Wartość to suma
          wag włączonych żarówek.
        </>
      }
      akcje={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => update(losowa(max))}
            aria-label="Losowa wartość"
            disabled={running}
          >
            <ShuffleIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setChallenge({ state: "idle" })
              setValue(0)
            }}
            aria-label="Wyzeruj"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          role="group"
          aria-label={`${n} bitów`}
          className={cn(
            "grid gap-1.5 sm:gap-2",
            n <= 8
              ? "grid-cols-[repeat(var(--n),minmax(0,1fr))]"
              : "grid-cols-8"
          )}
          style={{ "--n": n } as React.CSSProperties}
        >
          {bits.map((bit) => {
            const on = (value >> bit) & 1
            const weight = 2 ** bit
            return (
              <div key={bit} className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleBit(bit)}
                  aria-pressed={Boolean(on)}
                  aria-label={`Bit o wadze ${weight}: ${on ? "włączony" : "wyłączony"}`}
                  className={cn(
                    "group relative flex aspect-square w-full max-w-16 items-center justify-center border font-mono text-lg font-semibold transition-[background-color,box-shadow,color] duration-150 select-none md:text-xl",
                    on
                      ? "animate-bit-on border-signal bg-signal text-signal-foreground shadow-[0_0_18px_-2px_var(--signal)]"
                      : "border-dashed border-input bg-background text-muted-foreground hover:border-solid hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {on}
                </button>
                <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums sm:text-xs">
                  {weight}
                </span>
                <span
                  className="-mt-1 font-mono text-[0.625rem] text-muted-foreground/70"
                  aria-hidden
                >
                  2{sup(bit)}
                </span>
              </div>
            )
          })}
        </div>

        <LabReadouts>
          <LabReadout label="Dziesiętnie" value={value} accent />
          <LabReadout
            label="Szesnastkowo"
            value={`0x${toHex(value, Math.ceil(n / 4))}`}
          />
          <LabReadout
            label="Dwójkowo"
            value={
              <span className="text-base md:text-lg">
                {groupBits(toBin(value, n))}
              </span>
            }
          />
          {n === 8 ? (
            <LabReadout
              label="Znak ASCII"
              value={ascii ?? "—"}
              hint={ascii === null ? "poza ASCII (128–255)" : undefined}
            />
          ) : (
            <LabReadout
              label="Zakres"
              value={`0–${max}`}
              hint={`${max + 1} wartości`}
            />
          )}
        </LabReadouts>

        {wyzwanie !== undefined ? (
          <div className="flex flex-col gap-3 border border-dashed p-3 sm:flex-row sm:items-center">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-sm">
                {challenge.state === "won" ? (
                  <span className="flex items-center gap-2 font-medium text-signal-ink">
                    <CheckCircleIcon weight="fill" className="size-5" />
                    Brawo! {wyzwanie} w {(challenge.ms / 1000).toFixed(1)} s.
                  </span>
                ) : challenge.state === "lost" ? (
                  <span className="flex items-center gap-2 font-medium text-destructive">
                    <XCircleIcon weight="fill" className="size-5" />
                    Czas minął. Podpowiedź: {wyzwanie} = {decompose(wyzwanie)}.
                  </span>
                ) : (
                  <>
                    <span className="font-medium">Wyzwanie:</span> ustaw{" "}
                    <span className="font-mono font-semibold">{wyzwanie}</span>{" "}
                    w {czas} sekund.
                  </>
                )}
              </p>
              {running ? (
                <Progress
                  value={(remaining / limitMs) * 100}
                  aria-label="Pozostały czas"
                />
              ) : null}
            </div>
            <Button
              onClick={startChallenge}
              variant={running ? "outline" : "default"}
              disabled={running}
            >
              <TimerIcon data-icon="inline-start" />
              {running
                ? `${(remaining / 1000).toFixed(1)} s`
                : challenge.state === "idle"
                  ? "Start"
                  : "Jeszcze raz"}
            </Button>
          </div>
        ) : null}
      </div>
    </Lab>
  )
}

/** 42 → "32 + 8 + 2" */
function decompose(value: number) {
  const parts: number[] = []
  for (let bit = 15; bit >= 0; bit--) {
    if ((value >> bit) & 1) parts.push(2 ** bit)
  }
  return parts.join(" + ") || "0"
}
