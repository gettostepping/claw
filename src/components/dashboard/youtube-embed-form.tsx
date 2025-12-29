"use client"

import { addYouTubeEmbed, deleteYouTubeEmbed } from "@/actions/youtube"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { motion } from "framer-motion"
import { Trash2 } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="px-4 py-2 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 text-sm"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {pending ? "Adding..." : "Add YouTube Video"}
    </motion.button>
  )
}

export function YouTubeEmbedForm({ hasEmbed }: { hasEmbed: boolean }) {
  const [state, formAction] = useActionState(addYouTubeEmbed, null)
  const [deleteState, deleteAction] = useActionState(deleteYouTubeEmbed, null)

  return (
    <div className="space-y-4">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
          {state.error}
        </div>
      )}
      {(state?.success || deleteState?.success) && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
          {state?.success ? "YouTube video added!" : "YouTube video removed!"}
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
            YouTube Video URL
          </label>
          <input
            name="url"
            type="url"
            required
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
          />
        </div>
        <SubmitButton />
      </form>

      {hasEmbed && (
        <form action={deleteAction}>
          <motion.button
            type="submit"
            className="w-full px-4 py-2 rounded-lg font-medium bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Trash2 size={16} />
            Remove YouTube Video
          </motion.button>
        </form>
      )}
    </div>
  )
}

