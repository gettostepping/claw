"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function completeRegistration(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  const username = formData.get("username") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Validate username
  if (!username) {
    return { error: "Username is required" };
  }

  if (username.length < 3 || username.length > 30) {
    return { error: "Username must be between 3 and 30 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers, and underscores" };
  }

  // Check if username is already taken
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return { error: "Username is already taken" };
  }

  // Validate invite code (in a real app, you'd check this against a database of valid codes)
  if (!inviteCode) {
    return { error: "Invite code is required" };
  }

  // Use the invite code system to validate the invite
  const { validateInviteCode } = await import("@/actions/invites");
  const inviteResult = await validateInviteCode(inviteCode, session.user.id);
  if (inviteResult.error) {
    return { error: inviteResult.error };
  }

  try {
    // Update the user with the username
    await prisma.user.update({
      where: { email: session.user.email },
      data: { username },
    });

    // Create a profile for the user
    await prisma.profile.create({
      data: {
        userId: session.user.id,
        displayName: session.user.name || username,
        bio: null,
        avatarUrl: session.user.image || null,
        bannerUrl: null,
        backgroundType: "color",
        backgroundValue: "#000000",
        themePreset: "grime",
        blurBackground: false,
        showViews: true,
        views: 0,
      },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    return { error: "Failed to complete registration" };
  }
}