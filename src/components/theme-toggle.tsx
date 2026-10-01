"use client"

import { useEffect, useState } from "react"

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    const nextTheme = savedTheme ? savedTheme === "dark" : systemPrefersDark

    setIsDark(nextTheme)
    document.documentElement.classList.toggle("dark", nextTheme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      if (!localStorage.getItem("theme")) {
        const newIsDark = mediaQuery.matches
        setIsDark(newIsDark)
        document.documentElement.classList.toggle("dark", newIsDark)
      }
    }

    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const toggleTheme = () => {
    const nextTheme = !isDark
    setIsDark(nextTheme)
    localStorage.setItem("theme", nextTheme ? "dark" : "light")
    document.documentElement.classList.toggle("dark", nextTheme)
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
      aria-label="Toggle theme"
    >
      {isDark ? (
        <svg className="h-4 w-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m12.95 6.95-1.41-1.41M8.46 8.46 7.05 7.05m9.9 0-1.41 1.41M8.46 15.54l-1.41 1.41" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m12.95 6.95-1.41-1.41M8.46 8.46 7.05 7.05m9.9 0-1.41 1.41M8.46 15.54l-1.41 1.41" />
        </svg>
      )}
    </button>
  )
}
