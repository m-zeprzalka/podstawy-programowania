"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CalendarXIcon,
  RocketLaunchIcon,
  WarningIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react"

import {
  formatDataUTC,
  formatLiczba,
  MINUS,
  sup,
} from "@/components/interaktywne/liczby-dane"
import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

type Bity = 8 | 16 | 32

type TablicaTypowana = {
  new (length: number): { [i: number]: number }
  readonly name: string
}

/** [bez znaku, ze znakiem] dla każdej szerokości. */
const TYPY: Record<Bity, readonly [TablicaTypowana, TablicaTypowana]> = {
  8: [Uint8Array, Int8Array],
  16: [Uint16Array, Int16Array],
  32: [Uint32Array, Int32Array],
}

const KROK: Record<Bity, { wartosc: number; label: string; aria: string }> = {
  8: { wartosc: 100, label: "+100", aria: "Dodaj 100" },
  16: { wartosc: 10_000, label: "+10 tys.", aria: "Dodaj 10 000" },
  32: { wartosc: 1_000_000_000, label: "+1 mld", aria: "Dodaj miliard" },
}

function nazwaTypu(bity: Bity, zeZnakiem: boolean) {
  return TYPY[bity][zeZnakiem ? 1 : 0].name
}

/** Zapis do typed array: dokładnie ta arytmetyka, której używa JavaScript. */
function zapisz(value: number, bity: Bity, zeZnakiem: boolean) {
  const Typ = TYPY[bity][zeZnakiem ? 1 : 0]
  const a = new Typ(1)
  a[0] = value
  return a[0]
}

function zakres(bity: Bity, zeZnakiem: boolean) {
  return zeZnakiem
    ? { min: -(2 ** (bity - 1)), max: 2 ** (bity - 1) - 1 }
    : { min: 0, max: 2 ** bity - 1 }
}

/** Zapis liczby jako literał JS (ze zwykłym minusem). */
const js = (n: number) => String(n)

type Przypadek = "gangnam" | "ariane" | "y2038"

const PRZYPADKI: {
  id: Przypadek
  tytul: string
  rok: string
  bity: Bity
  zeZnakiem: boolean
  wartosc: number
  ikona: React.ReactNode
  opis: React.ReactNode
}[] = [
  {
    id: "gangnam",
    tytul: "Gangnam Style",
    rok: "2014",
    bity: 32,
    zeZnakiem: true,
    wartosc: 2_147_483_647,
    ikona: <YoutubeLogoIcon />,
    opis: (
      <>
        YouTube ogłosił, że teledysk przekroczył 2 147 483 647 wyświetleń, czyli
        maksimum 32-bitowej liczby ze znakiem. Kliknij +1. Rzecznik przyznał
        potem, że to był żart: licznik od miesięcy był 64-bitowy.
      </>
    ),
  },
  {
    id: "ariane",
    tytul: "Ariane 5",
    rok: "1996",
    bity: 16,
    zeZnakiem: true,
    wartosc: 32_767,
    ikona: <RocketLaunchIcon />,
    opis: (
      <>
        Lot 501: liczbę zmiennoprzecinkową (64 bity) zamieniano na 16-bitową
        całkowitą ze znakiem. Maksimum to 32 767, a wartość była większa. W
        Adzie skończyło się to wyjątkiem (nie zawinięciem) i utratą rakiety ok.
        37 s po starcie.
      </>
    ),
  },
  {
    id: "y2038",
    tytul: "Rok 2038",
    rok: "time_t",
    bity: 32,
    zeZnakiem: true,
    wartosc: 2_147_483_647,
    ikona: <CalendarXIcon />,
    opis: (
      <>
        Czas uniksowy to sekundy od 1 stycznia 1970 (UTC). W 32-bitowej liczbie
        ze znakiem kończy się 19 stycznia 2038 o 03:14:07 UTC. Kliknij +1 i
        zobacz, dokąd przeskoczy kalendarz. Rozwiązanie: 64-bitowy{" "}
        <code className="font-mono text-xs">time_t</code>.
      </>
    ),
  },
]

type Operacja =
  | { typ: "dodaj"; przed: number; delta: number }
  | { typ: "ustaw"; wartosc: number }

/** „Przepełnienie: 255 + 1 → 0” → trzy kawałki, które nie łamią się w środku. */
const PODZIAL = new RegExp("(?<=:) | (?=→)")

type Komunikat =
  | { typ: "przepelnienie"; tekst: string }
  | { typ: "info"; tekst: string }
  | null

/**
 * „Licznik kilometrów” na 8, 16 lub 32 bitach, bez znaku albo ze znakiem.
 * Arytmetyka jak w `Uint8Array` / `Int32Array`: po maksimum licznik przekręca
 * się na minimum. Zawiera presety: Gangnam Style, Ariane 5, rok 2038.
 *
 * @example <LicznikKilometrow bity={32} zeZnakiem />
 */
export function LicznikKilometrow({
  bity = 8,
  zeZnakiem = false,
}: {
  /** Szerokość licznika: 8, 16 albo 32 bity. */
  bity?: 8 | 16 | 32
  /** Czy liczba ma znak (uzupełnienie do dwóch). */
  zeZnakiem?: boolean
}) {
  const startBity: Bity = bity === 16 || bity === 32 ? bity : 8
  const [n, setN] = React.useState<Bity>(startBity)
  const [znak, setZnak] = React.useState(Boolean(zeZnakiem))
  const [value, setValue] = React.useState(0)
  const [operacja, setOperacja] = React.useState<Operacja>({
    typ: "ustaw",
    wartosc: 0,
  })
  const [komunikat, setKomunikat] = React.useState<Komunikat>(null)
  const [przypadek, setPrzypadek] = React.useState<Przypadek | null>(null)
  const [blysk, setBlysk] = React.useState(false)
  const blyskTimer = React.useRef<number | undefined>(undefined)
  const przypadkiId = React.useId()

  React.useEffect(() => () => window.clearTimeout(blyskTimer.current), [])

  const { min, max } = zakres(n, znak)
  const typ = nazwaTypu(n, znak)
  const krok = KROK[n]

  const mignij = () => {
    window.clearTimeout(blyskTimer.current)
    setBlysk(true)
    blyskTimer.current = window.setTimeout(() => setBlysk(false), 400)
  }

  const dodaj = (delta: number) => {
    const surowa = value + delta
    const wynik = zapisz(surowa, n, znak)
    setValue(wynik)
    setOperacja({ typ: "dodaj", przed: value, delta })
    if (wynik !== surowa) {
      const op = delta < 0 ? MINUS : "+"
      setKomunikat({
        typ: "przepelnienie",
        tekst: `Przepełnienie: ${formatLiczba(value)} ${op} ${formatLiczba(Math.abs(delta))} → ${formatLiczba(wynik)}`,
      })
      mignij()
    } else {
      setKomunikat(null)
    }
  }

  const ustaw = (wartosc: number) => {
    setValue(wartosc)
    setOperacja({ typ: "ustaw", wartosc })
    setKomunikat(null)
  }

  /** Zmiana typu: te same bity (lub obcięte), nowa interpretacja. */
  const zmienTyp = (noweBity: Bity, nowyZnak: boolean) => {
    const wynik = zapisz(value, noweBity, nowyZnak)
    const bityTekst = toBin(wynik, noweBity)
    setN(noweBity)
    setZnak(nowyZnak)
    setValue(wynik)
    setOperacja({ typ: "ustaw", wartosc: wynik })
    setPrzypadek(null)
    if (wynik !== value) {
      setKomunikat({
        typ: "info",
        tekst:
          noweBity === n
            ? `Te same bity (${bityTekst.length > 16 ? "…" + bityTekst.slice(-8) : bityTekst}), inna umowa: ${formatLiczba(value)} jako ${nazwaTypu(n, znak)} to ${formatLiczba(wynik)} jako ${nazwaTypu(noweBity, nowyZnak)}.`
            : `${formatLiczba(value)} nie mieści się w ${nazwaTypu(noweBity, nowyZnak)}: zostały tylko dolne bity, czyli ${formatLiczba(wynik)}.`,
      })
    } else {
      setKomunikat(null)
    }
  }

  const wybierzPrzypadek = (p: (typeof PRZYPADKI)[number]) => {
    setN(p.bity)
    setZnak(p.zeZnakiem)
    setValue(p.wartosc)
    setOperacja({ typ: "ustaw", wartosc: p.wartosc })
    setKomunikat(null)
    setPrzypadek(p.id)
  }

  const reset = () => {
    setN(startBity)
    setZnak(Boolean(zeZnakiem))
    setValue(0)
    setOperacja({ typ: "ustaw", wartosc: 0 })
    setKomunikat(null)
    setPrzypadek(null)
  }

  const bityTekst = toBin(value, n)
  const bajty = Array.from({ length: n / 8 }, (_, i) => n / 8 - 1 - i)
  const aktywny = PRZYPADKI.find((p) => p.id === przypadek)

  const kod = [
    `const licznik = new ${typ}(1)`,
    operacja.typ === "dodaj"
      ? `licznik[0] = ${js(operacja.przed)}`
      : `licznik[0] = ${js(operacja.wartosc)}`,
    operacja.typ === "dodaj"
      ? `licznik[0] ${operacja.delta < 0 ? "-=" : "+="} ${js(Math.abs(operacja.delta))}`
      : null,
    `licznik[0] // → ${js(value)}`,
  ].filter(Boolean) as string[]

  return (
    <Lab
      tytul="Licznik kilometrów"
      opis={
        <>
          Licznik ma stałą liczbę bitów. Dodawaj i odejmuj, a potem przekrocz
          maksimum: licznik przekręci się jak stary licznik w samochodzie.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={reset}
          aria-label="Wyzeruj licznik"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>
          Bez znaku: 0 … 2{sup(n)} − 1. Ze znakiem (uzupełnienie do dwóch): −2
          {sup(n - 1)} … 2{sup(n - 1)} − 1.
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-x-4 gap-y-3">
          <ToggleGroup
            aria-label="Liczba bitów"
            variant="outline"
            spacing={0}
            value={[String(n)]}
            onValueChange={(v) => {
              const next = Number(v[0])
              if (next === 8 || next === 16 || next === 32) zmienTyp(next, znak)
            }}
          >
            {([8, 16, 32] as const).map((b) => (
              <ToggleGroupItem key={b} value={String(b)} className="px-3">
                {b} bit
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <ToggleGroup
            aria-label="Znak"
            variant="outline"
            spacing={0}
            value={[znak ? "tak" : "nie"]}
            onValueChange={(v) => {
              if (v[0]) zmienTyp(n, v[0] === "tak")
            }}
          >
            <ToggleGroupItem value="nie" className="px-3">
              bez znaku
            </ToggleGroupItem>
            <ToggleGroupItem value="tak" className="px-3">
              ze znakiem
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div
          className={cn(
            "flex flex-col gap-4 border p-3 transition-[background-color,border-color,box-shadow] duration-300 sm:p-4",
            blysk
              ? "border-destructive bg-destructive/10 shadow-[0_0_0_3px_var(--destructive)]"
              : "bg-muted/40"
          )}
        >
          <div
            role="img"
            aria-label={`Bity: ${bityTekst}`}
            className={cn(
              "grid gap-x-3 gap-y-2",
              n === 8 ? "grid-cols-1" : "sm:grid-cols-2"
            )}
          >
            {bajty.map((bajt) => (
              <div key={bajt} className="flex min-w-0 flex-col gap-1">
                {n > 8 ? (
                  <span className="font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
                    bajt {bajt} · bity {bajt * 8 + 7}–{bajt * 8}
                  </span>
                ) : null}
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 8 }, (_, i) => {
                    const bit = bajt * 8 + 7 - i
                    const on = bityTekst[n - 1 - bit] === "1"
                    const bitZnaku = znak && bit === n - 1
                    return (
                      <Beben
                        key={bit}
                        on={on}
                        bitZnaku={bitZnaku}
                        duzy={n === 8}
                      />
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
          {znak ? (
            <p className="flex items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground">
              <span className="size-3 border-2 border-amber" aria-hidden />
              bit znaku: 1 oznacza liczbę ujemną
            </p>
          ) : null}

          <div className="flex flex-col gap-1 border bg-card px-3 py-2">
            <span className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
              Dziesiętnie · {typ}
            </span>
            <output
              aria-live="polite"
              className={cn(
                "font-mono text-2xl font-semibold tabular-nums sm:text-3xl",
                blysk ? "text-destructive" : "text-signal-ink"
              )}
            >
              {formatLiczba(value)}
            </output>
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              0x{toHex(value, n / 4).slice(-(n / 4))} · zakres{" "}
              {formatLiczba(min)} … {formatLiczba(max)}
            </span>
          </div>

          {aktywny?.id === "y2038" ? (
            <div className="flex flex-col gap-1 border border-amber/60 bg-amber-soft px-3 py-2">
              <span className="font-mono text-[0.6875rem] font-medium tracking-widest text-amber-ink uppercase">
                Data (sekundy od 1970)
              </span>
              <span
                aria-live="polite"
                className="font-mono text-base font-medium tabular-nums sm:text-xl"
              >
                {formatDataUTC(value)}
              </span>
            </div>
          ) : null}
        </div>

        <div>
          <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap">
            <Button
              variant="outline"
              className="col-span-2 tabular-nums sm:min-w-20"
              onClick={() => dodaj(-1)}
              aria-label="Odejmij 1"
            >
              {MINUS}1
            </Button>
            <Button
              variant="outline"
              className="col-span-2 tabular-nums sm:min-w-20"
              onClick={() => dodaj(1)}
              aria-label="Dodaj 1"
            >
              +1
            </Button>
            <Button
              variant="outline"
              className="col-span-2 tabular-nums sm:min-w-20"
              onClick={() => dodaj(krok.wartosc)}
              aria-label={krok.aria}
            >
              {krok.label}
            </Button>
            <Button
              variant="secondary"
              onClick={() => ustaw(min)}
              className="col-span-3"
            >
              Ustaw minimum
            </Button>
            <Button
              variant="secondary"
              onClick={() => ustaw(max)}
              className="col-span-3"
            >
              Ustaw maksimum
            </Button>
          </div>

          <div aria-live="polite">
            {komunikat ? (
              <p
                className={cn(
                  "mt-3 flex items-start gap-2 border px-3 py-2 text-sm",
                  komunikat.typ === "przepelnienie"
                    ? "border-destructive/40 bg-destructive/10 font-medium text-destructive"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                {komunikat.typ === "przepelnienie" ? (
                  <WarningIcon
                    weight="fill"
                    className="mt-0.5 size-4 shrink-0"
                  />
                ) : null}
                <span className="flex flex-wrap gap-x-2 font-mono tabular-nums">
                  {komunikat.typ === "przepelnienie"
                    ? komunikat.tekst.split(PODZIAL).map((czesc, i) => (
                        <span key={i} className="whitespace-nowrap">
                          {czesc}
                        </span>
                      ))
                    : komunikat.tekst}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <LabLabel>To samo w JavaScripcie</LabLabel>
          <pre className="overflow-x-auto border bg-muted/50 px-3 py-2 font-mono text-xs/relaxed sm:text-sm/relaxed">
            <code>
              {kod.map((linia, i) => {
                const [przed, komentarz] = linia.split(" // ")
                return (
                  <span key={i} className="block">
                    {przed}
                    {komentarz ? (
                      <span className="text-muted-foreground">
                        {` // ${komentarz}`}
                      </span>
                    ) : null}
                  </span>
                )
              })}
            </code>
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <LabLabel id={przypadkiId}>Prawdziwe przypadki</LabLabel>
          <div
            role="group"
            aria-labelledby={przypadkiId}
            className="grid gap-2 sm:grid-cols-3"
          >
            {PRZYPADKI.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={przypadek === p.id}
                onClick={() => wybierzPrzypadek(p)}
                className={cn(
                  "flex min-h-11 items-center gap-3 border px-3 py-2 text-left transition-colors hover:bg-muted",
                  przypadek === p.id
                    ? "border-amber bg-amber-soft"
                    : "bg-background"
                )}
              >
                <span className="text-amber-ink [&_svg]:size-5">{p.ikona}</span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium">
                    {p.tytul}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      {p.rok}
                    </span>
                  </span>
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">
                    {nazwaTypu(p.bity, p.zeZnakiem)} · {formatLiczba(p.wartosc)}
                  </span>
                </span>
              </button>
            ))}
          </div>
          {aktywny ? (
            <p className="text-sm/relaxed text-muted-foreground">
              {aktywny.opis}
            </p>
          ) : null}
        </div>
      </div>
    </Lab>
  )
}

/** Pojedynczy „bęben” licznika: cyfry 0 i 1 przewijane w pionie. */
function Beben({
  on,
  bitZnaku,
  duzy,
}: {
  on: boolean
  bitZnaku: boolean
  duzy: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative block overflow-hidden border bg-card shadow-[inset_0_6px_6px_-6px_color-mix(in_oklch,var(--foreground)_35%,transparent),inset_0_-6px_6px_-6px_color-mix(in_oklch,var(--foreground)_35%,transparent)] transition-colors duration-200",
        duzy ? "h-12 sm:h-14" : "h-10",
        on && "bg-signal-soft",
        bitZnaku && "border-2 border-amber"
      )}
    >
      <span
        className={cn(
          "absolute inset-x-0 top-0 flex flex-col font-mono font-semibold tabular-nums transition-transform duration-300 ease-out",
          duzy ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl",
          on ? "-translate-y-1/2" : "translate-y-0"
        )}
      >
        <span
          className={cn(
            "flex items-center justify-center text-muted-foreground",
            duzy ? "h-12 sm:h-14" : "h-10"
          )}
        >
          0
        </span>
        <span
          className={cn(
            "flex items-center justify-center text-signal-ink",
            duzy ? "h-12 sm:h-14" : "h-10"
          )}
        >
          1
        </span>
      </span>
    </span>
  )
}
