"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { uploadImageToR2, uploadVideoToR2 } from "@/lib/cloudflare-r2"

export async function updateProfile(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return { error: "Not authenticated" }

  // Get the current profile to preserve existing values
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id }
  });

  if (!profile) return { error: "Profile not found" };

  const displayName = formData.get("displayName") as string
  const bio = formData.get("bio") as string
  const avatarFile = formData.get("avatarFile") as File | null
  const bannerFile = formData.get("bannerFile") as File | null
  const backgroundFileImage = formData.get("backgroundFileImage") as File | null
  const backgroundFileVideo = formData.get("backgroundFileVideo") as File | null

  // Direct R2 URLs from client-side upload
  const avatarUrlDirect = formData.get("avatarUrlDirect") as string | null
  const bannerUrlDirect = formData.get("bannerUrlDirect") as string | null
  const backgroundUrlDirect = formData.get("backgroundUrlDirect") as string | null
  const accentColor = formData.get("accentColor") as string
  const cardStyle = formData.get("cardStyle") as string
  const backgroundType = formData.get("backgroundType") as string
  // Handle color background value
  let backgroundColorValue = formData.get("backgroundValue") as string;
  if (backgroundType === "color" && formData.get("backgroundValueText")) {
    backgroundColorValue = formData.get("backgroundValueText") as string;
  }
  const socialSoundcloud = formData.get("socialSoundcloud") as string
  const socialYoutube = formData.get("socialYoutube") as string
  const socialInstagram = formData.get("socialInstagram") as string
  const socialDiscord = formData.get("socialDiscord") as string

  // Initialize URLs with existing values
  let avatarUrl = profile.avatarUrl || "";
  let bannerUrl = profile.bannerUrl || "";
  let updatedBackgroundValue = profile.backgroundValue || "";

  // Get removal flags
  const removeAvatar = formData.get("removeAvatar") === "on";
  const removeBanner = formData.get("removeBanner") === "on";
  const removeBackground = formData.get("removeBackground") === "on";

  // Handle avatar upload
  if (removeAvatar) {
    avatarUrl = ""; // Clear the avatar
  } else if (avatarUrlDirect) {
    avatarUrl = avatarUrlDirect;
  } else if (avatarFile && avatarFile.size > 0) {
    try {
      // Validate file type
      if (!avatarFile.type.startsWith('image/')) {
        return { error: "Avatar file must be an image" };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (avatarFile.size > maxSize) {
        return { error: `Avatar file size too large. Maximum size is 5MB, got ${(avatarFile.size / (1024 * 1024)).toFixed(2)}MB` };
      }

      const buffer = Buffer.from(await avatarFile.arrayBuffer());
      avatarUrl = await uploadImageToR2(buffer, avatarFile.name, avatarFile.type);
    } catch (error) {
      return { error: "Failed to upload avatar image" };
    }
  }

  // Handle banner upload
  if (removeBanner) {
    bannerUrl = ""; // Clear the banner
  } else if (bannerUrlDirect) {
    bannerUrl = bannerUrlDirect;
  } else if (bannerFile && bannerFile.size > 0) {
    try {
      // Validate file type
      if (!bannerFile.type.startsWith('image/')) {
        return { error: "Banner file must be an image" };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (bannerFile.size > maxSize) {
        return { error: `Banner file size too large. Maximum size is 10MB, got ${(bannerFile.size / (1024 * 1024)).toFixed(2)}MB` };
      }

      const buffer = Buffer.from(await bannerFile.arrayBuffer());
      bannerUrl = await uploadImageToR2(buffer, bannerFile.name, bannerFile.type);
    } catch (error) {
      return { error: "Failed to upload banner image" };
    }
  }

  // Handle background file upload (image or video)
  if (removeBackground) {
    updatedBackgroundValue = ""; // Clear the background
  } else if (backgroundUrlDirect) {
    updatedBackgroundValue = backgroundUrlDirect;
  } else if (backgroundType === 'image' && backgroundFileImage && backgroundFileImage.size > 0) {
    try {
      // Validate image file type
      if (!backgroundFileImage.type.startsWith('image/')) {
        return { error: "Background file must be an image" };
      }
      // Validate file size (max 10MB for images)
      const maxSize = 10 * 1024 * 1024;
      if (backgroundFileImage.size > maxSize) {
        return { error: `Background image too large. Maximum size is 10MB, got ${(backgroundFileImage.size / (1024 * 1024)).toFixed(2)}MB` };
      }

      const buffer = Buffer.from(await backgroundFileImage.arrayBuffer());
      updatedBackgroundValue = await uploadImageToR2(buffer, backgroundFileImage.name, backgroundFileImage.type);
    } catch (error) {
      return { error: "Failed to upload background image" };
    }
  } else if (backgroundType === 'video' && backgroundFileVideo && backgroundFileVideo.size > 0) {
    try {
      // Validate video file type
      if (!backgroundFileVideo.type.startsWith('video/')) {
        return { error: "Background file must be a video" };
      }
      // Validate file size (max 50MB for videos)
      const maxSize = 50 * 1024 * 1024;
      if (backgroundFileVideo.size > maxSize) {
        return { error: `Background video too large. Maximum size is 50MB, got ${(backgroundFileVideo.size / (1024 * 1024)).toFixed(2)}MB` };
      }

      const buffer = Buffer.from(await backgroundFileVideo.arrayBuffer());
      updatedBackgroundValue = await uploadVideoToR2(buffer, backgroundFileVideo.name, backgroundFileVideo.type);
    } catch (error) {
      return { error: "Failed to upload background video" };
    }
  } else if (backgroundType === 'color') {
    // If background type is color, use the color value from the form
    updatedBackgroundValue = backgroundColorValue;
  } else if (backgroundType !== profile.backgroundType) {
    // If background type changed but no file uploaded, clear the old value
    updatedBackgroundValue = "";
  }

  const backgroundEffect = formData.get("backgroundEffect") as string
  const nameEffect = formData.get("nameEffect") as string

  try {
    await prisma.profile.update({
      where: { userId: session.user.id }, // session.user.id needs to be ensured in auth callback
      data: {
        displayName,
        bio,
        avatarUrl,
        bannerUrl,
        accentColor,
        cardStyle,
        backgroundType,
        backgroundValue: updatedBackgroundValue,
        socialSoundcloud,
        socialYoutube,
        socialInstagram,
        socialDiscord,
        backgroundEffect,
        nameEffect,
        featuredContent: formData.get("featuredContent") as string || "video",
      },
    })
    revalidatePath("/dashboard")
    revalidatePath("/dashboard/edit")
    if (session.user.name) {
      revalidatePath(`/@${session.user.name}`)
    }
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}
