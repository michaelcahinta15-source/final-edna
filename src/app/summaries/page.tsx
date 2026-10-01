"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { EmailCard } from "@/components/email-card"
import ThemeToggle from "@/components/theme-toggle"
import LogoutButton from "@/components/logout-button"

const SAMPLE_EMAILS = [
  {
    id: "1",
    subject: "Quarterly planning update",
    fromName: "Sarah Johnson",
    fromEmail: "sarah@contoso.com",
    receivedDateTime: "2026-09-30T09:15:00Z",
    isRead: false,
    summary: "The planning update highlights the launch timeline and asks for approval on the revised milestones before Friday.",
    bodyPreview: "The planning update highlights the launch timeline and asks for approval on the revised milestones before Friday.",
  },
  {
    id: "2",
    subject: "Team standup notes",
    fromName: "Alex Chen",
    fromEmail: "alex@contoso.com",
    receivedDateTime: "2026-09-29T16:40:00Z",
    isRead: true,
    summary: "The notes confirm the sprint goals, blockers, and next review meeting scheduled for Thursday afternoon.",
    bodyPreview: "The notes confirm the sprint goals, blockers, and next review meeting scheduled for Thursday afternoon.",
  },
  {
    id: "3",
    subject: "Customer follow-up",
    fromName: "Priya Patel",
    fromEmail: "priya@contoso.com",
    receivedDateTime: "2026-09-28T08:05:00Z",
    isRead: false,
    summary: "The customer requested a proposal review and an updated pricing breakdown before the end of the week.",
    bodyPreview: "The customer requested a proposal review and an updated pricing breakdown before the end of the week.",
  },
  {
    id: "4",
    subject: "Travel approvals",
    fromName: "Jordan Lee",
    fromEmail: "jordan@contoso.com",
    receivedDateTime: "2026-09-27T11:20:00Z",
    isRead: true,
    summary: "Approval for the travel request is in place and the team is coordinating hotel and flight bookings.",
    bodyPreview: "Approval for the travel request is in place and the team is coordinating hotel and flight bookings.",
  },
]

export default function SummariesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [dateRange, setDateRange] = useState("7days")

  const filteredEmails = useMemo(() => {
    return SAMPLE_EMAILS.filter((email) => {
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
  }, [searchTerm, unreadOnly, dateRange])

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

            {filteredEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No emails found matching your filters.</p>
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
