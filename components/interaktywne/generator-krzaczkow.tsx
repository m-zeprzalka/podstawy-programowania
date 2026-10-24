"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  ArrowsLeftRightIcon,
  CheckCircleIcon,
  WarningIcon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

import {
  KODOWANIA,
  nazwaKodowania,
  odczytaj,
  segmentuj,
  zakoduj,
  type KodowanieId,
  type OdczytanyZnak,
} from "./kodowania-dane"

const DOMYSLNY_TEKST = "Zażółć gęślą jaźń"
const MAKS_DLUGOSC = 60

const PRESETY: readonly {
  zapis: KodowanieId
  odczyt: KodowanieId
  tytul: string
  przyklad: string
}[] = [
  {
    zapis: "utf-8",
    odczyt: "windows-1250",
    tytul: "UTF-8 czytany jako Windows-1250",
    przyklad: "ą → Ä…, ó → Ăł",
  },
  {
    zapis: "iso-8859-2",
    odczyt: "windows-1250",
    tytul: "ISO-8859-2 jako Windows-1250",
    przyklad: "ą → ±, ś → ¶, ź → Ľ",
  },
  {
    zapis: "windows-1250",
    odczyt: "iso-8859-2",
    tytul: "Windows-1250 jako ISO-8859-2",
    przyklad: "ą → š",
  },
]

const ELEMENTY = KODOWANIA.map((k) => ({ value: k.value, label: k.label }))

const opisKodowania = (id: KodowanieId) =>
  KODOWANIA.find((k) => k.value === id)?.opis

/**
 * Generator krzaczków: tekst zapisany w jednym kodowaniu i odczytany
 * w innym. Pokazuje bajty każdego znaku i wynik odczytu (mojibake).
 *
 * @example <GeneratorKrzaczkow zapisano="utf-8" odczytano="windows-1250" />
 */
export function GeneratorKrzaczkow({
  tekst: tekstStartowy = DOMYSLNY_TEKST,
  zapisano = "utf-8",
  odczytano = "windows-1250",
  tytul = "Generator krzaczków",
}: {
  /** Tekst początkowy. */
  tekst?: string
  /** Kodowanie zapisu: "utf-8" | "windows-1250" | "iso-8859-2" | "cp852" | "mazovia". */
  zapisano?: KodowanieId
  /** Kodowanie odczytu (te same wartości). */
  odczytano?: KodowanieId
  tytul?: string
}) {
  const idTekstu = React.useId()
  const idZapisu = React.useId()
  const idOdczytu = React.useId()
  const [tekst, setTekst] = React.useState(tekstStartowy)
  const [zapis, setZapis] = React.useState<KodowanieId>(zapisano)
  const [odczyt, setOdczyt] = React.useState<KodowanieId>(odczytano)
  const [aktywny, setAktywny] = React.useState<number | null>(null)
  const przyciski = React.useRef<(HTMLButtonElement | null)[]>([])

  const zapisane = React.useMemo(() => zakoduj(tekst, zapis), [tekst, zapis])
  const bajty = React.useMemo(
    () => zapisane.flatMap((z) => z.bajty),
    [zapisane]
  )
  const odczytane = React.useMemo(
    () => odczytaj(bajty, odczyt),
    [bajty, odczyt]
  )
  const segmenty = React.useMemo(
    () => segmentuj(zapisane, odczytane),
    [zapisane, odczytane]
  )

  const niezgodne = segmenty
    .filter((s) => !s.zgodne)
    .reduce((n, s) => n + s.zapis.length, 0)
  const brakujace = Array.from(
    new Set(zapisane.filter((z) => z.brak).map((z) => z.znak))
  )
  const ukryte = odczytane.some((o) => o.rodzaj === "sterujacy")
  const bledne = odczytane.some(
    (o) => o.rodzaj === "nieznany" || o.rodzaj === "bledny"
  )

  const zakres =
    aktywny !== null && zapisane[aktywny]
      ? {
          start: zapisane[aktywny].start,
          koniec: zapisane[aktywny].start + zapisane[aktywny].bajty.length,
        }
      : null
  const wZakresie = (start: number, koniec: number) =>
    zakres !== null && start < zakres.koniec && koniec > zakres.start

  const ustawPreset = (p: (typeof PRESETY)[number]) => {
    setZapis(p.zapis)
    setOdczyt(p.odczyt)
    if (!tekst.trim()) setTekst(DOMYSLNY_TEKST)
  }

  const reset = () => {
    setTekst(tekstStartowy)
    setZapis(zapisano)
    setOdczyt(odczytano)
    setAktywny(null)
  }

  const zamien = () => {
    setZapis(odczyt)
    setOdczyt(zapis)
  }

  const naKlawisz = (e: React.KeyboardEvent, i: number) => {
    let cel = i
    if (e.key === "ArrowRight") cel = i + 1
    else if (e.key === "ArrowLeft") cel = i - 1
    else if (e.key === "Home") cel = 0
    else if (e.key === "End") cel = zapisane.length - 1
    else if (e.key === "Escape") {
      setAktywny(null)
      return
    } else return
    e.preventDefault()
    cel = Math.max(0, Math.min(zapisane.length - 1, cel))
    przyciski.current[cel]?.focus()
    setAktywny(cel)
  }

  const fokusowalny = aktywny ?? 0
  const opisAktywnego =
    aktywny !== null && zapisane[aktywny] && zakres
      ? (() => {
          const z = zapisane[aktywny]
          const wynik = odczytane
            .filter((o) => wZakresie(o.start, o.koniec))
            .map((o) => opisZnaku(o))
            .join("")
          return `„${z.znak === " " ? "spacja" : z.znak}” → ${z.bajty
            .map((b) => toHex(b))
            .join(
              " "
            )}${z.brak ? " (zamiast znaku: „?”)" : ""} → odczyt: „${wynik}”`
        })()
      : null

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Zapisz tekst w jednym kodowaniu, a odczytaj w innym. Bajty się nie
          zmieniają, zmienia się tylko umowa, jak je czytać.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={reset}
          aria-label="Przywróć przykład"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={<>Plik się nie zepsuł: zmieniła się tylko umowa odczytu.</>}
    >
      <div className="flex flex-col gap-5">
        <Field>
          <FieldLabel htmlFor={idTekstu}>Tekst</FieldLabel>
          <Input
            id={idTekstu}
            value={tekst}
            maxLength={MAKS_DLUGOSC}
            onChange={(e) => {
              setTekst(e.target.value)
              setAktywny(null)
            }}
            autoComplete="off"
            spellCheck={false}
            className="h-10 text-base md:text-sm"
          />
        </Field>

        <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          <WyborKodowania
            id={idZapisu}
            etykieta="Zapisano jako"
            wartosc={zapis}
            onZmiana={setZapis}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={zamien}
            aria-label="Zamień kodowania miejscami"
            className="justify-self-center sm:mt-6"
          >
            <ArrowsLeftRightIcon className="rotate-90 sm:rotate-0" />
          </Button>
          <WyborKodowania
            id={idOdczytu}
            etykieta="Odczytano jako"
            wartosc={odczyt}
            onZmiana={setOdczyt}
          />
        </div>

        <div className="flex flex-col gap-2">
          <LabLabel>Klasyczne krzaczki</LabLabel>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PRESETY.map((p) => {
              const wlaczony = p.zapis === zapis && p.odczyt === odczyt
              return (
                <button
                  key={p.tytul}
                  type="button"
                  onClick={() => ustawPreset(p)}
                  aria-pressed={wlaczony}
                  className={cn(
                    "flex min-h-11 flex-col items-start gap-0.5 border px-3 py-2 text-left transition-colors",
                    wlaczony
                      ? "border-primary bg-primary text-primary-foreground"
                      : "bg-background hover:bg-muted"
                  )}
                >
                  <span className="text-sm font-medium">{p.tytul}</span>
                  <span
                    className={cn(
                      "font-mono text-xs",
                      wlaczony
                        ? "text-primary-foreground/80"
                        : "text-muted-foreground"
                    )}
                  >
                    {p.przyklad}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div
          className={cn(
            "flex flex-col gap-2 border p-3",
            tekst.length === 0
              ? "bg-muted/40"
              : niezgodne === 0
                ? "border-signal/50 bg-signal-soft"
                : "border-amber/60 bg-amber-soft"
          )}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <LabLabel>Odczyt jako {nazwaKodowania(odczyt)}</LabLabel>
            {tekst.length > 0 ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 font-mono text-xs font-medium",
                  niezgodne === 0 ? "text-signal-ink" : "text-amber-ink"
                )}
              >
                {niezgodne === 0 ? (
                  <CheckCircleIcon weight="fill" className="size-4" />
                ) : (
                  <WarningIcon weight="fill" className="size-4" />
                )}
                {niezgodne === 0
                  ? "Zgodne"
                  : `Krzaczki: ${niezgodne} z ${zapisane.length} zn.`}
              </span>
            ) : null}
          </div>
          <p
            className="min-h-9 font-mono text-xl font-medium break-all md:text-2xl"
            aria-live="polite"
          >
            {tekst.length === 0 ? (
              <span className="text-base text-muted-foreground">
                Wpisz jakiś tekst.
              </span>
            ) : (
              odczytane.map((o, i) => <ZnakOdczytu key={i} o={o} />)
            )}
          </p>
        </div>

        {brakujace.length > 0 ? (
          <p className="border-l-2 border-destructive bg-destructive/10 px-3 py-2 text-sm">
            {brakujace.map((z) => `„${z}”`).join(", ")}{" "}
            {brakujace.length === 1 ? "nie istnieje" : "nie istnieją"} w{" "}
            {nazwaKodowania(zapis)}, więc zapisano zamiast{" "}
            {brakujace.length === 1 ? "niego" : "nich"} „?” (bajt 3F).
          </p>
        ) : null}

        {zapisane.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <LabLabel>
                Bajty w {nazwaKodowania(zapis)}: {bajty.length}
              </LabLabel>
              <span className="text-xs text-muted-foreground">
                znak → bajty (hex) → odczyt
              </span>
            </div>
            <div
              role="group"
              aria-label="Znaki tekstu i ich bajty"
              className="flex flex-wrap gap-1"
              onPointerLeave={(e) => {
                if (e.pointerType === "mouse") setAktywny(null)
              }}
            >
              {segmenty.map((s) => {
                const kolumny = s.koniec - s.start
                return (
                  <div
                    key={s.start}
                    className="grid border bg-background"
                    style={{
                      gridTemplateColumns: `repeat(${kolumny}, minmax(1.75rem, auto))`,
                    }}
                  >
                    {s.zapis.map((k) => {
                      const z = zapisane[k]
                      const wl = k === aktywny
                      return (
                        <button
                          key={`z${k}`}
                          ref={(el) => {
                            przyciski.current[k] = el
                          }}
                          type="button"
                          tabIndex={k === fokusowalny ? 0 : -1}
                          aria-pressed={wl}
                          aria-label={`Znak ${z.znak === " " ? "spacja" : z.znak}`}
                          onClick={() => setAktywny(k)}
                          onFocus={() => setAktywny(k)}
                          onKeyDown={(e) => naKlawisz(e, k)}
                          onPointerEnter={(e) => {
                            if (e.pointerType === "mouse") setAktywny(k)
                          }}
                          className={cn(
                            "flex h-10 items-center justify-center border-b px-1 text-lg transition-colors",
                            wl
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted",
                            z.brak && !wl && "text-destructive"
                          )}
                          style={{ gridColumn: `span ${z.bajty.length}` }}
                        >
                          {z.znak === " " ? (
                            <span className={wl ? "" : "text-muted-foreground"}>
                              ␣
                            </span>
                          ) : (
                            z.znak
                          )}
                        </button>
                      )
                    })}
                    {Array.from({ length: kolumny }, (_, i) => {
                      const nr = s.start + i
                      const zrodlo = zapisane.find(
                        (z) => nr >= z.start && nr < z.start + z.bajty.length
                      )
                      return (
                        <span
                          key={`b${nr}`}
                          className={cn(
                            "flex h-6 items-center justify-center border-b px-1 font-mono text-[0.6875rem] tabular-nums transition-colors",
                            wZakresie(nr, nr + 1)
                              ? "bg-primary/85 text-primary-foreground"
                              : zrodlo?.brak
                                ? "bg-destructive/10 text-destructive"
                                : "text-muted-foreground"
                          )}
                        >
                          {toHex(bajty[nr])}
                        </span>
                      )
                    })}
                    {s.odczyt.map((k) => {
                      const o = odczytane[k]
                      const wl = wZakresie(o.start, o.koniec)
                      return (
                        <span
                          key={`o${k}`}
                          className={cn(
                            "flex h-10 items-center justify-center px-1 text-lg transition-shadow",
                            o.rodzaj === "nieznany" || o.rodzaj === "bledny"
                              ? "bg-destructive/10 text-destructive"
                              : s.zgodne
                                ? "bg-signal-soft text-signal-ink"
                                : "bg-amber-soft text-amber-ink",
                            wl && "ring-2 ring-primary ring-inset"
                          )}
                          style={{ gridColumn: `span ${o.koniec - o.start}` }}
                        >
                          <ZnakOdczytu o={o} />
                        </span>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <p
              className="min-h-5 text-xs break-words text-muted-foreground"
              aria-live="polite"
            >
              {opisAktywnego ??
                "Najedź na znak albo go dotknij, żeby podświetlić jego bajty."}
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <Legenda
                probka="ą"
                className="bg-signal-soft text-signal-ink"
                opis="zgodne"
              />
              <Legenda
                probka="Ä…"
                className="bg-amber-soft text-amber-ink"
                opis="krzaczki"
              />
              {ukryte ? (
                <Legenda
                  probka="85"
                  className="border border-dashed border-current font-mono text-[0.625rem]"
                  opis="niewidoczny znak sterujący (hex)"
                />
              ) : null}
              {bledne ? (
                <Legenda
                  probka="�"
                  className="bg-destructive/10 text-destructive"
                  opis="bajt bez znaczenia w tym kodowaniu"
                />
              ) : null}
            </ul>
          </div>
        ) : null}
      </div>
    </Lab>
  )
}

function WyborKodowania({
  id,
  etykieta,
  wartosc,
  onZmiana,
}: {
  id: string
  etykieta: string
  wartosc: KodowanieId
  onZmiana: (v: KodowanieId) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{etykieta}</FieldLabel>
      <Select
        items={ELEMENTY}
        value={wartosc}
        onValueChange={(v) => {
          if (v) onZmiana(v as KodowanieId)
        }}
      >
        <SelectTrigger
          id={id}
          className="w-full text-sm data-[size=default]:h-10"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ELEMENTY.map((k) => (
            <SelectItem key={k.value} value={k.value} className="text-sm">
              {k.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription>{opisKodowania(wartosc)}</FieldDescription>
    </Field>
  )
}

function Legenda({
  probka,
  opis,
  className,
}: {
  probka: string
  opis: string
  className?: string
}) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden
        className={cn(
          "inline-flex h-5 min-w-5 items-center justify-center px-1",
          className
        )}
      >
        {probka}
      </span>
      {opis}
    </li>
  )
}

/** Opis znaku odczytu w tekście (sterujące jako ‹85›). */
function opisZnaku(o: OdczytanyZnak) {
  if (o.rodzaj === "sterujacy") return `‹${toHex(o.znak.codePointAt(0) ?? 0)}›`
  return o.znak
}

/** Znak odczytu: sterujące jako mała ramka z kodem, spacja jako ␣. */
function ZnakOdczytu({ o }: { o: OdczytanyZnak }) {
  const cp = o.znak.codePointAt(0) ?? 0
  if (o.rodzaj === "sterujacy")
    return (
      <span
        title={`Niewidoczny znak sterujący U+${toHex(cp, 4)}`}
        className="mx-px inline-flex h-5 items-center border border-dashed border-current px-0.5 align-middle font-mono text-[0.625rem] leading-none opacity-80"
      >
        {toHex(cp)}
      </span>
    )
  if (o.znak === " ") return <span className="opacity-50">␣</span>
  if (cp === 0xa0)
    return (
      <span className="opacity-50" title="Twarda spacja U+00A0">
        ⍽
      </span>
    )
  if (cp === 0xad)
    return (
      <span className="opacity-50" title="Miękki dywiz U+00AD">
        -
      </span>
    )
  return <>{o.znak}</>
}
