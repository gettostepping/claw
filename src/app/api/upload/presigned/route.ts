import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generatePresignedUrl } from "@/lib/cloudflare-r2";

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { fileName, mimeType, folder } = await req.json();

        if (!fileName || !mimeType) {
            return NextResponse.json({ error: "Missing fileName or mimeType" }, { status: 400 });
        }

        const { uploadUrl, publicUrl, key } = await generatePresignedUrl(
            fileName,
            mimeType,
            folder || 'images'
        );

        return NextResponse.json({ uploadUrl, publicUrl, key });
    } catch (error) {
        console.error("Error generating presigned URL:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
