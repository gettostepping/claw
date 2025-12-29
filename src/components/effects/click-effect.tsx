"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface ClickAnimation {
  id: number
  x: number
  y: number
}

export function ClickEffect() {
  const [clicks, setClicks] = useState<ClickAnimation[]>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const id = Date.now()
      setClicks((prev) => [...prev, { id, x: e.clientX, y: e.clientY }])
      
      // Cleanup after animation
      setTimeout(() => {
        setClicks((prev) => prev.filter((click) => click.id !== id))
      }, 1000)
    }

    window.addEventListener("click", handleClick)
    return () => window.removeEventListener("click", handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998] overflow-hidden">
      <AnimatePresence>
        {clicks.map((click) => (
          <motion.div
            key={click.id}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute w-8 h-8 rounded-full bg-white/30 blur-sm"
            style={{
              left: click.x - 16,
              top: click.y - 16,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
