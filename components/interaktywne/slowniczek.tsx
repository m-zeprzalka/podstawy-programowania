"use client"

import * as React from "react"
import { MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react"

import { Lab } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

type Haslo = [polski: string, angielski: string]

const PRZYKLADOWE: Haslo[] = [
  ["adres", "address"],
  ["bajt", "byte"],
  ["funkcja", "function"],
  ["kompilator", "compiler"],
  ["pętla", "loop"],
  ["zmienna", "variable"],
]

/** Małe litery bez znaków diakrytycznych: „Pętla” → „petla”, „ł” → „l”. */
function normalizuj(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ł/g, "l")
}

/** Podświetla dopasowanie (gdy normalizacja nie zmienia długości tekstu). */
function Podswietl({ tekst, szukane }: { tekst: string; szukane: string }) {
  if (!szukane) return <>{tekst}</>
  const n = normalizuj(tekst)
  const i = n.indexOf(szukane)
  if (i < 0 || n.length !== tekst.length) return <>{tekst}</>
  return (
    <>
      {tekst.slice(0, i)}
      <mark className="bg-signal-soft text-foreground underline decoration-signal decoration-2 underline-offset-2">
        {tekst.slice(i, i + szukane.length)}
      </mark>
      {tekst.slice(i + szukane.length)}
    </>
  )
}

function liczbaHasel(m: number) {
  return m === 1 ? "hasła" : "haseł"
}

/**
 * Słowniczek polsko-angielski z wyszukiwarką (bez wrażliwości na wielkość
 * liter i polskie znaki), posortowany alfabetycznie z literami-nagłówkami.
 *
 * @example <Slowniczek hasla={[["adres", "address"], ["pętla", "loop"]]} />
 */
export function Slowniczek({
  hasla = PRZYKLADOWE,
  tytul = "Słowniczek PL–EN",
}: {
  /** Pary [polski, angielski]. */
  hasla?: [polski: string, angielski: string][]
  tytul?: string
}) {
  const [zapytanie, setZapytanie] = React.useState("")
  const inputId = React.useId()
  const inputRef = React.useRef<HTMLInputElement>(null)

  const posortowane = React.useMemo(
    () => [...hasla].sort((a, b) => a[0].localeCompare(b[0], "pl")),
    [hasla]
  )

  const szukane = normalizuj(zapytanie.trim())
  const wyniki = szukane
    ? posortowane.filter(
        ([pl, en]) =>
          normalizuj(pl).includes(szukane) || normalizuj(en).includes(szukane)
      )
    : posortowane

  const grupy: { litera: string; hasla: Haslo[] }[] = []
  for (const h of wyniki) {
    const litera = h[0].charAt(0).toLocaleUpperCase("pl")
    const ostatnia = grupy[grupy.length - 1]
    if (ostatnia && ostatnia.litera === litera) ostatnia.hasla.push(h)
    else grupy.push({ litera, hasla: [h] })
  }

  const wyczysc = () => {
    setZapytanie("")
    inputRef.current?.focus()
  }

  return (
    <Lab
      tytul={tytul}
      opis="Wpisz fragment słowa po polsku albo po angielsku. Wielkość liter i polskie znaki nie mają znaczenia."
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor={inputId} className="sr-only">
            Szukaj w słowniczku
          </label>
          <InputGroup className="h-10 md:h-9">
            <InputGroupAddon>
              <MagnifyingGlassIcon aria-hidden />
            </InputGroupAddon>
            <InputGroupInput
              ref={inputRef}
              id={inputId}
              type="search"
              value={zapytanie}
              onChange={(e) => setZapytanie(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape" && zapytanie) {
                  e.preventDefault()
                  setZapytanie("")
                }
              }}
              placeholder="np. petla, loop, zmienna…"
              autoComplete="off"
              spellCheck={false}
              className="text-base md:text-sm [&::-webkit-search-cancel-button]:hidden"
            />
            {zapytanie ? (
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-sm"
                  onClick={wyczysc}
                  aria-label="Wyczyść wyszukiwanie"
                >
                  <XIcon />
                </InputGroupButton>
              </InputGroupAddon>
            ) : null}
          </InputGroup>
          <p
            aria-live="polite"
            className="font-mono text-xs text-muted-foreground tabular-nums"
          >
            {wyniki.length} z {posortowane.length}{" "}
            {liczbaHasel(posortowane.length)}
          </p>
        </div>

        {wyniki.length === 0 ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MagnifyingGlassIcon />
              </EmptyMedia>
              <EmptyTitle>Brak wyników</EmptyTitle>
              <EmptyDescription>
                Nie ma hasła pasującego do „{zapytanie.trim()}”. Spróbuj
                krótszego fragmentu albo wyszukaj po angielsku.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button variant="outline" onClick={wyczysc}>
                Pokaż wszystkie hasła
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex flex-col">
            <div
              className="hidden grid-cols-2 gap-4 border-b-2 border-foreground/80 px-3 pb-2 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase md:grid"
              aria-hidden
            >
              <span>polski</span>
              <span>angielski</span>
            </div>
            <div className="flex flex-col gap-3 md:gap-0">
              {grupy.map((g) => (
                <div
                  key={g.litera}
                  role="group"
                  aria-label={`Litera ${g.litera}`}
                  className="flex flex-col gap-1 md:gap-0"
                >
                  <div
                    className="flex items-center gap-2 md:border-b md:bg-muted/40 md:px-3 md:py-1"
                    aria-hidden
                  >
                    <span className="flex size-5 items-center justify-center bg-signal-soft font-mono text-xs font-semibold text-signal-ink md:size-auto md:bg-transparent">
                      {g.litera}
                    </span>
                    <span className="h-px flex-1 bg-border md:hidden" />
                  </div>
                  <dl className="flex flex-col gap-1 md:gap-0">
                    {g.hasla.map(([pl, en]) => (
                      <div
                        key={`${pl}|${en}`}
                        className={cn(
                          "flex flex-col gap-0.5 border bg-background px-3 py-2",
                          "md:grid md:grid-cols-2 md:gap-4 md:border-0 md:border-b md:bg-transparent md:py-2 md:hover:bg-muted/50"
                        )}
                      >
                        <dt className="font-semibold md:font-medium">
                          <Podswietl tekst={pl} szukane={szukane} />
                        </dt>
                        <dd className="font-mono text-sm text-muted-foreground md:text-foreground">
                          <span className="sr-only">po angielsku: </span>
                          <Podswietl tekst={en} szukane={szukane} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Lab>
  )
}
