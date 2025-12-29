import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    const { inviteId } = body;

    if (!inviteId) {
      return Response.json({ error: "Invite ID is required" }, { status: 400 });
    }

    await prisma.invite.delete({
      where: {
        id: inviteId,
      },
    });

    revalidatePath("/dashboard/invites");
    return Response.json({ success: true });
  } catch (error) {
    console.error("Error deleting invite:", error);
    return Response.json({ error: "Failed to delete invite code" }, { status: 500 });
  }
}