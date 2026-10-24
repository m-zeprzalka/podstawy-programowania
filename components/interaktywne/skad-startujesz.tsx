"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckIcon,
  PencilSimpleIcon,
} from "@phosphor-icons/react"

import { Lab } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { useStoredJSON } from "@/hooks/use-stored-state"
import { cn } from "@/lib/utils"

import { POZIOMY_STARTU, type PoziomStartu } from "./wstep-dane"

type Odpowiedz = { wybor: PoziomStartu; data: string }

const KLUCZ = "kurs:ankieta-start"

const dataPL = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

/** Odrzuca uszkodzone lub stare dane z localStorage. */
function poprawna(o: unknown): Odpowiedz | null {
  if (!o || typeof o !== "object") return null
  const { wybor, data } = o as Partial<Odpowiedz>
  if (!POZIOMY_STARTU.some((p) => p.id === wybor)) return null
  if (typeof data !== "string" || Number.isNaN(Date.parse(data))) return null
  return { wybor: wybor as PoziomStartu, data }
}

/**
 * Ankieta startowa „Skąd startujesz?”: samoocena doświadczenia
 * z komentarzem dopasowanym do odpowiedzi.
 * Odpowiedź zostaje tylko w localStorage tej przeglądarki.
 *
 * @example <SkadStartujesz />
 */
export function SkadStartujesz() {
  const [zapisana, zapisz] = useStoredJSON<Odpowiedz | null>(KLUCZ, null)
  const odpowiedz = poprawna(zapisana)
  const [zmieniam, setZmieniam] = React.useState(false)

  const pokazOpcje = odpowiedz === null || zmieniam
  const wybrany = POZIOMY_STARTU.find((p) => p.id === odpowiedz?.wybor)

  const wybierz = (wybor: PoziomStartu) => {
    zapisz({ wybor, data: new Date().toISOString() })
    setZmieniam(false)
  }

  return (
    <Lab
      tytul="Skąd startujesz?"
      opis="Szczerze, (bez oceniania przez prowadzącego): nie ma złej odpowiedzi."
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            zapisz(null)
            setZmieniam(false)
          }}
          disabled={odpowiedz === null}
          aria-label="Usuń odpowiedź"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka="Twoja odpowiedź zostaje tylko w tej przeglądarce."
    >
      <div className="flex flex-col gap-5">
        {pokazOpcje ? (
          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-base font-medium text-balance">
              Jak oceniasz swoje odczucia w stosunku do programowania?
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {POZIOMY_STARTU.map((p) => {
                const aktywny = odpowiedz?.wybor === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => wybierz(p.id)}
                    aria-pressed={aktywny}
                    className={cn(
                      "group flex min-h-12 flex-col items-start gap-1 border p-3 text-left transition-colors",
                      aktywny
                        ? "border-signal bg-signal-soft"
                        : "border-input bg-background hover:border-foreground/40 hover:bg-muted/60"
                    )}
                  >
                    <span className="flex w-full items-center justify-between gap-2 font-medium">
                      {p.etykieta}
                      {aktywny ? (
                        <CheckIcon
                          weight="bold"
                          className="size-4 shrink-0 text-signal-ink"
                          aria-hidden
                        />
                      ) : null}
                    </span>
                    <span className="font-mono text-[0.6875rem] tracking-wide text-muted-foreground">
                      {p.en}
                    </span>
                    <span className="text-sm/snug text-muted-foreground">
                      {p.opis}
                    </span>
                  </button>
                )
              })}
            </div>
            {zmieniam ? (
              <Button
                variant="ghost"
                size="sm"
                className="self-start"
                onClick={() => setZmieniam(false)}
              >
                Anuluj zmianę
              </Button>
            ) : null}
          </fieldset>
        ) : null}

        <p className="sr-only" aria-live="polite">
          {wybrany
            ? `Zapisano odpowiedź: ${wybrany.etykieta}.`
            : ""}
        </p>

        {odpowiedz && wybrany && !zmieniam ? (
          <div className="flex flex-col gap-3 border-l-2 border-signal bg-signal-soft py-2.5 pr-2 pl-3 sm:flex-row sm:items-center">
            <p className="flex-1 text-sm">
              <span className="text-muted-foreground">Twoja odpowiedź: </span>
              <span className="font-semibold">{wybrany.etykieta}</span>
              <span className="block font-mono text-xs text-muted-foreground">
                zapisana {dataPL.format(new Date(odpowiedz.data))}
              </span>
            </p>
            <Button
              variant="outline"
              size="sm"
              className="self-start sm:self-auto"
              onClick={() => setZmieniam(true)}
            >
              <PencilSimpleIcon data-icon="inline-start" />
              Zmień odpowiedź
            </Button>
          </div>
        ) : null}

        {odpowiedz && wybrany ? (
          <div className="flex flex-col gap-2 text-sm/relaxed">
            <p>{wybrany.komentarz}</p>
            <p className="text-muted-foreground">
              Nie porównuj się z innymi. Liczy się postęp względem siebie z
              pierwszego dnia – wróć do tej ankiety na koniec semestru.
            </p>
          </div>
        ) : null}
      </div>
    </Lab>
  )
}
