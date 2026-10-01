"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { EmailCard } from "@/components/email-card"
import ThemeToggle from "@/components/theme-toggle"
import LogoutButton from "@/components/logout-button"

interface Email {
  id: string
  subject: string
  fromName: string
  fromEmail: string
  receivedDateTime: string
  isRead: boolean
  summary: string
  bodyPreview: string
}

export default function SummariesPage() {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [dateRange, setDateRange] = useState("7days")

  useEffect(() => {
    let cancelled = false

    async function loadEmails() {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/emails", { cache: "no-store" })
        const data: { emails?: Email[]; error?: string } = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Unable to load your emails.")
        }

        if (!cancelled) setEmails(data.emails ?? [])
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Unable to load your emails.")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadEmails()
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const matchesSearch =
        searchTerm.trim().length === 0 ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesUnread = !unreadOnly || !email.isRead

      const matchesDateRange = (() => {
        if (dateRange === "all") return true

        const receivedDate = new Date(email.receivedDateTime)
        const now = new Date()
        const days = dateRange === "today" ? 1 : dateRange === "7days" ? 7 : 30
        const start = new Date(now)
        start.setDate(now.getDate() - days + 1)

        return receivedDate >= start && receivedDate <= now
      })()

      return matchesSearch && matchesUnread && matchesDateRange
    })
  }, [emails, searchTerm, unreadOnly, dateRange])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">Outlook Email Scanner</span>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Home</Link>
              <Link href="/summaries" className="text-gray-500 dark:text-gray-400 font-medium text-gray-900 dark:text-gray-100">Summaries</Link>
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Dashboard</Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <span className="text-gray-900 dark:text-gray-100">User</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Email Summaries</h1>

              <div className="flex flex-col md:flex-row md:space-x-4 w-full md:w-auto">
                <div className="relative w-full md:w-64">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 105.636 12.364m11.264 3.899L15.054 9.75" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search emails..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 sm:text-sm"
                  />
                </div>

                <div className="flex flex-col md:flex-row md:space-x-3 w-full md:w-auto space-y-2 md:space-y-0">
                  <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={unreadOnly}
                      onChange={(e) => setUnreadOnly(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
                    />
                    Unread only
                  </label>

                  <div className="relative w-full md:w-32">
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 sm:text-sm"
                    >
                      <option value="today">Today</option>
                      <option value="7days">7 days</option>
                      <option value="30days">30 days</option>
                      <option value="all">All time</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400" role="status">
                Loading your Outlook emails...
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <p className="text-red-600 dark:text-red-400">{error}</p>
                <button
                  type="button"
                  onClick={() => setRefreshKey((key) => key + 1)}
                  className="mt-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  {emails.length === 0 ? "No Outlook emails found." : "No emails match your filters."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEmails.map((email) => (
                  <EmailCard key={email.id} email={email} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
