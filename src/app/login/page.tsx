"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)
  const [adminUsername, setAdminUsername] = useState("")
  const [adminPassword, setAdminPassword] = useState("")
  const [isAdminSigningIn, setIsAdminSigningIn] = useState(false)

  const handleSignIn = async () => {
    setAuthError(null)

    try {
      await signIn("azure-ad", { callbackUrl: "/dashboard" })
    } catch (error) {
      setAuthError(
        error instanceof Error
          ? error.message
          : "Microsoft sign-in could not be started. Check your Entra ID configuration.",
      )
    }
  }

  const handleAdminSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setAuthError(null)
    setIsAdminSigningIn(true)

    try {
      const result = await signIn("admin-credentials", {
        username: adminUsername,
        password: adminPassword,
        callbackUrl: "/dashboard",
        redirect: false,
      })

      if (result?.error) {
        setAuthError("Admin sign-in failed. Check your credentials and server configuration.")
      } else if (result?.url) {
        window.location.assign(result.url)
      } else {
        setAuthError("Admin sign-in could not be completed. Please try again.")
      }
    } catch {
      setAuthError("Could not complete admin sign-in. Please try again.")
    } finally {
      setIsAdminSigningIn(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="w-full max-w-md space-y-8 p-6">
        <div className="text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-normal text-purple-700 dark:text-purple-300">
            Specialized for Edna Atienza
          </p>
          <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-gray-100">
            ARMY Making lives ezier
          </h1>
          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Securely scan and summarize your Outlook emails with AI-powered insights
          </p>

          <div className="flex h-12 w-48 items-center justify-center rounded-lg border border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 mx-auto">
            <span className="text-xl font-semibold text-gray-900 dark:text-gray-100">: D</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => void handleSignIn()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Sign in with Microsoft
          </button>
        </div>

        <form onSubmit={(event) => void handleAdminSignIn(event)} className="space-y-3">
          <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
            Admin access
          </div>
          <label className="sr-only" htmlFor="admin-username">Admin username</label>
          <input
            id="admin-username"
            name="username"
            type="text"
            autoComplete="username"
            required
            value={adminUsername}
            onChange={(event) => setAdminUsername(event.target.value)}
            placeholder="Admin username"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <label className="sr-only" htmlFor="admin-password">Admin password</label>
          <input
            id="admin-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={adminPassword}
            onChange={(event) => setAdminPassword(event.target.value)}
            placeholder="Admin password"
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
          />
          <button
            type="submit"
            disabled={isAdminSigningIn}
            className="w-full rounded-lg bg-purple-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdminSigningIn ? "Signing in..." : "Sign in as admin"}
          </button>
        </form>

        {authError && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/20 dark:text-red-200">
            {authError}
          </div>
        )}

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Your emails are processed only to create summaries and are never stored.
        </div>
      </div>
    </div>
  )
}