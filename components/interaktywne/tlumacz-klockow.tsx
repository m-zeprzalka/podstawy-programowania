"use client"

import * as React from "react"

import { Lab, LabLabel } from "@/components/kurs/lab"
import { cn } from "@/lib/utils"

import { PrzelacznikJezyka, useJezykScratcha } from "./scratch-jezyk"
import { ScratchSkrypt } from "./scratch-skrypt"

type Pojecie = {
  id: string
  nazwa: string
  /** Przykładowy blok w polskiej składni Scratcha. */
  kod: string
  /** Ten sam przykład w angielskim Scratchu. */
  kodEn: string
  /** Etykieta bloku w angielskim Scratchu. */
  en: string
  /** Etykieta bloku w polskim Scratchu. */
  pl: string
  /** Odpowiednik w C. */
  c: string
  opis: string
}

const ETYKIETA =
  "font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase"

const POJECIA: Pojecie[] = [
  {
    id: "funkcja",
    nazwa: "funkcja",
    kod: "powiedz [Cześć!]",
    kodEn: "say [Cześć!]",
    en: "say [Cześć!]",
    pl: "powiedz [Cześć!]",
    c: 'printf("Cześć!\\n");',
    opis: "Funkcja to klocek-czasownik, który coś robi; w C wywołujesz ją nazwą z nawiasami.",
  },
  {
    id: "argument",
    nazwa: "argument",
    kod: "powiedz [Witaj, świecie!]",
    kodEn: "say [Witaj, świecie!]",
    en: "say [Witaj, świecie!]",
    pl: "powiedz [Witaj, świecie!]",
    c: 'printf("hello, world\\n");',
    opis: "Argument to dane wpisane w okienko klocka — w C trafiają w nawiasy wywołania funkcji.",
  },
  {
    id: "wartosc",
    nazwa: "wartość zwracana",
    kod: "powiedz (połącz [Cześć, ] i (odpowiedź))",
    kodEn: "say (join [Cześć, ] (answer))",
    en: "say (join [Cześć, ] (answer))",
    pl: "powiedz (połącz [Cześć, ] i (odpowiedź))",
    c: "int n = strlen(imie);",
    opis: "Owalny klocek oddaje wynik, który wkładasz w okienko innego klocka — jak wynik funkcji strlen (długość tekstu) zapisany w zmiennej.",
  },
  {
    id: "efekt",
    nazwa: "efekt uboczny",
    kod: "zagraj dźwięk [Miau] i czekaj",
    kodEn: "play sound [Meow] until done",
    en: "play sound [Meow] until done",
    pl: "zagraj dźwięk [Miau] i czekaj",
    c: 'printf("Miau!\\n");',
    opis: "Efekt uboczny to widoczny skutek działania — dźwięk, dymek, tekst w terminalu — a nie wartość do dalszego użycia.",
  },
  {
    id: "zmienna",
    nazwa: "zmienna",
    kod: "ustaw [wynik] na (0)\nzmień [wynik] o (1)",
    kodEn: "set [wynik] to (0)\nchange [wynik] by (1)",
    en: "set [wynik] to (0)\nchange [wynik] by (1)",
    pl: "ustaw [wynik] na (0)\nzmień [wynik] o (1)",
    c: "int wynik = 0;\nwynik = wynik + 1;",
    opis: "Zmienna to nazwane pudełko na wartość, którą można odczytać i zmienić w trakcie programu.",
  },
  {
    id: "wyrazenie",
    nazwa: "wyrażenie logiczne",
    kod: "<dotyka [wskaźnik myszy]?>",
    kodEn: "<touching [mouse-pointer]?>",
    en: "<touching [mouse-pointer]?>",
    pl: "<dotyka [wskaźnik myszy]?>",
    c: "x < y",
    opis: "Wyrażenie logiczne ma odpowiedź „tak” albo „nie” (prawda/fałsz); w Scratchu poznasz je po sześciokątnym kształcie.",
  },
  {
    id: "warunek",
    nazwa: "warunek",
    kod: "jeżeli <dotyka [Oscar]?> to\n    powiedz [Mam cię!]\nw przeciwnym razie\n    powiedz [Pudło]",
    kodEn: "if <touching [Oscar]?> then\n    say [Mam cię!]\nelse\n    say [Pudło]",
    en: "if <> then … else",
    pl: "jeżeli < > to … w przeciwnym razie",
    c: "if (x < y)\n{\n    …\n}\nelse\n{\n    …\n}",
    opis: "Warunek wybiera jedną z dróg zależnie od wartości wyrażenia logicznego.",
  },
  {
    id: "petla",
    nazwa: "pętla",
    kod: "powtórz (3) razy\n    zagraj dźwięk [Miau] i czekaj",
    kodEn: "repeat (3)\n    play sound [Meow] until done",
    en: "repeat ( )",
    pl: "powtórz ( ) razy",
    c: "for (int i = 0; i < 3; i++)\n{\n    …\n}",
    opis: "Pętla powtarza zamknięte w niej klocki: określoną liczbę razy, w nieskończoność albo aż spełni się warunek.",
  },
  {
    id: "zdarzenie",
    nazwa: "zdarzenie",
    kod: "kiedy kliknięto zieloną flagę\npowiedz [Start!]",
    kodEn: "when green flag clicked\nsay [Start!]",
    en: "when green flag clicked",
    pl: "kiedy kliknięto zieloną flagę",
    c: "int main(void)",
    opis: "Zdarzenie uruchamia skrypt. Program w C zaczyna się od funkcji main, a zdarzenia wrócą przy JavaScripcie.",
  },
  {
    id: "watek",
    nazwa: "wątek",
    kod: "kiedy kliknięto zieloną flagę\nzawsze\n    zmień y o (-1)\n\nkiedy kliknięto zieloną flagę\nzawsze\n    jeżeli <dotyka [Oscar]?> to\n        zmień [wynik] o (1)",
    kodEn: "when green flag clicked\nforever\n    change y by (-1)\n\nwhen green flag clicked\nforever\n    if <touching [Oscar]?> then\n        change [wynik] by (1)",
    en: "when green flag clicked  (×2)",
    pl: "kiedy kliknięto zieloną flagę  (×2)",
    c: "// wątki; w JS: współbieżność (async)",
    opis: "Kilka skryptów od tego samego zdarzenia działa jednocześnie — każdy z nich to osobny wątek.",
  },
  {
    id: "abstrakcja",
    nazwa: "abstrakcja",
    kod: "definiuj miau (n) razy\npowtórz (n) razy\n    zagraj dźwięk [Miau] i czekaj\n\nkiedy kliknięto zieloną flagę\nmiau (3) razy",
    kodEn: "define miau (n) razy\nrepeat (n)\n    play sound [Meow] until done\n\nwhen green flag clicked\nmiau (3) razy",
    en: "define miau (n) razy",
    pl: "definiuj miau (n) razy",
    c: "void miau(int n)",
    opis: "Własny blok ukrywa szczegóły pod jedną nazwą — tak jak funkcja, którą sam definiujesz w C.",
  },
]

/**
 * „Tłumacz klocków” PL → EN → C: wybierz pojęcie (tabela 12.3), aby zobaczyć
 * przykładowy blok Scratcha, jego angielską etykietę i odpowiednik w C.
 *
 * @example <TlumaczKlockow />
 */
export function TlumaczKlockow() {
  const id = React.useId()
  const [wybrane, setWybrane] = React.useState(POJECIA[0].id)
  const p = POJECIA.find((x) => x.id === wybrane) ?? POJECIA[0]
  const [jezyk] = useJezykScratcha()
  const en = jezyk === "en"

  return (
    <Lab
      tytul="Tłumacz klocków"
      opis="Wybierz pojęcie: zobaczysz klocek ze Scratcha, jego nazwę w drugim języku i odpowiednik w C."
      akcje={<PrzelacznikJezyka />}
    >
      <div className="grid gap-4 md:grid-cols-[11rem_minmax(0,1fr)] md:gap-6">
        <div
          role="group"
          aria-label="Pojęcia"
          className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-col md:gap-1 md:overflow-visible md:px-0 md:pb-0"
        >
          {POJECIA.map((x) => {
            const aktywne = x.id === p.id
            return (
              <button
                key={x.id}
                type="button"
                aria-pressed={aktywne}
                aria-controls={`${id}-panel`}
                onClick={() => setWybrane(x.id)}
                className={cn(
                  "flex min-h-10 shrink-0 items-center border px-3 font-mono text-xs whitespace-nowrap transition-colors md:w-full md:text-left",
                  aktywne
                    ? "border-signal bg-signal-soft font-semibold text-foreground shadow-[inset_3px_0_0_var(--signal)]"
                    : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {x.nazwa}
              </button>
            )
          })}
        </div>

        <div id={`${id}-panel`} className="flex min-w-0 flex-col gap-4">
          <h4 aria-live="polite" className="text-lg font-semibold first-letter:uppercase">
            {p.nazwa}
          </h4>
          <div className="flex flex-col gap-2">
            <LabLabel>Scratch ({en ? "EN" : "PL"})</LabLabel>
            <ScratchSkrypt
              key={p.id}
              kod={p.kod}
              kodEn={p.kodEn}
              duszek={p.nazwa}
              kompaktowy
            />
          </div>
          <dl className="grid gap-px border bg-border sm:grid-cols-2">
            <div className="flex min-w-0 flex-col gap-1.5 bg-card p-3">
              <dt className={ETYKIETA}>Scratch ({en ? "PL" : "EN"})</dt>
              <dd className="font-mono text-sm whitespace-pre-wrap">
                {en ? p.pl : p.en}
              </dd>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5 bg-card p-3">
              <dt className={ETYKIETA}>C</dt>
              <dd className="min-w-0">
                <pre className="overflow-x-auto font-mono text-sm text-signal-ink">
                  <code>{p.c}</code>
                </pre>
              </dd>
            </div>
          </dl>
          <p className="text-sm/relaxed">{p.opis}</p>
        </div>
      </div>
    </Lab>
  )
}
