"use client"

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSoundcloud, faYoutube, faInstagram, faSpotify, faDiscord } from "@fortawesome/free-brands-svg-icons"
import { faCheck } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"
import { motion } from "framer-motion"

interface SocialsProps {
  soundcloud?: string | null
  youtube?: string | null
  instagram?: string | null
  spotify?: string | null
  discord?: string | null
}

export function SocialsDisplay({ soundcloud, youtube, instagram, spotify, discord }: SocialsProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyDiscord = () => {
    if (discord) {
      navigator.clipboard.writeText(discord)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!soundcloud && !youtube && !instagram && !spotify && !discord) return null

  return (
    <div className="flex items-center justify-center gap-4 py-2">
      {soundcloud && (
        <motion.a
          href={soundcloud}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-100 hover:opacity-100 hover:text-[#ff5500] transition-all"
          title="SoundCloud"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faSoundcloud} className="w-5 h-5" />
        </motion.a>
      )}

      {youtube && (
        <motion.a
          href={youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-100 hover:opacity-100 hover:text-[#ff0000] transition-all"
          title="YouTube"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
        </motion.a>
      )}

      {instagram && (
        <motion.a
          href={instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-100 hover:opacity-100 hover:text-[#e1306c] transition-all"
          title="Instagram"
          whileHover={{ scale: 1.2, rotate: 5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
        </motion.a>
      )}

      {spotify && (
        <motion.a
          href={spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="opacity-100 hover:opacity-100 hover:text-[#1DB954] transition-all"
          title="Spotify"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          <FontAwesomeIcon icon={faSpotify} className="w-5 h-5" />
        </motion.a>
      )}

      {discord && (
        <motion.button
          onClick={handleCopyDiscord}
          className="opacity-100 hover:opacity-100 hover:text-[#5865F2] transition-all relative group"
          title="Copy Discord Username"
          whileHover={{ scale: 1.2, rotate: -5 }}
          whileTap={{ scale: 0.9 }}
        >
          {copied ? (
            <FontAwesomeIcon icon={faCheck} className="w-5 h-5" />
          ) : (
            <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
          )}
        </motion.button>
      )}
    </div>
  )
}
