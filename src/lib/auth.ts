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
  cookies: {
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/youtube.readonly",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name || profile.email?.split("@")[0],
          email: profile.email,
          image: profile.picture,
          // emailVerified will be set by the adapter
          // Don't set username here - let users set it during registration
        }
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
          name: user.username,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // With PrismaAdapter, user and account linking is handled automatically
      // We just need to make sure to allow the sign-in and handle any custom logic
      
      if (account?.provider === "google" && profile && user.email) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        
        if (!existingUser) {
          // User doesn't exist, they will be created by the adapter
          // The adapter creates the user after this callback, so we need to update the role
          // after the user is created. We'll handle this in the jwt callback.
        } else {
          // User exists, update their image if needed
          // Only update if they don't have an image set or if it's different
          if (!existingUser.image) {
            const profilePicture = (profile as { picture?: string; image?: string }).picture || (profile as { picture?: string; image?: string }).image;
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { image: profilePicture || null }
            });
          }
        }
      }
      return true;
    },
    async redirect({ url, baseUrl }) {
      // If the URL is for register and it's within our domain, allow it
      if (url.startsWith(baseUrl) && url.includes('/register')) {
        return Promise.resolve(url);
      }
      
      // For other cases, if URL is safe and within our domain, use it
      if (url.startsWith(baseUrl)) {
        return Promise.resolve(url);
      }
      
      // Default fallback
      return Promise.resolve(baseUrl + '/register');
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.image = user.image
        token.username = user.username || null
        token.role = (user as { role?: string }).role || 'member'
      }
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.expiresAt = account.expires_at
        
        // If this is a Google OAuth sign-in for a new user, ensure proper role assignment
        if (account.provider === 'google' && user.email) {
          // Check if the user already has a role set
          if (!token.role || token.role === 'member') {
            const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
            const isAdmin = user.email === adminEmail;
            
            if (isAdmin && token.role !== 'admin') {
              // Update the user in the database to set admin role
              await prisma.user.update({
                where: { id: user.id },
                data: { role: 'admin' }
              });
              
              token.role = 'admin';
            }
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.name = token.name || undefined
        session.user.email = token.email || undefined
        session.user.image = token.picture || undefined
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
