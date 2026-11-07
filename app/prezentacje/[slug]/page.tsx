import { promises as fs } from "node:fs"
import path from "node:path"

import type { Metadata } from "next"
import { Noto_Color_Emoji, Noto_Sans_SC } from "next/font/google"
import { notFound } from "next/navigation"

import { Przegladarka } from "@/components/prezentacja/przegladarka"
import { listaPrezentacji, wczytajPrezentacje } from "@/lib/prezentacje"
import { cn } from "@/lib/utils"

import "../slajdy.css"

/**
 * Ukryta strona z prezentacją do zajęć, np. /prezentacje/lekcja-0.
 * Treść: content/prezentacje/<slug>.md. Gotowy PDF: public/prezentacje/<slug>.pdf.
 */
export const dynamicParams = false

/* Zapasowe czcionki na emoji i znaki chińskie (np. w tabeli Unicode), żeby
   slajdy i PDF wyglądały tak samo na każdym komputerze. */
const emoji = Noto_Color_Emoji({
  weight: "400",
  subsets: ["emoji"],
  variable: "--font-emoji",
})
const cjk = Noto_Sans_SC({
  weight: ["400", "600"],
  preload: false,
  variable: "--font-cjk",
})

export async function generateStaticParams() {
  return (await listaPrezentacji()).map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await wczytajPrezentacje(slug)
  return {
    title: p?.tytul ?? "Prezentacja",
    description: p?.opis,
    robots: { index: false, follow: false },
  }
}

async function istnieje(plik: string) {
  try {
    await fs.access(plik)
    return true
  } catch {
    return false
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = await wczytajPrezentacje(slug)
  if (!p) notFound()

  const maPdf = await istnieje(
    path.join(process.cwd(), "public/prezentacje", `${slug}.pdf`)
  )

  return (
    <div className={cn(emoji.variable, cjk.variable)}>
      <Przegladarka
        tytul={p.tytul}
        lekcja={slug.replace("-", " ")}
        slajdy={p.slajdy}
        pdf={maPdf ? `/prezentacje/${slug}.pdf` : undefined}
        powrot={`/kurs/${slug}`}
      />
    </div>
  )
}
