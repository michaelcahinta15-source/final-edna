import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

// Microsoft Graph API base URL
const GRAPH_ENDPOINT = "https://graph.microsoft.com/v1.0"

interface EmailMessage {
  id: string
  subject: string
  from: {
    emailAddress: {
      name: string
      address: string
    }
  }
  receivedDateTime: string
  isRead: boolean
  bodyPreview: string
  body?: {
    contentType: string
    content: string
  }
}

interface GraphEmailResponse {
  value: EmailMessage[]
  "@odata.nextLink"?: string
}

interface GraphCountResponse {
  "@odata.count"?: number
}

export async function getAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.accessToken ?? null
}

export async function fetchEmails(
  top = 25,
  skip = 0,
  filter = "",
  orderby = "receivedDateTime desc",
  providedAccessToken?: string
): Promise<EmailMessage[]> {
  const accessToken = providedAccessToken ?? await getAccessToken()
  if (!accessToken) {
    throw new Error("No access token available")
  }

  // Build query parameters
  const params = new URLSearchParams({
    $select: "id,subject,from,receivedDateTime,isRead,bodyPreview,body",
    $orderby: orderby,
    $top: top.toString(),
    $skip: skip.toString(),
  })

  if (filter) {
    params.append("$filter", filter)
  }

  const url = `${GRAPH_ENDPOINT}/me/messages?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    cache: "no-store", // Important for security - don't cache emails
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired - let NextAuth handle refresh
      throw new Error("Unauthorized - token may be expired")
    }
    if (response.status === 429) {
      throw new Error("Rate limit exceeded - please try again later")
    }
    throw new Error(`Failed to fetch emails: ${response.statusText}`)
  }

  const data: GraphEmailResponse = await response.json()
  return data.value
}

export async function getEmailCount(filter = "", providedAccessToken?: string): Promise<number> {
  const accessToken = providedAccessToken ?? await getAccessToken()
  if (!accessToken) {
    throw new Error("No access token available")
  }

  const params = new URLSearchParams({
    $count: "true",
  })
  if (filter) params.set("$filter", filter)

  const url = `${GRAPH_ENDPOINT}/me/messages?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ConsistencyLevel: "eventual",
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to get email count: ${response.statusText}`)
  }

  const data: GraphCountResponse = await response.json()
  if (typeof data["@odata.count"] !== "number") {
    throw new Error("Microsoft Graph did not return an email count")
  }
  return data["@odata.count"]
}

export async function getEmailsByDateRange(
  days: number,
  filter = "",
  providedAccessToken?: string
): Promise<{ date: string; count: number }[]> {
  const accessToken = providedAccessToken ?? await getAccessToken()
  if (!accessToken) {
    throw new Error("No access token available")
  }

  const endDate = new Date()
  endDate.setUTCHours(0, 0, 0, 0)
  const startDate = new Date(endDate)
  startDate.setUTCDate(startDate.getUTCDate() - days + 1)
  const endExclusive = new Date(endDate)
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1)

  const startString = startDate.toISOString()
  const endString = endExclusive.toISOString()
  const dateFilter = `receivedDateTime ge ${startString} and receivedDateTime lt ${endString}`
  const combinedFilter = filter ? `${filter} and ${dateFilter}` : dateFilter
  const params = new URLSearchParams({
    $filter: combinedFilter,
    $select: "receivedDateTime",
    $top: "1000",
  })

  const counts = new Map<string, number>()
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(startDate)
    date.setUTCDate(date.getUTCDate() + offset)
    counts.set(date.toISOString().slice(0, 10), 0)
  }

  let nextUrl: string | undefined = `${GRAPH_ENDPOINT}/me/messages?${params.toString()}`
  while (nextUrl) {
    const response = await fetch(nextUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get emails by date range: ${response.statusText}`)
    }

    const data: GraphEmailResponse = await response.json()
    for (const email of data.value) {
      const date = email.receivedDateTime.slice(0, 10)
      counts.set(date, (counts.get(date) ?? 0) + 1)
    }
    nextUrl = data["@odata.nextLink"]
  }

  return Array.from(counts, ([date, count]) => ({ date, count }))
}