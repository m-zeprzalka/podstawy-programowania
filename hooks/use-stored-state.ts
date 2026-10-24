"use client"

import * as React from "react"

const EVENT = "kurs:storage"

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback)
  window.addEventListener(EVENT, callback)
  return () => {
    window.removeEventListener("storage", callback)
    window.removeEventListener(EVENT, callback)
  }
}

export function writeStored(key: string, value: string | null) {
  try {
    if (value === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, value)
  } catch {
    // Prywatne okno lub zablokowany storage: stan żyje tylko do przeładowania.
  }
  window.dispatchEvent(new Event(EVENT))
}

/**
 * Wartość z localStorage zsynchronizowana między komponentami i kartami.
 * Na serwerze i przy pierwszym renderze zwraca `null`.
 */
export function useStoredValue(key: string): string | null {
  return React.useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  )
}

/** Stan JSON w localStorage z wartością domyślną. */
export function useStoredJSON<T>(key: string, fallback: T) {
  const raw = useStoredValue(key)
  const value = React.useMemo<T>(() => {
    if (raw === null) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
    // fallback celowo pominięty: ma być stały dla danego klucza
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [raw])
  const set = React.useCallback(
    (next: T | ((prev: T) => T)) => {
      const prevRaw = read(key)
      let prev = fallback
      if (prevRaw !== null) {
        try {
          prev = JSON.parse(prevRaw) as T
        } catch {}
      }
      const resolved =
        typeof next === "function" ? (next as (p: T) => T)(prev) : next
      writeStored(key, JSON.stringify(resolved))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  )
  return [value, set] as const
}
