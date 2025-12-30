import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect("/dashboard")
  }
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white p-4">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <h1 className="text-6xl font-black tracking-tighter sm:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          clawsome.world
        </h1>
        <p className="text-xl text-gray-400 sm:text-2xl font-light">
          The underground identity layer. <br />
          Highly customizable profiles for the new wave.
        </p>

        <div className="flex gap-4">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors"
          >
            Claim Your Profile
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors"
          >
            Login
          </Link>
        </div>
      </main>

      <footer className="absolute bottom-8 text-gray-600 text-sm">
        inspired by gun.lol • built for the culture
      </footer>
    </div>
  )
}
