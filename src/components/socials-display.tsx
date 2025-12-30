"use client"

import { Instagram, Youtube, CloudLightning, Disc, Copy, Check } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"

interface SocialsProps {
  soundcloud?: string | null
  youtube?: string | null
  instagram?: string | null
  discord?: string | null
}

export function SocialsDisplay({ soundcloud, youtube, instagram, discord }: SocialsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyDiscord = () => {
    if (discord) {
      navigator.clipboard.writeText(discord)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!soundcloud && !youtube && !instagram && !discord) return null

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {soundcloud && (
        <motion.a
          href={soundcloud}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-50 hover:opacity-100 hover:text-[#ff5500] transition-all"
          title="SoundCloud"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <CloudLightning size={20} />
        </motion.a>
      )}

      {youtube && (
        <motion.a
          href={youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#ff0000] transition-colors"
          title="YouTube"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Youtube size={20} />
        </motion.a>
      )}

      {instagram && (
        <motion.a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-[#e1306c] transition-colors"
          title="Instagram"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <Instagram size={20} />
        </motion.a>
      )}

      {discord && (
        <motion.button
          onClick={handleCopyDiscord}
          className="text-gray-400 hover:text-[#5865F2] transition-colors relative group"
          title="Copy Discord Username"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          {copied ? <Check size={20} /> : <Disc size={20} />}
        </motion.button>
      )}
    </div>
  )
}
