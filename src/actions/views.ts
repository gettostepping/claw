"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function incrementViews(profileId: string) {
    try {
        await prisma.profile.update({
            where: { id: profileId },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        // Set cookie to expire in 5 minutes
        const cookieStore = await cookies()
        cookieStore.set(`viewed_${profileId}`, "true", {
            maxAge: 60 * 5,
            path: "/",
            httpOnly: true,
            sameSite: "lax"
        })

        return { success: true }
    } catch (error) {
        console.error("Failed to increment views:", error)
        return { error: "Failed to increment views" }
    }
}
