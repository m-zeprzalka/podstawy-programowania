import type { MetadataRoute } from "next"

import { site } from "@/lib/site"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.nazwa,
    short_name: "Podstawy",
    description: site.opis,
    lang: "pl",
    start_url: "/",
    display: "standalone",
    background_color: "#0e1311",
    theme_color: "#0e1311",
    icons: [
      { src: "/icon/192", sizes: "192x192", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png" },
      { src: "/icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
