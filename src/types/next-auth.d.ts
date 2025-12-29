import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string
      email?: string
      image?: string
      username?: string
      role?: string
    } & DefaultSession["user"]
    accessToken?: string
    refreshToken?: string
    expiresAt?: number
  }

  interface User {
    name?: string
    username?: string
    emailVerified?: Date | null
  }
}
