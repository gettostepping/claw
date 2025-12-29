"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { checkAgeRestriction } from "@/lib/youtube"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      return match[1]
    }
  }
  
  return null
}

function createYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export async function addYouTubeEmbed(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  const url = formData.get("url") as string
  if (!url) return { error: "URL is required" }

  const videoId = extractYouTubeVideoId(url)
  if (!videoId) {
    return { error: "Invalid YouTube URL" }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return { error: "Profile not found" }
    }

    // Check if YouTube embed already exists, if so update it
    const existingEmbed = await prisma.musicEmbed.findFirst({
      where: {
        profileId: profile.id,
        type: "youtube",
      },
    })

    // Check if video is age-restricted
    const isAgeRestricted = await checkAgeRestriction(videoId)
    
    if (isAgeRestricted) {
      return { error: "This video is age-restricted and cannot be embedded" }
    }
    
    const embedUrl = createYouTubeEmbedUrl(videoId)

    if (existingEmbed) {
      await prisma.musicEmbed.update({
        where: { id: existingEmbed.id },
        data: {
          embedUrl,
        },
      })
    } else {
      await prisma.musicEmbed.create({
        data: {
          profileId: profile.id,
          type: "youtube",
          embedUrl,
          autoplay: false,
        },
      })
    }

    revalidatePath("/dashboard/edit")
    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to add YouTube embed" }
  }
}

export async function deleteYouTubeEmbed(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return { error: "Profile not found" }
    }

    const embed = await prisma.musicEmbed.findFirst({
      where: {
        profileId: profile.id,
        type: "youtube",
      },
    })

    if (embed) {
      await prisma.musicEmbed.delete({
        where: { id: embed.id },
      })
    }

    revalidatePath("/dashboard/edit")
    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete YouTube embed" }
  }
}

