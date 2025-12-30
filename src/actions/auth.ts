"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function signUp(prevState: unknown, formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const inviteCode = formData.get("inviteCode") as string;

  // Basic validation
  if (!email || !username || !password || !inviteCode) {
    return { error: "All fields are required" };
  }

  if (username.length < 3 || username.length > 30) {
    return { error: "Username must be between 3 and 30 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers, and underscores" };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  try {
    // 1. Check if user/email already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) return { error: "Email already in use" };
      if (existingUser.username === username) return { error: "Username already taken" };
    }

    // 2. Validate invite code
    const invite = await prisma.invite.findUnique({
      where: { code: inviteCode }
    });

    if (!invite || invite.used || (invite.expiresAt && invite.expiresAt < new Date())) {
      return { error: "Invalid or expired invite code" };
    }

    // 3. Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 4. Create User & Profile in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          username,
          passwordHash,
          role: "member"
        }
      });

      await tx.profile.create({
        data: {
          userId: user.id,
          displayName: username,
          bio: null,
          avatarUrl: null,
          bannerUrl: null,
          backgroundType: "color",
          backgroundValue: "#000000",
          accentColor: "#a855f7",
          blurBackground: false,
          showViews: true,
          views: 0,
        }
      });

      // Mark invite as used
      await tx.invite.update({
        where: { id: invite.id },
        data: {
          used: true,
          usedBy: user.id
        }
      });

      return user;
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}