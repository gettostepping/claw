"use server"

import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { revalidatePath } from "next/cache"
import { uploadImageToR2 } from "@/lib/cloudflare-r2"

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
  const backgroundFile = formData.get("backgroundFile") as File | null
  const themePreset = formData.get("themePreset") as string
  const backgroundType = formData.get("backgroundType") as string
  let backgroundValue = formData.get("backgroundValue") as string;
  
  // If background type is color and we have a text input, use that instead
  if (formData.get("backgroundType") === "color" && formData.get("backgroundValueText")) {
    backgroundValue = formData.get("backgroundValueText") as string;
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
  
  // Handle background image upload
  if (removeBackground) {
    updatedBackgroundValue = ""; // Clear the background
  } else if (backgroundType === 'image' && backgroundFile && backgroundFile.size > 0) {
    try {
      // Validate file type
      if (!backgroundFile.type.startsWith('image/')) {
        return { error: "Background file must be an image" };
      }
      
      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (backgroundFile.size > maxSize) {
        return { error: `Background file size too large. Maximum size is 10MB, got ${(backgroundFile.size / (1024 * 1024)).toFixed(2)}MB` };
      }
      
      const buffer = Buffer.from(await backgroundFile.arrayBuffer());
      updatedBackgroundValue = await uploadImageToR2(buffer, backgroundFile.name, backgroundFile.type);
    } catch (error) {
      return { error: "Failed to upload background image" };
    }
  }

  try {
    await prisma.profile.update({
      where: { userId: session.user.id }, // session.user.id needs to be ensured in auth callback
      data: {
        displayName,
        bio,
        avatarUrl,
        bannerUrl,
        themePreset,
        backgroundType,
        backgroundValue: updatedBackgroundValue,
        socialSoundcloud,
        socialYoutube,
        socialInstagram,
        socialDiscord,
      },
    })
    revalidatePath("/dashboard")
    revalidatePath(`/@${session.user.name}`)
    return { success: true }
  } catch (error) {
    return { error: "Failed to update profile" }
  }
}
