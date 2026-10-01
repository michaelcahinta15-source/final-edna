import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
import ThemeToggle from "@/components/theme-toggle"
import LogoutButton from "@/components/logout-button"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (!session) {
    // Redirect to login if not authenticated
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-center">Redirecting to login...</p>
      </div>
    )
  }

  // Extract user info from session
  const userName = session.user?.name?.split(" ")[0] || "there"

  // Mock data for now - will be replaced with actual Graph API calls
  const mockUnreadCount = 5
  const mockEmailsToday = 12

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Outlook Email Scanner
              </span>
            </div>
            <div className="hidden md:flex md:items-center md:space-x-4">
              <Link href="/" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Home
              </Link>
              <Link href="/summaries" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
                Summaries
              </Link>
              <Link href="/dashboard" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
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

      <main className="flex-1">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Good morning, {userName}!
              </h1>
              <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
                Ready to scan and summarize your Outlook emails?
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Unread Count Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Unread Emails
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {mockUnreadCount}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 text-2xl">📧</span>
                  </div>
                </div>
              </div>

              {/* Emails Today Card */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Emails Today
                    </p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {mockEmailsToday}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                    <span className="text-green-600 dark:text-green-400 text-2xl">📅</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="col-span-2 md:col-span-1 lg:col-span-1">
                <div className="space-y-4">
                  <Link
                    href="/summaries"
                    className="w-full bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg active:translate-y-0 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="text-xl">📋</span>
                    View my summaries
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full bg-green-600 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg active:translate-y-0 dark:bg-green-500 dark:hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="text-xl">📊</span>
                    Open dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}