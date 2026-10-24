import { cn } from "@/lib/utils"

/** Liczba jako rząd „diod” (bitów), np. 5 → ▫▫▪▫▪. Dekoracja z podpisem dla czytników. */
export function BityLed({
  wartosc,
  bity = 5,
  className,
}: {
  wartosc: number
  bity?: number
  className?: string
}) {
  const bin = wartosc.toString(2).padStart(bity, "0").slice(-bity)
  return (
    <span
      className={cn("inline-flex items-center gap-[3px]", className)}
      role="img"
      aria-label={`${wartosc} dwójkowo: ${bin}`}
      title={`${wartosc} = ${bin}₂`}
    >
      {bin.split("").map((b, i) => (
        <span
          key={i}
          className={cn(
            "size-2",
            b === "1" ? "bg-signal shadow-[0_0_6px_var(--signal)]" : "border border-foreground/25"
          )}
        />
      ))}
    </span>
  )
}
