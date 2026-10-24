"use client"

import * as React from "react"
import { ArrowSquareOutIcon } from "@phosphor-icons/react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export type ZrodloInfo = { tytul: string; url: string }

const ZrodlaContext = React.createContext<ZrodloInfo[]>([])

/** Udostępnia listę źródeł lekcji przypisom `<Zrodlo>`. */
export function ZrodlaProvider({
  zrodla,
  children,
}: {
  zrodla: ZrodloInfo[]
  children: React.ReactNode
}) {
  return <ZrodlaContext.Provider value={zrodla}>{children}</ZrodlaContext.Provider>
}

function host(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "")
  } catch {
    return url
  }
}

/** Przypis do źródła lekcji, np. `<Zrodlo n={4} />` albo `<Zrodlo n={[4, 7]} />`. */
export function Zrodlo({ n }: { n: number | number[] }) {
  const zrodla = React.useContext(ZrodlaContext)
  const numbers = Array.isArray(n) ? n : [n]
  const items = numbers
    .map((num) => ({ num, info: zrodla[num - 1] }))
    .filter((x): x is { num: number; info: ZrodloInfo } => Boolean(x.info))

  if (items.length === 0) return null

  return (
    <Popover>
      <PopoverTrigger
        className="relative -top-[0.45em] ml-0.5 inline-flex min-h-0 items-center px-0.5 font-mono text-[0.68em] leading-none text-muted-foreground tabular-nums transition-colors hover:text-signal-ink focus-visible:text-signal-ink"
        aria-label={`Źródło ${numbers.join(", ")}`}
      >
        [{numbers.join(",")}]
      </PopoverTrigger>
      <PopoverContent className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <ul className="flex flex-col divide-y">
          {items.map(({ num, info }) => (
            <li key={num} className="flex gap-3 p-3">
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                [{num}]
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <p className="text-sm/snug font-medium">{info.tytul}</p>
                <a
                  href={info.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-1 truncate font-mono text-xs text-signal-ink underline-offset-2 hover:underline"
                >
                  {host(info.url)}
                  <ArrowSquareOutIcon className="size-3 shrink-0" />
                </a>
              </div>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}

/** Pełna, numerowana lista źródeł lekcji. */
export function ListaZrodel() {
  const zrodla = React.useContext(ZrodlaContext)
  return (
    <ol className="not-prose my-6 flex flex-col divide-y border-y">
      {zrodla.map((z, i) => (
        <li key={z.url + i} id={`zrodlo-${i + 1}`} className="flex gap-3 py-2.5 text-sm">
          <span className="w-8 shrink-0 pt-px font-mono text-xs text-muted-foreground tabular-nums">
            [{i + 1}]
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-medium">{z.tytul}</span>
            <a
              href={z.url}
              target="_blank"
              rel="noreferrer noopener"
              className="truncate font-mono text-xs text-muted-foreground underline-offset-2 hover:text-signal-ink hover:underline"
            >
              {z.url.replace(/^https?:\/\//, "")}
            </a>
          </div>
        </li>
      ))}
    </ol>
  )
}
