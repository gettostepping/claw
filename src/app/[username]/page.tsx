import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { cookies } from "next/headers"
import Link from "next/link"
import { ProfileCardWithMusic } from "@/components/profile/profile-card"
import { ViewTracker } from "@/components/view-tracker"
import { FooterLink } from "@/components/footer-link"
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
    title: `${user.profile.displayName} (@${user.username}) | clawsome.world`,
    description: user.profile.bio || "Check out my profile on clawsome.world",
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

  // Extract accent color for use in footer
  const accentColor = profile.accentColor || '#a855f7'

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
    artist: t.artist ?? null,
    coverUrl: t.coverUrl ?? null,
    streamUrl: t.streamUrl,
  }))

  const session = await getServerSession(authOptions)
  const isOwner = !!session?.user?.id && session.user.id === user.id

  // Check if view should be tracked (no cookie and not owner)
  const cookieStore = await cookies()
  const viewCookieName = `viewed_${profile.id}`
  const hasViewed = cookieStore.get(viewCookieName)
  const shouldTrack = !hasViewed && !isOwner

  // Background style
  let backgroundStyle = {}
  let hasVideoBackground = false

  if (profile.backgroundType === "color") {
    backgroundStyle = { backgroundColor: profile.backgroundValue }
  } else if (profile.backgroundType === "image") {
    backgroundStyle = {
      backgroundImage: `url(${profile.backgroundValue})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    }
  } else if (profile.backgroundType === "video") {
    hasVideoBackground = true
  }

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 relative`} style={backgroundStyle}>
      {hasVideoBackground && profile.backgroundValue && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover -z-10"
          src={profile.backgroundValue}
        />
      )}
      {/* Overlay for readability if needed */}
      <div className={`absolute inset-0 ${profile.blurBackground ? "backdrop-blur-sm" : ""} pointer-events-none`} />

      <ViewTracker profileId={profile.id} shouldTrack={shouldTrack} />

      <ProfileCardWithMusic username={username} profile={sanitizedProfile} tracks={tracks} isOwner={isOwner} accessToken={session?.accessToken} />

      <footer className="absolute bottom-4 text-xs opacity-40">
        <FooterLink accentColor={accentColor} />
      </footer>
    </div>
  )
}