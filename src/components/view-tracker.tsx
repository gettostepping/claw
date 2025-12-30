"use client"

import { useEffect } from "react"

export function ViewTracker({ profileId, shouldTrack }: { profileId: string; shouldTrack: boolean }) {
    useEffect(() => {
        if (shouldTrack) {
            fetch("/api/views", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ profileId })
            }).catch(err => console.error("Failed to track view:", err))
        }
    }, [profileId, shouldTrack])

    return null
}
