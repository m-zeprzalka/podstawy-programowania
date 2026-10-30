"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

/** Język etykiet bloków Scratcha. Na zajęciach domyślnie angielski. */
export type JezykScratcha = "en" | "pl"

const KLUCZ = "kurs:scratch-jezyk"
const DOMYSLNY: JezykScratcha = "en"

/* Wspólny wybór dla wszystkich bloków na stronie, zapamiętany w przeglądarce. */
let wybrany: JezykScratcha | null = null
const sluchacze = new Set<() => void>()

function odczytaj(): JezykScratcha {
  if (wybrany) return wybrany
  try {
    return localStorage.getItem(KLUCZ) === "pl" ? "pl" : DOMYSLNY
  } catch {
    return DOMYSLNY
  }
}

function ustaw(jezyk: JezykScratcha) {
  wybrany = jezyk
  try {
    localStorage.setItem(KLUCZ, jezyk)
  } catch {
    // Brak dostępu do pamięci przeglądarki: wybór działa do odświeżenia strony.
  }
  sluchacze.forEach((s) => s())
}

function subskrybuj(sluchacz: () => void) {
  sluchacze.add(sluchacz)
  const zInnejKarty = (e: StorageEvent) => {
    if (e.key !== KLUCZ) return
    wybrany = null
    sluchacz()
  }
  window.addEventListener("storage", zInnejKarty)
  return () => {
    sluchacze.delete(sluchacz)
    window.removeEventListener("storage", zInnejKarty)
  }
}

/** Wybrany język bloków; zmiana w jednym miejscu przełącza wszystkie bloki. */
export function useJezykScratcha() {
  const jezyk = React.useSyncExternalStore(subskrybuj, odczytaj, () => DOMYSLNY)
  return [jezyk, ustaw] as const
}

/** Przełącznik EN / PL do paska laboratorium. */
export function PrzelacznikJezyka() {
  const [jezyk, setJezyk] = useJezykScratcha()
  return (
    <ToggleGroup
      aria-label="Język bloków Scratcha"
      variant="outline"
      size="sm"
      spacing={0}
      value={[jezyk]}
      onValueChange={(v) => {
        if (v[0] === "en" || v[0] === "pl") setJezyk(v[0])
      }}
    >
      <ToggleGroupItem value="en" aria-label="Bloki po angielsku">
        EN
      </ToggleGroupItem>
      <ToggleGroupItem value="pl" aria-label="Bloki po polsku">
        PL
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
