"use client"

import * as React from "react"
import { Moon, Sun } from "@phosphor-icons/react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isDark = mounted && resolvedTheme === "dark"
  const label = isDark ? "Switch to light theme" : "Switch to dark theme"

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun weight="bold" /> : <Moon weight="bold" />}
    </Button>
  )
}

export { ThemeProvider, ThemeToggle }
