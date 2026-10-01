"use client"

import { useState } from "react"
import type { FC, FormEvent } from "react"
import { recordError } from "@/lib/error-logs"

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

interface EmailCardProps {
  email: Email
  isNew?: boolean
  shiftDown?: boolean
  onMarkAsRead?: (id: string) => void
  onMarkAsUnread?: (id: string) => void
}

export const EmailCard: FC<EmailCardProps> = ({ email, isNew = false, shiftDown = false, onMarkAsRead, onMarkAsUnread }) => {
  const [expanded, setExpanded] = useState(false)
  const [reply, setReply] = useState("")
  const [replySending, setReplySending] = useState(false)
  const [replySent, setReplySent] = useState(false)
  const [replyError, setReplyError] = useState<string | null>(null)

  const handleToggleRead = () => {
    if (email.isRead && onMarkAsUnread) onMarkAsUnread(email.id)
    if (!email.isRead && onMarkAsRead) onMarkAsRead(email.id)
  }

  const handleReply = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!reply.trim() || replySending) return

    setReplySending(true)
    setReplyError(null)
    setReplySent(false)

    try {
      const response = await fetch(`/api/emails/${encodeURIComponent(email.id)}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: reply }),
      })
      const data: { error?: string } = await response.json()

      if (!response.ok) throw new Error(data.error || "Unable to send your reply.")

      setReply("")
      setReplySent(true)
    } catch (error) {
      recordError(error, "Send email reply")
      setReplyError(error instanceof Error ? error.message : "Unable to send your reply.")
    } finally {
      setReplySending(false)
    }
  }

  return (
    <article className={`rounded-lg bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 sm:p-6 ${isNew ? "email-arrival" : shiftDown ? "email-shift-down" : ""}`}>
      <div className="flex items-start gap-3">
        {!email.isRead && (
          <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" aria-label="Unread" />
        )}
        <div className="min-w-0 flex-1">
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={`email-preview-${email.id}`}
            onClick={() => setExpanded((value) => !value)}
            className="group w-full rounded text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-700 dark:text-gray-100 dark:group-hover:text-blue-300 sm:text-lg">
                {email.subject || "(No subject)"}
              </h3>
              <time className="shrink-0 pt-1 text-xs text-gray-500 dark:text-gray-400">
                {new Date(email.receivedDateTime).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
            </div>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              From: {email.fromName} &lt;{email.fromEmail}&gt;
            </p>
            <p className="mt-2 line-clamp-3 text-gray-700 dark:text-gray-200">{email.summary}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              {expanded ? "Hide preview" : "Read preview"}
              <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M5.22 7.22a.75.75 0 0 1 1.06 0L10 10.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
              </svg>
            </span>
          </button>
          {expanded && (
            <div id={`email-preview-${email.id}`} className="mt-4 border-t border-gray-200 pt-4 text-sm leading-6 text-gray-700 dark:border-gray-700 dark:text-gray-200">
              <p className="mb-1 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Message preview</p>
              {email.bodyPreview || email.summary}
              <form onSubmit={handleReply} className="mt-5 space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <label htmlFor={`reply-${email.id}`} className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Reply to {email.fromName}
                </label>
                <textarea
                  id={`reply-${email.id}`}
                  value={reply}
                  onChange={(event) => {
                    setReply(event.target.value)
                    setReplySent(false)
                    setReplyError(null)
                  }}
                  maxLength={8000}
                  rows={4}
                  placeholder="Write your reply..."
                  className="block w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-400"
                  disabled={replySending}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{reply.length}/8,000</span>
                  <button
                    type="submit"
                    disabled={!reply.trim() || replySending}
                    className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {replySending ? "Sending..." : "Send reply"}
                  </button>
                </div>
                {replySent && <p role="status" className="text-sm text-green-700 dark:text-green-400">Reply sent.</p>}
                {replyError && <p role="alert" className="text-sm text-red-600 dark:text-red-400">{replyError}</p>}
              </form>
            </div>
          )}
        </div>
        {(onMarkAsRead || onMarkAsUnread) && (
          <button
            type="button"
            onClick={handleToggleRead}
            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
            aria-label={email.isRead ? "Mark as unread" : "Mark as read"}
            title={email.isRead ? "Mark as unread" : "Mark as read"}
          >
            {email.isRead ? "Mark unread" : "Mark read"}
          </button>
        )}
      </div>
    </article>
  )
}