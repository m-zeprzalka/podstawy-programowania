import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ChalkboardTeacherIcon, ClockIcon } from "@phosphor-icons/react/ssr"

import { BityLed } from "@/components/kurs/bity-led"
import { LessonStart, ModuleGrid } from "@/components/kurs/lekcja"
import { ModuleBar } from "@/components/kurs/mobile"
import { ModuleFooter } from "@/components/kurs/module-footer"
import { LessonsNav, ModulesNav } from "@/components/kurs/nawigacja"
import { ZrodlaProvider } from "@/components/kurs/zrodla"
import { getMDXComponents } from "@/components/mdx"
import { Badge } from "@/components/ui/badge"
import { formatCzas, pad2 } from "@/lib/format"
import { getLessonIndexPage, getLessons, locate, type LessonInfo } from "@/lib/kurs"
import { site } from "@/lib/site"
import { source, type KursPage } from "@/lib/source"

export default async function Page(props: PageProps<"/kurs/[[...slug]]">) {
  const { slug } = await props.params
  if (!slug || slug.length === 0) return <ProgramKursu />

  const page = source.getPage(slug)
  if (!page) notFound()
  const found = locate(page)
  if (!found) notFound()

  const { lesson, module, lessons } = found
  const zrodla = getLessonIndexPage(lesson)?.data.zrodla ?? []
  const MDX = page.data.body
  const content = (
    <ZrodlaProvider zrodla={zrodla}>
      <div className="prose-kurs">
        <MDX components={getMDXComponents()} />
      </div>
    </ZrodlaProvider>
  )

  if (!module) {
    return <LessonOverview lesson={lesson} lessons={lessons} page={page} content={content} />
  }

  const i = lesson.modules.findIndex((m) => m.url === module.url)
  const prev = lesson.modules[i - 1]
  const next = lesson.modules[i + 1]

  return (
    <div className="mx-auto flex w-full max-w-[90rem]">
      <LeftRail lessons={lessons} />

      <main id="tresc" className="min-w-0 flex-1 px-4 pt-6 pb-28 sm:px-6 md:px-10 lg:px-12 lg:pt-10 lg:pb-20">
        <article className="mx-auto max-w-[44rem]">
          <header className="mb-10 flex flex-col gap-4 border-b pb-8">
            <nav
              aria-label="Okruszki"
              className="flex flex-wrap items-center gap-1.5 font-mono text-xs text-muted-foreground"
            >
              <Link href={lesson.url} className="hover:text-foreground">
                Lekcja {pad2(lesson.numer)}
              </Link>
              <span aria-hidden>/</span>
              <span className="truncate">{lesson.title}</span>
            </nav>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-2.5">
                <BityLed wartosc={module.numer} />
                <span className="font-mono text-xs font-medium tracking-widest uppercase">
                  Moduł {pad2(module.numer)}
                  <span className="text-muted-foreground">/{pad2(lesson.modules.length)}</span>
                </span>
              </span>
              {module.czas ? (
                <span className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                  <ClockIcon className="size-3.5" />~{module.czas} min
                </span>
              ) : null}
              {module.dlaProwadzacego ? (
                <Badge variant="outline">
                  <ChalkboardTeacherIcon data-icon="inline-start" />
                  dla prowadzącego
                </Badge>
              ) : null}
            </div>
            <h1 className="text-[2rem]/[1.15] font-semibold tracking-tight text-balance md:text-[2.5rem]/[1.1]">
              {noBreakHyphens(page.data.title)}
            </h1>
            {page.data.description ? (
              <p className="text-lg/relaxed text-muted-foreground text-pretty">
                {page.data.description}
              </p>
            ) : null}
          </header>

          {content}

          <ModuleFooter lesson={lesson} module={module} prev={prev} next={next} />
        </article>
      </main>

      <aside className="hidden w-72 shrink-0 lg:block">
        <div className="sticky top-(--header-height) h-[calc(100dvh-var(--header-height))] overflow-y-auto overscroll-contain border-l px-4 py-8">
          <ModulesNav lesson={lesson} toc={page.data.toc} />
        </div>
      </aside>

      <ModuleBar lesson={lesson} module={module} prev={prev} next={next} toc={page.data.toc} />
    </div>
  )
}

/** „UTF-8” nie powinno łamać się na „UTF-” i „8”: zamiana na łącznik niełamliwy. */
function noBreakHyphens(text: string) {
  return text.replace(/(\w)-(\w)/g, "$1\u2011$2")
}

function LeftRail({ lessons }: { lessons: LessonInfo[] }) {
  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-(--header-height) flex h-[calc(100dvh-var(--header-height))] flex-col gap-8 overflow-y-auto overscroll-contain border-r px-4 py-8">
        <LessonsNav lessons={lessons} />
        <p className="mt-auto px-1 font-mono text-[0.6875rem]/relaxed text-muted-foreground">
          Licencja{" "}
          <a href={site.licencja.url} className="underline underline-offset-2 hover:text-foreground">
            {site.licencja.nazwa}
          </a>
          .
        </p>
      </div>
    </aside>
  )
}

function LessonOverview({
  lesson,
  lessons,
  page,
  content,
}: {
  lesson: LessonInfo
  lessons: LessonInfo[]
  page: KursPage
  content: React.ReactNode
}) {
  const soon = lesson.status === "wkrotce"
  return (
    <div className="mx-auto flex w-full max-w-[90rem]">
      <LeftRail lessons={lessons} />
      <main id="tresc" className="min-w-0 flex-1 px-4 pt-8 pb-20 sm:px-6 md:px-10 lg:px-12 lg:pt-12">
        <div className="mx-auto flex max-w-[56rem] flex-col gap-12">
          <header className="relative flex flex-col gap-5 overflow-hidden border bg-card p-6 md:p-10">
            <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom_left,black,transparent_65%)]" aria-hidden />
            <div className="relative flex flex-wrap items-center gap-3">
              <span className="font-mono text-xs font-medium tracking-widest text-signal-ink uppercase">
                Lekcja {pad2(lesson.numer)}
              </span>
              <BityLed wartosc={lesson.numer} bity={4} />
              {soon ? <Badge variant="outline">wkrótce</Badge> : null}
            </div>
            <h1 className="relative max-w-3xl text-4xl/[1.05] font-semibold tracking-tight text-balance md:text-6xl/[1.02]">
              {lesson.title}
            </h1>
            {lesson.description ? (
              <p className="relative max-w-2xl text-lg/relaxed text-muted-foreground text-pretty">
                {lesson.description}
              </p>
            ) : null}
            {!soon ? (
              <div className="relative flex flex-col gap-6 pt-2">
                <dl className="flex flex-wrap gap-x-8 gap-y-3 font-mono text-xs">
                  <div className="flex flex-col gap-1">
                    <dt className="tracking-widest text-muted-foreground uppercase">Moduły</dt>
                    <dd className="text-xl font-medium tabular-nums">{lesson.modules.length}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="tracking-widest text-muted-foreground uppercase">Czas</dt>
                    <dd className="text-xl font-medium tabular-nums">~{formatCzas(lesson.czas)}</dd>
                  </div>
                  <div className="flex flex-col gap-1">
                    <dt className="tracking-widest text-muted-foreground uppercase">Źródła</dt>
                    <dd className="text-xl font-medium tabular-nums">
                      {page.data.zrodla?.length ?? 0}
                    </dd>
                  </div>
                </dl>
                <LessonStart lesson={lesson} />
              </div>
            ) : null}
          </header>

          {!soon ? (
            <section aria-labelledby="moduly" className="flex flex-col gap-4">
              <h2 id="moduly" className="font-mono text-xs font-semibold tracking-widest text-muted-foreground uppercase">
                Moduły lekcji
              </h2>
              <ModuleGrid lesson={lesson} />
            </section>
          ) : null}

          <section className="mx-auto w-full max-w-[44rem]">{content}</section>
        </div>
      </main>
    </div>
  )
}

function ProgramKursu() {
  const lessons = getLessons()
  return (
    <div className="mx-auto flex w-full max-w-[90rem]">
      <LeftRail lessons={lessons} />
      <main id="tresc" className="min-w-0 flex-1 px-4 pt-8 pb-20 sm:px-6 md:px-10 lg:px-12 lg:pt-12">
        <div className="mx-auto flex max-w-[56rem] flex-col gap-8">
          <header className="flex flex-col gap-3">
            <p className="font-mono text-xs font-medium tracking-widest text-signal-ink uppercase">
              Program kursu
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              {site.nazwa}
            </h1>
            <p className="max-w-2xl text-lg/relaxed text-muted-foreground text-pretty">{site.opis}</p>
          </header>
          <div className="xl:hidden">
            <LessonsNav lessons={lessons} />
          </div>
          <ol className="hidden flex-col gap-3 xl:flex">
            {lessons.map((l) => (
              <li key={l.url}>
                <Link
                  href={l.url}
                  className="flex gap-6 border p-6 transition-colors hover:border-foreground/50 hover:bg-muted/40"
                >
                  <span className="font-mono text-5xl/none font-semibold text-muted-foreground tabular-nums">
                    {pad2(l.numer)}
                  </span>
                  <span className="flex flex-col gap-2">
                    <span className="flex items-center gap-3 text-xl font-semibold">
                      {l.title}
                      {l.status === "wkrotce" ? <Badge variant="outline">wkrótce</Badge> : null}
                    </span>
                    {l.description ? (
                      <span className="text-muted-foreground text-pretty">{l.description}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  )
}

export function generateStaticParams() {
  return [{ slug: [] }, ...source.generateParams()]
}

export async function generateMetadata(
  props: PageProps<"/kurs/[[...slug]]">
): Promise<Metadata> {
  const { slug } = await props.params
  if (!slug || slug.length === 0) return { title: "Program kursu" }
  const page = source.getPage(slug)
  if (!page) notFound()
  return {
    title: page.data.title,
    description: page.data.description,
  }
}
