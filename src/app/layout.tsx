import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Outlook Email Scanner | BTS Edition",
  description: "A BTS-inspired Outlook email scanner with AI-powered summaries",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full bts-theme">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}