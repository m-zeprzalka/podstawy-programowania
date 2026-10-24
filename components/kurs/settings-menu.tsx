"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  ChalkboardTeacherIcon,
  DesktopIcon,
  GearSixIcon,
  MoonIcon,
  SunIcon,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTeacherMode } from "@/hooks/use-progress"

/** Ustawienia: motyw i tryb prowadzącego. */
export function SettingsMenu() {
  const { theme, setTheme } = useTheme()
  const [teacher, setTeacher] = useTeacherMode()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" size="icon" aria-label="Ustawienia" />}
      >
        <GearSixIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Motyw</DropdownMenuLabel>
          <DropdownMenuRadioGroup value={theme ?? "system"} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <SunIcon />
              Jasny
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <MoonIcon />
              Ciemny
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <DesktopIcon />
              Jak w systemie
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Widok</DropdownMenuLabel>
          <DropdownMenuCheckboxItem checked={teacher} onCheckedChange={setTeacher}>
            <ChalkboardTeacherIcon />
            Tryb prowadzącego
          </DropdownMenuCheckboxItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/** Szybki przełącznik jasny/ciemny. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="Przełącz motyw jasny/ciemny"
    >
      <SunIcon className="hidden dark:block" />
      <MoonIcon className="dark:hidden" />
    </Button>
  )
}
