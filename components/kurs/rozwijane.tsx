"use client"

import * as React from "react"
import {
  CaretDownIcon,
  ChalkboardTeacherIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useTeacherMode } from "@/hooks/use-progress"
import { cn } from "@/lib/utils"

function Rozwijany({
  icon: Icon,
  etykieta,
  tytul,
  meta,
  open,
  onOpenChange,
  className,
  children,
}: {
  icon: React.ComponentType<{ className?: string; weight?: "duotone" }>
  etykieta: string
  tytul?: string
  meta?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}) {
  return (
    <Collapsible
      open={open}
      onOpenChange={onOpenChange}
      className={cn("group/rozwijany my-6 border", className)}
    >
      <CollapsibleTrigger className="flex min-h-12 w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60 md:px-5">
        <Icon className="size-5 shrink-0 text-muted-foreground" weight="duotone" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-2">
          <span className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
            {etykieta}
            {meta ? <span className="tabular-nums"> · {meta}</span> : null}
          </span>
          {tytul ? <span className="font-medium">{tytul}</span> : null}
        </span>
        <CaretDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[open]/rozwijany:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="h-(--collapsible-panel-height) overflow-hidden transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0">
        <div className="border-t px-4 py-4 text-[0.9375rem]/relaxed md:px-5 md:text-base/relaxed [&>*+*]:mt-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

/** 🧪 Ćwiczenie na zajęciach (demo prowadzącego). W trybie prowadzącego otwarte. */
export function NaZajeciach({
  tytul,
  czas,
  children,
}: {
  tytul?: string
  /** Np. „5 min”. */
  czas?: string
  children: React.ReactNode
}) {
  const [teacher] = useTeacherMode()
  const [open, setOpen] = React.useState<boolean | null>(null)
  return (
    <Rozwijany
      icon={ChalkboardTeacherIcon}
      etykieta="Na zajęciach"
      meta={czas}
      tytul={tytul}
      open={open ?? teacher}
      onOpenChange={setOpen}
      className="border-dashed"
    >
      {children}
    </Rozwijany>
  )
}

/** 🔍 Dla dociekliwych: treść dodatkowa, domyślnie zwinięta. */
export function Dociekliwi({
  tytul,
  children,
}: {
  tytul?: string
  children: React.ReactNode
}) {
  return (
    <Rozwijany icon={MagnifyingGlassIcon} etykieta="Dla dociekliwych" tytul={tytul}>
      {children}
    </Rozwijany>
  )
}
