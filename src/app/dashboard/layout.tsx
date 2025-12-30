import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LogoutButton } from "@/components/logout-button"
import { Home, Edit3, Eye, Users, Key } from "lucide-react"
import { prisma } from "@/lib/prisma"
import RoleDisplay from "@/components/dashboard/role-display"
import { CherryBlossomEffect } from "@/components/effects/background-effects"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user?.email) {
    redirect("/api/auth/signin")
  }

  const user = await prisma.user.findUnique({ where: { email: session.user.email } })


  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-black to-red-900/20 pointer-events-none" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(124,58,237,0.1),transparent_50%)] pointer-events-none" />
      <CherryBlossomEffect />

      <div className="flex min-h-screen relative z-10">
        {/* Sidebar */}
        <aside className="w-72 border-r border-white/10 bg-black/40 backdrop-blur-md p-6 hidden md:block">
          <div className="mb-12">
            <Link
              href="/dashboard"
              className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent hover:from-purple-300 hover:to-pink-300 transition-all"
            >
              clawsome.beauty
            </Link>
            <p className="text-xs text-neutral-400 mt-1 font-mono">underground control</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <Home size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Overview</span>
            </Link>
            <Link
              href="/dashboard/edit"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
            >
              <Edit3 size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
              <span className="font-medium">Edit Profile</span>
            </Link>
            {user && (user as { role?: string }).role === 'admin' && (
              <Link
                href="/dashboard/invites"
                className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
              >
                <Key size={18} className="text-neutral-400 group-hover:text-white transition-colors" />
                <span className="font-medium">Manage Invites</span>
              </Link>
            )}
          </nav>

          <div className="pt-6 mt-6 border-t border-white/10 space-y-1">
            <Link
              href={`/@${user?.username || user?.id}`}
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group text-neutral-400 hover:text-white"
            >
              <Eye size={18} className="group-hover:text-white transition-colors" />
              <span className="font-medium">View Public Page</span>
            </Link>
            <LogoutButton />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
