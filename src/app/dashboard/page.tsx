"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import StatCard from "@/components/stat-card"
import ThemeToggle from "@/components/theme-toggle"

interface DateRangeOption {
  value: string
  label: string
}

const DATE_RANGES: DateRangeOption[] = [
  { value: "today", label: "Today" },
  { value: "7days", label: "7 Days" },
  { value: "30days", label: "30 Days" },
]

const DASHBOARD_DATA: Record<string, { total: number; read: number; unread: number; trend: Array<{ date: string; count: number }> }> = {
  today: {
    total: 132,
    read: 81,
    unread: 51,
    trend: [
      { date: "2026-09-26", count: 24 },
      { date: "2026-09-27", count: 31 },
      { date: "2026-09-28", count: 19 },
      { date: "2026-09-29", count: 42 },
      { date: "2026-09-30", count: 16 },
    ],
  },
  "7days": {
    total: 386,
    read: 234,
    unread: 152,
    trend: [
      { date: "2026-09-26", count: 36 },
      { date: "2026-09-27", count: 54 },
      { date: "2026-09-28", count: 44 },
      { date: "2026-09-29", count: 72 },
      { date: "2026-09-30", count: 62 },
    ],
  },
  "30days": {
    total: 1842,
    read: 1105,
    unread: 737,
    trend: [
      { date: "2026-09-08", count: 48 },
      { date: "2026-09-12", count: 56 },
      { date: "2026-09-16", count: 61 },
      { date: "2026-09-22", count: 70 },
      { date: "2026-09-30", count: 84 },
    ],
  },
}

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<string>("7days")

  const stats = useMemo(() => DASHBOARD_DATA[dateRange] ?? DASHBOARD_DATA["7days"], [dateRange])
  const { total, read, unread, trend } = stats
  const readPercentage = total > 0 ? Math.round((read / total) * 100) : 0
  const unreadPercentage = total > 0 ? Math.round((unread / total) * 100) : 0
  const maxTrendValue = Math.max(...trend.map((day) => day.count), 1)

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
              <Link href="/summaries" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">Summaries</Link>
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 font-medium text-gray-900 dark:text-gray-100">Dashboard</Link>
              <div className="flex items-center gap-4">
                <ThemeToggle />
                <span className="text-gray-900 dark:text-gray-100">User</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Email Dashboard</h1>

              <div className="flex items-center space-x-3">
                <label className="text-gray-700 dark:text-gray-300">Time period:</label>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="ml-2 block pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 sm:text-sm"
                >
                  {DATE_RANGES.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <StatCard
                title="Total Emails"
                value={total}
                icon={<span className="text-xl">📧</span>}
                bgColor="bg-blue-100 dark:bg-blue-900"
                textColor="text-gray-900 dark:text-gray-100"
              />

              <StatCard
                title="Read Emails"
                value={read}
                icon={<span className="text-xl">✓</span>}
                bgColor="bg-green-100 dark:bg-green-900"
                textColor="text-gray-900 dark:text-gray-100"
                trendValue={readPercentage}
                trendLabel="of total"
              />

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

            <div className="grid gap-6 md:grid-cols-2">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Read vs Unread Emails</h3>
                <div className="h-96 w-full">
                  <div className="relative h-full flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-32 h-32 rounded-full border-[22px] border-blue-500 border-r-green-500 border-b-green-500 border-l-blue-500 shadow-inner bg-white dark:bg-gray-800 flex items-center justify-center">
                        <span className="text-xl font-bold text-gray-900 dark:text-gray-100">{total}</span>
                      </div>
                    </div>
                    <div className="mt-32 text-center text-sm text-gray-500 dark:text-gray-400">
                      {readPercentage}% Read • {unreadPercentage}% Unread
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Emails Received per Day</h3>
                <div className="h-96 w-full">
                  <div className="space-y-4 pt-4">
                    {trend.map((day, index) => (
                      <div key={`${day.date}-${index}`} className="flex items-center gap-3">
                        <div className="w-20 text-right text-xs text-gray-500 dark:text-gray-400">
                          {new Date(day.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </div>
                        <div className="flex-1 h-4 bg-blue-100 dark:bg-blue-900 rounded relative overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-4 bg-blue-500 dark:bg-blue-400 rounded"
                            style={{ width: `${(day.count / maxTrendValue) * 100}%` }}
                          />
                        </div>
                        <div className="w-20 text-left text-xs text-gray-500 dark:text-gray-400">{day.count} emails</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
