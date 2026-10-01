"use client"

import { useState } from "react"
import type { FC } from "react"

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
  onMarkAsRead?: (id: string) => void
  onMarkAsUnread?: (id: string) => void
}

export const EmailCard: FC<EmailCardProps> = ({ email, onMarkAsRead, onMarkAsUnread }) => {
  const [expanded, setExpanded] = useState(false)

  const handleToggleRead = () => {
    if (email.isRead && onMarkAsUnread) onMarkAsUnread(email.id)
    if (!email.isRead && onMarkAsRead) onMarkAsRead(email.id)
  }

  return (
    <article className="rounded-lg bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:bg-gray-800 sm:p-6">
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