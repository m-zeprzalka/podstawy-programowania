"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useFetchSearch } from "fumadocs-core/search/client"
import {
  FileTextIcon,
  HashIcon,
  MagnifyingGlassIcon,
  TextAlignLeftIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

const SearchContext = React.createContext<(open: boolean) => void>(() => {})

/** Stan okna wyszukiwania + skrót ⌘K / Ctrl+K / „/”. */
export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing =
        target &&
        (target.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !typing)
      ) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <SearchContext.Provider value={setOpen}>
      {children}
      <SearchDialog open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}

export function SearchTrigger({ className }: { className?: string }) {
  const setOpen = React.useContext(SearchContext)
  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className={cn(
          "hidden w-56 justify-start gap-2 px-3 font-sans text-sm font-normal text-muted-foreground md:flex lg:w-64",
          className
        )}
      >
        <MagnifyingGlassIcon data-icon="inline-start" />
        <span className="flex-1 text-left">Szukaj w kursie…</span>
        <Kbd>Ctrl K</Kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        aria-label="Szukaj w kursie"
        className="md:hidden"
      >
        <MagnifyingGlassIcon />
      </Button>
    </>
  )
}

/** Usuwa znaczniki Markdown z fragmentu wyniku (także wiersze tabel). */
function plain(markdown: string) {
  return markdown
    .split("\n")
    .filter((line) => !/^\s*\|?\s*:?-{3,}/.test(line))
    .join(" ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/\*\*([^*]*)\*\*/g, "$1")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\s*\|\s*/g, " · ")
    .replace(/(?: · )+/g, " · ")
    .replace(/^ · | · $/g, "")
    .replace(/[#*_>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const { search, onSearchChange, isLoading, data } = useFetchSearch({
    api: "/api/search",
  })

  const items = React.useMemo(() => {
    if (!data) return []
    return data.items.flatMap((item) =>
      item.type === "table" ? item.rows : [item]
    )
  }, [data])

  const go = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Szukaj w kursie"
      description="Wpisz pojęcie, np. bajt, ASCII albo pętla."
      className="top-[12dvh] max-w-[calc(100%-1.5rem)] sm:max-w-xl"
    >
      <Command shouldFilter={false}>
        <CommandInput
          value={search}
          onValueChange={onSearchChange}
          placeholder="Szukaj: bajt, ASCII, pętla…"
        />
        <CommandList aria-busy={isLoading}>
          {search.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              Wpisz pojęcie, np. <span className="font-mono">bajt</span>,{" "}
              <span className="font-mono">UTF-8</span> albo{" "}
              <span className="font-mono">wyszukiwanie binarne</span>.
            </p>
          ) : (
            <>
              <CommandEmpty>
                {isLoading ? "Szukam…" : `Brak wyników dla „${search}”.`}
              </CommandEmpty>
              {items.length > 0 ? (
                <CommandGroup heading="Wyniki">
                  {items.slice(0, 40).map((item) => {
                    const Icon =
                      item.type === "page"
                        ? FileTextIcon
                        : item.type === "heading"
                          ? HashIcon
                          : TextAlignLeftIcon
                    return (
                      <CommandItem
                        key={item.id}
                        value={item.id}
                        onSelect={() => go(item.url)}
                        className={cn(item.type !== "page" && "pl-8")}
                      >
                        <Icon className="text-muted-foreground" />
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span
                            className={cn(
                              "line-clamp-2",
                              item.type === "page" && "font-medium"
                            )}
                          >
                            {plain(item.content)}
                          </span>
                          {item.breadcrumbs?.length ? (
                            <span className="truncate font-mono text-[0.6875rem] text-muted-foreground">
                              {item.breadcrumbs.map(plain).join(" / ")}
                            </span>
                          ) : null}
                        </span>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              ) : null}
            </>
          )}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
