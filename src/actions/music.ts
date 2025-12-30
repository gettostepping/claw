"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { processSoundCloudUrl } from "@/lib/cobalt"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function uploadTrack(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  const url = formData.get("url") as string
  if (!url) return { error: "URL is required" }

  try {
    const cobaltResponse = await processSoundCloudUrl(url)

    if (!cobaltResponse || cobaltResponse.status === 'error') {
      console.error("Cobalt Error:", cobaltResponse?.error)
      return { error: "Failed to process URL" }
    }

    console.log("Cobalt Success Response:", JSON.stringify(cobaltResponse, null, 2))

    // Determine the stream URL
    const streamUrl = cobaltResponse.url
    // If it's a redirect, we might want to follow it or just use it. Cobalt usually gives a direct link.

    // Get the user's profile
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return { error: "Profile not found" }
    }

    // Create the track
    try {
      await (prisma.track.create as any)({
        data: {
          profileId: profile.id,
          title: cobaltResponse.title || cobaltResponse.filename || "Untitled Track",
          artist: cobaltResponse.artist || cobaltResponse.author || "Unknown Artist",
          coverUrl: cobaltResponse.artwork || cobaltResponse.picture || cobaltResponse.thumbnail || cobaltResponse.cover,
          streamUrl: streamUrl,
          sourceUrl: url,
          duration: cobaltResponse.duration ? Math.floor(cobaltResponse.duration) : null,
        }
      })
    } catch (e: unknown) {
      const msg = e instanceof Error ? String(e.message) : String(e)
      if (msg.includes("Unknown argument `sourceUrl`")) {
        await prisma.track.create({
          data: {
            profileId: profile.id,
            title: cobaltResponse.title || cobaltResponse.filename || "Untitled Track",
            artist: cobaltResponse.artist || cobaltResponse.author || "Unknown Artist",
            coverUrl: cobaltResponse.thumbnail || cobaltResponse.cover || cobaltResponse.picture,
            streamUrl: streamUrl,
          }
        })
      } else {
        throw e
      }
    }

    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to upload track" }
  }
}

export async function updateTrack(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  const trackId = formData.get("trackId") as string
  const title = formData.get("title") as string
  const coverUrl = formData.get("coverUrl") as string

  if (!trackId) return { error: "Track ID is required" }
  if (!title) return { error: "Title is required" }

  try {
    // Verify ownership
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { profile: { include: { user: true } } }
    })

    if (!track || track.profile.user.email !== session.user.email) {
      return { error: "Unauthorized" }
    }

    const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : null

    await prisma.track.update({
      where: { id: trackId },
      data: {
        title,
        coverUrl: coverUrl || null,
        duration,
      }
    })

    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to update track" }
  }
}

export async function deleteTrack(trackId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  try {
    // Verify ownership
    const track = await prisma.track.findUnique({
      where: { id: trackId },
      include: { profile: { include: { user: true } } }
    })

    if (!track || track.profile.user.email !== session.user.email) {
      return { error: "Unauthorized" }
    }

    await prisma.track.delete({
      where: { id: trackId }
    })

    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: "Failed to delete track" }
  }
}
