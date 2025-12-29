"use client"

import { motion } from "framer-motion"

interface LinkCardProps {
  title: string
  url: string
}

export function LinkCard({ title, url }: LinkCardProps) {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-3 px-4 rounded-xl bg-white/5 border border-white/5 transition-all text-center font-medium relative overflow-hidden group"
      whileHover={{ 
        scale: 1.02, 
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.2)",
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <span className="relative z-10">{title}</span>
      <motion.div
        className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100"
        initial={false}
        transition={{ duration: 0.2 }}
      />
    </motion.a>
  )
}
