"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

const MAKS_DLUGOSC = 40

const PRZYKLADY: readonly { tekst: string; opis: string }[] = [
  { tekst: "a", opis: "litera a" },
  { tekst: "ą", opis: "litera ą" },
  { tekst: "😂", opis: "emoji płacz ze śmiechu" },
  { tekst: "👍🏽", opis: "kciuk z odcieniem skóry" },
  { tekst: "👨‍👩‍👧", opis: "rodzina" },
  { tekst: "🇵🇱", opis: "flaga Polski" },
]

/** Oficjalne nazwy Unicode dla znaków z przykładów. */
const NAZWY: Record<number, string> = {
  0x0020: "SPACE",
  0x0104: "LATIN CAPITAL LETTER A WITH OGONEK",
  0x0105: "LATIN SMALL LETTER A WITH OGONEK",
  0x0106: "LATIN CAPITAL LETTER C WITH ACUTE",
  0x0107: "LATIN SMALL LETTER C WITH ACUTE",
  0x0118: "LATIN CAPITAL LETTER E WITH OGONEK",
  0x0119: "LATIN SMALL LETTER E WITH OGONEK",
  0x0141: "LATIN CAPITAL LETTER L WITH STROKE",
  0x0142: "LATIN SMALL LETTER L WITH STROKE",
  0x0143: "LATIN CAPITAL LETTER N WITH ACUTE",
  0x0144: "LATIN SMALL LETTER N WITH ACUTE",
  0x00d3: "LATIN CAPITAL LETTER O WITH ACUTE",
  0x00f3: "LATIN SMALL LETTER O WITH ACUTE",
  0x015a: "LATIN CAPITAL LETTER S WITH ACUTE",
  0x015b: "LATIN SMALL LETTER S WITH ACUTE",
  0x0179: "LATIN CAPITAL LETTER Z WITH ACUTE",
  0x017a: "LATIN SMALL LETTER Z WITH ACUTE",
  0x017b: "LATIN CAPITAL LETTER Z WITH DOT ABOVE",
  0x017c: "LATIN SMALL LETTER Z WITH DOT ABOVE",
  0x0328: "COMBINING OGONEK",
  0x200d: "ZERO WIDTH JOINER",
  0x2764: "HEAVY BLACK HEART",
  0xfe0f: "VARIATION SELECTOR-16",
  0x1f3fb: "EMOJI MODIFIER FITZPATRICK TYPE-1-2",
  0x1f3fc: "EMOJI MODIFIER FITZPATRICK TYPE-3",
  0x1f3fd: "EMOJI MODIFIER FITZPATRICK TYPE-4",
  0x1f3fe: "EMOJI MODIFIER FITZPATRICK TYPE-5",
  0x1f3ff: "EMOJI MODIFIER FITZPATRICK TYPE-6",
  0x1f44d: "THUMBS UP SIGN",
  0x1f466: "BOY",
  0x1f467: "GIRL",
  0x1f468: "MAN",
  0x1f469: "WOMAN",
  0x1f602: "FACE WITH TEARS OF JOY",
}

/** Krótkie etykiety niewidocznych „klejów”. */
const SKROTY: Record<number, string> = {
  0x200d: "ZWJ",
  0xfe0f: "VS16",
}

type Rola = "klej" | "modyfikator" | "zwykly"

function rola(cp: number): Rola {
  if (cp === 0x200d || cp === 0xfe0f || cp === 0x0328) return "klej"
  if (cp >= 0x1f3fb && cp <= 0x1f3ff) return "modyfikator"
  return "zwykly"
}

function nazwa(cp: number): { tekst: string; oficjalna: boolean } {
  if (NAZWY[cp]) return { tekst: NAZWY[cp], oficjalna: true }
  if (cp >= 0x41 && cp <= 0x5a)
    return {
      tekst: `LATIN CAPITAL LETTER ${String.fromCharCode(cp)}`,
      oficjalna: true,
    }
  if (cp >= 0x61 && cp <= 0x7a)
    return {
      tekst: `LATIN SMALL LETTER ${String.fromCharCode(cp - 32)}`,
      oficjalna: true,
    }
  if (cp >= 0x1f1e6 && cp <= 0x1f1ff)
    return {
      tekst: `REGIONAL INDICATOR SYMBOL LETTER ${String.fromCharCode(0x41 + cp - 0x1f1e6)}`,
      oficjalna: true,
    }
  const z = String.fromCodePoint(cp)
  if (/\p{Extended_Pictographic}/u.test(z))
    return { tekst: "emoji", oficjalna: false }
  if (/\p{Lu}/u.test(z)) return { tekst: "wielka litera", oficjalna: false }
  if (/\p{L}/u.test(z)) return { tekst: "litera", oficjalna: false }
  if (/\p{N}/u.test(z)) return { tekst: "cyfra", oficjalna: false }
  if (/\p{M}/u.test(z)) return { tekst: "znak łączący", oficjalna: false }
  if (/\p{Z}/u.test(z)) return { tekst: "odstęp", oficjalna: false }
  return { tekst: "znak", oficjalna: false }
}

/** Polska odmiana: 1 punkt, 2 punkty, 5 punktów. */
function odmiana(n: number, jeden: string, kilka: string, wiele: string) {
  if (n === 1) return jeden
  const d = n % 10
  const s = n % 100
  if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return kilka
  return wiele
}

const kodowanie = new TextEncoder()

function grafemy(tekst: string): string[] | null {
  if (typeof Intl === "undefined" || typeof Intl.Segmenter !== "function")
    return null
  const seg = new Intl.Segmenter("pl", { granularity: "grapheme" })
  return Array.from(seg.segment(tekst), (s) => s.segment)
}

/**
 * Rozbieracz emoji: ten sam tekst ma trzy „długości” (grafemy, punkty
 * kodowe, jednostki UTF-16) i jeszcze liczbę bajtów UTF-8.
 *
 * @example <RozbieraczEmoji tekst="👍🏽" />
 */
export function RozbieraczEmoji({
  tekst: tekstStartowy = "👨‍👩‍👧",
  tytul = "Rozbieracz emoji",
}: {
  /** Tekst początkowy. */
  tekst?: string
  tytul?: string
}) {
  const idPola = React.useId()
  const [tekst, setTekst] = React.useState(tekstStartowy)

  const listaGrafemow = grafemy(tekst)
  const punkty = Array.from(tekst)
  const bajty = kodowanie.encode(tekst).length
  const spozaBmp = punkty.filter((p) => (p.codePointAt(0) ?? 0) > 0xffff).length
  const wBmp = punkty.length - spozaBmp
  const zwj = punkty.filter((p) => p === "‍").length
  const grupy = listaGrafemow ?? punkty

  const przyklad = PRZYKLADY.find((p) => p.tekst === tekst)

  let indeks = 0
  const grupyZPunktami = grupy.map((g) => {
    const cps = Array.from(g).map((p) => ({ p, nr: indeks++ }))
    return { g, cps }
  })

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Jeden widoczny znak może składać się z kilku punktów kodowych. Wybierz
          przykład albo wpisz własny tekst i zobacz, z czego się składa.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setTekst(tekstStartowy)}
          aria-label="Przywróć przykład"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>
          UTF-16 zapisuje znaki do U+FFFF w 1 jednostce, a dalsze w 2 (para
          surogatów). UTF-8 używa 1–4 bajtów.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <LabLabel id={`${idPola}-przyklady`}>Przykłady</LabLabel>
          <ToggleGroup
            value={przyklad ? [przyklad.tekst] : []}
            onValueChange={(v) => {
              if (v[0]) setTekst(v[0] as string)
            }}
            variant="outline"
            spacing={0}
            aria-labelledby={`${idPola}-przyklady`}
            className="grid w-full grid-cols-6 sm:w-fit"
          >
            {PRZYKLADY.map((p) => (
              <ToggleGroupItem
                key={p.tekst}
                value={p.tekst}
                aria-label={p.opis}
                className="h-11 min-w-11 px-2 font-sans text-xl md:h-11"
              >
                {p.tekst}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <Field>
          <FieldLabel htmlFor={idPola}>Tekst</FieldLabel>
          <Input
            id={idPola}
            value={tekst}
            maxLength={MAKS_DLUGOSC}
            onChange={(e) => setTekst(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            className="h-10 text-base md:text-sm"
          />
        </Field>

        <div className="flex min-h-24 items-center justify-center border bg-muted/40 p-4 text-center text-5xl break-all">
          {tekst || (
            <span className="text-sm text-muted-foreground">
              Wpisz jakiś tekst.
            </span>
          )}
        </div>

        <dl
          className="grid grid-cols-2 gap-px border bg-border sm:grid-cols-4"
          aria-live="polite"
        >
          <Dlugosc
            etykieta="Grafemy"
            wartosc={listaGrafemow ? listaGrafemow.length : "?"}
            kod="[...new Intl.Segmenter().segment(s)].length"
            opis="widoczne znaki"
            akcent
          />
          <Dlugosc
            etykieta="Punkty kodowe"
            wartosc={punkty.length}
            kod="[...s].length"
            opis="numery U+…"
          />
          <Dlugosc
            etykieta="UTF-16"
            wartosc={tekst.length}
            kod="s.length"
            opis="jednostki po 16 bitów"
          />
          <Dlugosc
            etykieta="Bajty UTF-8"
            wartosc={bajty}
            kod="new TextEncoder().encode(s).length"
            opis="tyle zajmie w pliku"
          />
        </dl>

        {punkty.length > 0 ? (
          <p className="border-l-2 border-signal bg-signal-soft px-3 py-2 text-sm/relaxed">
            <span className="font-medium">Dlaczego {tekst.length}?</span>{" "}
            <code className="font-mono text-[0.85em]">s.length</code> liczy
            jednostki UTF-16.{" "}
            {spozaBmp > 0 ? (
              <>
                {spozaBmp} {odmiana(spozaBmp, "punkt", "punkty", "punktów")}{" "}
                spoza U+FFFF{" "}
                {odmiana(spozaBmp, "zajmuje", "zajmują", "zajmuje")} po 2
                jednostki (para surogatów)
                {wBmp > 0 ? (
                  <>
                    , a {wBmp}{" "}
                    {odmiana(wBmp, "pozostały", "pozostałe", "pozostałych")}
                    {zwj > 0 ? ` (w tym ${zwj} × ZWJ)` : ""} po 1
                  </>
                ) : null}
                :{" "}
                <span className="font-mono font-medium whitespace-nowrap">
                  {spozaBmp} × 2{wBmp > 0 ? ` + ${wBmp} × 1` : ""} ={" "}
                  {tekst.length}
                </span>
                .
              </>
            ) : (
              <>
                Wszystkie punkty są w zakresie do U+FFFF, więc każdy zajmuje 1
                jednostkę:{" "}
                <span className="font-mono font-medium">
                  {punkty.length} × 1 = {tekst.length}
                </span>
                .
              </>
            )}
          </p>
        ) : null}

        {punkty.length > 0 ? (
          <div className="flex flex-col gap-3">
            <LabLabel>
              Punkty kodowe{listaGrafemow ? " pogrupowane w grafemy" : ""}
            </LabLabel>
            <ol className="flex flex-col gap-3">
              {grupyZPunktami.map(({ g, cps }, gi) => (
                <li key={gi} className="flex flex-col gap-2 border p-2.5">
                  <p className="flex flex-wrap items-baseline gap-x-2 text-xs text-muted-foreground">
                    <span className="font-mono tracking-widest uppercase">
                      {listaGrafemow ? `Grafem ${gi + 1}` : `Znak ${gi + 1}`}
                    </span>
                    <span className="text-xl text-foreground">
                      {g === " " ? "␣" : g}
                    </span>
                    <span>
                      = {cps.length}{" "}
                      {odmiana(
                        cps.length,
                        "punkt kodowy",
                        "punkty kodowe",
                        "punktów kodowych"
                      )}
                    </span>
                  </p>
                  <ul className="grid grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2">
                    {cps.map(({ p, nr }) => (
                      <Klocek key={nr} znak={p} />
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
            {listaGrafemow === null ? (
              <p className="text-xs text-muted-foreground">
                Ta przeglądarka nie ma Intl.Segmenter, więc grafemów nie da się
                policzyć.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Lab>
  )
}

function Dlugosc({
  etykieta,
  wartosc,
  kod,
  opis,
  akcent = false,
}: {
  etykieta: string
  wartosc: React.ReactNode
  kod: string
  opis: string
  akcent?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 bg-card p-3">
      <dt className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
        {etykieta}
      </dt>
      <dd
        className={cn(
          "font-mono text-2xl font-medium tabular-nums md:text-3xl",
          akcent && "text-signal-ink"
        )}
      >
        {wartosc}
      </dd>
      <dd className="text-xs text-muted-foreground">{opis}</dd>
      <dd className="mt-auto pt-1">
        <code className="font-mono text-[0.6875rem] leading-snug wrap-anywhere text-foreground/80">
          {/* Miejsca łamania po kropkach i przed nawiasami. */}
          {kod.split(/(?=[.(])/).map((czesc, i) => (
            <React.Fragment key={i}>
              {i > 0 ? <wbr /> : null}
              {czesc}
            </React.Fragment>
          ))}
        </code>
      </dd>
    </div>
  )
}

function Klocek({ znak }: { znak: string }) {
  const cp = znak.codePointAt(0) ?? 0
  const r = rola(cp)
  const n = nazwa(cp)
  const utf8 = Array.from(kodowanie.encode(znak), (b) => toHex(b)).join(" ")
  const utf16 = Array.from({ length: znak.length }, (_, i) =>
    toHex(znak.charCodeAt(i), 4)
  ).join(" ")
  const skrot = SKROTY[cp]
  return (
    <li
      className={cn(
        "flex min-w-0 flex-col gap-1 border p-2",
        r === "klej" && "border-dashed border-amber bg-amber-soft",
        r === "modyfikator" && "border-amber bg-amber-soft"
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-1">
        <span className="flex h-9 min-w-8 items-center justify-center text-2xl leading-none">
          {skrot ? (
            <span className="border border-dashed border-amber-ink px-1 font-mono text-xs font-semibold text-amber-ink">
              {skrot}
            </span>
          ) : cp === 0x20 ? (
            <span className="text-muted-foreground">␣</span>
          ) : r === "klej" ? (
            // Znak łączący pokazany na kółku zastępczym.
            <span>◌{znak}</span>
          ) : (
            znak
          )}
        </span>
        <span className="font-mono text-sm font-semibold tabular-nums">
          U+{toHex(cp, 4)}
        </span>
      </div>
      <p
        className={cn(
          "min-h-8 text-[0.6875rem] leading-snug break-words",
          n.oficjalna
            ? "font-mono tracking-wide uppercase"
            : "text-muted-foreground italic"
        )}
      >
        {n.tekst}
      </p>
      <dl className="flex flex-col gap-1 font-mono text-[0.6875rem] tabular-nums">
        <div className="flex flex-col">
          <dt className="text-[0.625rem] text-muted-foreground">
            UTF-8 ({kodowanie.encode(znak).length} B)
          </dt>
          <dd className="font-medium">{utf8}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="text-[0.625rem] text-muted-foreground">
            UTF-16 ({znak.length} jedn.)
          </dt>
          <dd className="font-medium">{utf16}</dd>
        </div>
      </dl>
    </li>
  )
}
