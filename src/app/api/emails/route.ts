import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { fetchEmails } from "@/lib/graph"
import { getCachedSummary } from "@/lib/summarize"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Sign in to load your Outlook emails." }, { status: 401 })
  }

  try {
    const messages = await fetchEmails(25, 0, "", "receivedDateTime desc", session.accessToken)
    const emails = await Promise.all(messages.map(async (message) => ({
      id: message.id,
      subject: message.subject || "(No subject)",
      fromName: message.from?.emailAddress?.name || message.from?.emailAddress?.address || "Unknown sender",
      fromEmail: message.from?.emailAddress?.address || "",
      receivedDateTime: message.receivedDateTime,
      isRead: message.isRead,
      bodyPreview: message.bodyPreview || "",
      summary: await getCachedSummary(message.id, message.bodyPreview || message.subject || "", { maxLength: 2 }),
    })))

    return NextResponse.json({ emails }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Outlook emails."
    const status = message.includes("Unauthorized") || message.includes("No access token") ? 401 : 502
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
  }
}