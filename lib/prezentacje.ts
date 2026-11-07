import { promises as fs } from "node:fs"
import path from "node:path"

import { rehypeCode } from "fumadocs-core/mdx-plugins/rehype-code"
import type { Root as HastRoot } from "hast"
import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { Root as MdastRoot, RootContent } from "mdast"
import * as React from "react"
import { Fragment, jsx, jsxs } from "react/jsx-runtime"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"

import { Bity, Kolory, Schemat } from "@/components/prezentacja/bloki"

/**
 * Prezentacje do zajęć: zwykłe pliki Markdown w `content/prezentacje`.
 *
 * - slajdy oddziela linijka `---`,
 * - slajd zaczynający się od `# ` to slajd tytułowy,
 * - `<!-- duzy -->` w pierwszej linijce: krótki tekst bardzo dużą czcionką,
 * - `<!-- kolumny -->`: każdy nagłówek `###` zaczyna nową kolumnę,
 * - linijka `Notatki:` zaczyna notatki prowadzącego (nie trafiają na slajd),
 * - bloki kodu ```bity, ```kolory i ```schemat rysują grafikę.
 */

const KATALOG = path.join(process.cwd(), "content/prezentacje")

export type Uklad = "tytul" | "zwykly" | "duzy" | "kolumny"

export type Slajd = {
  uklad: Uklad
  tresc: React.ReactNode
  notatki: React.ReactNode | null
}

export type Prezentacja = {
  slug: string
  tytul: string
  opis: string
  slajdy: Slajd[]
}

export async function listaPrezentacji() {
  const pliki = await fs.readdir(KATALOG)
  return pliki.filter((p) => p.endsWith(".md")).map((p) => p.slice(0, -3))
}

/** Prosty nagłówek YAML: tylko pary `klucz: wartość`. */
function frontmatter(zrodlo: string) {
  const m = zrodlo.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n/)
  if (!m) return { dane: {} as Record<string, string>, reszta: zrodlo }
  const dane: Record<string, string> = {}
  for (const linia of m[1].split(/\r?\n/)) {
    const k = linia.match(/^(\w+):\s*(.*)$/)
    if (k) dane[k[1]] = k[2].replace(/^["'](.*)["']$/, "$1")
  }
  return { dane, reszta: zrodlo.slice(m[0].length) }
}

/** Dzieli tekst na linijce `separator`, pomijając bloki kodu. */
function podziel(tekst: string, separator: RegExp) {
  const czesci: string[][] = [[]]
  let wKodzie = false
  for (const linia of tekst.split(/\r?\n/)) {
    if (/^\s*```/.test(linia)) wKodzie = !wKodzie
    if (!wKodzie && separator.test(linia)) czesci.push([])
    else czesci[czesci.length - 1].push(linia)
  }
  return czesci.map((c) => c.join("\n"))
}

const BLOKI_GRAFICZNE = new Set(["bity", "kolory", "schemat"])

/** Bloki ```bity itp. zamieniamy na własne elementy, zanim zajmie się nimi Shiki. */
function blokiGraficzne(drzewo: MdastRoot) {
  const zamien = (dzieci: RootContent[]) => {
    dzieci.forEach((wezel, i) => {
      if (
        wezel.type === "code" &&
        wezel.lang &&
        BLOKI_GRAFICZNE.has(wezel.lang)
      ) {
        dzieci[i] = {
          type: "blokGraficzny",
          data: {
            hName: `slajd-${wezel.lang}`,
            hProperties: { dane: wezel.value },
            hChildren: [],
          },
        } as unknown as RootContent
      } else if ("children" in wezel) {
        zamien(wezel.children as RootContent[])
      }
    })
  }
  zamien(drzewo.children)
}

/** Układ „kolumny”: wstęp, a potem grupy zaczynające się od nagłówka `###`. */
function kolumny(drzewo: MdastRoot): MdastRoot {
  const pierwsza = drzewo.children.findIndex(
    (w) => w.type === "heading" && w.depth === 3
  )
  if (pierwsza < 0) return drzewo
  const wstep = drzewo.children.slice(0, pierwsza)
  const grupy: RootContent[][] = []
  for (const w of drzewo.children.slice(pierwsza)) {
    if (w.type === "heading" && w.depth === 3) grupy.push([w])
    else grupy[grupy.length - 1].push(w)
  }
  const kolumna = (dzieci: RootContent[]) =>
    ({
      type: "kolumna",
      data: { hName: "div", hProperties: { className: ["slajd-kolumna"] } },
      children: dzieci,
    }) as unknown as RootContent
  return {
    type: "root",
    children: [
      ...wstep,
      {
        type: "kolumny",
        data: { hName: "div", hProperties: { className: ["slajd-kolumny"] } },
        children: grupy.map(kolumna),
      } as unknown as RootContent,
    ],
  }
}

const parser = unified().use(remarkParse).use(remarkGfm)
const doHtml = unified()
  .use(remarkRehype)
  .use(rehypeCode, {
    themes: { light: "github-light", dark: "github-dark-dimmed" },
    defaultColor: false,
  })

async function renderuj(markdown: string, uklad: Uklad) {
  let drzewo = parser.parse(markdown)
  drzewo = (await parser.run(drzewo)) as MdastRoot
  blokiGraficzne(drzewo)
  if (uklad === "kolumny") drzewo = kolumny(drzewo)
  const hast = (await doHtml.run(drzewo)) as HastRoot
  return toJsxRuntime(hast, {
    Fragment,
    jsx,
    jsxs,
    components: {
      "slajd-bity": Bity,
      "slajd-kolory": Kolory,
      "slajd-schemat": Schemat,
    } as Record<string, React.ComponentType<{ dane: string }>>,
  })
}

export async function wczytajPrezentacje(
  slug: string
): Promise<Prezentacja | null> {
  let zrodlo: string
  try {
    zrodlo = await fs.readFile(path.join(KATALOG, `${slug}.md`), "utf8")
  } catch {
    return null
  }
  const { dane, reszta } = frontmatter(zrodlo)

  const slajdy = await Promise.all(
    podziel(reszta, /^---\s*$/)
      .filter((s) => s.trim() !== "")
      .map(async (surowy) => {
        const [tresc, ...notatki] = podziel(surowy, /^Notatki:\s*$/)
        // Komentarze na początku slajdu: wskazówka układu albo zwykła notka.
        const komentarze = tresc.match(/^(?:\s*<!--[\s\S]*?-->)+/)?.[0] ?? ""
        const wskazowka = komentarze.match(/<!--\s*(duzy|kolumny)\s*-->/)
        const bezWskazowki = tresc.slice(komentarze.length)
        const uklad: Uklad = wskazowka
          ? (wskazowka[1] as Uklad)
          : /^\s*#\s/.test(bezWskazowki)
            ? "tytul"
            : "zwykly"
        return {
          uklad,
          tresc: await renderuj(bezWskazowki, uklad),
          notatki: notatki.length
            ? await renderuj(notatki.join("\n"), "zwykly")
            : null,
        }
      })
  )

  return {
    slug,
    tytul: dane.title ?? slug,
    opis: dane.description ?? "",
    slajdy,
  }
}
