import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
import DiscordProvider from "next-auth/providers/discord"
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        },
      },
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID || "",
      clientSecret: process.env.DISCORD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash)

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.username ?? undefined,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" && user.email) {
        try {
          const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
          if (user.email === adminEmail) {
            // Use updateMany to avoid error if user doesn't exist yet (first-time login)
            await prisma.user.updateMany({
              where: { email: user.email },
              data: { role: "admin" }
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // Always redirect to dashboard for now to ensure user gets there
      if (url.includes("/login") || url === baseUrl) {
        return `${baseUrl}/dashboard`
      }
      return url.startsWith(baseUrl) ? url : baseUrl
    },
    async jwt({ token, user, account, trigger, session }) {
      if (trigger === "update") {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string }
        });
        if (freshUser) {
          token.username = freshUser.username;
          token.role = freshUser.role;
          token.image = freshUser.image;
        }
      }

      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.username = (user as any).username || null
        token.role = (user as { role?: string }).role || 'member'
      }
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name || undefined
        session.user.email = token.email || undefined
        session.user.image = token.image as string || undefined
        session.user.username = token.username as string || undefined
        session.user.role = token.role as string || 'member'
        session.accessToken = token.accessToken as string || undefined
        session.refreshToken = token.refreshToken as string || undefined
        session.expiresAt = token.expiresAt as number || undefined
      }
      return session
    },
  },
}
