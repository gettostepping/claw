import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import RegisterPageClient from "./page.client";

// This is the server component that checks authentication status
// Users must be authenticated (via Google) but not have a username to access the registration form

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    // If not authenticated, redirect to login
    redirect("/login");
  }
  
  if (session.user.username) {
    // If user already has a username, redirect to dashboard
    redirect("/dashboard");
  }
  
  // If user is authenticated but doesn't have a username, show the registration form
  return <RegisterPageClient />;
}