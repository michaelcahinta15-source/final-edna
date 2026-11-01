import { createHash, timingSafeEqual } from "node:crypto"
import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"
import CredentialsProvider from "next-auth/providers/credentials"

const microsoftClientId =
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? process.env.AZURE_AD_CLIENT_ID ?? ""
const microsoftClientSecret =
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? process.env.AZURE_AD_CLIENT_SECRET ?? ""
const microsoftTenantId =
  process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ?? process.env.AZURE_AD_TENANT_ID ?? "common"
const adminUsername = process.env.ADMIN_USERNAME ?? ""
const adminPassword = process.env.ADMIN_PASSWORD ?? ""

export const isMicrosoftAuthConfigured = Boolean(microsoftClientId && microsoftClientSecret)
const isAdminAuthConfigured = Boolean(adminUsername && adminPassword)

function matchesConfiguredCredential(value: unknown, configuredValue: string): boolean {
  if (typeof value !== "string") {
    return false
  }

  const valueHash = createHash("sha256").update(value).digest()
  const configuredValueHash = createHash("sha256").update(configuredValue).digest()

  return timingSafeEqual(valueHash, configuredValueHash)
}

declare module "next-auth" {
  interface Session {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    ...(isMicrosoftAuthConfigured
      ? [
        AzureADProvider({
          clientId: microsoftClientId,
          clientSecret: microsoftClientSecret,
          tenantId: microsoftTenantId,
          authorization: {
            params: {
              scope: "openid profile email offline_access User.Read Mail.Read Mail.Send",
              response_type: "code",
            },
          },
        }),
      ]
      : []),
    ...(isAdminAuthConfigured
      ? [
          CredentialsProvider({
            id: "admin-credentials",
            name: "Admin credentials",
            credentials: {
              username: { label: "Username", type: "text" },
              password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
              if (
                !matchesConfiguredCredential(credentials?.username, adminUsername) ||
                !matchesConfiguredCredential(credentials?.password, adminPassword)
              ) {
                return null
              }

              return { id: "admin", name: "Admin" }
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at ? account.expires_at * 1000 : 0
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined
      session.refreshToken = token.refreshToken as string | undefined
      session.expiresAt = token.expiresAt as number | undefined
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
}