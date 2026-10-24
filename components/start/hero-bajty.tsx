"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { asciiLabel, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

const START = [72, 73, 33] // „HI!”
const WAGI = [128, 64, 32, 16, 8, 4, 2, 1]

/**
 * Trzy bajty, trzy interpretacje: liczby, tekst ASCII i kolor RGB.
 * Bity „wpisują się” po kolei przy pierwszym wyświetleniu (animacja CSS).
 */
export function HeroBajty() {
  const [bytes, setBytes] = React.useState(START)

  const toggle = (row: number, bit: number) => {
    setBytes((prev) => prev.map((b, i) => (i === row ? b ^ (1 << bit) : b)))
  }

  const text = bytes.map((b) => asciiLabel(b) ?? "·")
  const color = `rgb(${bytes.join(", ")})`
  const changed = bytes.some((b, i) => b !== START[i])

  return (
    <div className="relative border bg-card shadow-[8px_8px_0_0_var(--border)]">
      <div className="flex h-10 items-center gap-2 border-b bg-muted/60 pr-1.5 pl-3">
        <span className="size-2 bg-signal shadow-[0_0_8px_var(--signal)]" aria-hidden />
        <span className="flex-1 font-mono text-xs text-muted-foreground">pamiec.bin</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setBytes(START)}
          aria-label="Przywróć HI!"
          className={cn("transition-opacity", changed ? "opacity-100" : "pointer-events-none opacity-0")}
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      </div>

      <div className="flex flex-col gap-2.5 p-4 sm:p-5">
        <div className="flex items-end gap-3 font-mono text-[0.625rem] text-muted-foreground tabular-nums sm:text-[0.6875rem]" aria-hidden>
          <span className="hidden w-12 sm:block">waga</span>
          <div className="grid flex-1 grid-cols-8 gap-1">
            {WAGI.map((w) => (
              <span key={w} className="text-center">
                {w}
              </span>
            ))}
          </div>
          <span className="w-9 text-right">dec</span>
        </div>
        {bytes.map((value, row) => (
          <div key={row} className="flex items-center gap-3">
            <span className="hidden w-12 font-mono text-[0.6875rem] text-muted-foreground tabular-nums sm:block">
              0x{toHex(row, 4)}
            </span>
            <div role="group" aria-label={`Bajt ${row + 1}`} className="grid flex-1 grid-cols-8 gap-1">
              {toBin(value, 8)
                .split("")
                .map((b, i) => {
                  const bit = 7 - i
                  const on = b === "1"
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => toggle(row, bit)}
                      aria-pressed={b === "1"}
                      aria-label={`Bajt ${row + 1}, bit o wadze ${2 ** bit}`}
                      className={cn(
                        "flex aspect-square animate-type-in items-center justify-center border font-mono text-sm font-medium transition-[background-color,color,box-shadow] duration-150 sm:text-base",
                        on
                          ? "border-signal bg-signal text-signal-foreground shadow-[0_0_14px_-2px_var(--signal)]"
                          : "border-dashed border-input text-muted-foreground hover:border-solid hover:border-foreground/40"
                      )}
                      style={{ animationDelay: `${(row * 8 + i) * 45}ms` }}
                    >
                      {b}
                    </button>
                  )
                })}
            </div>
            <span className="w-9 text-right font-mono text-sm text-muted-foreground tabular-nums">
              {value}
            </span>
          </div>
        ))}
      </div>

      <dl className="grid grid-cols-3 border-t" aria-live="polite">
        <div className="flex flex-col gap-1 border-r p-3 sm:p-4">
          <dt className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
            Liczby
          </dt>
          <dd className="font-mono text-sm font-medium tabular-nums sm:text-base">
            {bytes.join(" ")}
          </dd>
        </div>
        <div className="flex flex-col gap-1 border-r p-3 sm:p-4">
          <dt className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
            Tekst
          </dt>
          <dd className="truncate font-mono text-sm font-semibold sm:text-base">
            {text.map((t, i) => (
              <span key={i} className={cn(t.length > 1 && "text-xs font-normal text-muted-foreground")}>
                {t}
                {t.length > 1 && i < text.length - 1 ? " " : ""}
              </span>
            ))}
          </dd>
        </div>
        <div className="flex flex-col gap-1 p-3 sm:p-4">
          <dt className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
            Kolor
          </dt>
          <dd className="flex items-center gap-2">
            <span
              className="size-5 shrink-0 border border-foreground/20"
              style={{ backgroundColor: color }}
              aria-label={`Kolor ${color}`}
              role="img"
            />
            <span className="truncate font-mono text-xs text-muted-foreground">
              #{bytes.map((b) => toHex(b)).join("")}
            </span>
          </dd>
        </div>
      </dl>
    </div>
  )
}
