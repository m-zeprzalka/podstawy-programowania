import type * as PageTree from "fumadocs-core/page-tree"

import { source, type KursPage } from "@/lib/source"

export type ModuleInfo = {
  url: string
  /** Pełny tytuł modułu. */
  title: string
  /** Krótka nazwa do nawigacji. */
  nav: string
  /** Numer modułu w lekcji (od 1). */
  numer: number
  description?: string
  czas?: number
  dlaProwadzacego: boolean
}

export type LessonInfo = {
  url: string
  title: string
  description?: string
  numer: number
  status: "dostepna" | "wkrotce"
  czas: number
  modules: ModuleInfo[]
}

function isIndex(page: KursPage) {
  return page.path.endsWith("index.mdx")
}

function folderPages(folder: PageTree.Folder): KursPage[] {
  const pages: KursPage[] = []
  const visit = (node: PageTree.Node) => {
    if (node.type === "page") {
      const page = source.getNodePage(node)
      if (page) pages.push(page)
    } else if (node.type === "folder") {
      if (node.index) visit(node.index)
      node.children.forEach(visit)
    }
  }
  if (folder.index) visit(folder.index)
  folder.children.forEach(visit)
  // Strona indeksu mogła trafić tu dwa razy (index + children).
  return pages.filter((p, i, all) => all.findIndex((q) => q.url === p.url) === i)
}

/** Wszystkie lekcje w kolejności z `content/kurs/meta.json`. */
export function getLessons(): LessonInfo[] {
  const tree = source.getPageTree()
  const lessons: LessonInfo[] = []

  tree.children.forEach((node, i) => {
    if (node.type !== "folder") return
    const pages = folderPages(node)
    const index = pages.find(isIndex)
    if (!index) return

    const modules = pages
      .filter((p) => !isIndex(p))
      .map<ModuleInfo>((p, j) => ({
        url: p.url,
        title: p.data.title,
        nav: p.data.nav ?? p.data.title,
        numer: j + 1,
        description: p.data.description,
        czas: p.data.czas,
        dlaProwadzacego: p.data.dlaProwadzacego,
      }))

    lessons.push({
      url: index.url,
      title: index.data.title,
      description: index.data.description,
      numer: index.data.numer ?? i,
      status: index.data.status,
      czas: modules.reduce((sum, m) => sum + (m.czas ?? 0), 0),
      modules,
    })
  })

  return lessons
}

/** Lekcja, do której należy strona, i pozycja modułu (null dla strony lekcji). */
export function locate(page: KursPage) {
  const lessons = getLessons()
  for (const lesson of lessons) {
    if (lesson.url === page.url) return { lesson, module: null, lessons }
    const found = lesson.modules.find((m) => m.url === page.url)
    if (found) return { lesson, module: found, lessons }
  }
  return null
}

/** Strona indeksu lekcji (np. ze źródłami we frontmatterze). */
export function getLessonIndexPage(lesson: LessonInfo) {
  return source.getPages().find((p) => p.url === lesson.url)
}

export { formatCzas, pad2 } from "@/lib/format"
