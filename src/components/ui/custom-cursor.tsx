"use client"

import { useEffect, useState } from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"

export function CustomCursor() {
    const cursorX = useMotionValue(-100)
    const cursorY = useMotionValue(-100)

    // Use motion values directly for instant follow
    // const springConfig = { damping: 25, stiffness: 700 }
    // const cursorXSpring = useSpring(cursorX, springConfig)
    // const cursorYSpring = useSpring(cursorY, springConfig)

    const [isPointer, setIsPointer] = useState(false)
    const [isClicking, setIsClicking] = useState(false)

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX)
            cursorY.set(e.clientY)

            // Check if hovering over clickable element
            const target = e.target as HTMLElement
            const clickable =
                target.tagName.toLowerCase() === 'a' ||
                target.tagName.toLowerCase() === 'button' ||
                target.closest('a') !== null ||
                target.closest('button') !== null ||
                getComputedStyle(target).cursor === 'pointer'

            setIsPointer(clickable)
        }

        const mouseDown = () => setIsClicking(true)
        const mouseUp = () => setIsClicking(false)

        window.addEventListener("mousemove", moveCursor)
        window.addEventListener("mousedown", mouseDown)
        window.addEventListener("mouseup", mouseUp)

        return () => {
            window.removeEventListener("mousemove", moveCursor)
            window.removeEventListener("mousedown", mouseDown)
            window.removeEventListener("mouseup", mouseUp)
        }
    }, [cursorX, cursorY])

    return (
        <motion.div
            className="fixed top-0 left-0 pointer-events-none z-[99999] mix-blend-screen"
            style={{
                translateX: cursorX,
                translateY: cursorY,
            }}
        >
            {/* Custom GIF Cursor */}
            <motion.div
                animate={{
                    scale: isClicking ? 0.8 : isPointer ? 1.5 : 1,
                    rotate: isPointer ? 0 : 0
                }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="relative"
            >
                {/* Using a standard img tag for raw performance and no-blur behavior */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src="/cursor.gif"
                    alt="cursor"
                    className="w-8 h-8 object-contain pointer-events-none block filter drop-shadow-[0_0_2px_rgba(255,255,255,0.5)]"
                    style={{ imageRendering: 'pixelated' }}
                />
            </motion.div>
        </motion.div>
    )
}
