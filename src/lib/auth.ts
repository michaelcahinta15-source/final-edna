import type { NextAuthOptions } from "next-auth"
import AzureADProvider from "next-auth/providers/azure-ad"

const microsoftClientId =
  process.env.AUTH_MICROSOFT_ENTRA_ID_ID ?? process.env.AZURE_AD_CLIENT_ID ?? ""
const microsoftClientSecret =
  process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET ?? process.env.AZURE_AD_CLIENT_SECRET ?? ""
const microsoftTenantId =
  process.env.AUTH_MICROSOFT_ENTRA_ID_TENANT_ID ?? process.env.AZURE_AD_TENANT_ID ?? "common"

export const isMicrosoftAuthConfigured = Boolean(microsoftClientId && microsoftClientSecret)

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
  providers: isMicrosoftAuthConfigured
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
    : [],
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
  secret: process.env.AUTH_SECRET,
}