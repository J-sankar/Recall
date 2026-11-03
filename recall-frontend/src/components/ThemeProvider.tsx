import { useEffect, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './themeContext'

function storedTheme(): Theme | null {
  try {
    const value = localStorage.getItem('recall-theme')
    return value === 'dark' || value === 'light' ? value : null
  } catch {
    return null
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState(storedTheme)
  const [systemTheme, setSystemTheme] = useState<Theme>(() => window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const theme = preference ?? systemTheme

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystemTheme(media.matches ? 'dark' : 'light')
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'recall-theme' || event.key === null) setPreference(storedTheme())
    }
    media.addEventListener('change', onChange)
    window.addEventListener('storage', onStorage)
    return () => {
      media.removeEventListener('change', onChange)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  function toggleTheme() {
    const next = theme === 'dark' ? 'light' : 'dark'
    setPreference(next)
    try { localStorage.setItem('recall-theme', next) } catch { /* Keep the theme for this session. */ }
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}
