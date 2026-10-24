"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import { odmiana } from "@/components/interaktywne/liczby-dane"
import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { formatPL } from "@/lib/bity"
import { cn } from "@/lib/utils"

type Kodowanie = {
  encode: (tekst: string) => number[]
  decode: (tokeny: number[]) => string
}

/** Kafelek: jeden token albo kilka, gdy znak UTF-8 rozpada się na tokeny. */
type Kafelek = { tekst: string; id: number[] }

const TLA = [
  "bg-signal-soft border-chart-1",
  "bg-amber-soft border-chart-2",
  "bg-chart-3/12 border-chart-3",
  "bg-chart-4/12 border-chart-4",
  "bg-chart-5/15 border-chart-5",
]

const PRZYKLADY = [
  { nazwa: "Pies", pl: "Spotkałem ogromnego psa.", en: "I met a huge dog." },
  {
    nazwa: "Programowanie",
    pl: "Programowanie to sztuka rozwiązywania problemów krok po kroku.",
    en: "Programming is the art of solving problems step by step.",
  },
  {
    nazwa: "Pan Tadeusz",
    pl: "Litwo! Ojczyzno moja! ty jesteś jak zdrowie.",
    en: "Lithuania! My homeland! You are like health.",
  },
]

const SLOWO = new RegExp("[\\p{L}\\p{N}]+(?:[-'’][\\p{L}\\p{N}]+)*", "gu")

function policzSlowa(tekst: string) {
  return tekst.match(SLOWO)?.length ?? 0
}

/** Dzieli tekst na tokeny i skleja te, które osobno nie są poprawnym UTF-8. */
function podziel(
  kod: Kodowanie,
  tekst: string
): { kafelki: Kafelek[]; tokeny: number } {
  let ids: number[]
  try {
    ids = kod.encode(tekst)
  } catch {
    return { kafelki: [], tokeny: 0 }
  }
  const kafelki: Kafelek[] = []
  let i = 0
  while (i < ids.length) {
    let grupa = [ids[i]]
    let napis = kod.decode(grupa)
    let j = i + 1
    while (napis.includes("�") && j < ids.length && grupa.length < 4) {
      const dluzsza = [...grupa, ids[j]]
      const dluzszyNapis = kod.decode(dluzsza)
      grupa = dluzsza
      napis = dluzszyNapis
      j++
      if (!dluzszyNapis.includes("�")) break
    }
    if (napis.includes("�") && grupa.length > 1) {
      // Nie udało się skleić: pokaż pojedynczy token.
      grupa = [ids[i]]
      napis = kod.decode(grupa)
      j = i + 1
    }
    kafelki.push({ tekst: napis, id: grupa })
    i = j
  }
  return { kafelki, tokeny: ids.length }
}

/** Widoczne białe znaki: spacja → „·”, nowa linia → „↵”, tabulator → „⇥”. */
function pokazBiale(tekst: string) {
  return tekst.replace(/ /g, "·").replace(/\n/g, "↵").replace(/\t/g, "⇥")
}

/**
 * Tokenizer o200k_base (GPT-4o) z porównaniem tego samego zdania po polsku
 * i po angielsku: kafelki tokenów, liczba tokenów i tokeny na słowo.
 * Słownik ładuje się leniwie po zamontowaniu komponentu.
 *
 * @example <Tokenizer pl="Spotkałem ogromnego psa." en="I met a huge dog." />
 */
export function Tokenizer({
  pl = "Spotkałem ogromnego psa.",
  en = "I met a huge dog.",
}: {
  /** Tekst po polsku. */
  pl?: string
  /** Ten sam tekst po angielsku. */
  en?: string
}) {
  const [tekstPL, setTekstPL] = React.useState(pl)
  const [tekstEN, setTekstEN] = React.useState(en)
  const [numery, setNumery] = React.useState(false)
  const [kod, setKod] = React.useState<Kodowanie | null>(null)
  const [blad, setBlad] = React.useState(false)
  const idPL = React.useId()
  const idEN = React.useId()
  const idNumery = React.useId()

  React.useEffect(() => {
    let aktywny = true
    import("gpt-tokenizer/encoding/o200k_base")
      .then((m) => {
        if (!aktywny) return
        setKod({
          encode: (t) => m.encode(t, { disallowedSpecial: new Set() }),
          decode: (ids) => m.decode(ids),
        })
      })
      .catch(() => {
        if (aktywny) setBlad(true)
      })
    return () => {
      aktywny = false
    }
  }, [])

  const wynikPL = React.useMemo(
    () => (kod ? podziel(kod, tekstPL) : null),
    [kod, tekstPL]
  )
  const wynikEN = React.useMemo(
    () => (kod ? podziel(kod, tekstEN) : null),
    [kod, tekstEN]
  )

  const slowaPL = policzSlowa(tekstPL)
  const slowaEN = policzSlowa(tekstEN)

  return (
    <Lab
      tytul="Tokenizer"
      opis={
        <>
          Model językowy nie widzi liter, tylko tokeny: kawałki tekstu z
          numerami w słowniku. Wpisz to samo zdanie po polsku i po angielsku.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setTekstPL(pl)
            setTekstEN(en)
          }}
          aria-label="Przywróć przykładowe zdania"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>Tokenizer o200k_base (GPT-4o). Inne modele dzielą tekst inaczej.</>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Przykłady"
          >
            {PRZYKLADY.map((p) => (
              <Button
                key={p.nazwa}
                variant="outline"
                size="sm"
                aria-pressed={tekstPL === p.pl && tekstEN === p.en}
                onClick={() => {
                  setTekstPL(p.pl)
                  setTekstEN(p.en)
                }}
                className="h-10 aria-pressed:border-foreground/40 aria-pressed:bg-muted md:h-8"
              >
                {p.nazwa}
              </Button>
            ))}
          </div>
          <label
            htmlFor={idNumery}
            className="flex min-h-10 cursor-pointer items-center gap-2 text-sm"
          >
            <Switch
              id={idNumery}
              checked={numery}
              onCheckedChange={(v) => setNumery(Boolean(v))}
            />
            Pokaż numery
          </label>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Kolumna
            id={idPL}
            jezyk="Polski"
            lang="pl"
            tekst={tekstPL}
            setTekst={setTekstPL}
            wynik={wynikPL}
            slowa={slowaPL}
            numery={numery}
            blad={blad}
          />
          <Kolumna
            id={idEN}
            jezyk="Angielski"
            lang="en"
            tekst={tekstEN}
            setTekst={setTekstEN}
            wynik={wynikEN}
            slowa={slowaEN}
            numery={numery}
            blad={blad}
          />
        </div>

        <Porownanie
          pl={wynikPL?.tokeny ?? null}
          en={wynikEN?.tokeny ?? null}
          slowaPL={slowaPL}
          slowaEN={slowaEN}
        />
      </div>
    </Lab>
  )
}

function Kolumna({
  id,
  jezyk,
  lang,
  tekst,
  setTekst,
  wynik,
  slowa,
  numery,
  blad,
}: {
  id: string
  jezyk: string
  lang: string
  tekst: string
  setTekst: (t: string) => void
  wynik: { kafelki: Kafelek[]; tokeny: number } | null
  slowa: number
  numery: boolean
  blad: boolean
}) {
  const naSlowo = wynik && slowa > 0 ? wynik.tokeny / slowa : null
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Field>
        <FieldLabel
          htmlFor={id}
          className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase"
        >
          {jezyk}
        </FieldLabel>
        <Textarea
          id={id}
          lang={lang}
          value={tekst}
          maxLength={1000}
          rows={2}
          spellCheck={false}
          onChange={(e) => setTekst(e.target.value)}
          className="min-h-20 text-base md:text-sm"
        />
      </Field>

      <div
        aria-label={`Tokeny: ${jezyk.toLowerCase()}`}
        role="group"
        className="flex min-h-12 flex-wrap content-start gap-1 border bg-muted/30 p-2"
      >
        {blad ? (
          <p className="text-sm text-destructive">
            Nie udało się wczytać tokenizera. Odśwież stronę.
          </p>
        ) : !wynik ? (
          <>
            <span className="sr-only">Wczytywanie tokenizera…</span>
            {[56, 32, 48, 72, 40, 24].map((w, i) => (
              <Skeleton key={i} className="h-7" style={{ width: w }} />
            ))}
          </>
        ) : wynik.kafelki.length === 0 ? (
          <p className="text-sm text-muted-foreground">Wpisz tekst.</p>
        ) : (
          wynik.kafelki.map((k, i) => (
            <span
              key={i}
              title={
                k.id.length > 1
                  ? `tokeny ${k.id.join(", ")} (jeden znak w ${k.id.length} tokenach)`
                  : `token ${k.id[0]}`
              }
              className={cn(
                "inline-flex flex-col items-start border-b-2 px-1 py-0.5 font-mono text-sm leading-tight",
                TLA[i % TLA.length]
              )}
            >
              <span className="whitespace-pre">
                {pokazBiale(k.tekst)
                  .split("")
                  .map((c, j) =>
                    c === "·" || c === "↵" || c === "⇥" ? (
                      <span key={j} className="text-muted-foreground">
                        {c}
                      </span>
                    ) : (
                      c
                    )
                  )}
                {k.id.length > 1 ? (
                  <sub className="ml-0.5 text-[0.625rem] text-muted-foreground">
                    ×{k.id.length}
                  </sub>
                ) : null}
              </span>
              {numery ? (
                <span className="text-[0.625rem] text-muted-foreground tabular-nums">
                  {k.id.join("+")}
                </span>
              ) : null}
            </span>
          ))
        )}
      </div>

      <LabReadouts className="grid-cols-3 sm:grid-cols-3" aria-live="polite">
        <LabReadout
          label="Tokeny"
          value={wynik ? formatPL(wynik.tokeny) : "…"}
          accent
        />
        <LabReadout label="Słowa" value={formatPL(slowa)} />
        <LabReadout
          label="Tok./słowo"
          value={
            naSlowo === null
              ? "—"
              : formatPL(naSlowo, { maximumFractionDigits: 2 })
          }
        />
      </LabReadouts>
    </div>
  )
}

function Porownanie({
  pl,
  en,
  slowaPL,
  slowaEN,
}: {
  pl: number | null
  en: number | null
  slowaPL: number
  slowaEN: number
}) {
  const gotowe = pl !== null && en !== null
  const max = gotowe ? Math.max(pl, en, 1) : 1
  const stosunek = gotowe && en > 0 ? pl / en : null
  const fmt = (n: number) => formatPL(n, { maximumFractionDigits: 2 })

  return (
    <div
      className="flex flex-col gap-3 border border-dashed p-3"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <LabLabel>Polski / angielski</LabLabel>
        <span className="font-mono text-2xl font-medium text-signal-ink tabular-nums">
          {stosunek === null ? "—" : `${fmt(stosunek)}×`}
        </span>
      </div>
      {gotowe ? (
        <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 font-mono text-xs">
          {[
            { label: "PL", n: pl, klasa: "bg-chart-1" },
            { label: "EN", n: en, klasa: "bg-chart-3" },
          ].map((r) => (
            <React.Fragment key={r.label}>
              <span className="text-muted-foreground">{r.label}</span>
              <span className="h-3 bg-muted" aria-hidden>
                <span
                  className={cn(
                    "block h-full transition-[width] duration-300",
                    r.klasa
                  )}
                  style={{ width: `${(r.n / max) * 100}%` }}
                />
              </span>
              <span className="text-right tabular-nums">
                {formatPL(r.n)} {odmiana(r.n, ["token", "tokeny", "tokenów"])}
              </span>
            </React.Fragment>
          ))}
        </div>
      ) : (
        <Skeleton className="h-8 w-full" />
      )}
      <p className="text-sm/relaxed text-muted-foreground">
        {stosunek === null
          ? "Liczę tokeny…"
          : stosunek > 1
            ? `Polska wersja zajmuje ${fmt(stosunek)} razy więcej tokenów.`
            : stosunek < 1
              ? `Tym razem polska wersja ma mniej tokenów niż angielska.`
              : "Obie wersje mają tyle samo tokenów."}{" "}
        {gotowe && slowaPL > 0 && slowaEN > 0
          ? `Na jedno słowo: ${fmt(pl / slowaPL)} (PL) i ${fmt(en / slowaEN)} (EN). Więcej tokenów to wyższy koszt, dłuższy czas i mniej miejsca w kontekście.`
          : null}
      </p>
    </div>
  )
}
