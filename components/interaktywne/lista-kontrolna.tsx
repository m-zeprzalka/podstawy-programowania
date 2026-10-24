"use client"

import * as React from "react"
import { CheckCircleIcon, EraserIcon } from "@phosphor-icons/react"

import { Lab } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { useStoredJSON } from "@/hooks/use-stored-state"
import { cn } from "@/lib/utils"

const PRZYKLAD = [
  "Przeczytaj treść zadania do końca.",
  "Zapisz plan w **pseudokodzie**.",
  "Zbuduj i przetestuj projekt od zielonej flagi.",
]

/** Prosty tekst z `**pogrubieniem**` i `` `kodem` ``. */
function Tekst({ tekst }: { tekst: string }) {
  const czesci = tekst.split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
  return (
    <>
      {czesci.map((c, i) =>
        c.startsWith("**") && c.endsWith("**") && c.length > 4 ? (
          <strong key={i} className="font-semibold">
            {c.slice(2, -2)}
          </strong>
        ) : c.startsWith("`") && c.endsWith("`") && c.length > 2 ? (
          <code
            key={i}
            className="border bg-muted px-1 py-px font-mono text-[0.85em]"
          >
            {c.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={i}>{c}</React.Fragment>
        )
      )}
    </>
  )
}

/**
 * Lista kontrolna z checkboxami. Stan zapisuje się w przeglądarce
 * (localStorage, klucz `kurs:lista:<id>`), więc przetrwa odświeżenie strony.
 * Punkty mogą zawierać `**pogrubienie**` i `` `kod` ``.
 *
 * @example <ListaKontrolna id="pset0" punkty={["Dwa duszki", "Trzy skrypty"]} />
 */
export function ListaKontrolna({
  id = "przyklad",
  punkty = PRZYKLAD,
  tytul = "Lista kontrolna",
}: {
  /** Unikalny identyfikator listy (klucz w localStorage). */
  id?: string
  /** Treść punktów. */
  punkty?: string[]
  tytul?: string
}) {
  const [zapisane, setZapisane] = useStoredJSON<number[]>(
    `kurs:lista:${id}`,
    []
  )
  const baseId = React.useId()

  const n = punkty.length
  const zaznaczone = new Set(
    Array.isArray(zapisane)
      ? zapisane.filter((i) => Number.isInteger(i) && i >= 0 && i < n)
      : []
  )
  const k = zaznaczone.size
  const gotowe = n > 0 && k === n

  const ustaw = (i: number, wartosc: boolean) =>
    setZapisane((prev) => {
      const zbior = new Set(Array.isArray(prev) ? prev : [])
      if (wartosc) zbior.add(i)
      else zbior.delete(i)
      return [...zbior].filter((x) => x < n).sort((a, b) => a - b)
    })

  return (
    <Lab
      tytul={tytul}
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setZapisane([])}
          disabled={k === 0}
          aria-label="Wyczyść"
          title="Wyczyść"
        >
          <EraserIcon />
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between gap-3">
            <span
              id={`${baseId}-postep`}
              className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase"
            >
              Postęp
            </span>
            <span className="font-mono text-sm font-semibold tabular-nums">
              {k} / {n}
            </span>
          </div>
          <Progress
            value={n ? (k / n) * 100 : 0}
            aria-labelledby={`${baseId}-postep`}
            getAriaValueText={() => `${k} z ${n}`}
            className="[&_[data-slot=progress-indicator]]:bg-signal [&_[data-slot=progress-track]]:h-1.5"
          />
        </div>

        <ul className="flex flex-col border">
          {punkty.map((p, i) => {
            const on = zaznaczone.has(i)
            return (
              <li key={i} className="border-b last:border-b-0">
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 px-3 py-2.5 transition-colors duration-150 hover:bg-muted/60",
                    on && "bg-signal-soft hover:bg-signal-soft"
                  )}
                >
                  <Checkbox
                    checked={on}
                    onCheckedChange={(v) => ustaw(i, v)}
                    className="mt-0.5 size-5 data-checked:border-signal data-checked:bg-signal data-checked:text-signal-foreground dark:data-checked:bg-signal"
                  />
                  <span className="flex min-w-0 flex-1 gap-2 text-sm/relaxed">
                    <span
                      className="font-mono text-xs/[1.625rem] text-muted-foreground tabular-nums"
                      aria-hidden
                    >
                      {i + 1}.
                    </span>
                    <span
                      className={cn(
                        "min-w-0 flex-1",
                        on && "text-muted-foreground"
                      )}
                    >
                      <Tekst tekst={p} />
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>

        <div aria-live="polite">
          {gotowe ? (
            <p className="flex items-center gap-2 border border-signal/50 bg-signal-soft px-3 py-2.5 text-sm font-medium text-signal-ink">
              <CheckCircleIcon
                weight="fill"
                className="size-5 shrink-0"
                aria-hidden
              />
              Gotowe! Wszystkie punkty ({n}/{n}) są odhaczone.
            </p>
          ) : null}
        </div>
      </div>
    </Lab>
  )
}
