"use client"

import * as React from "react"
import { CheckIcon, CopyIcon } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"

/** Kopiuje tekst elementu wskazanego przez `targetRef` (np. bloku kodu). */
export function KopiujButton({ targetId }: { targetId: string }) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (!copied) return
    const t = window.setTimeout(() => setCopied(false), 1600)
    return () => window.clearTimeout(t)
  }, [copied])

  const copy = async () => {
    const el = document.getElementById(targetId)
    if (!el) return
    try {
      await navigator.clipboard.writeText(el.innerText.replace(/\n$/, ""))
      setCopied(true)
    } catch {
      // Brak uprawnień do schowka: nic nie robimy.
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={copy}
      aria-label={copied ? "Skopiowano" : "Kopiuj kod"}
      className="text-muted-foreground"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}
