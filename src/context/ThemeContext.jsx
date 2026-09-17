import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react"

export const preferenceKey = "cotext-settings"
const validThemes = new Set(["dark", "light", "system"])

export const themes = {
  dark: {
    background: "#09090B",
    surface: "#111317",
    surface2: "#18181B",
    text: "#FFFFFF",
    textSecondary: "#A1A1AA",
    textMuted: "#71717A",
    border: "rgba(255,255,255,0.06)",
    input: "#111317",
    sidebar: "#0D0D10",
  },
  light: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surface2: "#F1F5F9",
    text: "#111827",
    textSecondary: "#374151",
    textMuted: "#6B7280",
    border: "rgba(15,23,42,0.08)",
    input: "#FFFFFF",
    sidebar: "#FFFFFF",
  },
}

const ThemeContext = createContext(null)

function readThemePreference() {
  try {
    const raw = localStorage.getItem(preferenceKey)
    const settings = raw ? JSON.parse(raw) : {}
    return validThemes.has(settings?.appearance) ? settings.appearance : "dark"
  } catch {
    return "dark"
  }
}

function getSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return "dark"
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark"
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readThemePreference)

  useLayoutEffect(() => {
    const applyTheme = (preference) => {
      const activeTheme =
        preference === "system" ? getSystemTheme() : preference
      const values = themes[activeTheme]
      const root = document.documentElement

      root.dataset.theme = activeTheme
      root.classList.remove("dark", "light")
      root.classList.add(activeTheme)

      root.style.setProperty("--theme-background", values.background)
      root.style.setProperty("--theme-surface", values.surface)
      root.style.setProperty("--theme-surface2", values.surface2)
      root.style.setProperty("--theme-text", values.text)
      root.style.setProperty("--theme-text-secondary", values.textSecondary)
      root.style.setProperty("--theme-text-muted", values.textMuted)
      root.style.setProperty("--theme-border", values.border)
      root.style.setProperty("--theme-input", values.input)
      root.style.setProperty("--theme-sidebar", values.sidebar)
    }

    applyTheme(theme)

    if (theme !== "system") return undefined

    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)")
    const handleChange = () => applyTheme("system")
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }
    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [theme])

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== preferenceKey) return

      try {
        const settings = JSON.parse(event.newValue)
        if (validThemes.has(settings?.appearance)) {
          setTheme(settings.appearance)
        }
      } catch {
        // Ignore malformed settings written by another tab.
      }
    }

    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  const updateTheme = (nextTheme) => {
    if (!validThemes.has(nextTheme)) return
    setTheme(nextTheme)

    try {
      const raw = localStorage.getItem(preferenceKey)
      const settings = raw ? JSON.parse(raw) : {}
      localStorage.setItem(
        preferenceKey,
        JSON.stringify({ ...settings, appearance: nextTheme }),
      )
    } catch (error) {
      console.error("Unable to save theme preference", error)
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: updateTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
