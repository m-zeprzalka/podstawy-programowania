"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon, CoinsIcon } from "@phosphor-icons/react"

import { sup } from "@/components/interaktywne/liczby-dane"
import {
  dodaj,
  dokladnie,
  dziesietnaNaTekst,
  naukowo,
  odejmij,
  parsujDziesietna,
  rowne,
  rozloz,
  type Dziesietna,
} from "@/components/interaktywne/zmiennoprzecinkowe-dane"
import { Lab, LabLabel } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

const PRESETY = [
  { a: "0.1", b: "0.2", label: "0,1 + 0,2" },
  { a: "0.1", b: "0.7", label: "0,1 + 0,7" },
  { a: "1.1", b: "2.2", label: "1,1 + 2,2" },
  { a: "0.5", b: "0.25", label: "0,5 + 0,25" },
  { a: "9007199254740992", b: "1", label: "2⁵³ + 1" },
]

const MAKS_CYFR = 140

type Wybor = "a" | "b" | "suma"

/**
 * Dlaczego 0.1 + 0.2 ≠ 0.3: wynik w JavaScripcie, porównanie z sumą
 * dziesiętną, dokładna wartość zapisana w pamięci i 64 bity IEEE 754
 * (znak, wykładnik, mantysa).
 *
 * @example <Zmiennoprzecinkowe a={0.1} b={0.2} />
 */
export function Zmiennoprzecinkowe({
  a = 0.1,
  b = 0.2,
}: {
  /** Pierwszy składnik. */
  a?: number
  /** Drugi składnik. */
  b?: number
}) {
  const [tekstA, setTekstA] = React.useState(() => String(a))
  const [tekstB, setTekstB] = React.useState(() => String(b))
  const [wybor, setWybor] = React.useState<Wybor>("suma")
  const idA = React.useId()
  const idB = React.useId()

  const decA = parsujDziesietna(tekstA)
  const decB = parsujDziesietna(tekstB)
  const poprawne = decA !== null && decB !== null

  return (
    <Lab
      tytul="0.1 + 0.2"
      opis={
        <>
          JavaScript zapisuje liczby w 64 bitach (IEEE 754). Wpisz dwie liczby i
          zobacz, co naprawdę trafia do pamięci. Przecinek i kropka działają tak
          samo.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => {
            setTekstA(String(a))
            setTekstB(String(b))
            setWybor("suma")
          }}
          aria-label="Przywróć wartości domyślne"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>Double: ok. 15–17 cyfr znaczących. Nie porównuj ułamków przez ===.</>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-start gap-2">
            <Field data-invalid={decA === null || undefined}>
              <FieldLabel htmlFor={idA} className="font-mono">
                a
              </FieldLabel>
              <Input
                id={idA}
                value={tekstA}
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                maxLength={40}
                aria-invalid={decA === null || undefined}
                onChange={(e) => setTekstA(e.target.value)}
                className="h-10 font-mono text-base tabular-nums md:h-9 md:text-sm"
              />
              {decA === null ? <FieldError>Wpisz liczbę</FieldError> : null}
            </Field>
            <span
              className="mt-7 flex h-10 items-center font-mono text-lg text-muted-foreground md:h-9"
              aria-hidden
            >
              +
            </span>
            <Field data-invalid={decB === null || undefined}>
              <FieldLabel htmlFor={idB} className="font-mono">
                b
              </FieldLabel>
              <Input
                id={idB}
                value={tekstB}
                inputMode="decimal"
                autoComplete="off"
                spellCheck={false}
                maxLength={40}
                aria-invalid={decB === null || undefined}
                onChange={(e) => setTekstB(e.target.value)}
                className="h-10 font-mono text-base tabular-nums md:h-9 md:text-sm"
              />
              {decB === null ? <FieldError>Wpisz liczbę</FieldError> : null}
            </Field>
          </div>
          <div
            className="flex flex-wrap gap-1.5"
            role="group"
            aria-label="Przykłady"
          >
            {PRESETY.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                aria-pressed={tekstA === p.a && tekstB === p.b}
                onClick={() => {
                  setTekstA(p.a)
                  setTekstB(p.b)
                }}
                className="h-10 tabular-nums aria-pressed:border-foreground/40 aria-pressed:bg-muted md:h-8"
              >
                {p.label}
              </Button>
            ))}
          </div>
        </div>

        {poprawne ? (
          <Wyniki decA={decA} decB={decB} wybor={wybor} setWybor={setWybor} />
        ) : (
          <p className="border border-dashed p-3 text-sm text-muted-foreground">
            Wpisz dwie liczby, np. 0,1 i 0,2.
          </p>
        )}

        <Grosze />
      </div>
    </Lab>
  )
}

function Wyniki({
  decA,
  decB,
  wybor,
  setWybor,
}: {
  decA: Dziesietna
  decB: Dziesietna
  wybor: Wybor
  setWybor: (w: Wybor) => void
}) {
  const jsA = dziesietnaNaTekst(decA)
  const jsB = dziesietnaNaTekst(decB)
  const numA = Number(jsA)
  const numB = Number(jsB)
  const suma = numA + numB
  const sumaDec = dodaj(decA, decB)
  const sumaDecJs = dziesietnaNaTekst(sumaDec)
  const literal = Number(sumaDecJs)
  const porownanie = suma === literal
  const sumaPamiec = dokladnie(suma)
  const dokladna = sumaPamiec !== null && rowne(sumaPamiec, sumaDec)
  const blad = sumaPamiec ? naukowo(odejmij(sumaPamiec, sumaDec)) : null

  const ton = !porownanie ? "zle" : dokladna ? "dobrze" : "uwaga"
  const kolor =
    ton === "zle"
      ? "text-destructive"
      : ton === "dobrze"
        ? "text-signal-ink"
        : "text-amber-ink"

  const wybrana = wybor === "a" ? numA : wybor === "b" ? numB : suma

  return (
    <>
      <div className="flex flex-col gap-3" aria-live="polite">
        <dl className="grid gap-px border bg-border sm:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-1 bg-card p-3">
            <dt className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
              a + b w JavaScripcie
            </dt>
            <dd
              className={cn(
                "font-mono text-lg font-medium break-all tabular-nums md:text-xl",
                kolor
              )}
            >
              {String(suma)}
            </dd>
          </div>
          <div className="flex min-w-0 flex-col gap-1 bg-card p-3">
            <dt className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
              Suma dziesiętna (na kartce)
            </dt>
            <dd className="font-mono text-lg font-medium break-all tabular-nums md:text-xl">
              {sumaDecJs}
            </dd>
          </div>
        </dl>

        <div
          className={cn(
            "flex flex-col gap-2 border px-3 py-2 sm:flex-row sm:items-center sm:justify-between",
            ton === "zle"
              ? "border-destructive/40 bg-destructive/10"
              : ton === "dobrze"
                ? "border-signal/40 bg-signal-soft"
                : "border-amber/60 bg-amber-soft"
          )}
        >
          <code className="min-w-0 font-mono text-sm break-all">
            {jsA} + {jsB.startsWith("-") ? `(${jsB})` : jsB} === {sumaDecJs}
          </code>
          <span
            className={cn(
              "shrink-0 font-mono text-lg font-semibold",
              porownanie ? "text-signal-ink" : "text-destructive"
            )}
          >
            {String(porownanie)}
          </span>
        </div>
        <p className="text-sm/relaxed text-muted-foreground">
          {dokladna ? (
            <>Wynik jest dokładny: ta suma ma dokładny zapis dwójkowy.</>
          ) : porownanie ? (
            <>
              Porównanie daje <code className="font-mono">true</code>, ale wynik
              nie jest dokładny: literał po prawej też zaokrąglono do tej samej
              liczby w pamięci.
              {blad ? (
                <>
                  {" "}
                  Błąd: {blad.mantysa} × 10{sup(blad.wykladnik)}.
                </>
              ) : null}
            </>
          ) : (
            <>
              Wynik różni się od sumy dziesiętnej
              {blad ? (
                <>
                  {" "}
                  o ok.{" "}
                  <span className="font-mono whitespace-nowrap">
                    {blad.mantysa} × 10{sup(blad.wykladnik)}
                  </span>
                </>
              ) : null}
              . Składniki nie mają skończonego zapisu dwójkowego, więc zostały
              zaokrąglone.
            </>
          )}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <LabLabel>Co naprawdę jest w pamięci</LabLabel>
        <dl className="grid gap-px border bg-border">
          <Pamiec etykieta={`a = ${jsA}`} zamiar={decA} />
          <Pamiec etykieta={`b = ${jsB}`} zamiar={decB} />
          <Pamiec etykieta="a + b" zamiar={sumaDec} wartosc={suma} />
          {!porownanie ? (
            <Pamiec etykieta={sumaDecJs} zamiar={sumaDec} />
          ) : null}
        </dl>
        <p className="flex items-center gap-2 font-mono text-[0.6875rem] text-muted-foreground">
          <span
            className="size-3 bg-amber-soft ring-1 ring-amber"
            aria-hidden
          />
          cyfry, które różnią się od wpisanej liczby
        </p>
      </div>

      <Ieee754
        wartosc={wybrana}
        wybor={wybor}
        setWybor={setWybor}
        etykiety={{ a: jsA, b: jsB }}
      />
    </>
  )
}

/** Wiersz z dokładnym rozwinięciem dziesiętnym liczby zapisanej w double. */
function Pamiec({
  etykieta,
  zamiar,
  wartosc,
}: {
  etykieta: string
  /** Liczba, o którą „chodziło” (zapis dziesiętny). */
  zamiar: Dziesietna
  /** Liczba w pamięci; domyślnie zaokrąglony `zamiar`. */
  wartosc?: number
}) {
  const x = wartosc ?? Number(dziesietnaNaTekst(zamiar))
  const pamiec = dokladnie(x)
  const tekst = pamiec ? dziesietnaNaTekst(pamiec) : String(x)
  const cel = dziesietnaNaTekst(zamiar)

  // Pierwsza cyfra, która różni się od zamierzonej liczby (z domyślnymi zerami).
  let k = -1
  if (!pamiec || !rowne(pamiec, zamiar)) {
    const celPelny = cel.includes(".") ? cel : `${cel}.`
    for (let i = 0; i < tekst.length; i++) {
      const c = i < celPelny.length ? celPelny[i] : "0"
      if (tekst[i] !== c) {
        k = i
        break
      }
    }
  }
  const pokazane = tekst.length > MAKS_CYFR ? tekst.slice(0, MAKS_CYFR) : tekst
  const ukryte = tekst.length - pokazane.length

  return (
    <div className="grid gap-1 bg-card px-3 py-2 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-3">
      <dt
        className="truncate font-mono text-xs text-muted-foreground"
        title={etykieta}
      >
        {etykieta}
      </dt>
      <dd className="font-mono text-xs/relaxed break-all tabular-nums sm:text-sm/relaxed">
        {k < 0 ? (
          pokazane
        ) : (
          <>
            {pokazane.slice(0, k)}
            <span className="bg-amber-soft text-amber-ink">
              {pokazane.slice(k)}
            </span>
          </>
        )}
        {ukryte > 0 ? (
          <span className="text-muted-foreground"> … (+{ukryte} cyfr)</span>
        ) : null}
        {k < 0 && pamiec ? (
          <span className="ml-2 font-sans text-xs text-signal-ink">
            dokładnie
          </span>
        ) : null}
      </dd>
    </div>
  )
}

/** 64 bity liczby: znak, wykładnik, mantysa i ich odczytanie. */
function Ieee754({
  wartosc,
  wybor,
  setWybor,
  etykiety,
}: {
  wartosc: number
  wybor: Wybor
  setWybor: (w: Wybor) => void
  etykiety: { a: string; b: string }
}) {
  const id = React.useId()
  const { bity, znak, wykladnik, mantysa } = rozloz(wartosc)
  const bityWykladnika = bity.slice(1, 12)
  const bityMantysy = bity.slice(12)

  let odczyt: React.ReactNode
  if (wykladnik === 2047) {
    odczyt = mantysa === BigInt(0) ? (znak ? "−Infinity" : "Infinity") : "NaN"
  } else if (wykladnik === 0) {
    odczyt =
      mantysa === BigInt(0) ? (
        "zero"
      ) : (
        <>
          liczba podnormalna: {znak ? "−" : "+"}0,mantysa × 2{sup(-1022)}
        </>
      )
  } else {
    const e = wykladnik - 1023
    const znaczaca = (1 + Number(mantysa) / 2 ** 52)
      .toPrecision(17)
      .replace(/\.?0+$/, "")
      .replace(".", ",")
    odczyt = (
      <>
        {znak ? "−" : "+"}
        {znaczaca} × 2{sup(e)}
      </>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <LabLabel id={id}>64 bity IEEE 754</LabLabel>
        <ToggleGroup
          aria-labelledby={id}
          variant="outline"
          spacing={0}
          value={[wybor]}
          onValueChange={(v) => {
            if (v[0]) setWybor(v[0] as Wybor)
          }}
        >
          <ToggleGroupItem
            value="a"
            aria-label={`a = ${etykiety.a}`}
            className="px-3"
          >
            a
          </ToggleGroupItem>
          <ToggleGroupItem
            value="b"
            aria-label={`b = ${etykiety.b}`}
            className="px-3"
          >
            b
          </ToggleGroupItem>
          <ToggleGroupItem value="suma" className="px-3">
            a + b
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div
        role="img"
        aria-label={`Znak ${znak}, wykładnik ${bityWykladnika}, mantysa ${bityMantysy}`}
        className="flex flex-wrap items-start gap-x-2 gap-y-3 font-mono text-xs sm:text-sm"
      >
        <Segment etykieta="znak · 1" className="border-chart-4 bg-chart-4/10">
          {bity[0]}
        </Segment>
        <Segment
          etykieta="wykładnik · 11"
          className="border-amber bg-amber-soft"
        >
          {bityWykladnika}
        </Segment>
        <Segment
          etykieta="mantysa · 52"
          className="border-signal bg-signal-soft"
          zawijaj
        >
          {(bityMantysy.match(/.{1,4}/g) ?? []).map((g, i) => (
            <span key={i}>{g}</span>
          ))}
        </Segment>
      </div>

      <dl className="grid gap-px border bg-border font-mono text-xs sm:text-sm">
        <Odczyt etykieta="znak">
          {bity[0]} → {znak ? "ujemna" : "dodatnia"}
        </Odczyt>
        <Odczyt etykieta="wykładnik">
          {wykladnik === 0 || wykladnik === 2047 ? (
            <>{wykladnik} (wartość specjalna)</>
          ) : (
            <>
              {wykladnik} − 1023 = {String(wykladnik - 1023).replace("-", "−")}
            </>
          )}
        </Odczyt>
        <Odczyt etykieta="wartość">{odczyt}</Odczyt>
      </dl>
    </div>
  )
}

function Segment({
  etykieta,
  className,
  zawijaj = false,
  children,
}: {
  etykieta: string
  className?: string
  zawijaj?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-1",
        zawijaj && "basis-full sm:flex-1 sm:basis-auto"
      )}
    >
      <span className="text-[0.625rem] tracking-widest text-muted-foreground uppercase">
        {etykieta}
      </span>
      <span
        className={cn(
          "flex border-b-2 px-1.5 py-1 tabular-nums",
          zawijaj ? "flex-wrap gap-x-1.5" : "",
          className
        )}
      >
        {children}
      </span>
    </div>
  )
}

function Odczyt({
  etykieta,
  children,
}: {
  etykieta: string
  children: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[6.5rem_minmax(0,1fr)] gap-2 bg-card px-3 py-2">
      <dt className="text-muted-foreground">{etykieta}</dt>
      <dd className="break-all tabular-nums">{children}</dd>
    </div>
  )
}

function Grosze() {
  return (
    <div className="flex flex-col gap-2 border border-dashed p-3">
      <p className="flex items-center gap-2 text-sm font-medium">
        <CoinsIcon className="size-5 text-amber-ink" aria-hidden />
        Pieniądze licz w groszach
      </p>
      <div className="flex flex-col gap-1 bg-muted/50 px-3 py-2 font-mono text-xs/relaxed sm:text-sm/relaxed">
        {[
          { kod: "0.10 + 0.20", wynik: "// 0.30000000000000004 zł" },
          { kod: "(10 + 20) / 100", wynik: "// 30 groszy → „0,30 zł”" },
        ].map((l) => (
          <code
            key={l.kod}
            className="grid gap-x-4 sm:grid-cols-[9rem_minmax(0,1fr)]"
          >
            <span>{l.kod}</span>
            <span className="text-muted-foreground">{l.wynik}</span>
          </code>
        ))}
      </div>
      <p className="text-xs/relaxed text-muted-foreground">
        Liczby całkowite do 2⁵³ (ok. 9 biliardów) double zapisuje dokładnie,
        więc 10 + 20 groszy to zawsze 30 groszy. Na złote zamieniaj dopiero przy
        wyświetlaniu.
      </p>
    </div>
  )
}
