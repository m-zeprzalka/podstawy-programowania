"use client"

import * as React from "react"
import {
  ArrowDownIcon,
  ArrowRightIcon,
  ChatTextIcon,
  EraserIcon,
  FileJpgIcon,
  ImageIcon,
  PaletteIcon,
  type Icon,
} from "@phosphor-icons/react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { cn } from "@/lib/utils"

type Podglad =
  | { typ: "tekst"; tekst: string }
  | { typ: "kolory"; kolory: string[] }
  | { typ: "obraz"; opis: string; przezroczyste?: boolean }

type Przyklad = {
  id: string
  etykieta: string
  ikona: Icon
  wejscie: { rodzaj: string; podglad: Podglad }
  skrzynka: { nazwa: string; wnetrze: string }
  wyjscie: { rodzaj: string; podglad: Podglad }
}

const PRZYKLADY: Przyklad[] = [
  {
    id: "czat",
    etykieta: "Czat z AI",
    ikona: ChatTextIcon,
    wejscie: {
      rodzaj: "tekst: prompt",
      podglad: {
        typ: "tekst",
        tekst: "Zaproponuj hasło na plakat festiwalu filmów animowanych.",
      },
    },
    skrzynka: {
      nazwa: "model językowy, np. Claude",
      wnetrze:
        "zamienia tekst na liczby (tokeny), oblicza, jaki token będzie następny, i zamienia liczby z powrotem na tekst",
    },
    wyjscie: {
      rodzaj: "tekst: odpowiedź",
      podglad: { typ: "tekst", tekst: "Klatka po klatce rodzi się magia." },
    },
  },
  {
    id: "obraz",
    etykieta: "Generator obrazów",
    ikona: ImageIcon,
    wejscie: {
      rodzaj: "tekst: prompt",
      podglad: {
        typ: "tekst",
        tekst: "Plakat koncertu jazzowego w stylu Bauhausu, czerwień i granat.",
      },
    },
    skrzynka: {
      nazwa: "model generujący obrazy",
      wnetrze:
        "też działa na liczbach: obraz to dla niego tabela wartości kolorów wszystkich pikseli",
    },
    wyjscie: {
      rodzaj: "obraz: plik PNG",
      podglad: { typ: "obraz", opis: "gotowy plakat" },
    },
  },
  {
    id: "tlo",
    etykieta: "Usuwanie tła",
    ikona: EraserIcon,
    wejscie: {
      rodzaj: "obraz: zdjęcie JPG",
      podglad: { typ: "obraz", opis: "butelka na białym tle" },
    },
    skrzynka: {
      nazwa: "narzędzie do usuwania tła, np. w Photoshopie",
      wnetrze:
        "dla każdego piksela ocenia, czy należy do przedmiotu, czy do tła, a piksele tła robi przezroczystymi",
    },
    wyjscie: {
      rodzaj: "obraz: plik PNG",
      podglad: { typ: "obraz", opis: "butelka bez tła", przezroczyste: true },
    },
  },
  {
    id: "paleta",
    etykieta: "Paleta kolorów",
    ikona: PaletteIcon,
    wejscie: {
      rodzaj: "tekst: opis nastroju",
      podglad: {
        typ: "tekst",
        tekst: "Kawiarnia w Lizbonie: ciepło, płytki azulejos, poranne słońce.",
      },
    },
    skrzynka: {
      nazwa: "Claude z promptem systemowym",
      wnetrze:
        "dostaje prompt systemowy „Odpowiadaj tylko pięcioma kodami kolorów”, który ustala format odpowiedzi, i dobiera kolory do opisu",
    },
    wyjscie: {
      rodzaj: "tekst: 5 kodów kolorów",
      podglad: {
        typ: "kolory",
        kolory: ["#1D4E89", "#F2E8CF", "#E9A23B", "#C8553D", "#2A9D8F"],
      },
    },
  },
  {
    id: "jpg",
    etykieta: "Eksport do JPG",
    ikona: FileJpgIcon,
    wejscie: {
      rodzaj: "obraz i ustawienie",
      podglad: { typ: "tekst", tekst: "Projekt 1920 × 1080 px, jakość 80%." },
    },
    skrzynka: {
      nazwa: "algorytm kompresji JPG (bez AI)",
      wnetrze:
        "pomija szczegóły, których oko prawie nie zauważa, żeby plik był mniejszy",
    },
    wyjscie: {
      rodzaj: "plik JPG",
      podglad: {
        typ: "tekst",
        tekst: "Plik wielokrotnie mniejszy niż obraz bez kompresji.",
      },
    },
  },
]

function Strzalka() {
  return (
    <div className="flex justify-center text-muted-foreground" aria-hidden>
      <ArrowDownIcon className="size-5 md:hidden" />
      <ArrowRightIcon className="hidden size-5 md:block" />
    </div>
  )
}

function PodgladTresci({ podglad }: { podglad: Podglad }) {
  if (podglad.typ === "kolory") {
    return (
      <ul className="grid grid-cols-5 gap-1" aria-label="Kolory">
        {podglad.kolory.map((k) => (
          <li key={k} className="flex min-w-0 flex-col gap-1">
            <span
              className="aspect-square w-full border"
              style={{ backgroundColor: k }}
              aria-hidden
            />
            <span className="truncate font-mono text-[0.625rem] text-muted-foreground">
              {k}
            </span>
          </li>
        ))}
      </ul>
    )
  }
  if (podglad.typ === "obraz") {
    return (
      <figure className="flex flex-col gap-1.5">
        <div
          className={cn(
            "flex aspect-[4/3] w-full items-center justify-center border",
            !podglad.przezroczyste && "bg-muted"
          )}
          style={
            podglad.przezroczyste
              ? {
                  backgroundImage:
                    "repeating-conic-gradient(var(--muted) 0 25%, transparent 0 50%)",
                  backgroundSize: "16px 16px",
                }
              : undefined
          }
          aria-hidden
        >
          <ImageIcon
            className="size-8 text-muted-foreground"
            weight="duotone"
          />
        </div>
        <figcaption className="text-xs text-muted-foreground">
          {podglad.opis}
          {podglad.przezroczyste ? " (szachownica = przezroczystość)" : ""}
        </figcaption>
      </figure>
    )
  }
  return <p className="text-sm/relaxed">„{podglad.tekst}”</p>
}

/**
 * Schemat „wejście → czarna skrzynka → wyjście” na przykładach z pracy
 * grafika: czat z AI, generator obrazów, usuwanie tła, paleta, eksport JPG.
 *
 * @example <WejscieWyjscie />
 */
export function WejscieWyjscie() {
  const [id, setId] = React.useState(PRZYKLADY[0].id)
  const etykietaId = React.useId()
  const p = PRZYKLADY.find((x) => x.id === id) ?? PRZYKLADY[0]

  return (
    <Lab
      tytul="Wejście, czarna skrzynka, wyjście"
      opis="Wybierz narzędzie i zobacz, co do niego wkładasz, co z niego wychodzi i co dzieje się w środku."
      stopka="Każdy program da się tak opisać: wejście, przetwarzanie, wyjście."
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <LabLabel id={etykietaId}>Narzędzie</LabLabel>
          <ToggleGroup
            value={[id]}
            onValueChange={(v) => {
              if (v[0]) setId(v[0] as string)
            }}
            variant="outline"
            aria-labelledby={etykietaId}
            className="w-full flex-wrap"
          >
            {PRZYKLADY.map((x) => (
              <ToggleGroupItem key={x.id} value={x.id} className="h-10">
                <x.ikona data-icon="inline-start" />
                {x.etykieta}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        <ol
          aria-live="polite"
          className="grid items-stretch gap-2 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center"
        >
          <li className="flex flex-col gap-2 border bg-background p-3">
            <LabLabel>Wejście · {p.wejscie.rodzaj}</LabLabel>
            <PodgladTresci podglad={p.wejscie.podglad} />
          </li>
          <Strzalka />
          <li className="flex flex-col gap-2 bg-primary p-3 text-primary-foreground">
            <p className="font-mono text-[0.6875rem] font-medium tracking-widest uppercase opacity-75">
              Czarna skrzynka
            </p>
            <p className="text-sm font-semibold">{p.skrzynka.nazwa}</p>
          </li>
          <Strzalka />
          <li className="flex flex-col gap-2 border border-dashed border-input p-3">
            <LabLabel>Wyjście · {p.wyjscie.rodzaj}</LabLabel>
            <PodgladTresci podglad={p.wyjscie.podglad} />
          </li>
        </ol>

        <p className="border-l-2 border-signal bg-signal-soft px-3 py-2 text-sm/relaxed">
          <span className="font-medium">Co jest w środku? </span>
          Narzędzie {p.skrzynka.wnetrze}. Żeby z niego korzystać, nie musisz
          tego wiedzieć. Dlatego mówimy o czarnej skrzynce.
        </p>
      </div>
    </Lab>
  )
}
