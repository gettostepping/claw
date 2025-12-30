import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
    try {
        const { profileId } = await request.json()

        if (!profileId) {
            return NextResponse.json({ error: "Profile ID required" }, { status: 400 })
        }

        // Increment the view count
        await prisma.profile.update({
            where: { id: profileId },
            data: {
                views: {
                    increment: 1
                }
            }
        })

        // Create response with cookie
        const response = NextResponse.json({ success: true })

        // Set cookie to expire in 5 minutes
        response.cookies.set(`viewed_${profileId}`, "true", {
            maxAge: 60 * 5,
            path: "/",
            httpOnly: true,
            sameSite: "lax"
        })

        return response
    } catch (error) {
        console.error("Failed to increment views:", error)
        return NextResponse.json({ error: "Failed to increment views" }, { status: 500 })
    }
}
