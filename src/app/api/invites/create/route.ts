export const runtime = 'nodejs';

import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Generate a random invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "CLAW-";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  if (session.user.role !== "admin") {
    return Response.json({ error: "Access denied. Admin role required." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { expiresAt } = body;
    
    const invite = await prisma.invite.create({
      data: {
        code: generateInviteCode(),
        createdBy: session.user.id,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    revalidatePath("/dashboard/invites");
    return Response.json({ success: true, code: invite.code });
  } catch (error) {
    console.error("Error creating invite:", error);
    return Response.json({ error: "Failed to create invite code" }, { status: 500 });
  }
}