"use client"

import { uploadTrack } from "@/actions/music"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { motion } from "framer-motion"
import { Music } from "lucide-react"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <motion.button
      type="submit"
      disabled={pending}
      className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-purple-500/20 text-sm flex items-center gap-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Music size={16} />
      {pending ? "Uploading..." : "Upload"}
    </motion.button>
  )
}

export function TrackUploadForm() {
  const [state, formAction] = useActionState(uploadTrack, null)

  return (
    <div className="space-y-4">
      <form action={formAction} className="flex gap-3">
        <input
          name="url"
          placeholder="https://soundcloud.com/artist/track"
          required
          className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono text-sm"
        />
        <SubmitButton />
      </form>
      
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-mono">
          Track uploaded successfully!
        </div>
      )}
      
      <p className="text-xs text-neutral-400 font-mono">
        Uploads appear under the Music toggle on your public profile.
      </p>
    </div>
  )
}


