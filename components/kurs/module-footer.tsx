"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  CircleIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { useProgress } from "@/hooks/use-progress"
import { pad2 } from "@/lib/format"
import type { LessonInfo, ModuleInfo } from "@/lib/kurs"
import { cn } from "@/lib/utils"

export function ModuleFooter({
  lesson,
  module,
  prev,
  next,
}: {
  lesson: LessonInfo
  module: ModuleInfo
  prev?: ModuleInfo
  next?: ModuleInfo
}) {
  const { done, toggle } = useProgress()
  const finished = done.has(module.url)

  return (
    <footer className="mt-16 flex flex-col gap-8">
      <div
        className={cn(
          "flex flex-col gap-4 border p-5 sm:flex-row sm:items-center",
          finished ? "border-signal bg-signal-soft" : "border-dashed"
        )}
      >
        <div className="flex flex-1 flex-col gap-1">
          <p className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
            Moduł {pad2(module.numer)} z {pad2(lesson.modules.length)}
          </p>
          <p className="font-medium" aria-live="polite">
            {finished
              ? "Moduł ukończony. Tak trzymaj!"
              : "Przeczytane i przećwiczone? Oznacz moduł jako ukończony."}
          </p>
        </div>
        <Button
          variant={finished ? "outline" : "default"}
          size="lg"
          onClick={() => toggle(module.url)}
          aria-pressed={finished}
        >
          {finished ? (
            <CheckCircleIcon data-icon="inline-start" weight="fill" />
          ) : (
            <CircleIcon data-icon="inline-start" />
          )}
          {finished ? "Ukończony" : "Oznacz jako ukończony"}
        </Button>
      </div>

      <nav aria-label="Sąsiednie moduły" className="grid gap-3 sm:grid-cols-2">
        {prev ? (
          <PagerLink href={prev.url} direction="prev" numer={prev.numer} title={prev.nav} />
        ) : (
          <PagerLink href={lesson.url} direction="prev" title="Przegląd lekcji" />
        )}
        {next ? (
          <PagerLink
            href={next.url}
            direction="next"
            numer={next.numer}
            title={next.nav}
            onClick={() => toggle(module.url, true)}
          />
        ) : (
          <PagerLink href={lesson.url} direction="next" title="Wróć do przeglądu lekcji" />
        )}
      </nav>
    </footer>
  )
}

function PagerLink({
  href,
  direction,
  numer,
  title,
  onClick,
}: {
  href: string
  direction: "prev" | "next"
  numer?: number
  title: string
  onClick?: () => void
}) {
  const next = direction === "next"
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "group flex min-h-20 flex-col justify-center gap-1 border px-4 py-3 transition-colors hover:border-foreground/50 hover:bg-muted/50",
        next && "items-end text-right sm:col-start-2"
      )}
    >
      <span className="flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
        {!next ? <ArrowLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" /> : null}
        {next ? "Dalej" : "Wstecz"}
        {numer ? ` · ${pad2(numer)}` : ""}
        {next ? <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" /> : null}
      </span>
      <span className="font-medium text-pretty">{title}</span>
    </Link>
  )
}
