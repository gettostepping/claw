import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getInvites } from "@/actions/invites";
import InvitesPageClient from "./invites.client";

// Server component that fetches data and renders the client component
export default async function InvitesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/login");
  }

  if (session.user.role !== "admin") {
    redirect("/dashboard");
  }

  const invites = await getInvites();

  // Pass the data to the client component
  return <InvitesPageClient invites={invites} />;
}