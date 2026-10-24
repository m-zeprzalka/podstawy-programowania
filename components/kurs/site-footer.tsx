import { LogoMark } from "@/components/kurs/logo"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

/** Stopka z atrybucją wymaganą przez licencję CC BY-NC-SA 4.0. */
export function SiteFooter({ className }: { className?: string }) {
  return (
    <footer className={cn("border-t bg-muted/40", className)}>
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <LogoMark />
          <span className="font-mono text-sm">
            {site.znak} <span className="text-muted-foreground">· {site.rok}</span>
          </span>
        </div>
        <p className="max-w-2xl text-xs/relaxed text-muted-foreground text-pretty">
          © {site.rok} {site.autor}. Licencja{" "}
          <a href={site.licencja.url} className="underline underline-offset-2 hover:text-foreground">
            {site.licencja.nazwa}
          </a>
          {" "}
        </p>
      </div>
    </footer>
  )
}
