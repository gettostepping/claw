"use server";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CLAW-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Create a new invite code (admin only)
export async function createInvite(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  if (session.user.role !== "admin") {
    return { error: "Access denied. Admin role required." };
  }

  try {
    const expiresAt = formData.get("expiresAt") as string | null;
    
    const invite = await prisma.invite.create({
      data: {
        code: generateInviteCode(),
        createdBy: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    revalidatePath("/dashboard/invites");
    return { success: true, code: invite.code };
  } catch (error) {
    console.error("Error creating invite:", error);
    return { error: "Failed to create invite code" };
  }
}

// Get all invites for the current user (admin only)
export async function getInvites() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  try {
    const invites = await prisma.invite.findMany({
      include: {
        creator: {
          select: {
            username: true,
            email: true,
          },
        },
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  } catch (error) {
    console.error("Error fetching invites:", error);
    return [];
  }
}

// Get user's invite codes
export async function getUserInvites() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    redirect("/login");
  }

  try {
    const invites = await prisma.invite.findMany({
      where: {
        createdBy: session.user.id,
      },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return invites;
  } catch (error) {
    console.error("Error fetching user invites:", error);
    return [];
  }
}

// Delete an invite code (admin only)
export async function deleteInvite(prevState: unknown, formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return { error: "Not authenticated" };
  }

  if (session.user.role !== "admin") {
    return { error: "Access denied. Admin role required." };
  }

  const inviteId = formData.get("inviteId") as string;

  try {
    await prisma.invite.delete({
      where: {
        id: inviteId,
      },
    });

    revalidatePath("/dashboard/invites");
    return { success: true };
  } catch (error) {
    console.error("Error deleting invite:", error);
    return { error: "Failed to delete invite code" };
  }
}

// Use an invite code during registration
export async function validateInviteCode(code: string, userId: string) {
  try {
    // Find the invite code
    const invite = await prisma.invite.findUnique({
      where: {
        code: code,
      },
    });

    if (!invite) {
      return { error: "Invalid invite code" };
    }

    if (invite.used) {
      return { error: "Invite code already used" };
    }

    if (invite.expiresAt && invite.expiresAt < new Date()) {
      return { error: "Invite code has expired" };
    }

    // Update the invite to mark it as used
    await prisma.invite.update({
      where: {
        id: invite.id,
      },
      data: {
        used: true,
        usedBy: userId,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error using invite code:", error);
    return { error: "Failed to use invite code" };
  }
}