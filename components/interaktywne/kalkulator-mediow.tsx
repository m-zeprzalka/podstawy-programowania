"use client"

import * as React from "react"
import {
  ArrowCounterClockwiseIcon,
  FilmStripIcon,
  MusicNotesIcon,
} from "@phosphor-icons/react"

import {
  formatBajty,
  formatBitrate,
  formatCzas,
} from "@/components/interaktywne/liczby-dane"
import { Lab, LabLabel } from "@/components/kurs/lab"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { formatPL } from "@/lib/bity"
import { cn } from "@/lib/utils"

const ROZDZIELCZOSCI = [
  { id: "720p", w: 1280, h: 720, strumien: 3 },
  { id: "1080p", w: 1920, h: 1080, strumien: 5 },
  { id: "1440p", w: 2560, h: 1440, strumien: 9 },
  { id: "4K", w: 3840, h: 2160, strumien: 16 },
] as const

type RozdzielczoscId = (typeof ROZDZIELCZOSCI)[number]["id"]

const BAJTY_NA_PIKSEL = 3
const MP3_KBPS = 128
const FLAC_UDZIAL = 0.6

const DOMYSLNE = {
  rozdzielczosc: "1080p" as RozdzielczoscId,
  fps: 30,
  czasWideo: 60,
  probkowanie: 44100,
  glebia: 16,
  kanaly: 2,
  czasAudio: 60,
}

/** Zaokrąglenie do 2 cyfr znaczących (do „ok. 300×”). */
function okolo(value: number) {
  if (value <= 0) return 0
  const p = 10 ** (Math.floor(Math.log10(value)) - 1)
  return Math.round(value / p) * p
}

/** „≈ 6,2 MB” albo „= 1411,2 kbit/s”, gdy zaokrąglenie jest dokładne. */
function przyblizenie(f: { tekst: string; dokladnie: boolean }) {
  return `${f.dokladnie ? "=" : "≈"} ${f.tekst}`
}

/**
 * Kalkulator rozmiaru nieskompresowanego wideo i audio. Domyślnie: klatka
 * Full HD (6 220 800 B ≈ 6,2 MB), 30 fps, 1 minuta oraz audio CD
 * (1411,2 kbit/s). Jednostki dziesiętne: 1 MB = 10⁶ B.
 *
 * @example <KalkulatorMediow />
 */
export function KalkulatorMediow() {
  const [rozdzielczosc, setRozdzielczosc] = React.useState<RozdzielczoscId>(
    DOMYSLNE.rozdzielczosc
  )
  const [fps, setFps] = React.useState(DOMYSLNE.fps)
  const [czasWideo, setCzasWideo] = React.useState(DOMYSLNE.czasWideo)
  const [probkowanie, setProbkowanie] = React.useState(DOMYSLNE.probkowanie)
  const [glebia, setGlebia] = React.useState(DOMYSLNE.glebia)
  const [kanaly, setKanaly] = React.useState(DOMYSLNE.kanaly)
  const [czasAudio, setCzasAudio] = React.useState(DOMYSLNE.czasAudio)

  const reset = () => {
    setRozdzielczosc(DOMYSLNE.rozdzielczosc)
    setFps(DOMYSLNE.fps)
    setCzasWideo(DOMYSLNE.czasWideo)
    setProbkowanie(DOMYSLNE.probkowanie)
    setGlebia(DOMYSLNE.glebia)
    setKanaly(DOMYSLNE.kanaly)
    setCzasAudio(DOMYSLNE.czasAudio)
  }

  // --- wideo ---
  const r =
    ROZDZIELCZOSCI.find((x) => x.id === rozdzielczosc) ?? ROZDZIELCZOSCI[1]
  const klatka = r.w * r.h * BAJTY_NA_PIKSEL
  const sekundaWideo = klatka * fps
  const caloscWideo = sekundaWideo * czasWideo
  const strumienBity = r.strumien * 1e6
  const strumienBajty = (strumienBity * czasWideo) / 8
  const surowyBitrate = sekundaWideo * 8

  // --- audio ---
  const bitrate = probkowanie * glebia * kanaly
  const sekundaAudio = bitrate / 8
  const caloscAudio = sekundaAudio * czasAudio
  const mp3Bajty = (MP3_KBPS * 1000 * czasAudio) / 8
  const jakoscCD = probkowanie === 44100 && glebia === 16 && kanaly === 2

  return (
    <Lab
      tytul="Ile to waży?"
      opis={
        <>
          Policz rozmiar nieskompresowanego obrazu i dźwięku. Zmień parametry i
          zobacz, dlaczego bez kompresji nie byłoby filmów w sieci.
        </>
      }
      akcje={
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={reset}
          aria-label="Przywróć wartości domyślne"
        >
          <ArrowCounterClockwiseIcon />
        </Button>
      }
      stopka={
        <>
          Jednostki dziesiętne: 1&nbsp;kB = 1000&nbsp;B, 1&nbsp;MB = 10⁶&nbsp;B,
          1&nbsp;GB = 10⁹&nbsp;B.
        </>
      }
    >
      <Tabs defaultValue="wideo" className="gap-4">
        <TabsList className="w-full group-data-horizontal/tabs:h-10">
          <TabsTrigger value="wideo" className="text-sm">
            <FilmStripIcon />
            Wideo
          </TabsTrigger>
          <TabsTrigger value="audio" className="text-sm">
            <MusicNotesIcon />
            Audio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wideo" className="flex flex-col gap-5 text-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <Wybor
              etykieta="Rozdzielczość"
              value={rozdzielczosc}
              onChange={setRozdzielczosc}
              opcje={ROZDZIELCZOSCI.map((x) => ({
                value: x.id,
                label: x.id,
                aria: `${x.id}, ${x.w} na ${x.h} pikseli`,
              }))}
              opis={`${formatPL(r.w)} × ${formatPL(r.h)} pikseli`}
            />
            <Wybor
              etykieta="Klatki na sekundę"
              value={fps}
              onChange={setFps}
              opcje={[24, 30, 60].map((x) => ({
                value: x,
                label: String(x),
                aria: `${x} klatek na sekundę`,
              }))}
              opis={
                fps === 24
                  ? "kino"
                  : fps === 30
                    ? "telewizja, internet"
                    : "gry, sport"
              }
            />
          </div>

          <SuwakCzasu value={czasWideo} onChange={setCzasWideo} />

          <dl aria-live="polite" className="grid gap-px border bg-border">
            <Wiersz
              etykieta={`Klatka · ${BAJTY_NA_PIKSEL} B/piksel`}
              dzialanie={`${formatPL(r.w)} × ${formatPL(r.h)} × ${BAJTY_NA_PIKSEL} B = ${formatPL(klatka)} B`}
              wynik={przyblizenie(formatBajty(klatka))}
            />
            <Wiersz
              etykieta={`Sekunda · ${fps} klatek`}
              dzialanie={`${formatPL(klatka)} B × ${fps} = ${formatPL(sekundaWideo)} B`}
              wynik={`${przyblizenie(formatBajty(sekundaWideo))}/s`}
            />
            <Wiersz
              etykieta={`Całość · ${formatCzas(czasWideo)}`}
              dzialanie={`${formatPL(sekundaWideo)} B × ${formatPL(czasWideo)} s = ${formatPL(caloscWideo)} B`}
              wynik={przyblizenie(formatBajty(caloscWideo))}
              akcent
            />
          </dl>

          <Kompresja
            czas={czasWideo}
            pozycje={[
              {
                nazwa: "Bez kompresji",
                przeplywnosc: formatBitrate(surowyBitrate).tekst,
                bajty: caloscWideo,
              },
              {
                nazwa: `Strumień ${r.id} (H.264/HEVC)`,
                przeplywnosc: `ok.\u00a0${formatPL(r.strumien)}\u00a0Mbit/s`,
                bajty: strumienBajty,
              },
            ]}
            wniosek={`Kompresja stratna zmniejsza to wideo ok. ${formatPL(okolo(surowyBitrate / strumienBity))}×.`}
          />
        </TabsContent>

        <TabsContent value="audio" className="flex flex-col gap-5 text-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <Wybor
              etykieta="Próbkowanie"
              value={probkowanie}
              onChange={setProbkowanie}
              opcje={[
                { value: 44100, label: "44,1 kHz", aria: "44,1 kiloherca" },
                { value: 48000, label: "48 kHz", aria: "48 kiloherców" },
              ]}
              opis={`${formatPL(probkowanie)} próbek/s`}
            />
            <Wybor
              etykieta="Głębia"
              value={glebia}
              onChange={setGlebia}
              opcje={[16, 24].map((x) => ({
                value: x,
                label: `${x} bit`,
                aria: `${x} bitów na próbkę`,
              }))}
              opis={`${glebia / 8} B na próbkę`}
            />
            <Wybor
              etykieta="Kanały"
              value={kanaly}
              onChange={setKanaly}
              opcje={[
                { value: 1, label: "mono", aria: "mono, 1 kanał" },
                { value: 2, label: "stereo", aria: "stereo, 2 kanały" },
              ]}
              opis={kanaly === 1 ? "1 kanał" : "2 kanały"}
            />
          </div>

          <SuwakCzasu value={czasAudio} onChange={setCzasAudio} />

          <dl aria-live="polite" className="grid gap-px border bg-border">
            <Wiersz
              etykieta="Przepływność"
              dzialanie={`${formatPL(probkowanie)} × ${glebia} bit × ${kanaly} = ${formatPL(bitrate)} bit/s`}
              wynik={przyblizenie(formatBitrate(bitrate))}
              dodatek={
                jakoscCD ? (
                  <Badge variant="outline" className="h-6">
                    Jakość CD
                  </Badge>
                ) : null
              }
            />
            <Wiersz
              etykieta="Sekunda"
              dzialanie={`${formatPL(bitrate)} bit ÷ 8 = ${formatPL(sekundaAudio)} B`}
              wynik={`${przyblizenie(formatBajty(sekundaAudio))}/s`}
            />
            <Wiersz
              etykieta={`Całość · ${formatCzas(czasAudio)}`}
              dzialanie={`${formatPL(sekundaAudio)} B × ${formatPL(czasAudio)} s = ${formatPL(caloscAudio)} B`}
              wynik={przyblizenie(formatBajty(caloscAudio))}
              akcent
            />
          </dl>

          <Kompresja
            czas={czasAudio}
            pozycje={[
              {
                nazwa: "Bez kompresji (PCM, WAV)",
                przeplywnosc: formatBitrate(bitrate).tekst,
                bajty: caloscAudio,
              },
              {
                nazwa: "FLAC (bezstratnie)",
                przeplywnosc: `ok.\u00a0${FLAC_UDZIAL * 100}% oryginału`,
                bajty: caloscAudio * FLAC_UDZIAL,
              },
              {
                nazwa: "MP3 (stratnie)",
                przeplywnosc: `${MP3_KBPS}\u00a0kbit/s`,
                bajty: mp3Bajty,
              },
            ]}
            wniosek={`MP3 ${MP3_KBPS} kbit/s jest ok. ${formatPL(okolo(bitrate / (MP3_KBPS * 1000)))}× mniejsze. FLAC oddaje dźwięk co do bitu, ale zysk zależy od nagrania.`}
          />
        </TabsContent>
      </Tabs>
    </Lab>
  )
}

/** Segmentowy przełącznik z etykietą sekcji. */
function Wybor<T extends string | number>({
  etykieta,
  opcje,
  value,
  onChange,
  opis,
}: {
  etykieta: string
  opcje: { value: T; label: string; aria?: string }[]
  value: T
  onChange: (value: T) => void
  opis?: string
}) {
  const id = React.useId()
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <LabLabel id={id}>{etykieta}</LabLabel>
      <ToggleGroup
        aria-labelledby={id}
        variant="outline"
        spacing={0}
        className="w-full"
        value={[String(value)]}
        onValueChange={(v) => {
          const next = opcje.find((o) => String(o.value) === v[0])
          if (next) onChange(next.value)
        }}
      >
        {opcje.map((o) => (
          <ToggleGroupItem
            key={String(o.value)}
            value={String(o.value)}
            aria-label={o.aria}
            className="flex-1 px-2 tabular-nums"
          >
            {o.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {opis ? (
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {opis}
        </p>
      ) : null}
    </div>
  )
}

const CZASY = [
  { s: 1, label: "1 s" },
  { s: 60, label: "1 min" },
  { s: 300, label: "5 min" },
  { s: 600, label: "10 min" },
]

function SuwakCzasu({
  value,
  onChange,
}: {
  value: number
  onChange: (value: number) => void
}) {
  const id = React.useId()
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-2">
        <LabLabel id={id}>Czas nagrania</LabLabel>
        <span className="font-mono text-sm font-medium tabular-nums">
          {formatCzas(value)}
        </span>
      </div>
      <Slider
        aria-labelledby={id}
        min={1}
        max={600}
        step={1}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        className="py-2"
      />
      <div className="flex flex-wrap gap-1.5">
        {CZASY.map((c) => (
          <Button
            key={c.s}
            variant="outline"
            size="sm"
            aria-pressed={value === c.s}
            onClick={() => onChange(c.s)}
            className="h-10 flex-1 tabular-nums aria-pressed:border-foreground/40 aria-pressed:bg-muted md:h-8"
          >
            {c.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

/** Twarda spacja między liczbą a jednostką: „6 220 800 B” nie rozpada się. */
function nielam(tekst: string) {
  return tekst.replace(/(\d) (B|s|bit|bit\/s)(?=$|\s)/g, "$1\u00a0$2")
}

/** Wiersz obliczenia: etykieta, wynik i działanie pod spodem. */
function Wiersz({
  etykieta,
  dzialanie,
  wynik,
  akcent = false,
  dodatek,
}: {
  etykieta: string
  dzialanie: string
  wynik: string
  akcent?: boolean
  dodatek?: React.ReactNode
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1 bg-card px-3 py-2.5">
      <dt className="flex min-w-0 flex-wrap items-center gap-2 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
        {etykieta}
        {dodatek}
      </dt>
      <dd
        className={cn(
          "text-right font-mono text-lg font-medium whitespace-nowrap tabular-nums md:text-xl",
          akcent && "text-signal-ink"
        )}
      >
        {wynik}
      </dd>
      <dd className="col-span-2 font-mono text-xs text-muted-foreground tabular-nums">
        {nielam(dzialanie)}
      </dd>
    </div>
  )
}

/** Porównanie „po kompresji” z paskami proporcjonalnymi do rozmiaru. */
function Kompresja({
  czas,
  pozycje,
  wniosek,
}: {
  czas: number
  pozycje: { nazwa: string; przeplywnosc: string; bajty: number }[]
  wniosek: string
}) {
  const max = Math.max(...pozycje.map((p) => p.bajty))
  return (
    <div className="flex flex-col gap-3 border border-dashed p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <LabLabel>Po kompresji · orientacyjnie</LabLabel>
        <span className="font-mono text-xs text-muted-foreground">
          rozmiar dla {formatCzas(czas)}
        </span>
      </div>
      <ul className="flex flex-col gap-3">
        {pozycje.map((p, i) => (
          <li key={p.nazwa} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm">
                {p.nazwa}{" "}
                <span className="font-mono text-xs text-muted-foreground tabular-nums">
                  · {p.przeplywnosc}
                </span>
              </span>
              <span className="font-mono text-sm font-medium tabular-nums">
                {i === 0 ? "" : "≈ "}
                {formatBajty(p.bajty).tekst}
              </span>
            </div>
            <div className="h-2 bg-muted" aria-hidden>
              <div
                className={cn(
                  "h-full min-w-0.5 transition-[width] duration-300",
                  i === 0 ? "bg-chart-5" : "bg-chart-1"
                )}
                style={{ width: `${(p.bajty / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs/relaxed text-muted-foreground">
        {wniosek} Wartości orientacyjne: zależą od kodeka, treści i ustawień.
      </p>
    </div>
  )
}
