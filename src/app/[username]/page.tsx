import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { ProfileCardWithMusic } from "@/components/profile/profile-card"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username: rawUsernameParam } = await params
  const rawUsername = rawUsernameParam ?? ""
  const username = rawUsername.startsWith("%40") 
    ? decodeURIComponent(rawUsername).substring(1) 
    : rawUsername.startsWith("@") 
      ? rawUsername.substring(1) 
      : rawUsername

  const user = await prisma.user.findUnique({
    where: { username },
    include: { profile: true },
  })

  if (!user || !user.profile) return { title: "Not Found" }

  return {
    title: `${user.profile.displayName} (@${user.username}) | claw.some`,
    description: user.profile.bio || "Check out my profile on claw.some",
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username: usernameParam } = await params
  if (!usernameParam) {
    notFound()
  }
  // Handle URL encoding of @
  let rawUsername = usernameParam
  if (rawUsername.startsWith("%40")) {
    rawUsername = decodeURIComponent(rawUsername)
  }
  
  // Verify it starts with @, else 404 (or redirect)
  if (!rawUsername.startsWith("@")) {
    notFound()
  }

  const username = rawUsername.substring(1)

  const user = await prisma.user.findUnique({
    where: { username },
    include: { 
      profile: {
        include: {
          links: { orderBy: { order: "asc" } },
          musicEmbeds: true,
          tracks: { orderBy: { createdAt: "desc" } },
          videos: true,
        }
      } 
    },
  })

  if (!user || !user.profile) {
    notFound()
  }

  const { profile } = user

  // Sanitize for client component (convert Dates to strings)
  const sanitizedProfile = {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    links: profile.links.map((link: { id: string; title: string; url: string; icon?: string | null; order: number; createdAt: Date }) => ({
      ...link,
      createdAt: link.createdAt.toISOString()
    })),
  }

  const tracks = profile.tracks.map((t: { id: string; title: string; artist?: string | null; coverUrl?: string | null; streamUrl: string }) => ({
    id: t.id,
    title: t.title,
    artist: t.artist,
    coverUrl: t.coverUrl,
    streamUrl: t.streamUrl,
  }))

  const session = await getServerSession(authOptions)
  const isOwner = !!session?.user?.id && session.user.id === user.id

  // Theme styles map
  const themes: Record<string, string> = {
    grime: "bg-neutral-900 text-gray-200 font-mono",
    basement: "bg-black text-red-600 font-sans",
    neon_trap: "bg-purple-900 text-pink-200 font-sans",
    raw_tape: "bg-[#e0e0e0] text-neutral-800 font-serif",
    cyberpunk: "bg-indigo-950 text-cyan-300 font-mono",
    dark_ambient: "bg-gray-900 text-purple-400 font-sans",
    vaporwave: "bg-pink-50 text-purple-600 font-serif",
    lofi: "bg-amber-50 text-amber-900 font-sans",
    punk: "bg-black text-yellow-400 font-mono",
    trap: "bg-slate-900 text-emerald-400 font-sans",
  }

  const themeClass = themes[profile.themePreset] || themes.grime

  // Background style
  let backgroundStyle = {}
  if (profile.backgroundType === "color") {
    backgroundStyle = { backgroundColor: profile.backgroundValue }
  } else if (profile.backgroundType === "image") {
    backgroundStyle = { 
      backgroundImage: `url(${profile.backgroundValue})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 ${themeClass}`} style={backgroundStyle}>
      {/* Overlay for readability if needed */}
      <div className={`absolute inset-0 ${profile.blurBackground ? "backdrop-blur-sm" : ""} pointer-events-none`} />

      <ProfileCardWithMusic username={username} profile={sanitizedProfile} tracks={tracks} isOwner={isOwner} accessToken={session?.accessToken} />
      
      <footer className="absolute bottom-4 text-xs opacity-40">
        claw.some
      </footer>
    </div>
  )
}