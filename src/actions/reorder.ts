"use server"

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function updateTrackOrder(items: { id: string; order: number }[]) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    // Verify ownership (optional but good practice: check if tracks belong to user)
    // For batch updates, we might skip individual checks for performance if we trust the frontend sending IDs
    // capable of only selecting user's tracks. But strictly, we should check.

    // Efficient transaction
    try {
        const operations = items.map((item) =>
            prisma.track.update({
                where: { id: item.id, profile: { userId: session.user.id } }, // Ensure ownership
                data: { order: item.order },
            })
        )

        await prisma.$transaction(operations)
        revalidatePath("/dashboard")
        revalidatePath(`/${session.user.name}`) // Ideally revalidate the profile page
        return { success: true }
    } catch (error) {
        console.error("Failed to reorder tracks:", error)
        return { success: false, error: "Failed to update order" }
    }
}

export async function updateBeatOrder(items: { id: string; order: number }[]) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    try {
        const operations = items.map((item) =>
            prisma.beat.update({
                where: { id: item.id, profile: { userId: session.user.id } },
                data: { order: item.order },
            })
        )

        await prisma.$transaction(operations)
        revalidatePath("/dashboard")
        revalidatePath(`/${session.user.name}`)
        return { success: true }
    } catch (error) {
        console.error("Failed to reorder beats:", error)
        return { success: false, error: "Failed to update order" }
    }
}
