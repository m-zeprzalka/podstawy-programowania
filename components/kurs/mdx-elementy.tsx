import * as React from "react"
import Link from "next/link"
import { ArrowUpRightIcon } from "@phosphor-icons/react/ssr"

import { KopiujButton } from "@/components/kurs/kopiuj"
import { cn } from "@/lib/utils"

const LANG_LABELS: Record<string, string> = {
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  c: "C",
  py: "Python",
  python: "Python",
  json: "JSON",
  bash: "Terminal",
  sh: "Terminal",
  txt: "Tekst",
  text: "Tekst",
  plaintext: "Tekst",
}

let codeCounter = 0

/** Blok kodu z Shiki: pasek z językiem/tytułem i przyciskiem kopiowania. */
export function Pre({
  children,
  title,
  className,
  // Ikona języka z rehype-code (SVG jako tekst) — nie przekazujemy jej do DOM.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  icon: _icon,
  ...props
}: React.ComponentProps<"pre"> & { title?: string; icon?: string }) {
  const code = React.isValidElement<{ className?: string }>(children) ? children : null
  const lang = code?.props.className?.match(/language-(\S+)/)?.[1] ?? "plaintext"
  const label = title ?? LANG_LABELS[lang] ?? lang
  const id = `kod-${++codeCounter}`

  return (
    <figure className="not-prose my-6 border bg-card">
      <figcaption className="flex h-10 items-center justify-between gap-2 border-b bg-muted/60 pr-1 pl-3">
        <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <span className="size-1.5 bg-muted-foreground/50" aria-hidden />
          {label}
        </span>
        <KopiujButton targetId={id} />
      </figcaption>
      <pre
        id={id}
        className={cn(
          "overflow-x-auto py-3.5 font-mono text-[0.8125rem] leading-6 [tab-size:4]",
          className
        )}
        {...props}
        style={undefined}
      >
        {children}
      </pre>
    </figure>
  )
}

/** Nagłówki z kotwicą „#” do linkowania sekcji. */
function createHeading(Tag: "h2" | "h3" | "h4") {
  return function Heading({ id, children, ...props }: React.ComponentProps<"h2">) {
    return (
      <Tag id={id} className="group/heading" {...props}>
        {children}
        {id ? (
          <a
            href={`#${id}`}
            data-bare
            aria-label="Link do tej sekcji"
            className="ml-2 font-mono text-[0.8em] font-normal text-muted-foreground no-underline opacity-0 transition-opacity group-hover/heading:opacity-100 focus-visible:opacity-100"
          >
            #
          </a>
        ) : null}
      </Tag>
    )
  }
}

export const H2 = createHeading("h2")
export const H3 = createHeading("h3")
export const H4 = createHeading("h4")

/** Linki: wewnętrzne przez next/link, zewnętrzne w nowej karcie ze strzałką. */
export function A({ href = "", children, ...props }: React.ComponentProps<"a">) {
  const external = /^https?:\/\//.test(href)
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
        <ArrowUpRightIcon
          className="ml-0.5 inline size-[0.85em] -translate-y-px align-baseline text-muted-foreground"
          aria-label="(otwiera się w nowej karcie)"
        />
      </a>
    )
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} {...props}>
      {children}
    </Link>
  )
}

/** Tabele przewijane poziomo na wąskich ekranach. */
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="not-prose my-6 overflow-x-auto border" tabIndex={0} role="region" aria-label="Tabela">
      <table className={cn("tabela-kurs", className)} {...props} />
    </div>
  )
}
