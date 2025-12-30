import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { HeroContent } from "@/components/home/hero-content"

export default async function Home() {
  const session = await getServerSession(authOptions)

  // Redirect to dashboard if already logged in
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(147,51,234,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(219,39,119,0.1),transparent_50%)]" />
      </div>

      <main className="flex-grow flex items-center justify-center">
        <HeroContent />
      </main>

      <footer className="relative z-10 w-full py-12 px-4 border-t border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tighter">CLAW<span className="text-purple-500">SOME</span>.WORLD</span>
          </div>

          <div className="text-neutral-500 text-sm font-light">
            © {new Date().getFullYear()} • inspired by gun.lol • built for the culture
          </div>

          <div className="flex gap-8">
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Terms</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Privacy</a>
            <a href="#" className="text-neutral-400 hover:text-white transition-colors text-sm">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
