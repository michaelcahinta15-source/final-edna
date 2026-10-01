"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import LogoutButton from "@/components/logout-button"
import ThemeToggle from "@/components/theme-toggle"
import { clearErrorLogs, getErrorLogs, subscribeToErrorLogs, type ErrorLog } from "@/lib/error-logs"

export default function ErrorsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [search, setSearch] = useState("")

  useEffect(() => {
    const updateLogs = () => setLogs(getErrorLogs())
    updateLogs()
    return subscribeToErrorLogs(updateLogs)
  }, [])

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return logs
    return logs.filter((log) => `${log.source} ${log.message}`.toLowerCase().includes(query))
  }, [logs, search])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white shadow-sm dark:bg-gray-800">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Outlook Email Scanner</span>
          <div className="hidden items-center gap-4 md:flex">
            <Link href="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Home</Link>
            <Link href="/summaries" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Summaries</Link>
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">Dashboard</Link>
            <Link href="/errors" aria-current="page" className="font-medium text-gray-900 dark:text-gray-100">Errors</Link>
            <ThemeToggle />
          </div>
          <LogoutButton />
        </div>
      </nav>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">Diagnostics</p>
              <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-gray-100">Error logs</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {logs.length} {logs.length === 1 ? "error" : "errors"} saved in this browser · newest first
              </p>
            </div>
            <button
              type="button"
              onClick={clearErrorLogs}
              disabled={logs.length === 0}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Clear logs
            </button>
          </header>

          <label className="block max-w-xl">
            <span className="sr-only">Search error logs</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search messages or source..."
              className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400"
            />
          </label>

          {filteredLogs.length === 0 ? (
            <div className="border-y border-gray-200 py-14 text-center dark:border-gray-700">
              <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {logs.length === 0 ? "No errors recorded" : "No matching errors"}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {logs.length === 0 ? "Browser and email workflow errors will appear here." : "Try another search term."}
              </p>
            </div>
          ) : (
            <ol className="divide-y divide-gray-200 border-y border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              {filteredLogs.map((log) => (
                <li key={log.id} className="py-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-800 dark:bg-rose-950 dark:text-rose-200">Error</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{log.source}</span>
                      </div>
                      <p className="mt-2 break-words text-sm text-gray-900 dark:text-gray-100">{log.message}</p>
                      {log.stack && (
                        <details className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <summary className="w-fit cursor-pointer">Stack trace</summary>
                          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded bg-gray-100 p-3 dark:bg-gray-800">{log.stack}</pre>
                        </details>
                      )}
                    </div>
                    <time className="shrink-0 text-xs text-gray-500 dark:text-gray-400" dateTime={log.timestamp}>
                      {new Date(log.timestamp).toLocaleString()}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </main>
    </div>
  )
}