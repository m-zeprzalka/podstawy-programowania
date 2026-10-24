"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon } from "@phosphor-icons/react"

import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { asciiLabel, groupBits, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

/** Adres pierwszej pokazanej komórki (przykładowy adres ze stosu). */
const BAZA = 0x7ffd5c30
/** Przesunięcie, od którego zaczyna się zmienna (0x7FFD5C3A jak w lekcji). */
const START = 0x0a
/** Maksymalna liczba bajtów tekstu (bez NUL). */
const MAKS_BAJTOW = 40
const MIN_KOMOREK = 48

const encoder = new TextEncoder()

type Komorka =
  | { rodzaj: "pusta" }
  | {
      rodzaj: "dane"
      bajt: number
      znak: string
      punkt: number
      /** Numer znaku w napisie (dla grupowania bajtów jednego znaku). */
      nrZnaku: number
      /** Który to bajt znaku (0, 1, …). */
      nrBajtu: number
      bajtowZnaku: number
      /** Indeks w tablicy C, np. napis[2]. */
      indeks: number
    }
  | { rodzaj: "nul"; indeks: number }

type Zmienna = {
  nazwa: string
  deklaracja: string
  tablica: boolean
  komorki: Komorka[]
  znakow: number
  bajtowDanych: number
  wielobajtowe: boolean
}

/** Przycina tekst do limitu bajtów UTF-8, nie rozcinając znaków. */
function przytnij(tekst: string, limit: number) {
  let wynik = ""
  let n = 0
  for (const ch of tekst) {
    const dl = encoder.encode(ch).length
    if (n + dl > limit) break
    wynik += ch
    n += dl
  }
  return wynik
}

function zbudujNapis(tekst: string): Zmienna {
  const komorki: Komorka[] = []
  let nrZnaku = 0
  let wielobajtowe = false
  for (const znak of tekst) {
    const bajty = Array.from(encoder.encode(znak))
    if (bajty.length > 1) wielobajtowe = true
    bajty.forEach((bajt, nrBajtu) => {
      komorki.push({
        rodzaj: "dane",
        bajt,
        znak,
        punkt: znak.codePointAt(0) ?? 0,
        nrZnaku,
        nrBajtu,
        bajtowZnaku: bajty.length,
        indeks: komorki.length,
      })
    })
    nrZnaku++
  }
  const bajtowDanych = komorki.length
  komorki.push({ rodzaj: "nul", indeks: komorki.length })
  const literal = tekst.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
  return {
    nazwa: "napis",
    deklaracja: `char napis[] = "${literal}";`,
    tablica: true,
    komorki,
    znakow: nrZnaku,
    bajtowDanych,
    wielobajtowe,
  }
}

const JEDEN_ZNAK: Zmienna = {
  nazwa: "c",
  deklaracja: "char c = 'H';",
  tablica: false,
  komorki: [
    {
      rodzaj: "dane",
      bajt: 0x48,
      znak: "H",
      punkt: 0x48,
      nrZnaku: 0,
      nrBajtu: 0,
      bajtowZnaku: 1,
      indeks: 0,
    },
  ],
  znakow: 1,
  bajtowDanych: 1,
  wielobajtowe: false,
}

/** Polska odmiana: 1 bajt, 2 bajty, 5 bajtów. */
function odmiana(n: number, jeden: string, kilka: string, wiele: string) {
  if (n === 1) return jeden
  const d = n % 10
  const s = n % 100
  if (d >= 2 && d <= 4 && (s < 12 || s > 14)) return kilka
  return wiele
}

const adres = (offset: number) => `0x${toHex(BAZA + offset, 8)}`
const punktKodowy = (p: number) => `U+${toHex(p, 4)}`
const SUPER = "⁰¹²³⁴⁵⁶⁷⁸⁹"

/** Etykieta znaku w małej komórce. */
function znakWKomorce(k: Extract<Komorka, { rodzaj: "dane" }>) {
  if (k.bajtowZnaku === 1) {
    if (k.bajt === 32) return "␣"
    return asciiLabel(k.bajt)?.length === 1 ? k.znak : "·"
  }
  return `${k.znak}${SUPER[k.nrBajtu + 1] ?? ""}`
}

const MD = "(min-width: 768px)"
function subskrybujMd(cb: () => void) {
  const mql = window.matchMedia(MD)
  mql.addEventListener("change", cb)
  return () => mql.removeEventListener("change", cb)
}
/** true od breakpointu md (na serwerze i przy hydratacji: false). */
function useSzeroki() {
  return React.useSyncExternalStore(
    subskrybujMd,
    () => window.matchMedia(MD).matches,
    () => false
  )
}

/**
 * Pamięć jako rząd ponumerowanych „szufladek” po 1 bajcie. Wpisany tekst
 * trafia bajt po bajcie (UTF-8) do kolejnych komórek, a na końcu ląduje
 * bajt 0x00 (NUL), czyli koniec napisu w C.
 *
 * @example <Pamiec tekst="HI!" />
 */
export function Pamiec({
  tekst = "HI!",
  tytul = "Pamięć: szufladki z adresami",
}: {
  /** Tekst początkowy (maks. 40 bajtów UTF-8). */
  tekst?: string
  tytul?: string
}) {
  const poczatkowy = React.useMemo(() => przytnij(tekst, MAKS_BAJTOW), [tekst])
  const [napis, setNapis] = React.useState(poczatkowy)
  const [jedenZnak, setJedenZnak] = React.useState(false)
  const [wybrana, setWybrana] = React.useState(START)
  const [podglad, setPodglad] = React.useState<number | null>(null)
  const komorkiRef = React.useRef<(HTMLButtonElement | null)[]>([])
  const inputId = React.useId()

  const szeroki = useSzeroki()
  const kolumny = szeroki ? 16 : 8

  const zmienna = React.useMemo(
    () => (jedenZnak ? JEDEN_ZNAK : zbudujNapis(napis)),
    [jedenZnak, napis]
  )
  const dlugosc = zmienna.komorki.length
  const razem = Math.max(
    MIN_KOMOREK,
    Math.ceil((START + dlugosc + 2) / 16) * 16
  )
  const wiersze = razem / kolumny

  const komorka = (i: number): Komorka =>
    i >= START && i < START + dlugosc
      ? zmienna.komorki[i - START]
      : { rodzaj: "pusta" }

  const wybranaBezp = Math.min(wybrana, razem - 1)
  const pokazana = podglad ?? wybranaBezp
  const pk = komorka(pokazana)

  const reset = () => {
    setNapis(poczatkowy)
    setJedenZnak(false)
    setWybrana(START)
    setPodglad(null)
  }

  const przejdz = (i: number) => {
    const cel = Math.max(0, Math.min(razem - 1, i))
    setWybrana(cel)
    setPodglad(null)
    komorkiRef.current[cel]?.focus()
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    const ruchy: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -kolumny,
      ArrowDown: kolumny,
    }
    if (e.key in ruchy) {
      e.preventDefault()
      przejdz(wybranaBezp + ruchy[e.key])
    } else if (e.key === "Home") {
      e.preventDefault()
      przejdz(0)
    } else if (e.key === "End") {
      e.preventDefault()
      przejdz(razem - 1)
    }
  }

  // Szerokość szablonu: kolumna adresu + komórki.
  const szablon = {
    gridTemplateColumns: `${szeroki ? "5.25rem" : "2.75rem"} repeat(${kolumny}, minmax(0, 1fr))`,
  } as React.CSSProperties

  // Odcinki zmiennej w każdym wierszu (do etykiety nad zakresem).
  const odcinek = (w: number) => {
    const od = Math.max(START, w * kolumny)
    const doo = Math.min(START + dlugosc, (w + 1) * kolumny)
    if (od >= doo) return null
    return { kol: od - w * kolumny, dl: doo - od, pierwszy: od === START }
  }

  // Czy pełna deklaracja zmieści się nad pierwszym odcinkiem (w przybliżeniu).
  const deklaracjaNadSiatka =
    zmienna.deklaracja.length >
    (kolumny - (START % kolumny)) * (szeroki ? 4.4 : 4.8)

  const bajtowRazem = dlugosc
  const podsumowanie = zmienna.tablica
    ? `${zmienna.znakow} ${odmiana(zmienna.znakow, "znak", "znaki", "znaków")} → ${zmienna.bajtowDanych} ${odmiana(zmienna.bajtowDanych, "bajt", "bajty", "bajtów")} + 1 bajt NUL = ${bajtowRazem} ${odmiana(bajtowRazem, "bajt", "bajty", "bajtów")}`
    : "1 znak → 1 bajt, bez NUL"

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Pamięć to rząd ponumerowanych szufladek po 1 bajcie, a numer szufladki
          to jej adres (zapisywany szesnastkowo). Wpisz tekst: jego bajty UTF-8
          trafią do kolejnych komórek. Dotknij komórki lub najedź na nią, żeby
          zobaczyć szczegóły.
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
      stopka="Adresy są przykładowe: prawdziwy program dostaje je od systemu operacyjnego."
    >
      <div className="flex flex-col gap-5">
        {/* Sterowanie */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <Field className="flex-1">
            <FieldLabel htmlFor={inputId} className="text-sm font-medium">
              Tekst w napisie
            </FieldLabel>
            <Input
              id={inputId}
              value={napis}
              onChange={(e) => setNapis(przytnij(e.target.value, MAKS_BAJTOW))}
              disabled={jedenZnak}
              spellCheck={false}
              autoComplete="off"
              className="h-10 font-mono text-base md:h-9 md:text-sm"
              aria-describedby={`${inputId}-opis`}
            />
            <FieldDescription
              id={`${inputId}-opis`}
              className="font-mono tabular-nums"
            >
              {zmienna.tablica
                ? zmienna.bajtowDanych
                : encoder.encode(napis).length}{" "}
              / {MAKS_BAJTOW} B · litery ASCII: 1 bajt, polskie: 2 bajty
            </FieldDescription>
          </Field>
          <label className="flex min-h-10 cursor-pointer items-center gap-3 sm:pb-6">
            <Switch
              checked={jedenZnak}
              onCheckedChange={(v) => {
                setJedenZnak(v)
                setWybrana(START)
                setPodglad(null)
              }}
            />
            <span className="text-sm">
              Jeden znak:{" "}
              <code className="font-mono text-[0.8125rem]">
                char c = &apos;H&apos;;
              </code>
            </span>
          </label>
        </div>

        {/* Siatka pamięci */}
        <div className="flex flex-col gap-2">
          <LabLabel>Pamięć RAM (1 komórka = 1 bajt)</LabLabel>
          {deklaracjaNadSiatka ? (
            <code className="border-l-2 border-signal bg-signal-soft px-2.5 py-1.5 font-mono text-xs font-semibold break-all text-signal-ink">
              {zmienna.deklaracja}
            </code>
          ) : null}
          <div
            role="group"
            aria-label={`Pamięć: ${razem} komórek od adresu ${adres(0)}. Strzałki przechodzą między komórkami.`}
            onKeyDown={onKeyDown}
            onPointerLeave={() => setPodglad(null)}
            className="flex flex-col"
          >
            {/* Nagłówek z przesunięciami */}
            <div className="grid gap-0.5 pb-1" style={szablon} aria-hidden>
              <span />
              {Array.from({ length: kolumny }, (_, k) => (
                <span
                  key={k}
                  className="text-center font-mono text-[0.625rem] text-muted-foreground/80 tabular-nums"
                >
                  +{toHex(k, 1)}
                </span>
              ))}
            </div>

            {Array.from({ length: wiersze }, (_, w) => {
              const o = odcinek(w)
              const etykieta =
                o && o.pierwszy
                  ? deklaracjaNadSiatka
                    ? zmienna.nazwa
                    : zmienna.deklaracja
                  : `${zmienna.nazwa} (cd.)`
              return (
                <React.Fragment key={w}>
                  {o ? (
                    <div
                      className="mt-1.5 grid grid-rows-[auto_auto] gap-x-0.5"
                      style={szablon}
                      aria-hidden
                    >
                      <span
                        className="truncate pb-0.5 font-mono text-[0.6875rem] font-semibold text-signal-ink"
                        style={{ gridColumn: `${o.kol + 2} / -1`, gridRow: 1 }}
                      >
                        {etykieta}
                      </span>
                      <span
                        className="h-1.5 border-x-2 border-t-2 border-signal"
                        style={{
                          gridColumn: `${o.kol + 2} / span ${o.dl}`,
                          gridRow: 2,
                        }}
                      />
                    </div>
                  ) : null}
                  <div className="grid gap-0.5 py-px" style={szablon}>
                    <span
                      className="flex flex-col justify-center pr-1 font-mono text-[0.625rem] leading-tight text-muted-foreground tabular-nums md:text-[0.6875rem]"
                      aria-hidden
                    >
                      {szeroki ? (
                        <span>
                          <span className="opacity-70">
                            0x{toHex(BAZA + w * kolumny, 8).slice(0, 4)}
                          </span>
                          {toHex(BAZA + w * kolumny, 8).slice(4)}
                        </span>
                      ) : (
                        <>
                          <span className="opacity-70">
                            0x{toHex(BAZA + w * kolumny, 8).slice(0, 4)}
                          </span>
                          <span>{toHex(BAZA + w * kolumny, 8).slice(4)}</span>
                        </>
                      )}
                    </span>
                    {Array.from({ length: kolumny }, (_, k) => {
                      const i = w * kolumny + k
                      const kom = komorka(i)
                      const pokaz = i === pokazana
                      const rodzenstwo =
                        !pokaz &&
                        kom.rodzaj === "dane" &&
                        pk.rodzaj === "dane" &&
                        pk.bajtowZnaku > 1 &&
                        kom.nrZnaku === pk.nrZnaku
                      return (
                        <button
                          key={i}
                          ref={(el) => {
                            komorkiRef.current[i] = el
                          }}
                          type="button"
                          tabIndex={i === wybranaBezp ? 0 : -1}
                          aria-pressed={i === wybranaBezp}
                          aria-label={opisKomorki(i, kom, zmienna)}
                          onClick={() => {
                            setWybrana(i)
                            setPodglad(null)
                          }}
                          onFocus={() => setWybrana(i)}
                          onPointerEnter={(e) => {
                            if (e.pointerType === "mouse") setPodglad(i)
                          }}
                          className={cn(
                            "relative flex h-11 min-w-0 flex-col items-center justify-center border font-mono text-[0.8125rem] leading-none font-medium tabular-nums transition-colors duration-150 select-none md:h-10",
                            kom.rodzaj === "pusta" &&
                              "border-dashed border-input bg-background text-muted-foreground/50 hover:border-foreground/40",
                            kom.rodzaj === "dane" &&
                              "border-signal/50 bg-signal-soft text-foreground",
                            kom.rodzaj === "nul" &&
                              "border-amber bg-amber-soft text-amber-ink",
                            pokaz &&
                              "z-10 outline-2 -outline-offset-1 outline-foreground",
                            rodzenstwo &&
                              "z-10 outline-1 -outline-offset-1 outline-foreground outline-dashed"
                          )}
                        >
                          {kom.rodzaj === "pusta" ? (
                            <span aria-hidden>··</span>
                          ) : (
                            <>
                              <span>
                                {kom.rodzaj === "dane" ? toHex(kom.bajt) : "00"}
                              </span>
                              <span
                                className={cn(
                                  "mt-1 max-w-full truncate px-px text-[0.625rem] font-normal",
                                  kom.rodzaj === "dane"
                                    ? "text-signal-ink"
                                    : "text-amber-ink"
                                )}
                                aria-hidden
                              >
                                {kom.rodzaj === "dane"
                                  ? znakWKomorce(kom)
                                  : "\\0"}
                              </span>
                            </>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </React.Fragment>
              )
            })}
          </div>

          {/* Legenda */}
          <ul
            className="flex flex-wrap gap-x-4 gap-y-1.5 pt-1 text-xs text-muted-foreground"
            aria-label="Legenda"
          >
            <li className="flex items-center gap-1.5">
              <span
                className="size-3 border border-signal/50 bg-signal-soft"
                aria-hidden
              />
              {zmienna.tablica ? "bajty napisu" : "bajt zmiennej c"}
            </li>
            {zmienna.tablica ? (
              <li className="flex items-center gap-1.5">
                <span
                  className="size-3 border border-amber bg-amber-soft"
                  aria-hidden
                />
                koniec napisu (NUL, 0x00)
              </li>
            ) : null}
            <li className="flex items-center gap-1.5">
              <span
                className="size-3 border border-dashed border-input bg-background"
                aria-hidden
              />
              cudza szufladka (nieznana zawartość)
            </li>
          </ul>
        </div>

        {/* Panel szczegółów */}
        <div className="flex flex-col gap-2 border bg-muted/30 p-3">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <LabLabel>Adres</LabLabel>
            <span className="font-mono text-base font-semibold tabular-nums md:text-lg">
              {adres(pokazana)}
            </span>
            <span
              className={cn(
                "font-mono text-xs",
                pk.rodzaj === "pusta"
                  ? "text-muted-foreground"
                  : "text-signal-ink"
              )}
            >
              {pk.rodzaj === "pusta"
                ? "poza zmienną"
                : zmienna.tablica
                  ? `${zmienna.nazwa}[${pk.indeks}]`
                  : zmienna.nazwa}
            </span>
          </div>
          <LabReadouts className="sm:grid-cols-4">
            <LabReadout
              label="DEC"
              value={
                pk.rodzaj === "dane" ? pk.bajt : pk.rodzaj === "nul" ? 0 : "?"
              }
              accent={pk.rodzaj !== "pusta"}
            />
            <LabReadout
              label="HEX"
              value={
                pk.rodzaj === "dane"
                  ? `0x${toHex(pk.bajt)}`
                  : pk.rodzaj === "nul"
                    ? "0x00"
                    : "?"
              }
            />
            <LabReadout
              label="BIN"
              value={
                <span className="text-base md:text-lg">
                  {pk.rodzaj === "dane"
                    ? groupBits(toBin(pk.bajt))
                    : pk.rodzaj === "nul"
                      ? "0000 0000"
                      : "???? ????"}
                </span>
              }
            />
            <LabReadout
              label="Znak"
              value={
                pk.rodzaj === "dane"
                  ? pk.bajtowZnaku === 1
                    ? (asciiLabel(pk.bajt) ?? pk.znak)
                    : pk.znak
                  : pk.rodzaj === "nul"
                    ? "NUL"
                    : "?"
              }
              hint={
                pk.rodzaj === "dane"
                  ? pk.bajtowZnaku > 1
                    ? `bajt ${pk.nrBajtu + 1} z ${pk.bajtowZnaku}`
                    : "ASCII, 1 bajt"
                  : pk.rodzaj === "nul"
                    ? "\\0, koniec napisu"
                    : "nieznany"
              }
            />
          </LabReadouts>
          <p className="text-sm/relaxed text-muted-foreground">
            <NotkaKomorki k={pk} zmienna={zmienna} />
          </p>
        </div>

        {/* Podsumowanie */}
        <div
          aria-live="polite"
          className="flex flex-col gap-1 border-l-2 border-signal pl-3 text-sm"
        >
          <p>
            <code className="font-mono font-semibold">
              sizeof({zmienna.nazwa}) = {bajtowRazem}
            </code>{" "}
            <span className="text-muted-foreground">({podsumowanie})</span>
          </p>
          <p className="text-muted-foreground">
            {jedenZnak
              ? "Znak w apostrofach to jedna szufladka. Napis w cudzysłowie zawsze kończy się dodatkowym bajtem 0x00."
              : zmienna.wielobajtowe
                ? "Polskie litery zajmują w UTF-8 po 2 bajty (emoji nawet 4), więc bajtów jest więcej niż znaków."
                : "Bajt 0x00 na końcu to znacznik końca napisu: tak C wie, gdzie napis się kończy."}
          </p>
        </div>
      </div>
    </Lab>
  )
}

function opisKomorki(i: number, k: Komorka, z: Zmienna) {
  const a = adres(i)
  if (k.rodzaj === "pusta") return `${a}: poza zmienną, zawartość nieznana`
  const nazwa = z.tablica ? `${z.nazwa}[${k.indeks}]` : z.nazwa
  if (k.rodzaj === "nul") return `${a}, ${nazwa}: 0x00, koniec napisu (NUL)`
  const znak =
    k.bajtowZnaku === 1
      ? `znak ${asciiLabel(k.bajt) ?? k.znak}`
      : `bajt ${k.nrBajtu + 1} z ${k.bajtowZnaku} znaku ${k.znak}`
  return `${a}, ${nazwa}: 0x${toHex(k.bajt)}, ${znak}`
}

function NotkaKomorki({ k, zmienna }: { k: Komorka; zmienna: Zmienna }) {
  if (k.rodzaj === "pusta")
    return (
      <>
        Ta szufladka nie należy do zmiennej{" "}
        <code className="font-mono text-foreground">{zmienna.nazwa}</code>. W
        prawdziwej pamięci może w niej leżeć cokolwiek (tzw. śmieci).
      </>
    )
  if (k.rodzaj === "nul")
    return (
      <>
        Bajt <code className="font-mono text-foreground">0x00</code> (NUL) to
        znacznik końca napisu. Dzięki niemu funkcje w C, np.{" "}
        <code className="font-mono text-foreground">printf</code>, wiedzą, gdzie
        przestać czytać.
      </>
    )
  if (k.bajtowZnaku > 1) {
    const bajty = Array.from(encoder.encode(k.znak))
      .map((b) => toHex(b))
      .join(" ")
    return (
      <>
        <span className="font-medium text-foreground">„{k.znak}”</span> (
        {punktKodowy(k.punkt)}) w UTF-8 zajmuje {k.bajtowZnaku}{" "}
        {odmiana(k.bajtowZnaku, "bajt", "bajty", "bajtów")}:{" "}
        <code className="font-mono text-foreground">{bajty}</code>. To bajt{" "}
        {k.nrBajtu + 1} z {k.bajtowZnaku}; sam w sobie nie jest znakiem ASCII.
      </>
    )
  }
  return (
    <>
      {zmienna.tablica ? (
        <>
          Element{" "}
          <code className="font-mono text-foreground">
            {zmienna.nazwa}[{k.indeks}]
          </code>
          {": "}
        </>
      ) : (
        <>
          Zmienna <code className="font-mono text-foreground">c</code> to
          nazwana szufladka:{" "}
        </>
      )}
      znak <span className="font-medium text-foreground">„{k.znak}”</span> ma
      kod ASCII {k.bajt}, czyli{" "}
      <code className="font-mono text-foreground">0x{toHex(k.bajt)}</code>, i
      mieści się w 1 bajcie.
    </>
  )
}
