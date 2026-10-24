"use client"

import * as React from "react"
import { ArrowCounterClockwiseIcon, ShuffleIcon } from "@phosphor-icons/react"

import { Lab, LabLabel, LabReadout, LabReadouts } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { asciiLabel, formatPL, toBin, toHex } from "@/lib/bity"
import { cn } from "@/lib/utils"

type Rgb = readonly [number, number, number]

const KANALY = [
  { klucz: "R", nazwa: "czerwony", maska: [1, 0, 0] },
  { klucz: "G", nazwa: "zielony", maska: [0, 1, 0] },
  { klucz: "B", nazwa: "niebieski", maska: [0, 0, 1] },
] as const

const PRESETY: readonly { nazwa: string; rgb: Rgb }[] = [
  { nazwa: "„HI!”", rgb: [72, 73, 33] },
  { nazwa: "#FF5733", rgb: [255, 87, 51] },
  { nazwa: "Czerwony", rgb: [255, 0, 0] },
  { nazwa: "Zielony", rgb: [0, 255, 0] },
  { nazwa: "Niebieski", rgb: [0, 0, 255] },
  { nazwa: "Biały", rgb: [255, 255, 255] },
  { nazwa: "Czarny", rgb: [0, 0, 0] },
]

const ogranicz = (n: number) =>
  Number.isFinite(n) ? Math.min(255, Math.max(0, Math.round(n))) : 0

const hex = (rgb: Rgb) => `#${rgb.map((v) => toHex(v)).join("")}`
const css = (rgb: Rgb) => `rgb(${rgb.join(", ")})`

/** Luminancja względna (WCAG 2). */
function luminancja(rgb: Rgb) {
  const [r, g, b] = rgb.map((v) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Jasność postrzegana L* (CIELAB), 0–100. */
function jasnosc(rgb: Rgb) {
  const y = luminancja(rgb)
  const l = y <= 216 / 24389 ? (y * 24389) / 27 : 116 * Math.cbrt(y) - 16
  return Math.round(l)
}

/** Czarny albo biały tekst, zależnie od tego, który ma większy kontrast. */
function kolorTekstu(rgb: Rgb) {
  const l = luminancja(rgb)
  return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#000000" : "#ffffff"
}

/** „#FF5733”, „ff5733”, „#f53” → [255, 87, 51] albo null. */
function parsujHex(wejscie: string): Rgb | null {
  const s = wejscie.trim().replace(/^#/, "")
  if (/^[0-9a-f]{6}$/i.test(s))
    return [0, 2, 4].map((i) =>
      parseInt(s.slice(i, i + 2), 16)
    ) as unknown as Rgb
  if (/^[0-9a-f]{3}$/i.test(s))
    return [0, 1, 2].map((i) => parseInt(s[i] + s[i], 16)) as unknown as Rgb
  return null
}

/** Znak ASCII dla kanału: znak drukowalny (32–126, spacja jako ␣) albo „—”. */
function znakAscii(v: number) {
  if (v === 32) return "␣"
  if (v > 32 && v < 127) return asciiLabel(v) ?? "—"
  return "—"
}

/**
 * Suwaki RGB: trzy bajty (0–255) składają się na kolor. Pokazuje HEX, zapis
 * CSS, bity każdego kanału i (po włączeniu) te same bajty jako znaki ASCII.
 *
 * @example <SuwakiRgb r={72} g={73} b={33} />
 */
export function SuwakiRgb({
  r = 72,
  g = 73,
  b = 33,
  tytul = "Suwaki RGB",
}: {
  /** Czerwony 0–255. */
  r?: number
  /** Zielony 0–255. */
  g?: number
  /** Niebieski 0–255. */
  b?: number
  tytul?: string
}) {
  const startowy: Rgb = [ogranicz(r), ogranicz(g), ogranicz(b)]
  const idBazowe = React.useId()
  const [rgb, setRgb] = React.useState<Rgb>(startowy)
  const [ascii, setAscii] = React.useState(false)

  const ustawKanal = (i: number, v: number) =>
    setRgb((prev) => {
      const nowy = [...prev] as [number, number, number]
      nowy[i] = ogranicz(v)
      return nowy
    })

  const kolor = css(rgb)
  const tekstNaProbce = kolorTekstu(rgb)
  const l = jasnosc(rgb)
  const czyHi = rgb[0] === 72 && rgb[1] === 73 && rgb[2] === 33

  return (
    <Lab
      tytul={tytul}
      opis={
        <>
          Kolor piksela to trzy bajty: ile czerwieni (R), zieleni (G) i
          niebieskiego (B), każdy od 0 do 255.
        </>
      }
      akcje={
        <>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setRgb(
                [0, 1, 2].map(() =>
                  Math.floor(Math.random() * 256)
                ) as unknown as Rgb
              )
            }
            aria-label="Losowy kolor"
          >
            <ShuffleIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              setRgb(startowy)
              setAscii(false)
            }}
            aria-label="Przywróć przykład"
          >
            <ArrowCounterClockwiseIcon />
          </Button>
        </>
      }
      stopka={
        <>
          256 × 256 × 256 = 256³ = {formatPL(256 ** 3)} kolorów (3 bajty = 24
          bity na piksel).
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div
          className="flex min-h-36 flex-col justify-between gap-4 border p-3 sm:min-h-44 sm:p-4"
          style={{ backgroundColor: kolor, color: tekstNaProbce }}
          role="img"
          aria-label={`Próbka koloru ${hex(rgb)}`}
        >
          <span className="font-mono text-xs font-medium tracking-widest uppercase opacity-80">
            Próbka
          </span>
          <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
            <span className="font-mono text-3xl font-semibold tabular-nums sm:text-4xl">
              {hex(rgb)}
            </span>
            {ascii ? (
              <span className="font-mono text-3xl font-semibold sm:text-4xl">
                {rgb.map(znakAscii).join(" ")}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {KANALY.map((k, i) => {
            const v = rgb[i]
            const idEtykiety = `${idBazowe}-${k.klucz}`
            const kanalSam = css(k.maska.map((m) => m * v) as unknown as Rgb)
            return (
              <div key={k.klucz} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-3">
                  <span
                    id={idEtykiety}
                    className="flex w-6 shrink-0 items-center font-mono text-sm font-semibold"
                  >
                    <span className="sr-only">Kanał {k.nazwa} </span>
                    <span aria-hidden>{k.klucz}</span>
                  </span>
                  <Slider
                    value={v}
                    onValueChange={(x) => ustawKanal(i, x as number)}
                    min={0}
                    max={255}
                    aria-labelledby={idEtykiety}
                    className="min-w-0 flex-1 *:first:h-10 [&_[data-slot=slider-thumb]]:size-5 [&_[data-slot=slider-track]]:h-1.5"
                  />
                  <PoleLiczby
                    wartosc={v}
                    onZmiana={(n) => ustawKanal(i, n)}
                    etykieta={`Kanał ${k.nazwa}, 0–255`}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-9 font-mono text-xs tabular-nums">
                  <span
                    aria-hidden
                    className="size-3.5 shrink-0 border"
                    style={{ backgroundColor: kanalSam }}
                  />
                  <span aria-label={`dwójkowo ${toBin(v, 8)}`}>
                    {toBin(v, 8)
                      .split("")
                      .map((bit, j) => (
                        <span
                          key={j}
                          aria-hidden
                          className={cn(
                            j === 4 && "ml-1",
                            bit === "1"
                              ? "font-semibold text-signal-ink"
                              : "text-muted-foreground"
                          )}
                        >
                          {bit}
                        </span>
                      ))}
                  </span>
                  <span className="text-muted-foreground">0x{toHex(v)}</span>
                  {ascii ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="text-muted-foreground">ASCII</span>
                      <span
                        className={cn(
                          "inline-flex h-5 min-w-5 items-center justify-center border px-1 font-semibold",
                          znakAscii(v) === "—"
                            ? "border-dashed text-muted-foreground"
                            : "border-signal bg-signal-soft text-signal-ink"
                        )}
                      >
                        {znakAscii(v)}
                      </span>
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <PoleHex rgb={rgb} onZmiana={setRgb} />
          <Field orientation="horizontal" className="w-fit">
            <Switch
              id={`${idBazowe}-ascii`}
              checked={ascii}
              onCheckedChange={(c) => setAscii(c)}
            />
            <FieldLabel
              htmlFor={`${idBazowe}-ascii`}
              className="min-h-10 text-sm"
            >
              Pokaż jako ASCII
            </FieldLabel>
          </Field>
        </div>

        {ascii ? (
          <div className="flex flex-col gap-2 border border-signal/50 bg-signal-soft p-3">
            <LabLabel>Te same bajty jako tekst</LabLabel>
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {rgb.map((v, i) => (
                <React.Fragment key={i}>
                  {i > 0 ? " " : ""}
                  <span
                    className={
                      znakAscii(v) === "—" ? "text-muted-foreground" : ""
                    }
                  >
                    {znakAscii(v)}
                  </span>
                </React.Fragment>
              ))}
            </p>
            <p className="text-sm text-muted-foreground">
              {rgb.join(" ")}: dla programu graficznego to kolor, dla edytora
              tekstu znaki. Znaczenie bajtów zależy od tego, kto je czyta. Poza
              zakresem drukowalnym (32–126) widać „—”.
            </p>
          </div>
        ) : null}

        <LabReadouts aria-live="polite" className="sm:grid-cols-3">
          <LabReadout label="HEX" value={hex(rgb)} accent />
          <LabReadout
            label="Jasność"
            value={`${l}/100`}
            hint={l < 40 ? "ciemny" : l < 70 ? "średni" : "jasny"}
            className="sm:order-last"
          />
          <LabReadout
            label="CSS"
            value={<span className="text-base">{kolor}</span>}
            hint="3 bajty = 24 bity"
            className="col-span-2 sm:col-span-1"
          />
        </LabReadouts>

        <div className="flex flex-col gap-2">
          <LabLabel>Gotowe kolory</LabLabel>
          <div className="flex flex-wrap gap-2">
            {PRESETY.map((p) => {
              const wl =
                p.rgb[0] === rgb[0] &&
                p.rgb[1] === rgb[1] &&
                p.rgb[2] === rgb[2]
              return (
                <Button
                  key={p.nazwa}
                  variant={wl ? "default" : "outline"}
                  aria-pressed={wl}
                  onClick={() => setRgb(p.rgb)}
                >
                  <span
                    aria-hidden
                    className="size-4 shrink-0 border border-foreground/20"
                    style={{ backgroundColor: css(p.rgb) }}
                  />
                  {p.nazwa}
                </Button>
              )
            })}
          </div>
        </div>

        <p
          className={cn(
            "border-l-2 px-3 py-2 text-sm/relaxed",
            czyHi ? "border-amber bg-amber-soft" : "border-border bg-muted/40"
          )}
        >
          <span className="font-medium">Jasny czy ciemny?</span> Przy
          wartościach ≤ 73 z 255 wszystkie kanały świecą słabo, więc kolor{" "}
          <span className="font-mono">#484921</span> jest{" "}
          <strong className="font-semibold">ciemny, oliwkowy</strong>. Co widać
          na próbce?
        </p>
      </div>
    </Lab>
  )
}

/** Pole liczbowe 0–255 z wersją roboczą (można je na chwilę wyczyścić). */
function PoleLiczby({
  wartosc,
  onZmiana,
  etykieta,
}: {
  wartosc: number
  onZmiana: (n: number) => void
  etykieta: string
}) {
  const [robocza, setRobocza] = React.useState<string | null>(null)
  return (
    <Input
      type="number"
      inputMode="numeric"
      min={0}
      max={255}
      step={1}
      aria-label={etykieta}
      value={robocza ?? String(wartosc)}
      onChange={(e) => {
        const s = e.target.value
        setRobocza(s)
        if (s.trim() !== "" && Number.isFinite(Number(s))) onZmiana(Number(s))
      }}
      onBlur={() => setRobocza(null)}
      className="h-10 w-18 shrink-0 text-center font-mono text-base tabular-nums md:text-sm"
    />
  )
}

/** Pole HEX: wpisz #RRGGBB (albo #RGB). */
function PoleHex({
  rgb,
  onZmiana,
}: {
  rgb: Rgb
  onZmiana: (rgb: Rgb) => void
}) {
  const id = React.useId()
  const [robocza, setRobocza] = React.useState<string | null>(null)
  const blad = robocza !== null && parsujHex(robocza) === null
  return (
    <Field className="w-full sm:w-48" data-invalid={blad || undefined}>
      <FieldLabel htmlFor={id}>Wpisz HEX</FieldLabel>
      <Input
        id={id}
        value={robocza ?? hex(rgb)}
        maxLength={7}
        spellCheck={false}
        autoComplete="off"
        aria-invalid={blad || undefined}
        onChange={(e) => {
          const s = e.target.value
          setRobocza(s)
          const wynik = parsujHex(s)
          if (wynik) onZmiana(wynik)
        }}
        onBlur={() => setRobocza(null)}
        className="h-10 font-mono text-base uppercase md:text-sm"
      />
    </Field>
  )
}
