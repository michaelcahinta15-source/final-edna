"use client"

export interface ErrorLog {
  id: string
  timestamp: string
  source: string
  message: string
  stack?: string
}

const STORAGE_KEY = "outlook-email-scanner:error-logs"
const UPDATED_EVENT = "outlook-email-scanner:error-logs-updated"
const MAX_LOGS = 100

export function getErrorLogs(): ErrorLog[] {
  if (typeof window === "undefined") return []

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) return []

    const logs: unknown = JSON.parse(stored)
    return Array.isArray(logs) ? logs as ErrorLog[] : []
  } catch {
    return []
  }
}

export function recordError(error: unknown, source: string): void {
  if (typeof window === "undefined") return

  const message = error instanceof Error ? error.message : String(error)
  const stack = error instanceof Error ? error.stack : undefined
  const log: ErrorLog = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    timestamp: new Date().toISOString(),
    source,
    message: message || "Unknown error",
    ...(stack ? { stack: stack.slice(0, 4000) } : {}),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([log, ...getErrorLogs()].slice(0, MAX_LOGS)))
    window.dispatchEvent(new Event(UPDATED_EVENT))
  } catch {
    // Logging must not interrupt the application when browser storage is unavailable.
  }
}

export function clearErrorLogs(): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(UPDATED_EVENT))
  } catch {
    // The UI remains usable if browser storage is unavailable.
  }
}

export function subscribeToErrorLogs(onUpdate: () => void): () => void {
  if (typeof window === "undefined") return () => {}

  window.addEventListener(UPDATED_EVENT, onUpdate)
  window.addEventListener("storage", onUpdate)
  return () => {
    window.removeEventListener(UPDATED_EVENT, onUpdate)
    window.removeEventListener("storage", onUpdate)
  }
}