'use client'

import { Moon, Sun } from 'lucide-react'
import { DARK_CLASS, THEME_STORAGE_KEY } from '@/app/_components/theme-storage'
import { Button } from '@/components/ui/button'

function toggleTheme(): void {
  const isDark = document.documentElement.classList.toggle(DARK_CLASS)
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light')
  } catch {
    // Storage is unavailable; the choice still applies until the next full load.
  }
}

// No React state: the DOM class is the source of truth and CSS swaps the icons.
export function ThemeToggle() {
  return (
    <Button variant="outline" size="icon" onClick={toggleTheme} className="relative">
      <Sun
        aria-hidden="true"
        className="size-[1.2rem] transition-transform dark:scale-0 dark:-rotate-90"
      />
      <Moon
        aria-hidden="true"
        className="absolute size-[1.2rem] scale-0 rotate-90 transition-transform dark:scale-100 dark:rotate-0"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
