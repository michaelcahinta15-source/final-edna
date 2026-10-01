import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { getEmailCount, getEmailsByDateRange } from "@/lib/graph"

export const dynamic = "force-dynamic"

const DAYS_BY_RANGE: Record<string, number> = {
  today: 1,
  "7days": 7,
  "30days": 30,
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json(
      { error: "Sign in to load your Outlook dashboard." },
      { status: 401, headers: { "Cache-Control": "no-store" } }
    )
  }

  const range = new URL(request.url).searchParams.get("range") ?? "7days"
  const days = DAYS_BY_RANGE[range] ?? DAYS_BY_RANGE["7days"]

  try {
    const [total, read, unread, emailTrend] = await Promise.all([
      getEmailCount("", session.accessToken),
      getEmailCount("isRead eq true", session.accessToken),
      getEmailCount("isRead eq false", session.accessToken),
      getEmailsByDateRange(days, "", session.accessToken),
    ])

    return NextResponse.json(
      {
        stats: { total, read, unread },
        emailTrend,
        userName: session.user?.name?.split(" ")[0] || "User",
        updatedAt: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "no-store" } }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load dashboard data"
    const status = message.includes("Unauthorized") || message.includes("No access token") ? 401 : 502
    return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
  }
}