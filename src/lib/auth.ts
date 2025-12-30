import { NextAuthOptions } from "next-auth"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import CredentialsProvider from "next-auth/providers/credentials"
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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
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
          email: user.email ?? undefined,
          name: user.username ?? undefined,
          username: user.username ?? undefined,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.username) {
        token.username = session.username;
      }

      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = (user as any).username || null
        token.role = (user as any).role || 'member'
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch fresh user data from DB to ensure roles/usernames are live
        // This solves the issue where role changes in the DB don't reflect until logout
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, username: true, email: true }
        })

        session.user.id = token.id as string
        session.user.email = dbUser?.email || (token.email as string) || undefined
        session.user.username = dbUser?.username || (token.username as string) || undefined
        session.user.role = dbUser?.role || (token.role as string) || 'member'
      }
      return session
    },
  },
}
