"use client"

import { signIn, useSession } from "next-auth/react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CherryBlossomEffect } from "@/components/effects/background-effects"

function LoginContent() {
  const { status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const isNewUser = searchParams.get("newuser") === "true"

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const identifier = formData.get("identifier") as string
    const password = formData.get("password") as string

    const result = await signIn("credentials", {
      identifier,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid identifier or password")
      setIsLoading(false)
    } else {
      router.push("/dashboard")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />
      <CherryBlossomEffect />

      <motion.div
        className="w-full max-w-md relative z-10 space-y-8 p-8 rounded-2xl bg-neutral-900/80 backdrop-blur-xl border border-white/10 shadow-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
            Login to clawsome.beauty
          </h2>
          <p className="text-neutral-400 mt-2">Welcome back to the underground</p>
        </div>

        {isNewUser && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm text-center">
            Account created successfully! Please sign in.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Email or Username
            </label>
            <input
              name="identifier"
              type="text"
              required
              placeholder="Enter your email or username"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-neutral-400 uppercase tracking-widest">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 mt-4 rounded-lg font-bold bg-white text-black hover:bg-neutral-200 transition-all disabled:opacity-50"
          >
            {isLoading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="text-center text-sm text-neutral-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white hover:underline">
            Register with Invite Code
          </Link>
        </div>
      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-pulse text-neutral-500 font-mono tracking-widest uppercase text-sm">Loading Identity...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
