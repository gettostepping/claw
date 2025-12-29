import { prisma } from "@/lib/prisma";

async function updateAdminRole() {
  try {
    // Update the user with the admin email to have admin role
    const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
    
    const updatedUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { role: "admin" },
    });
    
    console.log(`Updated user ${updatedUser.email} to admin role`);
  } catch (error) {
    console.error("Error updating admin role:", error);
  } finally {
    await prisma.$disconnect();
  }
}

updateAdminRole();