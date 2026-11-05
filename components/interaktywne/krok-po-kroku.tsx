"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CaretLeftIcon,
  CaretRightIcon,
  PauseIcon,
  PlayIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

import {
  PROGRAMY_KROKOWE,
  type ProgramKrokowyId,
  type Zmienna,
} from "./krok-po-kroku-dane"

/** Odstęp między krokami w trybie „Odtwórz”. */
const TEMPO_MS = 1400

const klucz = (z: Zmienna) => `${z.gdzie}:${z.nazwa}`

/**
 * Wykonuje krótki program w C krok po kroku: podświetla działający fragment
 * kodu, pokazuje zmienne (z funkcją lub pętlą, w której żyją) i ekran.
 *
 * @example <KrokPoKroku program="for" />
 */
export function KrokPoKroku({
  program,
  tytul,
}: {
  /** "while", "for", "siatka", "miau" albo "kwadrat". */
  program: ProgramKrokowyId
  tytul?: string
}) {
  const p = PROGRAMY_KROKOWE[program] ?? PROGRAMY_KROKOWE.for
  const ostatni = p.kroki.length - 1

  // -1 to stan przed pierwszym krokiem.
  const [nr, setNr] = React.useState(-1)
  const [graj, setGraj] = React.useState(false)
  const odtwarza = graj && nr < ostatni

  React.useEffect(() => {
    if (!odtwarza) return
    const id = window.setTimeout(
      () => setNr((n) => Math.min(n + 1, ostatni)),
      nr < 0 ? 400 : TEMPO_MS
    )
    return () => window.clearTimeout(id)
  }, [odtwarza, nr, ostatni])

  const krok = nr >= 0 ? p.kroki[nr] : null
  const poprzedni = nr > 0 ? p.kroki[nr - 1] : null
  const zmienne = krok?.zmienne ?? []
  const wyjscie = krok?.wyjscie ?? ""

  const zmienione = new Set(
    zmienne
      .filter((z) => {
        const stara = poprzedni?.zmienne.find((s) => klucz(s) === klucz(z))
        return !stara || stara.wartosc !== z.wartosc
      })
      .map(klucz)
  )

  const idz = (n: number) => {
    setGraj(false)
    setNr(Math.max(-1, Math.min(n, ostatni)))
  }

  const przelaczOdtwarzanie = () => {
    if (odtwarza) {
      setGraj(false)
      return
    }
    if (nr >= ostatni) setNr(-1)
    setGraj(true)
  }

  return (
    <Lab
      tytul={tytul ?? p.tytul}
      opis={p.opis}
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => idz(-1)}
          aria-label="Od nowa"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka="Narzędzie, które wykonuje program w ten sposób, to debugger. Ma go np. OnlineGDB."
    >
      <div className="flex flex-col gap-5">
        {/* Sterowanie i opis kroku */}
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button
              variant="outline"
              onClick={() => idz(nr - 1)}
              disabled={nr < 0}
            >
              <CaretLeftIcon data-icon="inline-start" />
              Wstecz
            </Button>
            <Button onClick={() => idz(nr + 1)} disabled={nr >= ostatni}>
              Dalej
              <CaretRightIcon data-icon="inline-end" />
            </Button>
            <Button
              variant="outline"
              onClick={przelaczOdtwarzanie}
              aria-pressed={odtwarza}
            >
              {odtwarza ? (
                <PauseIcon data-icon="inline-start" weight="fill" />
              ) : (
                <PlayIcon data-icon="inline-start" weight="fill" />
              )}
              {odtwarza ? "Pauza" : "Odtwórz"}
            </Button>
            <Button variant="ghost" onClick={() => idz(-1)}>
              <ArrowCounterClockwiseIcon data-icon="inline-start" />
              Od nowa
            </Button>
          </div>
          <div className="flex flex-col gap-1">
            <p className="font-mono text-xs text-muted-foreground tabular-nums">
              {krok ? `krok ${nr + 1} z ${ostatni + 1}` : "przed startem"}
            </p>
            <p
              aria-live="polite"
              className="min-h-12 border-l-2 border-signal pl-3 text-sm/relaxed"
            >
              {krok
                ? krok.opis
                : "Kliknij „Dalej”, żeby wykonać pierwszy krok, albo „Odtwórz”, żeby program szedł sam."}
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          {/* Kod */}
          <div className="flex min-w-0 flex-col gap-2">
            <LabLabel>Kod</LabLabel>
            <ol
              aria-label="Kod programu"
              className="overflow-x-auto border bg-muted/30 py-2 font-mono text-[0.8125rem]/6"
            >
              {p.kod.map((tekst, i) => {
                const biezaca = krok?.linia === i
                return (
                  <li
                    key={i}
                    aria-current={biezaca ? "step" : undefined}
                    className={cn(
                      "flex min-w-max border-l-2 border-transparent pr-4",
                      biezaca && "border-signal bg-signal-soft"
                    )}
                  >
                    <span
                      className="w-9 shrink-0 pr-3 text-right text-muted-foreground tabular-nums select-none"
                      aria-hidden
                    >
                      {i + 1}
                    </span>
                    <code className="whitespace-pre">
                      {biezaca && krok ? (
                        <>
                          {tekst.slice(0, krok.od)}
                          <mark className="-mx-0.5 bg-signal px-0.5 text-signal-foreground">
                            {tekst.slice(krok.od, krok.do)}
                          </mark>
                          {tekst.slice(krok.do)}
                        </>
                      ) : (
                        tekst || " "
                      )}
                    </code>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="flex min-w-0 flex-col gap-5">
            {/* Zmienne */}
            <div className="flex flex-col gap-2">
              <LabLabel>Zmienne</LabLabel>
              {zmienne.length ? (
                <div className="border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>nazwa</TableHead>
                        <TableHead>wartość</TableHead>
                        <TableHead>gdzie żyje</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {zmienne.map((z) => {
                        const nowa = zmienione.has(klucz(z))
                        return (
                          <TableRow key={klucz(z)}>
                            <TableCell className="font-mono">
                              {z.nazwa}
                            </TableCell>
                            <TableCell
                              className={cn(
                                "font-mono tabular-nums",
                                nowa && "font-semibold text-signal-ink"
                              )}
                            >
                              {z.wartosc}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {z.gdzie}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="border px-3 py-2 text-sm text-muted-foreground">
                  Na razie nie ma żadnych zmiennych.
                </p>
              )}
            </div>

            {/* Ekran */}
            <div className="flex flex-col gap-2">
              <LabLabel>Ekran</LabLabel>
              <div
                role="log"
                aria-label="Wyjście programu"
                className="min-h-20 border bg-muted/50 px-3 py-2 font-mono text-sm whitespace-pre text-signal-ink"
              >
                {wyjscie || (
                  <span className="text-xs text-muted-foreground">
                    Program jeszcze nic nie wypisał.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Lab>
  )
}
