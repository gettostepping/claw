import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/api/auth/signin")
  }

  // Fetch user and profile
  let user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { profile: true },
  })


  // Auto-create profile if missing
  if (user && !user.profile) {
    await prisma.profile.create({
      data: {
        userId: user.id,
        displayName: user.username || session.user.name || "User",
        backgroundType: "color",
        backgroundValue: "#000000",
        accentColor: "#a855f7",
      },
    })
    // Refetch
    user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    })
  }

  if (!user || !user.profile) {
    return <div>Error loading profile.</div>
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-neutral-400 font-mono text-sm">welcome back, {user.username}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Total Views</h3>
            <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-purple-400 transition-colors" />
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {user.profile.views.toLocaleString()}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Status</h3>
            <div className="w-2 h-2 rounded-full bg-green-500 group-hover:bg-green-400 transition-colors animate-pulse" />
          </div>
          <p className="text-4xl font-bold text-green-400">Active</p>
        </div>

        <div className="p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl hover:border-white/20 transition-all group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 text-sm font-medium uppercase tracking-wider">Role</h3>
            <div className="w-2 h-2 rounded-full bg-purple-500 group-hover:bg-purple-400 transition-colors" />
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {user && 'role' in user ? (user as { role?: string }).role || 'member' : 'member'}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/edit"
            className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">Edit Profile</h3>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-sm text-neutral-400">Customize your profile appearance</p>
          </Link>

          <Link
            href={`/@${user.username || user.id}`}
            target="_blank"
            className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-lg">View Profile</h3>
              <span className="text-2xl group-hover:translate-x-1 transition-transform">→</span>
            </div>
            <p className="text-sm text-neutral-400">See how others see your page</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
