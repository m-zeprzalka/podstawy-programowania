"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, ChalkboardTeacherIcon, CheckIcon } from "@phosphor-icons/react"

import { useLessonProgress } from "@/components/kurs/nawigacja"
import { MODULY, formatCzas, odmiana, pad2 } from "@/lib/format"
import { buttonVariants } from "@/components/ui/button"
import type { LessonInfo } from "@/lib/kurs"
import { cn } from "@/lib/utils"

/** Przycisk „Zacznij” / „Kontynuuj” zależny od postępu. */
export function LessonStart({ lesson }: { lesson: LessonInfo }) {
  const { done, count, total } = useLessonProgress(lesson)
  const next = lesson.modules.find((m) => !done.has(m.url)) ?? lesson.modules[0]
  if (!next) return null
  const label =
    count === 0 ? "Zacznij lekcję" : count === total ? "Powtórz od początku" : "Kontynuuj"
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link href={next.url} className={cn(buttonVariants({ size: "lg" }))}>
        {label}
        <ArrowRightIcon data-icon="inline-end" />
      </Link>
      <span className="font-mono text-xs text-muted-foreground tabular-nums">
        {count > 0 && count < total
          ? `Następny: ${pad2(next.numer)} · ${next.nav}`
          : `${odmiana(total, MODULY)} · ok. ${formatCzas(lesson.czas)}`}
      </span>
    </div>
  )
}

/** Siatka modułów lekcji z oznaczeniem ukończonych. */
export function ModuleGrid({ lesson }: { lesson: LessonInfo }) {
  const { done } = useLessonProgress(lesson)
  return (
    <ol className="grid gap-px border bg-border sm:grid-cols-2">
      {lesson.modules.map((m) => {
        const finished = done.has(m.url)
        return (
          <li key={m.url} className="bg-background">
            <Link
              href={m.url}
              className="group flex h-full gap-3 p-4 transition-colors hover:bg-muted/60"
            >
              <span
                className={cn(
                  "font-mono text-sm font-semibold tabular-nums",
                  finished ? "text-signal-ink" : "text-muted-foreground"
                )}
              >
                {pad2(m.numer)}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-medium text-pretty group-hover:underline group-hover:decoration-signal group-hover:decoration-2 group-hover:underline-offset-4">
                    {m.nav}
                  </span>
                  {finished ? (
                    <CheckIcon className="mt-1 size-4 shrink-0 text-signal-ink" weight="bold" aria-label="ukończony" />
                  ) : m.dlaProwadzacego ? (
                    <ChalkboardTeacherIcon className="mt-1 size-4 shrink-0 text-muted-foreground" aria-label="dla prowadzącego" />
                  ) : null}
                </span>
                {m.description ? (
                  <span className="text-sm/snug text-muted-foreground text-pretty">{m.description}</span>
                ) : null}
                {m.czas ? (
                  <span className="mt-auto pt-1 font-mono text-[0.6875rem] text-muted-foreground tabular-nums">
                    ~{m.czas} min
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
