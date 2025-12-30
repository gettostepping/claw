"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"

export async function addBeat(prevState: unknown, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const url = formData.get("url") as string
    const title = formData.get("title") as string
    const artist = formData.get("artist") as string || null
    const coverUrl = formData.get("coverUrl") as string || null
    const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : null
    const fileSize = formData.get("fileSize") ? parseInt(formData.get("fileSize") as string) : null
    const mimeType = formData.get("mimeType") as string || null

    if (!url || !title) return { error: "Title and file are required" }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
        })

        if (!profile) return { error: "Profile not found" }

        await prisma.beat.create({
            data: {
                profileId: profile.id,
                title,
                artist,
                coverUrl,
                url,
                duration,
                fileSize,
                mimeType,
            }
        })

        revalidatePath(`/@${session.user.username}`)
        revalidatePath(`/dashboard/edit`)
        return { success: true }
    } catch (error) {
        console.error("Add beat error:", error)
        return { error: "Failed to add beat" }
    }
}

export async function deleteBeat(beatId: string) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    try {
        const beat = await prisma.beat.findUnique({
            where: { id: beatId },
            include: { profile: true }
        })

        if (!beat || beat.profile.userId !== session.user.id) {
            return { error: "Unauthorized" }
        }

        await prisma.beat.delete({
            where: { id: beatId }
        })

        revalidatePath(`/@${session.user.username}`)
        revalidatePath(`/dashboard/edit`)
        return { success: true }
    } catch (error) {
        console.error("Delete beat error:", error)
        return { error: "Failed to delete beat" }
    }
}
export async function updateBeat(prevState: unknown, formData: FormData) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return { error: "Not authenticated" }

    const beatId = formData.get("beatId") as string
    const title = formData.get("title") as string
    const artist = formData.get("artist") as string || null
    const durationStr = formData.get("duration") as string
    const duration = durationStr ? parseInt(durationStr) : null

    if (!beatId || !title) return { error: "ID and title are required" }

    try {
        const beat = await prisma.beat.findUnique({
            where: { id: beatId },
            include: { profile: true }
        })

        if (!beat || beat.profile.userId !== session.user.id) {
            return { error: "Unauthorized" }
        }

        await prisma.beat.update({
            where: { id: beatId },
            data: {
                title,
                artist,
                duration
            }
        })

        revalidatePath(`/@${session.user.username}`)
        revalidatePath(`/dashboard/edit`)
        return { success: true }
    } catch (error) {
        console.error("Update beat error:", error)
        return { error: "Failed to update beat" }
    }
}
