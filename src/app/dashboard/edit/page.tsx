import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { LinksManager } from "@/components/dashboard/links-manager"
import { TrackUploadForm } from "@/components/dashboard/track-upload-form"
import { VideoUploadForm } from "@/components/dashboard/video-upload-form"

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
          videos: true
        }
      }
    },
  })

  if (!user?.profile) {
    redirect("/dashboard")
  }

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
        <ProfileForm profile={user.profile} key={JSON.stringify(user.profile)} />
      </div>

      {/* Links Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Links</h2>
        </div>
        <LinksManager links={user.profile.links} />
      </div>

      {/* Tracks Section */}
      <div className="p-8 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl">
        <div className="mb-6 flex items-center gap-3">
          <span className="w-1 h-6 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          <h2 className="text-2xl font-bold">Tracks</h2>
        </div>
        <p className="text-sm text-neutral-400 mb-6 font-mono">
          Paste a SoundCloud track URL to add it to your profile.
        </p>
        <TrackUploadForm />
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
        <VideoUploadForm hasVideo={user.profile.videos.length > 0} video={user.profile.videos[0]} />
      </div>
    </div>
  )
}
