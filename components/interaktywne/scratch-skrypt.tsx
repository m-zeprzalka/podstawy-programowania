"use client"

import * as React from "react"
import {
  CaretDownIcon,
  CheckIcon,
  CodeIcon,
  CopyIcon,
  FlagIcon,
  PuzzlePieceIcon,
} from "@phosphor-icons/react"

import { Lab } from "@/components/kurs/lab"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  PrzelacznikJezyka,
  useJezykScratcha,
  type JezykScratcha,
} from "./scratch-jezyk"
import { KATEGORIE, POCHODNE, type KategoriaScratch } from "./scratch-kategorie"
import {
  parsujSkrypt,
  type ElementScratch,
  type KomentarzScratch,
  type SkryptScratch,
  type StosScratch,
  type WezelScratch,
} from "./scratch-skladnia"

const DOMYSLNY_KOD = `kiedy kliknięto zieloną flagę
powiedz [Witaj, świecie!]`

/* ---------- Wygląd bloków (Scratch 3.0, czysty HTML/CSS) ---------- */

/** Język nazw kategorii (podpowiedzi i legenda). */
const JezykBlokow = React.createContext<JezykScratcha>("pl")

function useNazwaKategorii(kat: KategoriaScratch) {
  const jezyk = React.useContext(JezykBlokow)
  return jezyk === "en" ? KATEGORIE[kat].en : KATEGORIE[kat].nazwa
}

/** Zmienne koloru kategorii: `--sb`, `--sb-c`, `--sb-m`, `--sb-t`. */
const kolory = (kat: KategoriaScratch) =>
  `${KATEGORIE[kat].zmienne} ${POCHODNE}`

/** Biały, pogrubiony tekst z ciemną poświatą — czytelny także na żółtych blokach. */
const TEKST =
  "font-sans text-[0.8125rem] leading-none font-semibold whitespace-nowrap text-white [text-shadow:0_0_1px_var(--sb-t),0_1px_1px_var(--sb-t)]"

const KORPUS =
  "flex min-h-10 items-center gap-1.5 border border-(--sb-c) bg-(--sb) px-2.5 py-1.5"

/** Wcięcie u góry pierwszego bloku stosu (tam wchodzi wypust bloku powyżej). */
const WCIECIE =
  "[clip-path:polygon(0_0,12px_0,15px_0.5px,17px_2px,20px_5px,22px_6px,34px_6px,36px_5px,39px_2px,41px_0.5px,44px_0,100%_0,100%_100%,0_100%)]"
const WYPUST_PUNKTY = "0,0 3,0.5 5,2 8,5 10,6 22,6 24,5 27,2 29,0.5 32,0"

const SZESCIOKAT =
  "[clip-path:polygon(0_50%,12px_0,calc(100%_-_12px)_0,100%_50%,calc(100%_-_12px)_100%,12px_100%)]"

/** Pola zawsze białe z ciemnym tekstem — jak w edytorze, w obu motywach. */
const POLE_TEKST =
  "font-medium text-[color-mix(in_oklch,var(--color-scratch-ruch)_26%,black)] [text-shadow:none]"

/** Dolny wypust bloku (z obwódką); nakłada się na wcięcie bloku poniżej. */
function Wypust({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      width="32"
      height="6"
      viewBox="0 0 32 6"
      className={cn(
        "pointer-events-none absolute left-3 z-[1] overflow-visible",
        className
      )}
    >
      <polygon points={WYPUST_PUNKTY} className="fill-(--sb)" />
      <polyline
        points={WYPUST_PUNKTY}
        className="fill-none stroke-(--sb-c)"
        strokeWidth={1}
      />
    </svg>
  )
}

/** Obwódka wcięcia u góry pierwszego bloku stosu. */
function Wciecie() {
  return (
    <svg
      aria-hidden
      width="32"
      height="6"
      viewBox="0 0 32 6"
      className="pointer-events-none absolute top-0 left-3 overflow-visible"
    >
      <polyline
        points={WYPUST_PUNKTY}
        className="fill-none stroke-(--sb-c)"
        strokeWidth={1}
      />
    </svg>
  )
}

/** Żółta karteczka obok bloku (szeroki kontener) lub numerek (wąski). */
function Komentarz({ k }: { k: KomentarzScratch }) {
  return (
    <>
      <span className="absolute top-1/2 left-full z-[2] ml-2 hidden -translate-y-1/2 items-center @lg:flex">
        <span aria-hidden className="h-px w-4 bg-amber" />
        <span className="border border-t-[3px] border-amber bg-amber-soft px-2 py-1 font-sans text-xs/snug font-medium whitespace-nowrap text-foreground">
          <span className="sr-only">Komentarz: </span>
          {k.tekst}
        </span>
      </span>
      <span
        aria-hidden
        className="absolute top-1/2 left-full z-[2] ml-2 flex size-5 -translate-y-1/2 items-center justify-center border border-amber bg-amber-soft font-mono text-[0.6875rem] font-semibold text-amber-ink tabular-nums @lg:hidden"
      >
        {k.nr}
      </span>
    </>
  )
}

function Element({ e }: { e: ElementScratch }) {
  switch (e.typ) {
    case "tekst":
      return <span>{e.tekst}</span>
    case "flaga":
      return (
        <span className="inline-flex">
          <FlagIcon
            aria-hidden
            weight="fill"
            className="size-5 text-scratch-wyrazenia [filter:drop-shadow(0_0_0.6px_color-mix(in_oklch,var(--color-scratch-wyrazenia)_45%,black))]"
          />
          <span className="sr-only">{e.tekst}</span>
        </span>
      )
    case "pole":
      return (
        <span
          className={cn(
            "inline-flex h-6 min-w-6 items-center rounded-[2px] bg-white px-1.5 whitespace-pre",
            POLE_TEKST
          )}
        >
          {e.tekst}
        </span>
      )
    case "liczba":
      return (
        <span
          className={cn(
            "inline-flex h-6 min-w-8 items-center justify-center rounded-full bg-white px-2 tabular-nums",
            POLE_TEKST
          )}
        >
          {e.tekst}
        </span>
      )
    case "menu":
      return (
        <span className="inline-flex h-6 items-center gap-1 rounded-[4px] border border-(--sb-c) bg-(--sb-m) pr-1.5 pl-2 whitespace-pre">
          {e.tekst}
          <CaretDownIcon aria-hidden weight="bold" className="size-3" />
        </span>
      )
    case "slot":
      return (
        <span className={cn("inline-block h-6 w-10 bg-(--sb-m)", SZESCIOKAT)}>
          <span className="sr-only">(puste miejsce na warunek)</span>
        </span>
      )
    case "reporter":
      return <Reporter e={e} />
  }
}

function Elementy({ elementy }: { elementy: ElementScratch[] }) {
  return (
    <>
      {elementy.map((e, i) => (
        <Element key={i} e={e} />
      ))}
    </>
  )
}

function Reporter({
  e,
  className,
}: {
  e: Extract<ElementScratch, { typ: "reporter" }>
  className?: string
}) {
  const nazwa = useNazwaKategorii(e.kat)
  if (e.ksztalt === "warunek") {
    return (
      <span
        title={nazwa}
        className={cn(
          "inline-flex bg-(--sb-c) p-px",
          SZESCIOKAT,
          kolory(e.kat),
          className
        )}
      >
        <span
          className={cn(
            "inline-flex min-h-[1.625rem] items-center gap-1.5 bg-(--sb) px-3 py-0.5",
            SZESCIOKAT
          )}
        >
          <Elementy elementy={e.elementy} />
        </span>
      </span>
    )
  }
  return (
    <span
      title={nazwa}
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border border-(--sb-c) bg-(--sb) px-2.5 py-0.5",
        kolory(e.kat),
        className
      )}
    >
      <Elementy elementy={e.elementy} />
    </span>
  )
}

/* ---------- Bloki ---------- */

type WezelBlok = Extract<WezelScratch, { typ: "blok" }>

function Blok({ w, pierwszy }: { w: WezelBlok; pierwszy: boolean }) {
  const nazwa = useNazwaKategorii(w.kat)

  if (w.ksztalt === "c" || w.ksztalt === "c-koniec") {
    return (
      <div
        className={cn("relative flex w-max min-w-28 flex-col", kolory(w.kat))}
      >
        <div className="relative">
          <div
            title={nazwa}
            className={cn(
              KORPUS,
              TEKST,
              "rounded-t-[4px] rounded-br-[4px]",
              pierwszy && WCIECIE
            )}
          >
            <Elementy elementy={w.elementy} />
          </div>
          {pierwszy ? <Wciecie /> : null}
          {w.komentarz ? <Komentarz k={w.komentarz} /> : null}
        </div>
        <Usta wezly={w.dzieci ?? []} />
        {w.inaczej ? (
          <>
            <div className="relative -mt-px">
              <div
                title={nazwa}
                className={cn(KORPUS, TEKST, "rounded-r-[4px]")}
              >
                {w.etykietaInaczej ?? "w przeciwnym razie"}
              </div>
              {w.komentarzInaczej ? <Komentarz k={w.komentarzInaczej} /> : null}
            </div>
            <Usta wezly={w.inaczej} />
          </>
        ) : null}
        <div
          aria-hidden
          className="relative -mt-px h-6 rounded-tr-[4px] rounded-b-[4px] border border-(--sb-c) bg-(--sb)"
        >
          {w.ksztalt === "c" ? (
            <Wypust className="top-[calc(100%-1px)]" />
          ) : null}
        </div>
      </div>
    )
  }

  if (w.ksztalt === "kapelusz") {
    return (
      <div className={cn("relative mt-4 w-max", kolory(w.kat))}>
        <div
          title={nazwa}
          className={cn(
            KORPUS,
            TEKST,
            "min-h-11 min-w-[6.5rem] rounded-[4px] rounded-tl-none pt-2"
          )}
        >
          <Elementy elementy={w.elementy} />
        </div>
        <svg
          aria-hidden
          width="84"
          height="18"
          viewBox="0 0 84 18"
          className="pointer-events-none absolute -top-[17px] left-0 overflow-visible"
        >
          <path d="M0 18 C20 -4 64 -4 84 18 Z" className="fill-(--sb)" />
          <path
            d="M0.5 18 C20.5 -4 63.5 -4 83.5 18"
            className="fill-none stroke-(--sb-c)"
            strokeWidth={1}
          />
        </svg>
        <Wypust className="top-[calc(100%-1px)]" />
        {w.komentarz ? <Komentarz k={w.komentarz} /> : null}
      </div>
    )
  }

  if (w.ksztalt === "definicja") {
    return (
      <div className={cn("relative w-max", kolory(w.kat))}>
        <div
          title={nazwa}
          className={cn(
            KORPUS,
            TEKST,
            "min-h-12 gap-2 rounded-t-[1.25rem] rounded-b-[4px] px-3 pt-3 pb-2"
          )}
        >
          <Elementy elementy={w.elementy} />
          <span className="inline-flex min-h-8 items-center gap-1.5 rounded-[4px] border border-(--sb-c) bg-(--sb) px-2 py-1 shadow-[inset_0_-2px_0_var(--sb-m)]">
            <Elementy elementy={w.prototyp ?? []} />
          </span>
        </div>
        <Wypust className="top-[calc(100%-1px)]" />
        {w.komentarz ? <Komentarz k={w.komentarz} /> : null}
      </div>
    )
  }

  // stos / koniec
  return (
    <div className={cn("relative w-max", kolory(w.kat))}>
      <div
        title={nazwa}
        className={cn(KORPUS, TEKST, "rounded-[4px]", pierwszy && WCIECIE)}
      >
        <Elementy elementy={w.elementy} />
      </div>
      {pierwszy ? <Wciecie /> : null}
      {w.ksztalt !== "koniec" ? (
        <Wypust className="top-[calc(100%-1px)]" />
      ) : null}
      {w.komentarz ? <Komentarz k={w.komentarz} /> : null}
    </div>
  )
}

/** Wnętrze bloku C: lewy „kręgosłup” + wcięte dzieci (mogą wystawać w prawo). */
function Usta({ wezly }: { wezly: WezelScratch[] }) {
  return (
    <div className="flex">
      <div
        aria-hidden
        className="relative z-[1] -my-px w-4 shrink-0 border-x border-(--sb-c) bg-(--sb)"
      />
      <div className="relative -ml-px min-h-6 w-0">
        <Wypust className="-top-px" />
        <Lista wezly={wezly} className="-mt-px" />
      </div>
    </div>
  )
}

function Lista({
  wezly,
  gora = false,
  className,
  ...props
}: {
  wezly: WezelScratch[]
  /** Lista na szczycie stosu: pierwszy blok dostaje wcięcie. */
  gora?: boolean
} & React.ComponentProps<"ul">) {
  return (
    <ul
      role="list"
      className={cn("flex w-max flex-col items-start", className)}
      {...props}
    >
      {wezly.map((w, i) => {
        const poprzedni = wezly[i - 1]
        const sklej =
          poprzedni && poprzedni.typ !== "notka" && w.typ !== "notka"
        return (
          <li key={i} className={cn(sklej && "-mt-px")}>
            <Wezel w={w} pierwszy={gora && i === 0} />
          </li>
        )
      })}
    </ul>
  )
}

function Wezel({ w, pierwszy }: { w: WezelScratch; pierwszy: boolean }) {
  if (w.typ === "notka") {
    return (
      <p className="my-2 max-w-[40ch] border-l-2 border-dashed border-amber py-0.5 pl-2.5 text-xs/relaxed whitespace-normal text-muted-foreground italic">
        {w.tekst}
      </p>
    )
  }
  if (w.typ === "samodzielny") {
    return (
      <div className={cn("relative my-0.5 w-max", TEKST)}>
        <Reporter e={w.element} />
        {w.komentarz ? <Komentarz k={w.komentarz} /> : null}
      </div>
    )
  }
  return <Blok w={w} pierwszy={pierwszy} />
}

function Stos({ stos, nr }: { stos: StosScratch; nr: number }) {
  return (
    <div className="flex flex-col items-start gap-2">
      {stos.etykieta ? (
        <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
          <span className="flex items-center gap-1.5">
            <span aria-hidden className="size-2 bg-scratch-wyglad" />
            Duszek:{" "}
            <span className="text-foreground">{stos.etykieta.duszek}</span>
          </span>
          {stos.etykieta.opis ? (
            <span className="font-sans text-xs tracking-normal normal-case">
              {stos.etykieta.opis}
            </span>
          ) : null}
        </p>
      ) : null}
      <Lista
        wezly={stos.wezly}
        gora
        aria-label={`Skrypt ${nr}`}
        className="isolate pr-6 pb-1.5"
      />
      {stos.komentarze.length ? (
        <ol className="flex flex-col gap-1 @lg:hidden">
          {stos.komentarze.map((k) => (
            <li key={k.nr} className="flex items-start gap-2 text-xs/snug">
              <span className="flex size-5 shrink-0 items-center justify-center border border-amber bg-amber-soft font-mono text-[0.6875rem] font-semibold text-amber-ink tabular-nums">
                {k.nr}
              </span>
              <span className="pt-0.5">
                <span className="sr-only">Komentarz: </span>
                {k.tekst}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

/**
 * Same bloki (bez ramki, bez przewijania) — do osadzania np. w przyciskach.
 *
 * @example <ScratchBloki kod="powtórz (3) razy" />
 */
export function ScratchBloki({
  kod = DOMYSLNY_KOD,
  skrypt,
  jezyk = "pl",
  className,
}: {
  kod?: string
  /** Gotowy wynik `parsujSkrypt` (pomija parsowanie `kod`). */
  skrypt?: SkryptScratch
  /** Język nazw kategorii w podpowiedziach. */
  jezyk?: JezykScratcha
  className?: string
}) {
  const wynik = React.useMemo(() => skrypt ?? parsujSkrypt(kod), [kod, skrypt])
  return (
    <JezykBlokow.Provider value={jezyk}>
      <div className={cn("flex w-max min-w-full flex-col gap-8", className)}>
        {wynik.stosy.map((s, i) => (
          <Stos key={i} stos={s} nr={i + 1} />
        ))}
      </div>
    </JezykBlokow.Provider>
  )
}

function Legenda({
  kategorie,
  jezyk,
}: {
  kategorie: KategoriaScratch[]
  jezyk: JezykScratcha
}) {
  return (
    <ul
      className="flex flex-wrap gap-x-3 gap-y-1.5"
      aria-label="Kategorie bloków"
    >
      {kategorie.map((k) => (
        <li key={k} className="flex items-center gap-1.5">
          <span
            aria-hidden
            className={cn("size-2.5 rounded-[2px]", KATEGORIE[k].tlo)}
          />
          {jezyk === "en" ? KATEGORIE[k].en : KATEGORIE[k].nazwa}
        </li>
      ))}
    </ul>
  )
}

/**
 * Skrypt Scratcha zapisany tekstem (polska składnia z lekcji) i narysowany
 * jak bloki Scratcha 3.0: kolory kategorii, kapelusze, bloki C, pola,
 * reportery, warunki i komentarze. Przycisk „Pokaż tekst” przełącza na
 * zwykły tekst do skopiowania. Z `kodEn` dochodzi przełącznik EN / PL,
 * wspólny dla wszystkich bloków na stronie (domyślnie EN).
 *
 * Składnia: `[tekst]`, `(liczba)`, `(reporter …)`, `<warunek>`, wcięcie 4 spacje
 * dla dzieci bloków C, pusta linia = nowy skrypt, `blok  (komentarz)`.
 *
 * @example
 * <ScratchSkrypt duszek="Kot" kod={`kiedy kliknięto zieloną flagę
 * powiedz [Witaj, świecie!]`} />
 */
export function ScratchSkrypt({
  kod = DOMYSLNY_KOD,
  kodEn,
  duszek,
  kompaktowy = false,
  className,
}: {
  /** Tekst skryptu (polska składnia jak w lekcji). */
  kod?: string
  /** Ten sam skrypt z angielskimi etykietami bloków. */
  kodEn?: string
  /** Nazwa duszka — tytuł ramki (domyślnie „Skrypt”). */
  duszek?: string
  /** Same bloki na płótnie, bez ramki Lab i przycisków. */
  kompaktowy?: boolean
  className?: string
}) {
  const [wybranyJezyk] = useJezykScratcha()
  const jezyk: JezykScratcha =
    wybranyJezyk === "en" && kodEn !== undefined ? "en" : "pl"
  const zrodlo = jezyk === "en" ? (kodEn ?? kod) : kod
  const skrypt = React.useMemo(() => parsujSkrypt(zrodlo), [zrodlo])
  const [tekst, setTekst] = React.useState(false)
  const [skopiowano, setSkopiowano] = React.useState(false)
  const timer = React.useRef<number | undefined>(undefined)

  React.useEffect(() => () => window.clearTimeout(timer.current), [])

  const kopiuj = async () => {
    try {
      await navigator.clipboard.writeText(skrypt.tekst)
      setSkopiowano(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setSkopiowano(false), 1500)
    } catch {
      // Brak uprawnień do schowka: tekst i tak można zaznaczyć ręcznie.
    }
  }

  const tytul = duszek ?? "Skrypt"
  const plotno = (
    <div
      role="region"
      aria-label={`Bloki Scratcha: ${tytul}`}
      tabIndex={0}
      className={cn(
        "overflow-x-auto border bg-muted/40 bg-dots",
        kompaktowy ? "p-3" : "p-4"
      )}
    >
      <ScratchBloki skrypt={skrypt} jezyk={jezyk} />
    </div>
  )

  if (kompaktowy) {
    return <div className={cn("@container min-w-0", className)}>{plotno}</div>
  }

  return (
    <Lab
      tytul={tytul}
      className={className}
      akcje={
        <>
          {kodEn !== undefined ? <PrzelacznikJezyka /> : null}
          {tekst ? (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={kopiuj}
              aria-label={skopiowano ? "Skopiowano" : "Kopiuj tekst skryptu"}
            >
              {skopiowano ? <CheckIcon /> : <CopyIcon />}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTekst((t) => !t)}
            aria-label={tekst ? "Pokaż klocki" : "Pokaż tekst"}
          >
            {tekst ? (
              <PuzzlePieceIcon data-icon="inline-start" />
            ) : (
              <CodeIcon data-icon="inline-start" />
            )}
            <span className="hidden sm:inline">
              {tekst ? "Pokaż klocki" : "Pokaż tekst"}
            </span>
          </Button>
        </>
      }
      stopka={<Legenda kategorie={skrypt.kategorie} jezyk={jezyk} />}
    >
      {tekst ? (
        <pre className="overflow-x-auto border bg-muted/40 p-4 font-mono text-[0.8125rem]/relaxed">
          <code>{skrypt.tekst}</code>
        </pre>
      ) : (
        <div className="@container min-w-0">{plotno}</div>
      )}
    </Lab>
  )
}
