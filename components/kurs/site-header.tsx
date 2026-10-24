import Link from "next/link"

import { Logo } from "@/components/kurs/logo"
import { MobileMenu, ReadingProgress } from "@/components/kurs/mobile"
import { SearchTrigger } from "@/components/kurs/search"
import { SettingsMenu } from "@/components/kurs/settings-menu"
import { getLessons } from "@/lib/kurs"
import { cn } from "@/lib/utils"

export function SiteHeader({
  variant = "kurs",
}: {
  /** „kurs” ma menu lekcji i pasek czytania; „start” to nagłówek strony głównej. */
  variant?: "kurs" | "start"
}) {
  const lessons = getLessons()
  const first = lessons.find((l) => l.status === "dostepna")

  return (
    <header className="sticky top-0 z-40 h-(--header-height) border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div
        className={cn(
          "mx-auto flex h-full items-center gap-2 px-4 md:px-6",
          variant === "kurs" ? "max-w-[90rem]" : "max-w-6xl"
        )}
      >
        {variant === "kurs" ? <MobileMenu lessons={lessons} /> : null}
        <Logo />
        {variant === "start" ? (
          <nav aria-label="Sekcje strony" className="ml-6 hidden items-center gap-1 lg:flex">
            {[
              ["#jak", "Jak się uczymy"],
              ["#program", "Program"],
              ["#o-kursie", "O kursie"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </a>
            ))}
          </nav>
        ) : null}
        <div className="ml-auto flex items-center gap-1">
          <SearchTrigger />
          <SettingsMenu />
          {variant === "start" && first ? (
            <Link
              href={first.url}
              className="ml-2 hidden h-9 items-center bg-primary px-3.5 font-mono text-[0.8125rem] font-medium text-primary-foreground transition-colors hover:bg-primary/85 sm:flex"
            >
              Zacznij naukę
            </Link>
          ) : null}
        </div>
      </div>
      {variant === "kurs" ? <ReadingProgress /> : null}
    </header>
  )
}
