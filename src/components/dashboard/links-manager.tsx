"use client"

import { addLink, deleteLink } from "@/actions/links"


import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { motion } from "framer-motion"

function AddLinkButton() {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 text-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {pending ? "Adding..." : "Add Link"}
    </motion.button>
  )
}

type LinkType = {
  id: string;
  title: string;
  url: string;
  icon?: string | null;
  order: number;
  createdAt: Date;
};

export function LinksManager({ links }: { links: LinkType[] }) {
  const [state, formAction] = useActionState(addLink, null)

  return (
    <div className="space-y-8">
      {/* Existing Links */}
      <div className="space-y-4">
        {links.length > 0 ? (
          links.map((link) => (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-5 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white mb-1">{link.title}</div>
                <div className="text-sm text-neutral-400 truncate font-mono">{link.url}</div>
              </div>
              <motion.button
                onClick={() => deleteLink(link.id)}
                className="px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all text-sm font-medium ml-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Delete
              </motion.button>
            </motion.div>
          ))
        ) : (
          <div className="p-8 rounded-xl bg-black/20 border border-white/5 text-center">
            <p className="text-neutral-400 text-sm font-mono">No links added yet.</p>
          </div>
        )}
      </div>

      {/* Add New Link Form */}
      <div className="p-6 rounded-xl bg-black/40 border border-white/10">
        <h4 className="font-bold text-lg mb-6 flex items-center gap-3">
          <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
          Add New Link
        </h4>
        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
              {state.error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="title"
              placeholder="Title (e.g. SoundCloud)"
              required
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
            <input
              name="url"
              placeholder="URL (https://...)"
              required
              className="bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
            />
          </div>
          <div className="flex justify-end">
            <AddLinkButton />
          </div>
        </form>
      </div>
    </div>
  )
}
