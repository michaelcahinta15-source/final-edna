"use client"

import { useState, useCallback, useEffect } from "react"
import { fetchEmails } from "@/lib/graph"
import { getCachedSummary } from "@/lib/summarize"

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

interface UseEmailsReturn {
  emails: Email[]
  loading: boolean
  error: string | null
  hasMore: boolean
  loadMore: () => Promise<void>
  refresh: () => Promise<void>
  setFilter: (filter: string) => void
  filter: string
}

export function useEmails(initialFilter = ""): UseEmailsReturn {
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [filter, setFilter] = useState<string>(initialFilter)
  const [skip, setSkip] = useState<number>(0)
  const [refreshing, setRefreshing] = useState<boolean>(false)

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return

    setLoading(true)
    setError(null)

    try {
      const newEmails = await fetchEmails(25, skip, filter)

      if (newEmails.length === 0) {
        setHasMore(false)
        setLoading(false)
        return
      }

      // Fetch summaries for new emails
      const emailsWithSummaries = await Promise.all(
        newEmails.map(async (email) => {
          const summary = await getCachedSummary(
            email.id,
            email.bodyPreview || email.subject,
            { maxLength: 2 }
          )

          return {
            id: email.id,
            subject: email.subject,
            fromName: email.from.emailAddress.name || email.from.emailAddress.address,
            fromEmail: email.from.emailAddress.address,
            receivedDateTime: email.receivedDateTime,
            isRead: email.isRead,
            summary,
            bodyPreview: email.bodyPreview || ""
          }
        })
      )

      setEmails(prev => [...prev, ...emailsWithSummaries])
      setSkip(prev => prev + 25)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, skip, filter])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    setError(null)
    setEmails([])
    setSkip(0)
    setHasMore(true)

    try {
      await loadMore()
    } finally {
      setRefreshing(false)
    }
  }, [loadMore])

  // Initial load
  useEffect(() => {
    refresh()
  }, [refresh, filter])

  return {
    emails,
    loading: loading || refreshing,
    error,
    hasMore,
    loadMore,
    refresh,
    setFilter,
    filter
  }
}