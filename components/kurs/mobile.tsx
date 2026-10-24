"use client"

import * as React from "react"
import Link from "next/link"
import type { TOCItemType } from "fumadocs-core/toc"
import {
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  ListIcon,
} from "@phosphor-icons/react"

import { LessonProgressHeader, LessonsNav, ModuleList } from "@/components/kurs/nawigacja"
import { Logo } from "@/components/kurs/logo"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { pad2 } from "@/lib/format"
import type { LessonInfo, ModuleInfo } from "@/lib/kurs"
import { site } from "@/lib/site"

/** Menu lekcji (wysuwany panel) na telefonach i tabletach. */
export function MobileMenu({ lessons }: { lessons: LessonInfo[] }) {
  const [open, setOpen] = React.useState(false)
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon" aria-label="Otwórz menu lekcji" className="-ml-2 xl:hidden" />
        }
      >
        <ListIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88%] max-w-sm gap-0 text-sm">
        <SheetHeader className="border-b px-4 py-2">
          <SheetTitle className="sr-only">Menu kursu</SheetTitle>
          <SheetDescription className="sr-only">Lista lekcji kursu {site.nazwa}</SheetDescription>
          <Logo />
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <LessonsNav lessons={lessons} onNavigate={() => setOpen(false)} />
          <div className="mt-6 flex flex-col gap-1 border-t pt-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="px-1 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              Strona główna
            </Link>
            <Link
              href="/kurs"
              onClick={() => setOpen(false)}
              className="px-1 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              O kursie i program
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

/**
 * Dolny pasek modułu na telefonie: poprzedni / lista modułów / następny.
 * Lista otwiera się jako arkusz od dołu (Drawer), z postępem i spisem sekcji.
 */
export function ModuleBar({
  lesson,
  module,
  prev,
  next,
  toc,
}: {
  lesson: LessonInfo
  module: ModuleInfo
  prev?: ModuleInfo
  next?: ModuleInfo
  toc?: TOCItemType[]
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/92 pb-safe backdrop-blur-md supports-[backdrop-filter]:bg-background/80 lg:hidden">
      <div className="flex h-14 items-stretch">
        {prev ? (
          <Link
            href={prev.url}
            aria-label={`Poprzedni moduł: ${prev.nav}`}
            className="flex w-14 shrink-0 items-center justify-center border-r text-muted-foreground active:bg-muted"
          >
            <CaretLeftIcon className="size-5" />
          </Link>
        ) : (
          <span className="w-14 shrink-0 border-r" aria-hidden />
        )}

        <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
          <DrawerTrigger className="flex min-w-0 flex-1 items-center gap-3 px-4 text-left active:bg-muted">
            <span className="font-mono text-xs text-signal-ink tabular-nums">
              {pad2(module.numer)}
              <span className="text-muted-foreground">/{pad2(lesson.modules.length)}</span>
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium">{module.nav}</span>
            <CaretUpIcon className="size-4 shrink-0 text-muted-foreground" />
          </DrawerTrigger>
          <DrawerContent className="text-sm">
            <DrawerHeader className="border-b pb-4 group-data-[swipe-axis=y]/drawer-popup:text-left">
              <DrawerTitle className="sr-only">Moduły lekcji</DrawerTitle>
              <DrawerDescription className="sr-only">
                Wybierz moduł lekcji {lesson.title}
              </DrawerDescription>
              <LessonProgressHeader lesson={lesson} />
            </DrawerHeader>
            <div className="overflow-y-auto overscroll-contain px-2 py-3 pb-safe">
              <ModuleList lesson={lesson} toc={toc} onNavigate={() => setOpen(false)} />
            </div>
          </DrawerContent>
        </Drawer>

        {next ? (
          <Link
            href={next.url}
            aria-label={`Następny moduł: ${next.nav}`}
            className="flex w-14 shrink-0 items-center justify-center border-l bg-primary text-primary-foreground active:bg-primary/85"
          >
            <CaretRightIcon className="size-5" />
          </Link>
        ) : (
          <span className="w-14 shrink-0 border-l" aria-hidden />
        )}
      </div>
    </div>
  )
}

/** Cienki pasek postępu czytania pod nagłówkiem. */
export function ReadingProgress() {
  const ref = React.useRef<HTMLSpanElement>(null)
  React.useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const el = document.documentElement
      const max = el.scrollHeight - el.clientHeight
      const value = max > 0 ? Math.min(1, el.scrollTop / max) : 0
      if (ref.current) ref.current.style.transform = `scaleX(${value})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])
  return (
    <span aria-hidden className="pointer-events-none absolute inset-x-0 -bottom-px h-0.5">
      <span
        ref={ref}
        className="block h-full origin-left bg-signal"
        style={{ transform: "scaleX(0)" }}
      />
    </span>
  )
}
