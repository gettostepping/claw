import { NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

import { redirect } from "next/navigation";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  const formData = await request.formData();
  const username = formData.get("username") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Validate username format (alphanumeric, underscores, hyphens, 3-30 chars)
  if (!/^[a-zA-Z0-9_-]{3,30}$/.test(username)) {
    return Response.json({ error: "Username must be 3-30 characters and can only contain letters, numbers, underscores, and hyphens" }, { status: 400 });
  }

  // Check if username is already taken
  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return Response.json({ error: "Username already taken" }, { status: 400 });
  }

  // Use the invite code system to validate the invite
  if (!inviteCode) {
    return Response.json({ error: "Invite code is required" }, { status: 400 });
  }

  const { validateInviteCode } = await import("@/actions/invites");
  const inviteResult = await validateInviteCode(inviteCode, session.user.id);
  if (inviteResult.error) {
    return Response.json({ error: inviteResult.error }, { status: 400 });
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
        accentColor: "#a855f7",
        blurBackground: false,
        showViews: true,
        views: 0,
      },
    });

    revalidatePath("/dashboard");

    // Return success response with redirect URL
    return Response.json({ success: true, redirectUrl: "/dashboard" });
  } catch (error) {
    console.error("Registration error:", error);
    return Response.json({ error: "Failed to complete registration" }, { status: 500 });
  }
}