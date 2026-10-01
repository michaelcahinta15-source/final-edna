"use client"

import { FC } from "react"

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

export const EmailCard: FC<EmailCardProps> = ({
  email,
  onMarkAsRead,
  onMarkAsUnread
}) => {
  const handleToggleRead = () => {
    if (email.isRead && onMarkAsUnread) {
      onMarkAsUnread(email.id)
    } else if (!email.isRead && onMarkAsRead) {
      onMarkAsRead(email.id)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3">
            {/* Unread indicator */}
            {!email.isRead && (
              <div className="h-2.5 w-2.5 bg-blue-500 dark:bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
            )}

            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex-1">
                  {email.subject || "(No subject)"}
                </h3>
                <time className="text-xs text-gray-500 dark:text-gray-400 ml-3">
                  {new Date(email.receivedDateTime).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </time>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                From: {email.fromName} &lt;{email.fromEmail}&gt;
              </p>
              <p className="mt-2 text-gray-700 dark:text-gray-200 line-clamp-3">
                {email.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-end space-x-2">
          <button
            onClick={handleToggleRead}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            title={email.isRead ? "Mark as unread" : "Mark as read"}
          >
            {email.isRead ? (
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 6H9c-1.103 0-2 .897-2 2v8c0 1.103.897 2 2 2h11a2 2 0 002-2V8c0-1.103-.897-2-2-2z" />
              </svg>
            ) : (
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m2 0a2 2 0 100-4 2 2 0 000 4zm-5.657-.293a1 1 0 00-1.414 0 1 1 0 000 1.414l2.586 2.586a1 1 0 001.414 0 1 1 0 001.414-1.414L5.414 15.293a1 1 0 00-1.414 0 1 1 0 000 1.414z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}