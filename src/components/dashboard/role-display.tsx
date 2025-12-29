import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function RoleDisplay() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role || "member";
  const isAdmin = role === "admin";

  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black/40 backdrop-blur-md border border-white/10">
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        isAdmin 
          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30" 
          : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
      }`}>
        {isAdmin ? "ADMIN" : "MEMBER"}
      </span>
      <span className="text-sm text-neutral-400">Role</span>
    </div>
  );
}