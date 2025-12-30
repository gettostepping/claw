"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { uploadVideoToR2 } from "@/lib/cloudflare-r2";

export async function addVideo(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not authenticated" };

  const file = formData.get("video") as File | null;
  const videoUrlDirect = formData.get("videoUrlDirect") as string | null;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;

  if (!file && !videoUrlDirect) return { error: "Video file is required" };
  if (!title) return { error: "Title is required" };

  if (file && !videoUrlDirect) {
    // Validate file size (max 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB in bytes
    if (file.size > maxSize) {
      return { error: `File size too large. Maximum size is 100MB, got ${(file.size / (1024 * 1024)).toFixed(2)}MB` };
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return { error: "File must be a video" };
    }
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile) {
      return { error: "Profile not found" };
    }

    let videoUrl = videoUrlDirect;
    let fileName = videoUrlDirect ? "uploaded-video" : (file?.name || "uploaded-video");
    let mimeType = videoUrlDirect ? "video/mp4" : (file?.type || "video/mp4");
    let fileSize = file?.size || 0;

    if (!videoUrl && file) {
      // Convert file to buffer
      const buffer = Buffer.from(await file.arrayBuffer());
      // Upload to Cloudflare R2
      videoUrl = await uploadVideoToR2(buffer, file.name, file.type);
    }

    if (!videoUrl) return { error: "Failed to upload video" };

    // Create video record in database
    await prisma.video.create({
      data: {
        profileId: profile.id,
        title,
        description: description || null,
        fileName,
        mimeType,
        fileSize,
        url: videoUrl,
      },
    });

    revalidatePath("/dashboard/edit");
    revalidatePath(`/@${session.user.username}`);
    return { success: true };
  } catch (error) {
    console.error("Error uploading video:", error);
    return { error: "Failed to upload video" };
  }
}

export async function deleteVideo(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not authenticated" };

  const videoId = formData.get("videoId") as string;
  if (!videoId) return { error: "Video ID is required" };

  try {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: { profile: true },
    });

    if (!video) {
      return { error: "Video not found" };
    }

    // Check if user owns the video
    if (video.profile.userId !== session.user.id) {
      return { error: "Unauthorized" };
    }

    // TODO: Delete from Cloudflare R2 if needed
    // await deleteVideoFromR2(video.fileName); // Implement this in cloudflare-r2.ts

    await prisma.video.delete({
      where: { id: videoId },
    });

    revalidatePath("/dashboard/edit");
    revalidatePath(`/@${session.user.username}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting video:", error);
    return { error: "Failed to delete video" };
  }
}