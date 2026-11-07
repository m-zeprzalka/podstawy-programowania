"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CornersOutIcon,
  DownloadSimpleIcon,
  MoonIcon,
  NoteIcon,
  PrinterIcon,
  SquaresFourIcon,
  SunIcon,
} from "@phosphor-icons/react"
import { useTheme } from "next-themes"

import { LogoMark } from "@/components/kurs/logo"
import { Button, buttonVariants } from "@/components/ui/button"
import type { Uklad } from "@/lib/prezentacje"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

type SlajdWidoku = {
  uklad: Uklad
  tresc: React.ReactNode
  notatki: React.ReactNode | null
}

/* Numer slajdu żyje w adresie (#7), więc odświeżenie strony go nie gubi. */
const subskrybuj = (cb: () => void) => {
  window.addEventListener("hashchange", cb)
  return () => window.removeEventListener("hashchange", cb)
}
const numerZAdresu = () => Number.parseInt(window.location.hash.slice(1)) || 1
const numerNaSerwerze = () => 1

/** Znak kursu w dużym rozmiarze: bajt litery „P” jako 8 kwadratów. */
function DuzyZnak() {
  return (
    <span aria-hidden className="grid w-fit grid-cols-4 gap-[0.45cqw]">
      {"01010000".split("").map((b, i) => (
        <span
          key={i}
          className={cn(
            "size-[1.5cqw]",
            b === "1"
              ? "bg-signal shadow-[0_0_1cqw_var(--signal)]"
              : "bg-foreground/80"
          )}
        />
      ))}
    </span>
  )
}

function Slajd({
  slajd,
  numer,
  razem,
  lekcja,
}: {
  slajd: SlajdWidoku
  numer: number
  razem: number
  lekcja: string
}) {
  return (
    <section
      className={cn("slajd", `slajd--${slajd.uklad}`)}
      aria-label={`Slajd ${numer} z ${razem}`}
    >
      <header className="slajd-naglowek">
        <span className="flex items-center gap-[1cqw]">
          <LogoMark className="slajd-logo" />
          <span>{site.znak}</span>
        </span>
        <span>{lekcja}</span>
      </header>
      <div className="slajd-tresc">
        {slajd.uklad === "tytul" ? <DuzyZnak /> : null}
        {slajd.tresc}
      </div>
      <footer className="slajd-stopka">
        <span className="tabular-nums">
          {String(numer).padStart(2, "0")} / {String(razem).padStart(2, "0")}
        </span>
      </footer>
    </section>
  )
}

/**
 * Pokaz slajdów z pliku Markdown: jeden slajd na ekranie, strzałki,
 * pełny ekran, notatki prowadzącego, widok wszystkich slajdów i druk do PDF.
 */
export function Przegladarka({
  tytul,
  lekcja,
  slajdy,
  pdf,
  powrot,
}: {
  tytul: string
  /** Krótki podpis w nagłówku slajdu, np. „lekcja 0”. */
  lekcja: string
  slajdy: SlajdWidoku[]
  /** Adres gotowego pliku PDF, jeśli istnieje. */
  pdf?: string
  /** Link do lekcji w kursie. */
  powrot: string
}) {
  const razem = slajdy.length
  const zAdresu = React.useSyncExternalStore(
    subskrybuj,
    numerZAdresu,
    numerNaSerwerze
  )
  const numer = Math.min(Math.max(zAdresu, 1), razem)
  const [wszystkie, setWszystkie] = React.useState(false)
  const [notatki, setNotatki] = React.useState(false)
  const scena = React.useRef<HTMLDivElement>(null)
  const { resolvedTheme, setTheme } = useTheme()

  const idz = React.useCallback(
    (n: number) => {
      const cel = Math.min(Math.max(n, 1), razem)
      window.history.replaceState(null, "", `#${cel}`)
      window.dispatchEvent(new HashChangeEvent("hashchange"))
    },
    [razem]
  )

  const pelnyEkran = React.useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen()
    else scena.current?.requestFullscreen()
  }, [])

  React.useEffect(() => {
    const klawisz = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const dalej = ["ArrowRight", "ArrowDown", "PageDown", " ", "Enter"]
      const wstecz = ["ArrowLeft", "ArrowUp", "PageUp", "Backspace"]
      if (dalej.includes(e.key) && !wszystkie) {
        e.preventDefault()
        idz(numer + 1)
      } else if (wstecz.includes(e.key) && !wszystkie) {
        e.preventDefault()
        idz(numer - 1)
      } else if (e.key === "Home") idz(1)
      else if (e.key === "End") idz(razem)
      else if (e.key === "f" || e.key === "F") pelnyEkran()
      else if (e.key === "n" || e.key === "N") setNotatki((v) => !v)
      else if (e.key === "p" || e.key === "P") setWszystkie((v) => !v)
    }
    window.addEventListener("keydown", klawisz)
    return () => window.removeEventListener("keydown", klawisz)
  }, [idz, numer, razem, wszystkie, pelnyEkran])

  const biezacy = slajdy[numer - 1]

  return (
    <div
      className={cn(
        "prezentacja flex min-h-dvh flex-col bg-muted/50",
        notatki && !wszystkie && "prezentacja--notatki"
      )}
    >
      <h1 className="sr-only">{tytul}</h1>

      <div
        ref={scena}
        className={cn(
          "prezentacja-scena",
          wszystkie
            ? "prezentacja-scena--wszystkie"
            : "prezentacja-scena--jeden"
        )}
      >
        {slajdy.map((s, i) => (
          <div
            key={i}
            className="slajd-ramka"
            data-biezacy={i === numer - 1 ? "" : undefined}
          >
            {wszystkie ? (
              <button
                type="button"
                className="slajd-wybor"
                onClick={() => {
                  setWszystkie(false)
                  idz(i + 1)
                }}
                aria-label={`Pokaż slajd ${i + 1}`}
              />
            ) : null}
            <Slajd slajd={s} numer={i + 1} razem={razem} lekcja={lekcja} />
          </div>
        ))}
      </div>

      {notatki && !wszystkie ? (
        <aside className="prezentacja-ui mx-auto w-full max-w-5xl px-4 pb-3">
          <div className="max-h-36 overflow-y-auto border bg-background px-4 py-3 text-sm/relaxed [&>*+*]:mt-2">
            <p className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
              Notatki do slajdu {numer}
            </p>
            {biezacy?.notatki ?? (
              <p className="text-muted-foreground">Brak notatek.</p>
            )}
          </div>
        </aside>
      ) : null}

      <nav
        aria-label="Sterowanie prezentacją"
        className="prezentacja-ui sticky bottom-0 flex flex-wrap items-center justify-between gap-2 border-t bg-background/95 px-3 py-2 backdrop-blur"
      >
        <div className="flex min-w-0 items-center gap-1">
          <Link
            href={powrot}
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Kurs
          </Link>
          <span className="hidden truncate font-mono text-xs text-muted-foreground md:inline">
            {tytul}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => idz(numer - 1)}
            disabled={wszystkie || numer <= 1}
            aria-label="Poprzedni slajd"
          >
            <CaretLeftIcon />
          </Button>
          <span className="min-w-16 text-center font-mono text-xs tabular-nums">
            {numer} / {razem}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => idz(numer + 1)}
            disabled={wszystkie || numer >= razem}
            aria-label="Następny slajd"
          >
            <CaretRightIcon />
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant={notatki ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setNotatki((v) => !v)}
            aria-pressed={notatki}
            aria-label="Notatki prowadzącego (N)"
            title="Notatki prowadzącego (N)"
          >
            <NoteIcon />
          </Button>
          <Button
            variant={wszystkie ? "secondary" : "ghost"}
            size="icon-sm"
            onClick={() => setWszystkie((v) => !v)}
            aria-pressed={wszystkie}
            aria-label="Wszystkie slajdy (P)"
            title="Wszystkie slajdy (P)"
          >
            <SquaresFourIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() =>
              setTheme(resolvedTheme === "dark" ? "light" : "dark")
            }
            aria-label="Jasny albo ciemny motyw"
            title="Jasny albo ciemny motyw"
          >
            <SunIcon className="hidden dark:block" />
            <MoonIcon className="dark:hidden" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={pelnyEkran}
            aria-label="Pełny ekran (F)"
            title="Pełny ekran (F)"
          >
            <CornersOutIcon />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => window.print()}
            aria-label="Drukuj albo zapisz jako PDF"
            title="Drukuj albo zapisz jako PDF: wybierz „Zapisz jako PDF”, marginesy „Brak” i włącz grafikę tła"
          >
            <PrinterIcon />
          </Button>
          {pdf ? (
            <a
              href={pdf}
              download
              className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
            >
              <DownloadSimpleIcon data-icon="inline-start" />
              PDF
            </a>
          ) : null}
        </div>
      </nav>
    </div>
  )
}
