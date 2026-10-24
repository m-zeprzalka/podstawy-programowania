"use client"

import * as React from "react"

import { useStoredJSON, useStoredValue, writeStored } from "@/hooks/use-stored-state"
import { PROGRESS_KEY, TEACHER_KEY } from "@/lib/preferences"

/** Ukończone moduły (lista adresów URL). */
export function useProgress() {
  const [done, setDone] = useStoredJSON<string[]>(PROGRESS_KEY, [])
  const doneSet = React.useMemo(() => new Set(done), [done])

  const toggle = React.useCallback(
    (url: string, value?: boolean) => {
      setDone((prev) => {
        const has = prev.includes(url)
        const next = value ?? !has
        if (next && !has) return [...prev, url]
        if (!next && has) return prev.filter((u) => u !== url)
        return prev
      })
    },
    [setDone]
  )

  return { done: doneSet, toggle }
}

/** Tryb prowadzącego: pokazuje bloki `<DlaProwadzacego>` i wskazówki do zajęć. */
export function useTeacherMode() {
  const raw = useStoredValue(TEACHER_KEY)
  const enabled = raw === "1"

  const setEnabled = React.useCallback((value: boolean) => {
    writeStored(TEACHER_KEY, value ? "1" : "0")
    document.documentElement.dataset.prowadzacy = value ? "1" : "0"
  }, [])

  return [enabled, setEnabled] as const
}
