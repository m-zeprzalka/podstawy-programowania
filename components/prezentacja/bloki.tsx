import { ArrowRightIcon } from "@phosphor-icons/react/ssr"

import { cn } from "@/lib/utils"

/**
 * Grafiki na slajdach, rysowane z bloków kodu w Markdownie.
 * Rozmiary w jednostkach `cqw`, więc skalują się razem ze slajdem.
 */

/** ```bity: w każdej linijce bity (np. 0100 0001), a po nich opcjonalny podpis. */
export function Bity({ dane }: { dane: string }) {
  const wiersze = dane
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const slowa = l.split(/\s+/)
      const bity: string[] = []
      while (slowa.length && /^[01]+$/.test(slowa[0])) bity.push(slowa.shift()!)
      return { bity: bity.join(""), podpis: slowa.join(" ") }
    })
    .filter((w) => w.bity.length > 0)

  return (
    <div className="slajd-bity flex flex-col gap-[2.2cqw]">
      {wiersze.map(({ bity, podpis }, i) => (
        <div
          key={i}
          className="flex flex-wrap items-end gap-x-[2.4cqw] gap-y-[1cqw]"
        >
          <ol className="flex gap-[0.7cqw]" aria-label={`Bity ${bity}`}>
            {bity.split("").map((b, j) => (
              <li key={j} className="flex flex-col items-center gap-[0.5cqw]">
                <span className="font-mono text-[1.15cqw] text-muted-foreground tabular-nums">
                  {2 ** (bity.length - 1 - j)}
                </span>
                <span
                  className={cn(
                    "flex size-[5.4cqw] items-center justify-center border-[0.18cqw] font-mono text-[2.6cqw] font-semibold",
                    b === "1"
                      ? "border-signal bg-signal text-signal-foreground shadow-[0_0_1.6cqw_var(--signal)]"
                      : "border-border bg-muted text-muted-foreground"
                  )}
                >
                  {b}
                </span>
              </li>
            ))}
          </ol>
          <p className="pb-[0.6cqw] font-mono text-[3.4cqw] leading-none font-semibold tabular-nums">
            = {parseInt(bity, 2)}
          </p>
          {podpis ? (
            <p className="pb-[0.8cqw] text-[2cqw] leading-none text-muted-foreground">
              {podpis}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

/** ```kolory: w każdej linijce kolor #RRGGBB, a po nim opcjonalny opis. */
export function Kolory({ dane }: { dane: string }) {
  const kolory = dane
    .split("\n")
    .map((l) => l.trim().match(/^(#[0-9a-fA-F]{6})\s*(.*)$/))
    .filter((m): m is RegExpMatchArray => m !== null)
    .map((m) => {
      const hex = m[1].toUpperCase()
      const rgb = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))
      return { hex, rgb, opis: m[2] }
    })

  return (
    <ul className="slajd-kolory grid auto-cols-fr grid-flow-col gap-[1.6cqw]">
      {kolory.map((k) => (
        <li key={k.hex} className="flex min-w-0 flex-col gap-[0.8cqw]">
          <span
            className="aspect-square w-full border-[0.12cqw] border-border"
            style={{ backgroundColor: k.hex }}
            aria-hidden
          />
          <span className="font-mono text-[1.8cqw] font-semibold">{k.hex}</span>
          <span className="font-mono text-[1.3cqw] text-muted-foreground tabular-nums">
            rgb({k.rgb.join(", ")})
          </span>
          {k.opis ? (
            <span className="text-[1.5cqw] leading-snug">{k.opis}</span>
          ) : null}
        </li>
      ))}
    </ul>
  )
}

function Strzalka() {
  return (
    <span
      className="flex items-center justify-center text-muted-foreground"
      aria-hidden
    >
      <ArrowRightIcon className="size-[3cqw]" />
    </span>
  )
}

/** ```schemat: linijki „wejście: …”, „skrzynka: …”, „wyjście: …”. */
export function Schemat({ dane }: { dane: string }) {
  const pole = (klucz: RegExp) =>
    dane
      .split("\n")
      .map((l) => l.trim())
      .find((l) => klucz.test(l))
      ?.replace(klucz, "")
      .trim() ?? ""
  const wejscie = pole(/^wej[sś]cie:\s*/i)
  const skrzynka = pole(/^skrzynka:\s*/i)
  const wyjscie = pole(/^wyj[sś]cie:\s*/i)

  return (
    <ol className="slajd-schemat grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-[1.2cqw]">
      <li className="flex flex-col gap-[0.8cqw] border-[0.12cqw] border-border bg-background p-[1.8cqw]">
        <span className="slajd-etykieta">Wejście</span>
        <span className="text-[2cqw] leading-snug">{wejscie}</span>
      </li>
      <Strzalka />
      <li className="flex flex-col justify-center gap-[0.8cqw] bg-primary p-[1.8cqw] text-primary-foreground">
        <span className="slajd-etykieta opacity-75">Czarna skrzynka</span>
        <span className="text-[2.2cqw] leading-snug font-semibold">
          {skrzynka}
        </span>
      </li>
      <Strzalka />
      <li className="flex flex-col gap-[0.8cqw] border-[0.12cqw] border-dashed border-input p-[1.8cqw]">
        <span className="slajd-etykieta">Wyjście</span>
        <span className="text-[2cqw] leading-snug">{wyjscie}</span>
      </li>
    </ol>
  )
}
