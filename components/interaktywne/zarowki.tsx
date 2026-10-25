"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  CheckCircleIcon,
  LightbulbIcon,
  ShuffleIcon,
  TimerIcon,
  TrophyIcon,
} from "@phosphor-icons/react"

import { Lab, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { asciiLabel, groupBits, toBin, toHex } from "@/lib/bity"
import { odmiana } from "@/lib/format"
import { cn } from "@/lib/utils"

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹"
const sup = (n: number) =>
  String(n)
    .split("")
    .map((d) => SUPERSCRIPT[Number(d)])
    .join("")

/** Znacznik czasu i losowanie poza renderem (wołane tylko z handlerów i efektów). */
const teraz = () => performance.now()
const losowa = (max: number) => Math.floor(Math.random() * (max + 1))

/** Ile różnych liczb od 1 do max, w losowej kolejności. */
function losowaSeria(ile: number, max: number) {
  const zbior = new Set<number>()
  while (zbior.size < Math.min(ile, max)) zbior.add(1 + losowa(max - 1))
  return [...zbior]
}

const SEKUNDY = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const sekundy = (ms: number) => `${SEKUNDY.format(ms / 1000)} s`

const LICZBY: [string, string, string] = ["liczbę", "liczby", "liczb"]

/** Pauza po trafieniu, żeby było widać ułożony wzór bitów. */
const PAUZA_MS = 1200

type Wynik = { liczba: number; ms: number; zPodpowiedzia: boolean }

type Seria =
  | { stan: "start" }
  | { stan: "gra"; runda: number; startedAt: number; podpowiedz: boolean }
  | { stan: "trafione"; runda: number }
  | { stan: "koniec" }

/**
 * Rząd klikalnych żarówek (bitów). Pokazuje wartość dziesiętną,
 * szesnastkową, dwójkową i (dla 8 bitów) znak ASCII.
 * Z `wyzwanie` dochodzi seria liczb do ustawienia na czas.
 *
 * @example <Zarowki bity={8} wyzwanie={[5, 16, 42, 255]} />
 */
export function Zarowki({
  bity = 8,
  wartosc = 0,
  wyzwanie,
  czas = 10,
  tytul = "Żarówki",
}: {
  /** Liczba bitów (1–16). */
  bity?: number
  /** Wartość początkowa. */
  wartosc?: number
  /** Liczba albo seria liczb do ustawienia, od najłatwiejszej. */
  wyzwanie?: number | number[]
  /** Limit czasu na jedną liczbę, w sekundach. */
  czas?: number
  tytul?: string
}) {
  const n = Math.min(16, Math.max(1, Math.round(bity)))
  const max = 2 ** n - 1
  // Zero jest ustawione od razu, więc w serii liczymy od 1.
  const zadane = React.useMemo(
    () =>
      wyzwanie === undefined
        ? []
        : [wyzwanie]
            .flat()
            .map((x) => Math.min(max, Math.max(1, Math.round(x)))),
    [wyzwanie, max]
  )

  const [value, setValue] = React.useState(() =>
    Math.min(max, Math.max(0, wartosc))
  )
  const [liczby, setLiczby] = React.useState(zadane)
  const [seria, setSeria] = React.useState<Seria>({ stan: "start" })
  const [wyniki, setWyniki] = React.useState<Wynik[]>([])
  const [wGlowie, setWGlowie] = React.useState(false)
  const [now, setNow] = React.useState(0)
  const idBazowe = React.useId()

  const limitMs = czas * 1000
  const wSerii = seria.stan === "gra" || seria.stan === "trafione"
  const cel = wSerii ? liczby[seria.runda] : undefined

  // Odliczanie czasu na bieżącą liczbę. Po czasie: podpowiedź, bez przerywania.
  React.useEffect(() => {
    if (seria.stan !== "gra" || seria.podpowiedz) return
    const id = window.setInterval(() => {
      const t = teraz()
      setNow(t)
      if (t - seria.startedAt >= limitMs)
        setSeria({ ...seria, podpowiedz: true })
    }, 50)
    return () => window.clearInterval(id)
  }, [seria, limitMs])

  // Po trafieniu chwila pauzy, potem następna liczba.
  React.useEffect(() => {
    if (seria.stan !== "trafione") return
    const id = window.setTimeout(() => {
      setValue(0)
      const t = teraz()
      setNow(t)
      setSeria({
        stan: "gra",
        runda: seria.runda + 1,
        startedAt: t,
        podpowiedz: false,
      })
    }, PAUZA_MS)
    return () => window.clearTimeout(id)
  }, [seria])

  const update = (next: number) => {
    setValue(next)
    if (seria.stan !== "gra" || next !== liczby[seria.runda]) return
    setWyniki((w) => [
      ...w,
      {
        liczba: next,
        ms: teraz() - seria.startedAt,
        zPodpowiedzia: seria.podpowiedz,
      },
    ])
    setSeria(
      seria.runda + 1 < liczby.length
        ? { stan: "trafione", runda: seria.runda }
        : { stan: "koniec" }
    )
  }

  const toggleBit = (bit: number) => {
    // W pauzie po trafieniu wzór zostaje na ekranie.
    if (seria.stan === "trafione") return
    update(value ^ (1 << bit))
  }

  const startSerii = (nowe: number[]) => {
    setLiczby(nowe)
    setWyniki([])
    setValue(0)
    const t = teraz()
    setNow(t)
    setSeria({ stan: "gra", runda: 0, startedAt: t, podpowiedz: false })
  }

  const remaining =
    seria.stan === "gra" && !seria.podpowiedz
      ? Math.max(0, limitMs - (now - seria.startedAt))
      : 0

  const ascii = n === 8 ? asciiLabel(value) : null
  const bits = Array.from({ length: n }, (_, i) => n - 1 - i)
  const ukryj = wGlowie && seria.stan === "gra"

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Kliknij żarówkę, żeby ją włączyć (1) lub wyłączyć (0). Wartość to suma
          wag włączonych żarówek.
          {zadane.length > 1
            ? " Potem sprawdź się w serii wyzwań pod spodem."
            : null}
        </>
      }
      akcje={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => update(losowa(max))}
            aria-label="Losowa wartość"
            disabled={wSerii}
          >
            <ShuffleIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setSeria({ stan: "start" })
              setWyniki([])
              setValue(0)
            }}
            aria-label="Wyzeruj"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          role="group"
          aria-label={`${n} bitów`}
          className={cn(
            "grid gap-1.5 sm:gap-2",
            n <= 8
              ? "grid-cols-[repeat(var(--n),minmax(0,1fr))]"
              : "grid-cols-8"
          )}
          style={{ "--n": n } as React.CSSProperties}
        >
          {bits.map((bit) => {
            const on = (value >> bit) & 1
            const weight = 2 ** bit
            return (
              <div key={bit} className="flex flex-col items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => toggleBit(bit)}
                  aria-pressed={Boolean(on)}
                  aria-label={`Bit o wadze ${weight}: ${on ? "włączony" : "wyłączony"}`}
                  className={cn(
                    "group relative flex aspect-square w-full max-w-16 items-center justify-center border font-mono text-lg font-semibold transition-[background-color,box-shadow,color] duration-150 select-none md:text-xl",
                    on
                      ? "animate-bit-on border-signal bg-signal text-signal-foreground shadow-[0_0_18px_-2px_var(--signal)]"
                      : "border-dashed border-input bg-background text-muted-foreground hover:border-solid hover:border-foreground/40 hover:text-foreground"
                  )}
                >
                  {on}
                </button>
                <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums sm:text-xs">
                  {weight}
                </span>
                <span
                  className="-mt-1 font-mono text-[0.625rem] text-muted-foreground/70"
                  aria-hidden
                >
                  2{sup(bit)}
                </span>
              </div>
            )
          })}
        </div>

        <LabReadouts>
          <LabReadout
            label="Dziesiętnie"
            value={ukryj ? "?" : value}
            hint={ukryj ? "licz w głowie" : undefined}
            accent
          />
          <LabReadout
            label="Szesnastkowo"
            value={`0x${toHex(value, Math.ceil(n / 4))}`}
          />
          <LabReadout
            label="Dwójkowo"
            value={
              <span className="text-base md:text-lg">
                {groupBits(toBin(value, n))}
              </span>
            }
          />
          {n === 8 ? (
            <LabReadout
              label="Znak ASCII"
              value={ascii ?? "—"}
              hint={ascii === null ? "poza ASCII (128–255)" : undefined}
            />
          ) : (
            <LabReadout
              label="Zakres"
              value={`0–${max}`}
              hint={`${max + 1} wartości`}
            />
          )}
        </LabReadouts>

        {zadane.length ? (
          <div className="flex flex-col gap-3 border border-dashed p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-2">
                <p className="text-sm" aria-live="polite">
                  {seria.stan === "start" && liczby.length > 1 ? (
                    <>
                      <span className="font-medium">Seria wyzwań:</span> ustaw
                      po kolei {odmiana(liczby.length, LICZBY)}, na każdą masz{" "}
                      {czas} s.
                    </>
                  ) : seria.stan === "start" ? (
                    <>
                      <span className="font-medium">Wyzwanie:</span> ustaw{" "}
                      <span className="font-mono font-semibold">
                        {liczby[0]}
                      </span>{" "}
                      w {czas} s.
                    </>
                  ) : seria.stan === "gra" ? (
                    <span className="flex flex-wrap items-baseline gap-x-2">
                      {liczby.length > 1 ? (
                        <span className="text-muted-foreground">
                          Liczba {seria.runda + 1} z {liczby.length}:
                        </span>
                      ) : null}
                      <span>
                        ustaw{" "}
                        <span className="font-mono text-2xl font-semibold tabular-nums">
                          {cel}
                        </span>
                      </span>
                    </span>
                  ) : seria.stan === "trafione" ? (
                    <span className="flex items-center gap-2 font-medium text-signal-ink">
                      <CheckCircleIcon weight="fill" className="size-5" />
                      Brawo! {cel} = {groupBits(toBin(cel ?? 0, n))}
                    </span>
                  ) : (
                    <Podsumowanie wyniki={wyniki} />
                  )}
                </p>
                {seria.stan === "gra" && seria.podpowiedz ? (
                  <p className="flex items-start gap-2 text-sm text-amber-ink">
                    <LightbulbIcon
                      weight="fill"
                      className="mt-0.5 size-4 shrink-0"
                    />
                    <span>
                      Czas minął. Podpowiedź: {cel} = {decompose(cel ?? 0)}.
                      Ustaw ją, żeby przejść dalej.
                    </span>
                  </p>
                ) : null}
                {seria.stan === "gra" && !seria.podpowiedz ? (
                  <Progress
                    value={(remaining / limitMs) * 100}
                    aria-label="Pozostały czas"
                  />
                ) : null}
              </div>
              {seria.stan === "trafione" ? null : (
                <div className="flex flex-wrap gap-2">
                  {seria.stan === "gra" ? (
                    <Button variant="outline" disabled>
                      <TimerIcon data-icon="inline-start" />
                      {sekundy(remaining)}
                    </Button>
                  ) : (
                    <>
                      <Button onClick={() => startSerii(liczby)}>
                        <TimerIcon data-icon="inline-start" />
                        {seria.stan === "start" ? "Start" : "Jeszcze raz"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          startSerii(losowaSeria(liczby.length, max))
                        }
                      >
                        <ShuffleIcon data-icon="inline-start" />
                        Losowe liczby
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>

            {liczby.length > 1 && seria.stan !== "koniec" ? (
              <ol
                aria-label="Liczby w serii"
                className="flex flex-wrap gap-1.5"
              >
                {liczby.map((liczba, i) => {
                  const wynik = wyniki[i]
                  const biezaca = seria.stan === "gra" && seria.runda === i
                  return (
                    <li
                      key={i}
                      className={cn(
                        "flex min-w-12 flex-col items-center border px-2 py-1 font-mono text-xs tabular-nums",
                        wynik
                          ? wynik.zPodpowiedzia
                            ? "border-amber bg-amber-soft text-amber-ink"
                            : "border-signal bg-signal-soft text-signal-ink"
                          : biezaca
                            ? "border-foreground font-semibold"
                            : "border-dashed text-muted-foreground"
                      )}
                    >
                      <span className="text-sm">{liczba}</span>
                      <span className="text-[0.625rem]">
                        {wynik
                          ? sekundy(wynik.ms)
                          : biezaca
                            ? "teraz"
                            : "\u00a0"}
                      </span>
                    </li>
                  )
                })}
              </ol>
            ) : null}

            {seria.stan === "koniec" && liczby.length > 1 ? (
              <Table className="font-mono text-xs tabular-nums">
                <TableHeader>
                  <TableRow>
                    <TableHead>liczba</TableHead>
                    <TableHead>dwójkowo</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      suma wag
                    </TableHead>
                    <TableHead className="text-right">czas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wyniki.map((w, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-semibold">
                        {w.liczba}
                      </TableCell>
                      <TableCell>{groupBits(toBin(w.liczba, n))}</TableCell>
                      <TableCell className="hidden whitespace-normal sm:table-cell">
                        {decompose(w.liczba)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right",
                          w.zPodpowiedzia ? "text-amber-ink" : "text-signal-ink"
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          {w.zPodpowiedzia ? (
                            <LightbulbIcon weight="fill" className="size-3.5" />
                          ) : null}
                          {sekundy(w.ms)}
                          {w.zPodpowiedzia ? (
                            <span className="sr-only">, z podpowiedzią</span>
                          ) : null}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : null}

            {seria.stan === "koniec" && wyniki.some((w) => w.zPodpowiedzia) ? (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <LightbulbIcon
                  weight="fill"
                  className="size-3.5 text-amber-ink"
                />
                ustawione po podpowiedzi, czyli po czasie. Spróbuj jeszcze raz!
              </p>
            ) : null}

            {!wSerii ? (
              <Field orientation="horizontal" className="w-fit">
                <Switch
                  id={`${idBazowe}-w-glowie`}
                  checked={wGlowie}
                  onCheckedChange={(c) => setWGlowie(c)}
                />
                <FieldLabel
                  htmlFor={`${idBazowe}-w-glowie`}
                  className="min-h-10 text-sm"
                >
                  Trudniej: ukryj wartość dziesiętną i licz w głowie
                </FieldLabel>
              </Field>
            ) : null}
          </div>
        ) : null}
      </div>
    </Lab>
  )
}

/** Wynik całej serii: ile w limicie czasu i łączny czas. */
function Podsumowanie({ wyniki }: { wyniki: Wynik[] }) {
  const wCzasie = wyniki.filter((w) => !w.zPodpowiedzia).length
  const razem = wyniki.reduce((s, w) => s + w.ms, 0)
  if (wyniki.length === 1) {
    return (
      <span className="flex items-center gap-2 font-medium text-signal-ink">
        <CheckCircleIcon weight="fill" className="size-5" />
        Brawo! {wyniki[0].liczba} w {sekundy(razem)}.
      </span>
    )
  }
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-medium",
        wCzasie === wyniki.length ? "text-signal-ink" : "text-foreground"
      )}
    >
      <TrophyIcon weight="fill" className="size-5 shrink-0" />
      {wCzasie === wyniki.length
        ? `Komplet! Wszystkie ${odmiana(wyniki.length, LICZBY)} w limicie czasu, razem ${sekundy(razem)}.`
        : `Seria ukończona: ${wCzasie} z ${wyniki.length} w limicie czasu, razem ${sekundy(razem)}.`}
    </span>
  )
}

/** 42 → "32 + 8 + 2" */
function decompose(value: number) {
  const parts: number[] = []
  for (let bit = 15; bit >= 0; bit--) {
    if ((value >> bit) & 1) parts.push(2 ** bit)
  }
  return parts.join(" + ") || "0"
}
