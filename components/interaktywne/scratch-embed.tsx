"use client"

import * as React from "react"
import { ArrowSquareOutIcon, ImageBrokenIcon, PlayIcon } from "@phosphor-icons/react"

import { Lab } from "@/components/kurs/lab"

/**
 * Osadzony projekt Scratch z fasadą „kliknij, aby załadować”: do kliknięcia
 * widać tylko miniaturę, a odtwarzacz (iframe z scratch.mit.edu) ładuje się
 * dopiero na żądanie.
 *
 * @example <ScratchEmbed id="277537196" tytul="Oscartime" />
 */
export function ScratchEmbed({
  id = "277537196",
  tytul = "Oscartime",
}: {
  /** Numer projektu z adresu scratch.mit.edu/projects/{id}. */
  id?: string | number
  /** Nazwa projektu (tytuł ramki, tekst alternatywny, tytuł iframe). */
  tytul?: string
}) {
  const nr = String(id).replace(/\D/g, "")
  const [zaladowany, setZaladowany] = React.useState(false)
  const [bladMiniatury, setBladMiniatury] = React.useState(false)
  const ramka = React.useRef<HTMLIFrameElement>(null)

  React.useEffect(() => {
    if (zaladowany) ramka.current?.focus()
  }, [zaladowany])

  const adres = `https://scratch.mit.edu/projects/${nr}/`

  return (
    <Lab
      tytul={tytul}
      opis={
        zaladowany
          ? "Kliknij zieloną flagę nad sceną, aby uruchomić projekt."
          : "Projekt ładuje się z scratch.mit.edu dopiero po kliknięciu."
      }
      stopka={
        <a
          href={adres}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-1.5 font-medium text-foreground underline decoration-signal decoration-2 underline-offset-4 hover:bg-signal-soft"
        >
          Otwórz w Scratchu
          <ArrowSquareOutIcon aria-hidden className="size-4" />
          <span className="sr-only">(nowa karta)</span>
        </a>
      }
    >
      <div className="relative mx-auto aspect-[485/402] w-full max-w-[485px] overflow-hidden border bg-muted">
        {zaladowany ? (
          <iframe
            ref={ramka}
            src={`${adres}embed`}
            title={`Projekt Scratch: ${tytul}`}
            allowFullScreen
            allow="autoplay; fullscreen"
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setZaladowany(true)}
            aria-label={`Załaduj i uruchom projekt Scratch „${tytul}”`}
            className="group absolute inset-0 flex size-full items-center justify-center"
          >
            {bladMiniatury ? (
              <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-dots p-6 text-center text-sm text-muted-foreground">
                <ImageBrokenIcon aria-hidden className="size-8" />
                Miniatura niedostępna
              </span>
            ) : (
              // Zewnętrzna miniatura z serwera Scratcha — celowo zwykły <img>.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://uploads.scratch.mit.edu/get_image/project/${nr}_480x360.png`}
                alt={`Miniatura projektu Scratch „${tytul}”`}
                loading="lazy"
                decoding="async"
                width={480}
                height={360}
                onError={() => setBladMiniatury(true)}
                className="absolute inset-0 size-full object-cover"
              />
            )}
            <span
              aria-hidden
              className="absolute inset-0 bg-foreground/10 transition-colors group-hover:bg-foreground/0"
            />
            <span
              aria-hidden
              className="relative flex size-16 items-center justify-center rounded-full bg-scratch-ruch text-white shadow-lg ring-4 ring-background/70 transition-transform group-hover:scale-105 group-focus-visible:scale-105"
            >
              <PlayIcon weight="fill" className="size-7 translate-x-0.5" />
            </span>
            <span className="absolute bottom-3 left-3 bg-background/90 px-2 py-1 font-mono text-xs font-medium text-foreground">
              Kliknij, aby załadować
            </span>
          </button>
        )}
      </div>
    </Lab>
  )
}
