"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnchorProvider, TOCItem, type TOCItemType } from "fumadocs-core/toc"
import {
  ChalkboardTeacherIcon,
  CheckIcon,
  LockSimpleIcon,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { useProgress } from "@/hooks/use-progress"
import { MODULY, formatCzas, odmiana, pad2 } from "@/lib/format"
import type { LessonInfo } from "@/lib/kurs"
import { cn } from "@/lib/utils"


/** Postęp lekcji: ukończone moduły / wszystkie. */
export function useLessonProgress(lesson: LessonInfo) {
  const { done } = useProgress()
  const count = lesson.modules.filter((m) => done.has(m.url)).length
  return { count, total: lesson.modules.length, done }
}

function ProgressLine({ value, className }: { value: number; className?: string }) {
  return (
    <span
      className={cn("relative block h-0.5 w-full overflow-hidden bg-border", className)}
      aria-hidden
    >
      <span
        className="absolute inset-y-0 left-0 bg-signal transition-[width] duration-500"
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Lewy panel: lekcje                                                   */
/* ------------------------------------------------------------------ */

function LessonLink({ lesson, active }: { lesson: LessonInfo; active: boolean }) {
  const { count, total } = useLessonProgress(lesson)
  const soon = lesson.status === "wkrotce"
  return (
    <Link
      href={lesson.url}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group flex gap-3 border px-3 py-3 transition-colors",
        active
          ? "border-foreground/80 bg-card"
          : "border-transparent hover:border-border hover:bg-muted/60",
        soon && "opacity-70"
      )}
    >
      <span
        className={cn(
          "font-mono text-2xl/none font-semibold tabular-nums",
          active ? "text-signal-ink" : "text-muted-foreground"
        )}
      >
        {pad2(lesson.numer)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="flex items-start justify-between gap-2">
          <span className="text-sm/snug font-medium text-pretty">{lesson.title}</span>
          {soon ? (
            <Badge variant="outline" className="shrink-0">
              <LockSimpleIcon data-icon="inline-start" />
              wkrótce
            </Badge>
          ) : null}
        </span>
        {!soon ? (
          <>
            <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
              {odmiana(total, MODULY)} · {formatCzas(lesson.czas)}
              {count > 0 ? ` · ${count}/${total}` : ""}
            </span>
            <ProgressLine value={total ? count / total : 0} />
          </>
        ) : null}
      </span>
    </Link>
  )
}

export function LessonsNav({
  lessons,
  onNavigate,
}: {
  lessons: LessonInfo[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  return (
    <nav aria-label="Lekcje" className="flex flex-col gap-3" onClick={onNavigate}>
      <p className="px-1 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
        Program kursu
      </p>
      <ul className="flex flex-col gap-1">
        {lessons.map((lesson) => (
          <li key={lesson.url}>
            <LessonLink
              lesson={lesson}
              active={pathname === lesson.url || pathname.startsWith(lesson.url + "/")}
            />
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/* Prawy panel: moduły bieżącej lekcji + spis sekcji modułu             */
/* ------------------------------------------------------------------ */

function TocList({ toc }: { toc: TOCItemType[] }) {
  const items = toc.filter((item) => item.depth <= 3)
  if (items.length === 0) return null
  return (
    <ul className="mt-1 mb-2 flex flex-col border-l ml-[1.375rem]">
      {items.map((item) => (
        <li key={item.url}>
          <TOCItem
            href={item.url}
            className={cn(
              "-ml-px block border-l border-transparent py-1 pr-2 text-[0.8125rem]/snug text-muted-foreground transition-colors hover:text-foreground data-[active=true]:border-signal data-[active=true]:font-medium data-[active=true]:text-foreground",
              item.depth >= 3 ? "pl-6" : "pl-3"
            )}
          >
            {item.title}
          </TOCItem>
        </li>
      ))}
    </ul>
  )
}

export function ModuleList({
  lesson,
  toc,
  onNavigate,
}: {
  lesson: LessonInfo
  toc?: TOCItemType[]
  onNavigate?: () => void
}) {
  const pathname = usePathname()
  const { done } = useProgress()

  const list = (
    <ol className="flex flex-col">
      {lesson.modules.map((m) => {
        const active = pathname === m.url
        const finished = done.has(m.url)
        return (
          <li key={m.url}>
            <Link
              href={m.url}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-10 items-start gap-2.5 border-l-2 px-2.5 py-2 transition-colors",
                active
                  ? "border-signal bg-accent text-accent-foreground"
                  : "border-transparent text-foreground/85 hover:bg-muted/70 hover:text-foreground"
              )}
            >
              <span
                className={cn(
                  "w-5 shrink-0 pt-px font-mono text-xs tabular-nums",
                  active ? "text-accent-foreground" : "text-muted-foreground"
                )}
              >
                {pad2(m.numer)}
              </span>
              <span className="min-w-0 flex-1 text-sm/snug">{m.nav}</span>
              {finished ? (
                <CheckIcon
                  className="mt-0.5 size-4 shrink-0 text-signal-ink"
                  weight="bold"
                  aria-label="ukończony"
                />
              ) : m.dlaProwadzacego ? (
                <ChalkboardTeacherIcon
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  aria-label="dla prowadzącego"
                />
              ) : null}
            </Link>
            {active && toc ? <TocList toc={toc} /> : null}
          </li>
        )
      })}
    </ol>
  )

  return toc && toc.length > 0 ? (
    <AnchorProvider toc={toc} single>
      {list}
    </AnchorProvider>
  ) : (
    list
  )
}

export function LessonProgressHeader({ lesson }: { lesson: LessonInfo }) {
  const { count, total } = useLessonProgress(lesson)
  return (
    <div className="flex flex-col gap-2">
      <Link
        href={lesson.url}
        className="group flex flex-col gap-0.5 hover:text-signal-ink"
      >
        <span className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
          Lekcja {pad2(lesson.numer)}
        </span>
        <span className="text-sm font-semibold">{lesson.title}</span>
      </Link>
      <div className="flex items-center gap-3">
        <ProgressLine value={total ? count / total : 0} className="flex-1" />
        <span className="font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
          {count}/{total}
        </span>
      </div>
    </div>
  )
}

export function ModulesNav({
  lesson,
  toc,
}: {
  lesson: LessonInfo
  toc?: TOCItemType[]
}) {
  return (
    <nav aria-label="Moduły lekcji" className="flex flex-col gap-4">
      <LessonProgressHeader lesson={lesson} />
      <ModuleList lesson={lesson} toc={toc} />
    </nav>
  )
}
