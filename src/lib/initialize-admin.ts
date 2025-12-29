import { prisma } from "./prisma";

export async function initializeAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  
  try {
    // Check if admin user already exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail },
    });
    
    if (existingAdmin) {
      // Update existing user to have admin role
      await prisma.user.update({
        where: { email: adminEmail },
        data: { role: "admin" },
      });
      console.log(`Admin user with email ${adminEmail} already exists. Updated role to admin.`);
    } else {
      // Create a new admin user
      await prisma.user.create({
        data: {
          email: adminEmail,
          username: "admin",
          role: "admin",
        },
      });
      console.log(`Created new admin user with email ${adminEmail}`);
    }
  } catch (error) {
    console.error("Error initializing admin user:", error);
  }
}