export const runtime = 'nodejs';

import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { processSoundCloudUrl } from "@/lib/cobalt"

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params
    const track = await prisma.track.findUnique({
      where: { id },
      select: { id: true, streamUrl: true, sourceUrl: true },
    })

    if (!track) {
      return NextResponse.json({ error: "Track not found" }, { status: 404 })
    }

    if (!track.sourceUrl) {
      // Fallback to existing URL if original source missing
      return NextResponse.json({ url: track.streamUrl }, { status: 200 })
    }

    const cobalt = await processSoundCloudUrl(track.sourceUrl)
    if (!cobalt || cobalt.status === "error") {
      // Fallback gracefully
      return NextResponse.json({ url: track.streamUrl, stale: true }, { status: 200 })
    }

    return NextResponse.json({ url: cobalt.url }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Failed to refresh stream" }, { status: 500 })
  }
}
