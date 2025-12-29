import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Update the user with the admin email to have admin role
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });
    
    return Response.json({ success: true, message: `Updated user ${updatedUser.email} to admin role` });
  } catch (error) {
    console.error("Error updating admin role:", error);
    return Response.json({ success: false, error: "Failed to update admin role" }, { status: 500 });
  }
}