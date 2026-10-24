import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Rama każdego interaktywnego przykładu („laboratorium”).
 * Pasek tytułu w stylu okna terminala, treść na karcie, opcjonalna stopka.
 */
function Lab({
  tytul,
  opis,
  akcje,
  stopka,
  className,
  children,
}: {
  /** Nazwa przykładu, np. „Żarówki”. */
  tytul: string
  /** Krótka instrukcja pod paskiem tytułu. */
  opis?: React.ReactNode
  /** Przyciski po prawej stronie paska (np. reset). */
  akcje?: React.ReactNode
  /** Pasek na dole (wskazówka, wynik, źródło). */
  stopka?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section
      data-lab
      aria-label={`Interaktywny przykład: ${tytul}`}
      className={cn(
        "not-prose my-8 border bg-card text-card-foreground",
        className
      )}
    >
      <header className="flex min-h-11 items-center gap-3 border-b bg-muted/60 py-1 pr-1.5 pl-3">
        <span className="flex items-center gap-1.5" aria-hidden>
          <span className="size-2 bg-signal shadow-[0_0_8px_var(--signal)]" />
          <span className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
            Lab
          </span>
        </span>
        <h3 className="min-w-0 flex-1 truncate font-mono text-[0.8125rem] font-semibold">
          {tytul}
        </h3>
        {akcje ? <div className="flex items-center gap-1">{akcje}</div> : null}
      </header>
      {opis ? (
        <p className="border-b px-4 py-3 text-sm/relaxed text-muted-foreground md:px-5">
          {opis}
        </p>
      ) : null}
      <div className="p-4 md:p-5">{children}</div>
      {stopka ? (
        <footer className="border-t bg-muted/40 px-4 py-2.5 font-mono text-xs text-muted-foreground md:px-5">
          {stopka}
        </footer>
      ) : null}
    </section>
  )
}

/** Siatka odczytów (DEC / HEX / BIN …). */
function LabReadouts({
  className,
  ...props
}: React.ComponentProps<"dl">) {
  return (
    <dl
      className={cn(
        "grid grid-cols-2 gap-px border bg-border sm:grid-cols-4",
        className
      )}
      {...props}
    />
  )
}

/** Pojedynczy odczyt: etykieta mono + duża wartość. */
function LabReadout({
  label,
  value,
  hint,
  accent = false,
  className,
}: {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
  accent?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1 bg-card p-3", className)}>
      <dt className="font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase">
        {label}
      </dt>
      <dd
        className={cn(
          "truncate font-mono text-xl font-medium tabular-nums md:text-2xl",
          accent && "text-signal-ink"
        )}
      >
        {value}
      </dd>
      {hint ? (
        <dd className="truncate font-mono text-xs text-muted-foreground">
          {hint}
        </dd>
      ) : null}
    </div>
  )
}

/** Etykieta sekcji wewnątrz laboratorium. */
function LabLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "font-mono text-[0.6875rem] font-medium tracking-widest text-muted-foreground uppercase",
        className
      )}
      {...props}
    />
  )
}

export { Lab, LabReadouts, LabReadout, LabLabel }
