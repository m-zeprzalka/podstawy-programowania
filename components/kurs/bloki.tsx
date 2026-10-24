import * as React from "react"
import {
  ChalkboardTeacherIcon,
  InfoIcon,
  KeyIcon,
  LightbulbIcon,
  TargetIcon,
  WarningIcon,
} from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"

/** Mała etykieta w stylu terminala: „// CEL MODUŁU”. */
export function Eyebrow({
  icon: Icon,
  className,
  children,
}: {
  icon?: React.ComponentType<{ className?: string; weight?: "regular" | "bold" | "fill" | "duotone" }>
  className?: string
  children: React.ReactNode
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-1.5 font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase",
        className
      )}
    >
      {Icon ? <Icon className="size-3.5" weight="bold" /> : null}
      {children}
    </p>
  )
}

/** 🎯 Cel modułu. */
export function Cel({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose my-6 border-l-2 border-signal bg-signal-soft px-4 py-3.5 md:px-5">
      <Eyebrow icon={TargetIcon} className="text-signal-ink">
        Cel modułu
      </Eyebrow>
      <div className="mt-1.5 text-base/relaxed font-medium md:text-[1.0625rem]/relaxed">
        {children}
      </div>
    </div>
  )
}

/** 🔑 Pojęcia: pary [polski, angielski]. */
export function Pojecia({ lista }: { lista: [string, string?][] }) {
  return (
    <div className="not-prose my-6 border px-4 py-3.5 md:px-5">
      <Eyebrow icon={KeyIcon}>Pojęcia</Eyebrow>
      <ul className="mt-3 flex flex-wrap gap-2">
        {lista.map(([pl, en]) => (
          <li
            key={pl}
            className="flex flex-wrap items-baseline gap-x-1.5 border bg-background px-2.5 py-1.5 text-sm"
          >
            <span className="font-medium">{pl}</span>
            {en ? (
              <span lang="en" className="font-mono text-xs text-muted-foreground">
                {en}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

const calloutStyles = {
  info: {
    icon: InfoIcon,
    label: "Informacja",
    className: "border-border bg-muted/50",
    accent: "text-foreground",
  },
  wskazowka: {
    icon: LightbulbIcon,
    label: "Wskazówka",
    className: "border-signal/40 bg-signal-soft",
    accent: "text-signal-ink",
  },
  uwaga: {
    icon: WarningIcon,
    label: "Uwaga",
    className: "border-amber/50 bg-amber-soft",
    accent: "text-amber-ink",
  },
} as const

/** Wyróżniony akapit: informacja, wskazówka albo uwaga (np. sprostowanie). */
export function Ramka({
  typ = "info",
  tytul,
  children,
}: {
  typ?: keyof typeof calloutStyles
  tytul?: string
  children: React.ReactNode
}) {
  const style = calloutStyles[typ]
  const Icon = style.icon
  return (
    <aside
      className={cn(
        "my-6 flex gap-3 border px-4 py-3.5 md:px-5",
        style.className
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", style.accent)} weight="duotone" />
      <div className="min-w-0 flex-1">
        <p className={cn("font-mono text-xs font-semibold tracking-wide uppercase", style.accent)}>
          {tytul ?? style.label}
        </p>
        <div className="mt-1 text-[0.9375rem]/relaxed md:text-base/relaxed [&>*+*]:mt-2">
          {children}
        </div>
      </div>
    </aside>
  )
}

export function Uwaga(props: { tytul?: string; children: React.ReactNode }) {
  return <Ramka typ="uwaga" {...props} />
}

export function Wskazowka(props: { tytul?: string; children: React.ReactNode }) {
  return <Ramka typ="wskazowka" {...props} />
}

/**
 * Treść widoczna tylko w trybie prowadzącego (przełącznik w ustawieniach).
 * Ukrywanie działa w CSS, więc nie ma mignięcia ani błędów hydratacji.
 */
export function DlaProwadzacego({
  tytul = "Dla prowadzącego",
  children,
}: {
  tytul?: string
  children: React.ReactNode
}) {
  return (
    <aside className="tylko-prowadzacy my-6 border border-dashed border-amber bg-amber-soft px-4 py-3.5 md:px-5">
      <Eyebrow icon={ChalkboardTeacherIcon} className="text-amber-ink">
        {tytul}
      </Eyebrow>
      <div className="mt-2 text-[0.9375rem]/relaxed md:text-base/relaxed [&>*+*]:mt-2">
        {children}
      </div>
    </aside>
  )
}
