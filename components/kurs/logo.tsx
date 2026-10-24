import Link from "next/link"

import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Znak kursu: bajt litery „P” (0x50 = 0101 0000) jako 8 bitów. */
export function LogoMark({ className }: { className?: string }) {
  const bits = "01010000"
  return (
    <span
      aria-hidden
      className={cn("grid grid-cols-4 gap-[2px]", className)}
    >
      {bits.split("").map((b, i) => (
        <span
          key={i}
          className={cn(
            "size-[5px]",
            b === "1" ? "bg-signal shadow-[0_0_6px_var(--signal)]" : "bg-foreground/80"
          )}
        />
      ))}
    </span>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "group flex items-center gap-2.5 py-2 outline-offset-4",
        className
      )}
      aria-label={`${site.nazwa}: strona główna`}
    >
      <LogoMark />
      <span className="flex items-baseline gap-1 text-sm font-semibold tracking-tight">
        <span className="font-mono text-muted-foreground transition-colors group-hover:text-signal-ink">
          ~/
        </span>
        <span>podstawy</span>
        <span className="hidden text-muted-foreground sm:inline">programowania</span>
      </span>
    </Link>
  )
}
