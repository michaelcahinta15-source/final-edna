"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import StatCard from "@/components/stat-card"
import ThemeToggle from "@/components/theme-toggle"
import LogoutButton from "@/components/logout-button"

interface DateRangeOption {
  value: string
  label: string
}

const DATE_RANGES: DateRangeOption[] = [
  { value: "today", label: "Today" },
  { value: "7days", label: "7 Days" },
  { value: "30days", label: "30 Days" },
]

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>("7days")
  const [stats, setStats] = useState<{
    total: number
    read: number
    unread: number
  }>({ total: 0, read: 0, unread: 0 })
  const [emailTrend, setEmailTrend] = useState<Array<{ date: string; count: number }>>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [userName, setUserName] = useState("User")
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let inFlight = false

    async function fetchData() {
      if (inFlight) return
      inFlight = true
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/dashboard?range=${dateRange}`, { cache: "no-store" })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to load dashboard data")
        }

        if (!cancelled) {
          setStats(data.stats)
          setEmailTrend(data.emailTrend)
          setUserName(data.userName)
          setLastUpdatedAt(data.updatedAt)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data")
        }
      } finally {
        inFlight = false
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()
    const intervalId = window.setInterval(fetchData, 60_000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [dateRange])

  if (loading && (stats.total === 0 || emailTrend.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Emails
                </span>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Home
                </Link>
                <Link href="/summaries" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Summaries
                </Link>
                <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 font-medium text-gray-900 dark:text-gray-100">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <span className="text-gray-900 dark:text-gray-100">{userName}</span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </nav>

        <div className="flex-1">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Loading dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <nav className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Emails
                </span>
              </div>
              <div className="hidden md:flex md:items-center md:space-x-4">
                <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Home
                </Link>
                <Link href="/summaries" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                  Summaries
                </Link>
                <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 font-medium text-gray-900 dark:text-gray-100">
                  Dashboard
                </Link>
                <div className="flex items-center gap-4">
                  <ThemeToggle />
                  <span className="text-gray-900 dark:text-gray-100">{userName}</span>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
        </nav>

        <div className="flex-1">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const { total, read, unread } = stats
  const readPercentage = total > 0 ? Math.round((read / total) * 100) : 0
  const unreadPercentage = total > 0 ? Math.round((unread / total) * 100) : 0

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                EMAILS
              </span>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Home
              </Link>
              <Link href="/summaries" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Summaries
              </Link>
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 font-medium text-gray-900 dark:text-gray-100">
                Dashboard
              </Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <span className="text-gray-900 dark:text-gray-100">{userName}</span>
              </div>
            </div>
            <LogoutButton />
          </div>
        </div>
      </nav>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {/* Dashboard Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Email Dashboard
              </h1>

              {/* Date Range Filter */}
              <div className="flex items-center space-x-3">
                {lastUpdatedAt && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Updated {new Date(lastUpdatedAt).toLocaleTimeString()}
                  </span>
                )}
                <label className="text-gray-700 dark:text-gray-300">
                  Time period:
                </label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="ml-2 block pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 sm:text-sm"
                >
                  {DATE_RANGES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Stat Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              {/* Total Emails */}
              <StatCard
                title="Total Emails"
                value={total}
                icon={<span className="text-xl">📧</span>}
                bgColor="bg-blue-100 dark:bg-blue-900"
                textColor="text-gray-900 dark:text-gray-100"
              />

              {/* Read Emails */}
              <StatCard
                title="Read Emails"
                value={read}
                icon={<span className="text-xl">✓</span>}
                bgColor="bg-green-100 dark:bg-green-900"
                textColor="text-gray-900 dark:text-gray-100"
                trendValue={readPercentage}
                trendLabel="of total"
              />

              {/* Unread Emails */}
              <StatCard
                title="Unread Emails"
                value={unread}
                icon={<span className="text-xl">•</span>}
                bgColor="bg-yellow-100 dark:bg-yellow-900"
                textColor="text-gray-900 dark:text-gray-100"
                trendValue={unreadPercentage}
                trendLabel="of total"
              />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Read vs Unread Donut Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Read vs Unread Emails
                </h3>
                <div className="h-96 w-full">
                  {(read === 0 && unread === 0) ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No email data available</p>
                    </div>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-6">
                      <div
                        className="h-40 w-40 rounded-full p-5"
                        style={{
                          background: `conic-gradient(#9b5de5 0% ${readPercentage}%, #f15bb5 ${readPercentage}% 100%)`,
                        }}
                        role="img"
                        aria-label={`${readPercentage}% read, ${unreadPercentage}% unread`}
                      >
                        <div className="flex h-full w-full items-center justify-center rounded-full bg-white dark:bg-gray-800">
                          <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{read + unread}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600 dark:text-gray-300">
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                          {readPercentage}% Read
                        </span>
                        <span className="inline-flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full bg-green-500" aria-hidden="true" />
                          {unreadPercentage}% Unread
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Email Trend Bar Chart */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Emails Received per Day
                </h3>
                <div className="h-96 w-full">
                  {(emailTrend.length === 0) ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-gray-500 dark:text-gray-400">No trend data available</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {emailTrend.map((day, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-20 text-right text-xs text-gray-500 dark:text-gray-400">
                            {new Date(day.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex-1 h-4 bg-blue-100 dark:bg-blue-900 rounded relative">
                            <div
                              className={`absolute left-0 top-0 h-4 bg-blue-500 dark:bg-blue-400 rounded`}
                              style={{ width: `${Math.min(day.count / Math.max(1, ...emailTrend.map(d => d.count)) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <div className="w-20 text-left text-xs text-gray-500 dark:text-gray-400">
                            {day.count} emails
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}