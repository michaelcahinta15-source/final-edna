import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)

  if (!session?.accessToken) {
    return NextResponse.json({ error: "Sign in again to reply to Outlook emails." }, { status: 401 })
  }

  const { id } = await params
  let comment: unknown

  try {
    comment = (await request.json()).comment
  } catch {
    return NextResponse.json({ error: "Enter a reply before sending." }, { status: 400 })
  }

  if (typeof comment !== "string" || !comment.trim()) {
    return NextResponse.json({ error: "Enter a reply before sending." }, { status: 400 })
  }

  if (comment.length > 8000) {
    return NextResponse.json({ error: "Replies must be 8,000 characters or fewer." }, { status: 400 })
  }

  const response = await fetch(
    `https://graph.microsoft.com/v1.0/me/messages/${encodeURIComponent(id)}/reply`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment: comment.trim() }),
      cache: "no-store",
    }
  )

  if (!response.ok) {
    const message = response.status === 403
      ? "Microsoft has not granted Mail.Send access yet. Approve that permission, then sign out and sign in again."
      : response.status === 401
        ? "Your Microsoft session expired. Sign out and sign in again."
        : "Outlook could not send this reply. Please try again."

    return NextResponse.json({ error: message }, { status: response.status === 403 ? 403 : 502 })
  }

  return NextResponse.json({ sent: true }, { headers: { "Cache-Control": "no-store" } })
}