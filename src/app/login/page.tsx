"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  const [authError, setAuthError] = useState<string | null>(null)

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