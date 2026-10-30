"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  CheckIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

import { PrzelacznikJezyka, useJezykScratcha } from "./scratch-jezyk"
import { ScratchBloki } from "./scratch-skrypt"

type Id = "funkcja" | "wartosc" | "warunek" | "petla" | "zdarzenie" | "wyrazenie"

const KLOCKI: { id: Id; kod: string; kodEn: string }[] = [
  { id: "funkcja", kod: "powiedz [Cześć!]", kodEn: "say [Cześć!]" },
  { id: "wartosc", kod: "odpowiedź", kodEn: "answer" },
  { id: "warunek", kod: "jeżeli <…> to", kodEn: "if <…> then" },
  { id: "petla", kod: "powtórz (3) razy", kodEn: "repeat (3)" },
  {
    id: "zdarzenie",
    kod: "kiedy kliknięto zieloną flagę",
    kodEn: "when green flag clicked",
  },
  {
    id: "wyrazenie",
    kod: "dotyka [wskaźnik myszy]?",
    kodEn: "touching [mouse-pointer]?",
  },
]

const NAZWY: Record<Id, string> = {
  funkcja: "funkcja",
  wartosc: "wartość zwracana",
  warunek: "warunek",
  petla: "pętla",
  zdarzenie: "zdarzenie",
  wyrazenie: "wyrażenie logiczne",
}

/** Kolejność z serwera (i do pierwszej hydratacji) — już nie po kolei. */
const DOMYSLNA: Id[] = ["wyrazenie", "petla", "funkcja", "zdarzenie", "wartosc", "warunek"]

/* Losowe ziarno tylko po stronie klienta: serwer i hydratacja widzą 0. */
let ziarnoKlienta = 0
const subskrybuj = () => () => {}
const ziarno = () => {
  if (!ziarnoKlienta) ziarnoKlienta = 1 + Math.floor(Math.random() * 1_000_000_000)
  return ziarnoKlienta
}
const ziarnoSerwera = () => 0

function tasuj(seed: number): Id[] {
  for (let proba = 0; ; proba++) {
    // mulberry32
    let a = (seed + proba * 7919) >>> 0
    const los = () => {
      a = (a + 0x6d2b79f5) >>> 0
      let t = a
      t = Math.imul(t ^ (t >>> 15), t | 1)
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const out = KLOCKI.map((k) => k.id)
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(los() * (i + 1))
      ;[out[i], out[j]] = [out[j], out[i]]
    }
    // Najwyżej jedno pojęcie naprzeciw „swojego” klocka.
    const naMiejscu = out.filter((id, i) => KLOCKI[i].id === id).length
    if (naMiejscu <= 1 || proba > 20) return out
  }
}

function potrzasnij(el: HTMLElement | undefined) {
  if (!el || typeof el.animate !== "function") return
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
  el.animate(
    [
      { transform: "translateX(0)" },
      { transform: "translateX(-5px)" },
      { transform: "translateX(5px)" },
      { transform: "translateX(-3px)" },
      { transform: "translateX(0)" },
    ],
    { duration: 320, easing: "ease-out" }
  )
}

/**
 * Quiz „dotknij klocek, potem pojęcie”: 6 klocków Scratcha i 6 pojęć
 * (funkcja, wartość zwracana, warunek, pętla, zdarzenie, wyrażenie logiczne).
 * Działa dotykiem, myszą i klawiaturą (Tab + Enter/Spacja).
 *
 * @example <DopasujPojecia />
 */
export function DopasujPojecia() {
  const uid = React.useId()
  const [jezyk] = useJezykScratcha()
  const baza = React.useSyncExternalStore(subskrybuj, ziarno, ziarnoSerwera)
  const [runda, setRunda] = React.useState(0)
  const kolejnosc = React.useMemo(
    () => (baza === 0 && runda === 0 ? DOMYSLNA : tasuj(baza + runda * 104729)),
    [baza, runda]
  )

  const [dopasowane, setDopasowane] = React.useState<Id[]>([])
  const [klocek, setKlocek] = React.useState<Id | null>(null)
  const [pojecie, setPojecie] = React.useState<Id | null>(null)
  const [bledy, setBledy] = React.useState(0)
  const [blad, setBlad] = React.useState<{ k: Id; p: Id } | null>(null)
  const [komunikat, setKomunikat] = React.useState(
    "Wybierz klocek, a potem pasujące do niego pojęcie."
  )
  const elementy = React.useRef(new Map<string, HTMLElement>())
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const rejestruj = (klucz: string) => (el: HTMLElement | null) => {
    if (el) elementy.current.set(klucz, el)
    else elementy.current.delete(klucz)
  }

  const nr = (id: Id) => KLOCKI.findIndex((k) => k.id === id) + 1
  const gotowe = dopasowane.length === KLOCKI.length

  const sprawdz = (k: Id, p: Id) => {
    if (k === p) {
      const nowe = [...dopasowane, k]
      setDopasowane(nowe)
      setKlocek(null)
      setPojecie(null)
      setBlad(null)
      setKomunikat(
        nowe.length === KLOCKI.length
          ? `Udało się! Wszystkie pary dopasowane. Pomyłki: ${bledy}.`
          : `Dobrze: klocek ${nr(k)} to ${NAZWY[p]}.`
      )
      return
    }
    setBledy((b) => b + 1)
    setKlocek(k)
    setPojecie(null)
    setBlad({ k, p })
    setKomunikat(`To nie ta para: klocek ${nr(k)} to nie ${NAZWY[p]}. Spróbuj jeszcze raz.`)
    potrzasnij(elementy.current.get(`k-${k}`))
    potrzasnij(elementy.current.get(`p-${p}`))
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setBlad(null), 900)
  }

  const wybierzKlocek = (id: Id) => {
    if (pojecie) return sprawdz(id, pojecie)
    setKlocek((k) => (k === id ? null : id))
  }
  const wybierzPojecie = (id: Id) => {
    if (klocek) return sprawdz(klocek, id)
    setPojecie((p) => (p === id ? null : id))
  }

  const odNowa = () => {
    setRunda((r) => r + 1)
    setDopasowane([])
    setKlocek(null)
    setPojecie(null)
    setBledy(0)
    setBlad(null)
    setKomunikat("Wybierz klocek, a potem pasujące do niego pojęcie.")
  }

  return (
    <Lab
      tytul="Dopasuj pojęcia"
      opis="Dotknij klocek, a potem pojęcie, które do niego pasuje (albo odwrotnie). Działa też klawiaturą: Tab i Enter."
      akcje={
        <>
          <PrzelacznikJezyka />
          <Button variant="ghost" size="icon-sm" onClick={odNowa} aria-label="Od nowa">
            <ArrowCounterClockwiseIcon />
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="flex min-w-0 flex-col gap-2">
            <LabLabel id={`${uid}-klocki`}>Klocki</LabLabel>
            <ul aria-labelledby={`${uid}-klocki`} className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
              {KLOCKI.map((k, i) => {
                const ok = dopasowane.includes(k.id)
                const wybrany = klocek === k.id
                const zly = blad?.k === k.id
                return (
                  <li key={k.id} className="min-w-0">
                    <button
                      ref={rejestruj(`k-${k.id}`)}
                      type="button"
                      disabled={ok}
                      aria-pressed={wybrany}
                      aria-label={`Klocek ${i + 1}: ${jezyk === "en" ? k.kodEn : k.kod}${ok ? ` — ${NAZWY[k.id]}` : ""}`}
                      onClick={() => wybierzKlocek(k.id)}
                      className={cn(
                        "flex min-h-16 w-full items-center gap-3 border bg-card py-2 pr-3 pl-2 text-left transition-[background-color,border-color,box-shadow] duration-150",
                        ok
                          ? "border-signal/60 bg-signal-soft"
                          : wybrany
                            ? "border-signal bg-signal-soft shadow-[0_0_0_2px_var(--signal)]"
                            : zly
                              ? "border-destructive bg-destructive/10"
                              : "hover:border-foreground/30 hover:bg-muted/50"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "flex size-7 shrink-0 items-center justify-center border font-mono text-xs font-semibold tabular-nums",
                          ok || wybrany
                            ? "border-signal bg-signal text-signal-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {ok ? <CheckIcon weight="bold" className="size-4" /> : i + 1}
                      </span>
                      <span aria-hidden className="min-w-0 flex-1 overflow-hidden">
                        <ScratchBloki
                          kod={jezyk === "en" ? k.kodEn : k.kod}
                          jezyk={jezyk}
                          className="min-w-0 gap-0"
                        />
                      </span>
                      {ok ? (
                        <span className="shrink-0 font-mono text-[0.6875rem] font-medium text-signal-ink">
                          {NAZWY[k.id]}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <LabLabel id={`${uid}-pojecia`}>Pojęcia</LabLabel>
            <ul aria-labelledby={`${uid}-pojecia`} className="grid grid-cols-2 gap-2 md:grid-cols-1">
              {kolejnosc.map((id) => {
                const ok = dopasowane.includes(id)
                const wybrane = pojecie === id
                const zly = blad?.p === id
                return (
                  <li key={id}>
                    <button
                      ref={rejestruj(`p-${id}`)}
                      type="button"
                      disabled={ok}
                      aria-pressed={wybrane}
                      aria-label={ok ? `${NAZWY[id]} — klocek ${nr(id)}` : NAZWY[id]}
                      onClick={() => wybierzPojecie(id)}
                      className={cn(
                        "flex h-full min-h-11 w-full items-center justify-between gap-2 border px-3 py-2 text-left text-sm font-medium transition-[background-color,border-color,box-shadow] duration-150",
                        ok
                          ? "border-signal/60 bg-signal-soft text-signal-ink"
                          : wybrane
                            ? "border-signal bg-signal-soft shadow-[0_0_0_2px_var(--signal)]"
                            : zly
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : klocek
                                ? "border-dashed border-foreground/40 bg-background hover:border-solid hover:bg-muted"
                                : "bg-background hover:bg-muted"
                      )}
                    >
                      {NAZWY[id]}
                      {ok ? (
                        <span className="flex shrink-0 items-center gap-1 font-mono text-xs tabular-nums">
                          <CheckIcon aria-hidden weight="bold" className="size-3.5" />
                          {nr(id)}
                        </span>
                      ) : null}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 flex-col gap-2">
            <p
              aria-live="polite"
              className={cn(
                "flex items-start gap-2 text-sm",
                gotowe && "font-medium text-signal-ink",
                blad && "text-destructive"
              )}
            >
              {gotowe ? (
                <CheckCircleIcon aria-hidden weight="fill" className="mt-0.5 size-4 shrink-0" />
              ) : null}
              {komunikat}
            </p>
            <div className="flex items-center gap-3">
              <Progress
                value={(dopasowane.length / KLOCKI.length) * 100}
                aria-label="Dopasowane pary"
                className="flex-1"
              />
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {dopasowane.length}/{KLOCKI.length} · pomyłki: {bledy}
              </span>
            </div>
          </div>
          {gotowe ? (
            <Button onClick={odNowa} className="h-10">
              <ArrowCounterClockwiseIcon data-icon="inline-start" />
              Od nowa
            </Button>
          ) : null}
        </div>
      </div>
    </Lab>
  )
}
