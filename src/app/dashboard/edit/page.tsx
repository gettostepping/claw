import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { LinksManager } from "@/components/dashboard/links-manager"
import { TrackUploadForm } from "@/components/dashboard/track-upload-form"
import { TracksManager } from "@/components/dashboard/tracks-manager"
import { VideoUploadForm } from "@/components/dashboard/video-upload-form"
import { BeatUploadForm } from "@/components/dashboard/beat-upload-form"
import { BeatsManager } from "@/components/dashboard/beats-manager"

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    redirect("/api/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: {
        include: {
          links: { orderBy: { order: "asc" } },
          musicEmbeds: true,
          videos: true,
          beats: { orderBy: { createdAt: "desc" } },
          tracks: { orderBy: { createdAt: "desc" } }
        }
      }
    },
  })

  if (!(user as any)?.profile) {
    redirect("/dashboard")
  }

  const profile = (user as any).profile;

  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">
          Edit Profile
        </h1>
        <p className="text-neutral-400 font-mono text-sm">customize your underground presence</p>
      </div>

      {/* Profile Form Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Profile Settings</h2>
        </div>
        <ProfileForm profile={profile as any} key={JSON.stringify(profile)} />
      </div>

      {/* Links Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Links</h2>
        </div>
        <LinksManager links={profile.links as any} />
      </div>

      {/* Tracks Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Tracks</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm text-neutral-400 font-mono">
              Paste a SoundCloud track URL to add it to your profile.
            </p>
            <TrackUploadForm />
          </div>
          <TracksManager tracks={profile.tracks as any} />
        </div>
      </div>

      {/* Video Upload Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Video Upload</h2>
        </div>
        <p className="text-sm text-neutral-400 mb-6 font-mono">
          Upload your own video file to display on your profile.
        </p>
        <VideoUploadForm hasVideo={profile.videos.length > 0} video={profile.videos[0] as any} />
      </div>

      {/* Beat Post Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Beat Post</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <p className="text-sm text-neutral-400 font-mono">
              Upload your own audio file (Beat) to display on your profile.
            </p>
            <BeatUploadForm />
          </div>
          <BeatsManager beats={profile.beats as any} />
        </div>
      </div>
    </div>
  )
}
