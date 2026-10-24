import Link from "next/link"
import {
  ArrowRightIcon,
  CursorClickIcon,
  DeviceMobileIcon,
  LockSimpleIcon,
  QuotesIcon,
  SealCheckIcon,
} from "@phosphor-icons/react/ssr"

import { BityLed } from "@/components/kurs/bity-led"
import { SiteFooter } from "@/components/kurs/site-footer"
import { SiteHeader } from "@/components/kurs/site-header"
import { HeroBajty } from "@/components/start/hero-bajty"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { MODULY, formatCzas, odmiana, pad2 } from "@/lib/format"
import { getLessons } from "@/lib/kurs"
import { cn } from "@/lib/utils"

const CECHY = [
  {
    icon: CursorClickIcon,
    tytul: "Wykonujesz zadania, zamiast tylko czytać",
    opis: "Tworzysz zmienne, programujesz funkcje i uruchamiasz algorytmy krok po kroku. Każde pojęcie ma swój interaktywny przykład.",
  },
  {
    icon: DeviceMobileIcon,
    tytul: "Ucz się na telefonie",
    opis: "Projekt mobile first: wygodny dolny pasek, lista modułów, tryb ciemny. Na komputerze klasyczny układ dokumentacji.",
  },
  {
    icon: SealCheckIcon,
    tytul: "Mini-quiz po każdym module",
    opis: "Krótkie pytania od razu pokazują, co już rozumiesz. Ukończone moduły zapisują się w przeglądarce, więc wiesz, gdzie skończyłeś.",
  },
  {
    icon: QuotesIcon,
    tytul: "Rzetelnia wiedza, ze źródłami",
    opis: "Sprawdzone przypisy do źródeł. Tam, gdzie kurs wymaga poszerzenia wiedzy, podajemy dodatkowe informacje.",
  },
] as const

const FAQ = [
  {
    q: "Czy muszę umieć programować?",
    a: "Nie. Kurs zakłada start od zupełnego zera: zaczynamy od tego, czym jest bit, a pierwsze programy układamy z klocków w Scratchu.",
  },
  {
    q: "Czego potrzebuję?",
    a: "Przeglądarki internetowej. Lekcje wygodnie czyta się na telefonie, a do ćwiczeń zalecany jest komputer z dostępem do IDE.",
  },
  {
    q: "Czy mogę korzystać z AI?",
    a: "Tak, jednak kurs zakłada pogłębione myślenie, nie o gotowe rozwiązania zadań. Dlaczego? Wyjaśniamy to w dalszych częściach kursu.",
  },
  {
    q: "Skąd pochodzą materiały?",
    a: "To autorskie opracowanie do zajęć. Łączy sprawdzone pomysły z różnych kursów wprowadzających połączone z własnymi ćwiczeniami i polskimi przykładami. Źródła podane są w przypisach.",
  },
  {
    q: "Czy kurs jest darmowy?",
    a: "Tak. Materiały są udostępniane na licencji CC BY-NC-SA 4.0: można je udostępniać i przerabiać niekomercyjnie, podając autora i zachowując tę samą licencję.",
  },
] as const

export default function Home() {
  const lessons = getLessons()
  const lekcja0 = lessons.find((l) => l.status === "dostepna")

  return (
    <>
      <SiteHeader variant="start" />
      <main id="tresc">
        {/* ---------------- Hero ---------------- */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_70%)]"
          />
          <div className="relative mx-auto grid max-w-6xl gap-12 px-4 pt-12 pb-16 md:px-6 md:pt-20 md:pb-24 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div className="flex flex-col gap-6">
              <p className="flex items-center gap-2 font-mono text-xs font-medium tracking-widest text-signal-ink uppercase">
                <span className="size-1.5 bg-signal shadow-[0_0_8px_var(--signal)]" aria-hidden />
                Kurs dla studentów
              </p>
              <h1 className="text-[2.75rem]/[1.02] font-semibold tracking-tight text-balance sm:text-6xl/[1.02] lg:text-7xl/[1]">
                Podstawy programowania
                <span className="mt-3 block font-mono text-[0.42em]/[1.3] font-normal tracking-tight text-muted-foreground">
                  od zera... i jedynki do pierwszego programu
                  <span className="ml-1 inline-block h-[1em] w-[0.55em] translate-y-[0.15em] animate-blink bg-signal" aria-hidden />
                </span>
              </h1>
              <p className="max-w-xl text-lg/relaxed text-muted-foreground text-pretty">
                Jak komputer zapisuje dane? Czym jest algorytm? Jak „zakodować”
                pierwszy program? Interaktywny kurs podstaw programowania.
              </p>
              <div className="flex flex-wrap gap-3">
                {lekcja0 ? (
                  <Link href={lekcja0.url} className={cn(buttonVariants({ size: "lg" }))}>
                    Zacznij od Lekcji 0
                    <ArrowRightIcon data-icon="inline-end" />
                  </Link>
                ) : null}
                <a href="#program" className={cn(buttonVariants({ size: "lg", variant: "outline" }))}>
                  Zobacz program
                </a>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <HeroBajty />
              <p className="font-mono text-xs/relaxed text-muted-foreground">
                <span className="text-foreground">Kliknij dowolny bit.</span> Te same trzy bajty
                to liczba, napis albo kolor.
              </p>
            </div>
          </div>
        </section>

        {/* ---------------- Jak się uczymy ---------------- */}
        <section id="jak" className="scroll-mt-14 border-b">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <SectionHeading eyebrow="Jak się uczymy" title="Praktyka ważniejsza od teorii" />
            <ul className="mt-10 grid gap-px border bg-border sm:grid-cols-2">
              {CECHY.map(({ icon: Icon, tytul, opis }, i) => (
                <li key={tytul} className="flex flex-col gap-4 bg-background p-6 md:p-8">
                  <div className="flex items-center justify-between">
                    <Icon className="size-7 text-signal-ink" weight="duotone" />
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                      {pad2(i + 1)}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{tytul}</h3>
                  <p className="text-muted-foreground text-pretty">{opis}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------------- Program ---------------- */}
        <section id="program" className="scroll-mt-14 border-b bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
            <SectionHeading eyebrow="Program" title="Od bitu do pierwszego programu" />
            <ol className="mt-10 flex flex-col gap-4">
              {lessons.map((lesson) => {
                const soon = lesson.status === "wkrotce"
                return (
                  <li key={lesson.url} className={cn("border bg-background", soon && "border-dashed")}>
                    <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                      <div className="flex shrink-0 items-start gap-4 md:w-64 md:flex-col">
                        <span
                          className={cn(
                            "font-mono text-6xl/none font-semibold tabular-nums md:text-7xl/none",
                            soon ? "text-muted-foreground/50" : "text-signal-ink"
                          )}
                        >
                          {pad2(lesson.numer)}
                        </span>
                        <BityLed wartosc={lesson.numer} bity={4} className="mt-2 md:mt-0" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-2xl font-semibold tracking-tight">{lesson.title}</h3>
                          {soon ? (
                            <Badge variant="outline">
                              <LockSimpleIcon data-icon="inline-start" />
                              wkrótce
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              {odmiana(lesson.modules.length, MODULY)} · ~{formatCzas(lesson.czas)}
                            </Badge>
                          )}
                        </div>
                        {lesson.description ? (
                          <p className="max-w-2xl text-muted-foreground text-pretty">{lesson.description}</p>
                        ) : null}
                        {!soon ? (
                          <>
                            <ol className="grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-3">
                              {lesson.modules.map((m) => (
                                <li key={m.url}>
                                  <Link
                                    href={m.url}
                                    className="group flex items-baseline gap-2 py-1 text-sm hover:text-signal-ink"
                                  >
                                    <span className="font-mono text-xs text-muted-foreground tabular-nums">
                                      {pad2(m.numer)}
                                    </span>
                                    <span className="group-hover:underline group-hover:underline-offset-4">
                                      {m.nav}
                                    </span>
                                  </Link>
                                </li>
                              ))}
                            </ol>
                            <Link
                              href={lesson.url}
                              className={cn(buttonVariants(), "self-start")}
                            >
                              Otwórz lekcję
                              <ArrowRightIcon data-icon="inline-end" />
                            </Link>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </li>
                )
              })}
              <li className="flex items-center gap-4 border border-dashed p-6 text-muted-foreground md:p-8">
                <span className="font-mono text-2xl/none font-semibold">02+</span>
                <span className="text-pretty">
                  Już wkrótce plan kolejnych lekcji
                </span>
              </li>
            </ol>
          </div>
        </section>

        {/* ---------------- O kursie + FAQ ---------------- */}
        <section id="o-kursie" className="scroll-mt-14">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:px-6 md:py-24 lg:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col gap-5">
              <SectionHeading eyebrow="O kursie" title="Od bitu do gotowego programu" />
              <p className="text-muted-foreground text-pretty">
                Kurs powstał dla studentów uczęszczających na zajęcia z podstaw programowania. Łączy sprawdzone pomysły
                z wielu kursów wprowadzających połączonych z autorskimi ćwiczeniami i przykładami.
              </p>
              <p className="text-muted-foreground text-pretty">
                Wszystko jest po polsku, wraz z przykładami - stworzony z myślą o nauce na telefonie.
              </p>
            </div>
            <Accordion className="border-t">
              {FAQ.map(({ q, a }) => (
                <AccordionItem key={q} value={q} className="border-b">
                  <AccordionTrigger>{q}</AccordionTrigger>
                  <AccordionContent>{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-xs font-medium tracking-widest text-signal-ink uppercase">
        {"// "}
        {eyebrow}
      </p>
      <h2 className="text-3xl font-semibold tracking-tight text-balance md:text-4xl">{title}</h2>
    </div>
  )
}
