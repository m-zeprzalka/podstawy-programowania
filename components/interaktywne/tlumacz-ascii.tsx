"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon, TextAaIcon } from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { asciiLabel, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

const MAKS_ZNAKOW = 24
/** Bit o wadze 32 (2⁵) odróżnia wielkie litery od małych. */
const BIT_WIELKOSCI = 5

type Tryb = "tekst" | "liczby"

type Kolumna =
  | { ok: true; kod: number; znak: string }
  | { ok: false; surowy: string; blad: string }

const jestLitera = (kod: number) =>
  (kod >= 65 && kod <= 90) || (kod >= 97 && kod <= 122)

const znaki = (tekst: string) => Array.from(tekst).slice(0, MAKS_ZNAKOW)

const kodyTekstu = (tekst: string) =>
  znaki(tekst).map((z) => z.codePointAt(0) ?? 0)

/** „72 73, 0x21” → kolumny z kodami albo opisem błędu. */
function parsujLiczby(wejscie: string): Kolumna[] {
  return wejscie
    .split(/[\s,;]+/)
    .filter(Boolean)
    .slice(0, MAKS_ZNAKOW)
    .map((t): Kolumna => {
      let kod: number
      if (/^0x[0-9a-f]{1,6}$/i.test(t)) kod = parseInt(t.slice(2), 16)
      else if (/^\d{1,7}$/.test(t)) kod = Number(t)
      else if (/^-\d+$/.test(t))
        return { ok: false, surowy: t, blad: `${t}: kody zaczynają się od 0` }
      else return { ok: false, surowy: t, blad: `„${t}” nie jest liczbą` }
      if (kod > 127)
        return {
          ok: false,
          surowy: t,
          blad: `${t} jest poza ASCII (0–127)`,
        }
      return { ok: true, kod, znak: String.fromCharCode(kod) }
    })
}

/**
 * Tłumacz ASCII: tekst ↔ kody (DEC, BIN, HEX). Przycisk „Zmień wielkość
 * liter” przełącza bit o wadze 32 i animuje go w każdej literze.
 *
 * @example <TlumaczAscii tekst="HI!" />
 */
export function TlumaczAscii({
  tekst: tekstStartowy = "HI!",
  tytul = "Tłumacz ASCII",
}: {
  /** Tekst początkowy (do 24 znaków). */
  tekst?: string
  tytul?: string
}) {
  const start = znaki(tekstStartowy).join("")
  const idPola = React.useId()
  const idOpisu = React.useId()
  const [tryb, setTryb] = React.useState<Tryb>("tekst")
  const [tekst, setTekst] = React.useState(start)
  const [liczby, setLiczby] = React.useState(() => kodyTekstu(start).join(" "))
  const [przelaczenie, setPrzelaczenie] = React.useState(0)
  const [animuj, setAnimuj] = React.useState(false)

  React.useEffect(() => {
    if (!animuj) return
    const id = window.setTimeout(() => setAnimuj(false), 450)
    return () => window.clearTimeout(id)
  }, [animuj, przelaczenie])

  const kolumny: Kolumna[] =
    tryb === "tekst"
      ? znaki(tekst).map((znak) => ({
          ok: true,
          kod: znak.codePointAt(0) ?? 0,
          znak,
        }))
      : parsujLiczby(liczby)

  const bledy = kolumny.filter((k) => !k.ok)
  const poprawne = kolumny.filter((k) => k.ok)
  const pozaAscii = poprawne.filter((k) => k.kod > 127)
  const litera = poprawne.find((k) => jestLitera(k.kod))
  const zaDuzo =
    tryb === "liczby" &&
    liczby.split(/[\s,;]+/).filter(Boolean).length > MAKS_ZNAKOW

  const zmienTekst = (wartosc: string) => {
    const nowy = znaki(wartosc).join("")
    setTekst(nowy)
    setLiczby(kodyTekstu(nowy).join(" "))
  }

  const zmienLiczby = (wartosc: string) => {
    setLiczby(wartosc)
    const k = parsujLiczby(wartosc)
    if (k.every((x) => x.ok)) {
      setTekst(k.map((x) => (x.ok ? x.znak : "")).join(""))
    }
  }

  const zmienWielkosc = () => {
    const przelacz = (kod: number) =>
      jestLitera(kod) ? kod ^ (1 << BIT_WIELKOSCI) : kod
    if (tryb === "tekst") {
      zmienTekst(
        znaki(tekst)
          .map((z) => String.fromCodePoint(przelacz(z.codePointAt(0) ?? 0)))
          .join("")
      )
    } else {
      const nowe = parsujLiczby(liczby).map((k) =>
        k.ok ? String(przelacz(k.kod)) : k.surowy
      )
      zmienLiczby(nowe.join(" "))
    }
    setPrzelaczenie((n) => n + 1)
    setAnimuj(true)
  }

  const reset = () => {
    setTryb("tekst")
    zmienTekst(start)
    setAnimuj(false)
  }

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Komputer przechowuje litery jako liczby. Wpisz tekst albo kody 0–127 i
          zobacz, jak wygląda każdy znak dziesiętnie, dwójkowo i szesnastkowo.
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
      stopka={
        <>
          ASCII: 128 kodów (0–127). Kody 0–31 i 127 to znaki sterujące, np. 10 =
          nowa linia (LF), 9 = tabulator.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <ToggleGroup
          value={[tryb]}
          onValueChange={(v) => {
            if (v[0]) setTryb(v[0] as Tryb)
          }}
          variant="outline"
          spacing={0}
          aria-label="Kierunek tłumaczenia"
          className="w-full sm:w-fit"
        >
          <ToggleGroupItem value="tekst" className="flex-1 sm:flex-none">
            Tekst → liczby
          </ToggleGroupItem>
          <ToggleGroupItem value="liczby" className="flex-1 sm:flex-none">
            Liczby → tekst
          </ToggleGroupItem>
        </ToggleGroup>

        {tryb === "tekst" ? (
          <Field>
            <FieldLabel htmlFor={idPola}>Tekst</FieldLabel>
            <Input
              id={idPola}
              value={tekst}
              onChange={(e) => zmienTekst(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              aria-describedby={idOpisu}
              className="h-10 font-mono text-base md:text-sm"
            />
            <FieldDescription id={idOpisu}>
              Do {MAKS_ZNAKOW} znaków. Spróbuj też „ą” albo spacji.
            </FieldDescription>
          </Field>
        ) : (
          <Field data-invalid={bledy.length > 0 || undefined}>
            <FieldLabel htmlFor={idPola}>Kody znaków</FieldLabel>
            <Input
              id={idPola}
              value={liczby}
              onChange={(e) => zmienLiczby(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              inputMode="text"
              placeholder="72 73 33"
              aria-invalid={bledy.length > 0 || undefined}
              aria-describedby={idOpisu}
              className="h-10 font-mono text-base md:text-sm"
            />
            <FieldDescription id={idOpisu}>
              Liczby 0–127 oddzielone spacją lub przecinkiem (można też
              szesnastkowo, np. 0x48).
            </FieldDescription>
          </Field>
        )}

        <div
          className="flex flex-col gap-1.5 border bg-muted/40 p-3"
          aria-live="polite"
        >
          <LabLabel>{tryb === "tekst" ? "Kody (DEC)" : "Tekst"}</LabLabel>
          {kolumny.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {tryb === "tekst"
                ? "Wpisz jakiś tekst."
                : "Wpisz kody, np. 72 73 33."}
            </p>
          ) : tryb === "tekst" ? (
            <>
              <p className="font-mono text-xl font-medium break-words tabular-nums md:text-2xl">
                {poprawne.map((k) => k.kod).join(" ")}
              </p>
              <p className="font-mono text-xs break-words text-muted-foreground">
                {poprawne
                  .map((k) =>
                    k.kod > 127 ? `U+${toHex(k.kod, 4)}` : `0x${toHex(k.kod)}`
                  )
                  .join(" ")}
              </p>
            </>
          ) : bledy.length > 0 ? (
            <ul className="flex flex-col gap-0.5 text-sm text-destructive">
              {bledy.map((b, i) => (b.ok ? null : <li key={i}>{b.blad}</li>))}
            </ul>
          ) : (
            <p className="font-mono text-2xl font-medium break-words md:text-3xl">
              {poprawne.map((k, i) => (
                <ZnakWTekscie key={i} kod={k.kod} znak={k.znak} />
              ))}
            </p>
          )}
          {zaDuzo ? (
            <p className="text-xs text-muted-foreground">
              Pokazano pierwsze {MAKS_ZNAKOW} liczby.
            </p>
          ) : null}
        </div>

        {kolumny.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="overflow-x-auto border">
              <table className="w-full border-collapse font-mono tabular-nums">
                <caption className="sr-only">
                  Każdy znak dziesiętnie, dwójkowo i szesnastkowo
                </caption>
                <thead>
                  <tr>
                    <NaglowekWiersza>Znak</NaglowekWiersza>
                    {kolumny.map((k, i) => {
                      const anim = animuj && k.ok && jestLitera(k.kod)
                      return (
                        <th
                          key={i}
                          scope="col"
                          className={cn(
                            "h-14 min-w-[4.5rem] border-b border-l px-2 text-center font-semibold",
                            !k.ok && "bg-destructive/10 text-destructive",
                            k.ok && k.kod > 127 && "bg-amber-soft"
                          )}
                        >
                          {k.ok ? (
                            <span
                              key={anim ? przelaczenie : "x"}
                              className={cn(
                                "inline-block",
                                anim &&
                                  "animate-in duration-300 fade-in-0 zoom-in-75"
                              )}
                            >
                              <ZnakKomorki kod={k.kod} znak={k.znak} />
                            </span>
                          ) : (
                            <span className="text-2xl" aria-label="błąd">
                              ?
                            </span>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <NaglowekWiersza>DEC</NaglowekWiersza>
                    {kolumny.map((k, i) => (
                      <td
                        key={i}
                        className={cn(
                          "border-b border-l px-2 py-2 text-center text-sm",
                          !k.ok && "bg-destructive/10 text-destructive",
                          k.ok && k.kod > 127 && "bg-amber-soft text-amber-ink"
                        )}
                      >
                        {k.ok ? k.kod : k.surowy}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <NaglowekWiersza>BIN</NaglowekWiersza>
                    {kolumny.map((k, i) => (
                      <td
                        key={i}
                        className={cn(
                          "border-b border-l px-2 py-2 text-center text-xs sm:text-sm",
                          !k.ok && "bg-destructive/10",
                          k.ok && k.kod > 127 && "bg-amber-soft"
                        )}
                      >
                        {!k.ok ? (
                          <span className="text-destructive">—</span>
                        ) : k.kod > 127 ? (
                          <span className="font-sans text-xs whitespace-nowrap text-amber-ink">
                            poza ASCII
                          </span>
                        ) : (
                          <Bity
                            kod={k.kod}
                            animuj={animuj && jestLitera(k.kod)}
                            klucz={przelaczenie}
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <NaglowekWiersza>HEX</NaglowekWiersza>
                    {kolumny.map((k, i) => (
                      <td
                        key={i}
                        className={cn(
                          "border-l px-2 py-2 text-center text-sm",
                          !k.ok && "bg-destructive/10 text-destructive",
                          k.ok && k.kod > 127 && "bg-amber-soft text-amber-ink"
                        )}
                      >
                        {!k.ok
                          ? "—"
                          : k.kod > 127
                            ? `U+${toHex(k.kod, 4)}`
                            : `0x${toHex(k.kod)}`}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              <span
                className="inline-flex h-5 items-center bg-amber-soft px-1 font-mono text-amber-ink ring-1 ring-amber"
                aria-hidden
              >
                1
              </span>
              bit o wadze 32 (2⁵): decyduje o wielkości litery
            </p>
          </div>
        ) : null}

        {pozaAscii.length > 0 ? (
          <p className="border-l-2 border-amber bg-amber-soft px-3 py-2 text-sm">
            {pozaAscii.map((k, i) => (
              <React.Fragment key={i}>
                {i > 0 ? ", " : ""}„{k.znak}” (
                <span className="font-mono">U+{toHex(k.kod, 4)}</span>)
              </React.Fragment>
            ))}{" "}
            {pozaAscii.length === 1 ? "jest" : "są"} poza ASCII (kod &gt; 127) →
            Unicode (moduł 7).
          </p>
        ) : null}

        <div className="flex flex-col gap-3 border border-dashed p-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={zmienWielkosc}
            disabled={!litera}
            className="sm:self-center"
          >
            <TextAaIcon data-icon="inline-start" />
            Zmień wielkość liter
          </Button>
          <div className="flex min-w-0 flex-col gap-1 text-sm">
            <p>
              Różnica 32 = jeden bit (2⁵). Przełączenie go zamienia wielką
              literę w małą i odwrotnie.
            </p>
            {litera && litera.ok ? (
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground tabular-nums">
                <span>
                  {litera.znak} = {litera.kod} =
                </span>
                <Bity kod={litera.kod} />
                <span aria-hidden>↔</span>
                <span>
                  {String.fromCharCode(litera.kod ^ 32)} = {litera.kod ^ 32} =
                </span>
                <Bity kod={litera.kod ^ 32} />
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Dodaj literę A–Z lub a–z, żeby to sprawdzić.
              </p>
            )}
          </div>
        </div>
      </div>
    </Lab>
  )
}

function NaglowekWiersza({ children }: { children: React.ReactNode }) {
  return (
    <th
      scope="row"
      className="sticky left-0 z-10 border-b bg-muted px-2.5 text-left text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase"
    >
      {children}
    </th>
  )
}

/** Znak w nagłówku kolumny: drukowalny duży, sterujący jako etykieta. */
function ZnakKomorki({ kod, znak }: { kod: number; znak: string }) {
  const etykieta = kod <= 127 ? asciiLabel(kod) : null
  if (kod <= 32 || kod === 127) {
    return (
      <span
        className="inline-flex h-7 items-center border border-dashed border-input px-1.5 font-sans text-xs font-medium text-muted-foreground"
        title={kod === 32 ? "spacja" : `znak sterujący ${etykieta}`}
      >
        {etykieta}
      </span>
    )
  }
  return <span className="text-2xl leading-none">{znak}</span>
}

/** Znak w wyniku „Liczby → tekst”: sterujące jako małe etykiety. */
function ZnakWTekscie({ kod, znak }: { kod: number; znak: string }) {
  if (kod === 32)
    return (
      <span className="text-muted-foreground" title="spacja">
        ␣
      </span>
    )
  if (kod < 32 || kod === 127)
    return (
      <span className="mx-0.5 inline-flex h-6 items-center border border-dashed border-input px-1 align-middle font-sans text-xs text-muted-foreground">
        {asciiLabel(kod)}
      </span>
    )
  return <>{znak}</>
}

/** 8 bitów z wyróżnionym bitem o wadze 32. */
function Bity({
  kod,
  animuj = false,
  klucz,
}: {
  kod: number
  animuj?: boolean
  klucz?: number
}) {
  const bity = toBin(kod, 8).split("")
  return (
    <span
      className="inline-flex whitespace-nowrap"
      aria-label={`${toBin(kod, 8)}, bit o wadze 32 = ${bity[7 - BIT_WIELKOSCI]}`}
    >
      {bity.map((b, i) => {
        const wyrozniony = i === 7 - BIT_WIELKOSCI
        if (!wyrozniony)
          return (
            <span
              key={i}
              aria-hidden
              className={
                b === "1" ? "text-foreground" : "text-muted-foreground"
              }
            >
              {b}
            </span>
          )
        return (
          <span
            key={animuj ? `a${klucz}` : "s"}
            aria-hidden
            className={cn(
              "inline-block bg-amber-soft px-px font-semibold text-amber-ink ring-1 ring-amber",
              animuj && "animate-in duration-300 fade-in-0 slide-in-from-top-2"
            )}
          >
            {b}
          </span>
        )
      })}
    </span>
  )
}
