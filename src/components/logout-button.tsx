"use client"

import { signOut } from "next-auth/react"
import { LogOut } from "lucide-react"

export function LogoutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-white/5 bg-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition-all group text-red-400 hover:text-red-300"
    >
      <LogOut size={18} className="group-hover:text-red-300 transition-colors" />
      <span className="font-medium">Logout</span>
    </button>
  )
}
