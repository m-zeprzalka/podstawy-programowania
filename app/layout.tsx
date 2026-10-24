import type { Metadata, Viewport } from "next"
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google"

import "./globals.css"
import { SearchProvider } from "@/components/kurs/search"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { teacherModeScript } from "@/lib/preferences"
import { site } from "@/lib/site"
import { cn } from "@/lib/utils"

const plexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-plex-sans",
})

const plexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
})

export const metadata: Metadata = {
  title: {
    default: site.nazwa,
    template: `%s · ${site.nazwa}`,
  },
  description: site.opis,
  applicationName: site.nazwa,
  appleWebApp: {
    capable: true,
    title: site.nazwa,
    statusBarStyle: "black-translucent",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfcfa" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1311" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pl"
      suppressHydrationWarning
      className={cn("antialiased", plexSans.variable, plexMono.variable)}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: teacherModeScript }} />
      </head>
      <body className="min-h-dvh">
        <ThemeProvider>
          <TooltipProvider delay={300}>
            <SearchProvider>{children}</SearchProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
