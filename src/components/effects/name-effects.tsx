"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function PurpleParticlesEffect() {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; delay: number; duration: number }[]>([])

    useEffect(() => {
        const newParticles = Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            x: (Math.random() - 0.5) * 200,
            y: (Math.random() - 0.5) * 60,
            size: 2 + Math.random() * 4,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
        }))
        setParticles(newParticles)
    }, [])

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                    animate={{
                        x: p.x,
                        y: p.y,
                        opacity: [0, 0.6, 0],
                        scale: [0, 1, 0.5]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "easeOut",
                    }}
                    style={{
                        position: "absolute",
                        width: p.size,
                        height: p.size,
                        backgroundColor: "#a855f7",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                        boxShadow: "0 0 10px #a855f7",
                    }}
                />
            ))}
        </div>
    )
}
export function GoldenGlowEffect() {
    return (
        <div className="absolute inset-x-0 -bottom-1 h-3 pointer-events-none -z-10">
            <motion.div
                animate={{
                    opacity: [0.3, 0.7, 0.3],
                    scaleX: [1, 1.1, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    background: "radial-gradient(ellipse at center, rgba(234, 179, 8, 0.8) 0%, rgba(234, 179, 8, 0) 70%)",
                    filter: "blur(4px)",
                }}
            />
        </div>
    )
}

export function RainbowEffect({ children }: { children: React.ReactNode }) {
    return (
        <span className="relative inline-block">
            <motion.span
                animate={{
                    color: ["#ff0000", "#ff7f00", "#ffff00", "#00ff00", "#0000ff", "#4b0082", "#8b00ff", "#ff0000"],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {children}
            </motion.span>
        </span>
    )
}

export function GlitchEffect({ children }: { children: React.ReactNode }) {
    return (
        <span className="relative inline-block overflow-hidden group">
            <span className="relative z-10">{children}</span>
            <motion.span
                className="absolute inset-0 z-0 text-red-500 opacity-70"
                animate={{
                    x: [-2, 2, -1, 0],
                    y: [1, -1, 2, 0],
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    repeatDelay: 2,
                }}
                style={{ clipPath: "inset(50% 0 0 0)" }}
            >
                {children}
            </motion.span>
            <motion.span
                className="absolute inset-0 z-0 text-cyan-500 opacity-70"
                animate={{
                    x: [2, -2, 1, 0],
                    y: [-1, 1, -2, 0],
                }}
                transition={{
                    duration: 0.2,
                    repeat: Infinity,
                    repeatType: "mirror",
                    repeatDelay: 2.1,
                }}
                style={{ clipPath: "inset(0 0 50% 0)" }}
            >
                {children}
            </motion.span>
        </span>
    )
}
