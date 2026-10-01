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

export async function getEmailCount(filter = ""): Promise<number> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    throw new Error("No access token available")
  }

  const params = new URLSearchParams({
    $count: "true",
    $filter: filter,
  })

  const url = `${GRAPH_ENDPOINT}/me/messages?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get email count: ${response.statusText}`)
  }

  // For $count=true, Graph API returns plain text
  const text = await response.text()
  return parseInt(text, 10)
}

export async function getEmailsByDateRange(
  days: number,
  filter = ""
): Promise<{ date: string; count: number }[]> {
  const accessToken = await getAccessToken()
  if (!accessToken) {
    throw new Error("No access token available")
  }

  // Calculate date range
  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(endDate.getDate() - days + 1) // Include today

  const startString = startDate.toISOString().split("T")[0]
  const endString = endDate.toISOString().split("T")[0]

  const dateFilter = filter
    ? `${filter} and receivedDateTime ge ${startString}T00:00:00Z and receivedDateTime le ${endString}T23:59:59Z`
    : `receivedDateTime ge ${startString}T00:00:00Z and receivedDateTime le ${endString}T23:59:59Z`

  // Group by date using Graph API
  const params = new URLSearchParams({
    $filter: dateFilter,
    $apply: "groupby((receivedDateTime))",
  })

  const url = `${GRAPH_ENDPOINT}/me/messages?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get emails by date range: ${response.statusText}`)
  }

  const data: any = await response.json()
  return data.value.map((item: any) => ({
    date: item.receivedDateTime.split("T")[0],
    count: item.count
  }))
}