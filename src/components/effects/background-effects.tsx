"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function SnowEffect() {
    const [flakes, setFlakes] = useState<{ id: number; left: string; delay: number; duration: number; size: number }[]>([])

    useEffect(() => {
        const newFlakes = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 5,
            duration: 5 + Math.random() * 10,
            size: 2 + Math.random() * 4,
        }))
        setFlakes(newFlakes)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {flakes.map((flake) => (
                <motion.div
                    key={flake.id}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: "110vh", opacity: [0, 1, 1, 0] }}
                    transition={{
                        duration: flake.duration,
                        repeat: Infinity,
                        delay: flake.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        left: flake.left,
                        width: flake.size,
                        height: flake.size,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                    }}
                />
            ))}
        </div>
    )
}

export function RainEffect() {
    const [drops, setDrops] = useState<{ id: number; left: string; delay: number; duration: number }[]>([])

    useEffect(() => {
        const newDrops = Array.from({ length: 100 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: Math.random() * 2,
            duration: 0.5 + Math.random() * 0.5,
        }))
        setDrops(newDrops)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {drops.map((drop) => (
                <motion.div
                    key={drop.id}
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: "110vh", opacity: [0, 0.5, 0.5, 0] }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        delay: drop.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        left: drop.left,
                        width: "1px",
                        height: "40px",
                        backgroundColor: "rgba(255, 255, 255, 0.3)",
                    }}
                />
            ))}
        </div>
    )
}
export function StarFieldEffect() {
    const [stars, setStars] = useState<{ id: number; left: string; top: string; size: number; duration: number }[]>([])

    useEffect(() => {
        const newStars = Array.from({ length: 150 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            size: 1 + Math.random() * 2,
            duration: 2 + Math.random() * 3,
        }))
        setStars(newStars)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-black/20">
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: Math.random() * 5,
                    }}
                    style={{
                        position: "absolute",
                        left: star.left,
                        top: star.top,
                        width: star.size,
                        height: star.size,
                        backgroundColor: "white",
                        borderRadius: "50%",
                        boxShadow: "0 0 5px white",
                    }}
                />
            ))}
        </div>
    )
}

export function FirefliesEffect() {
    const [flies, setFlies] = useState<{ id: number; x: string[]; y: string[]; size: number; delay: number }[]>([])

    useEffect(() => {
        const newFlies = Array.from({ length: 30 }).map((_, i) => ({
            id: i,
            x: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
            y: [Math.random() * 100 + "%", Math.random() * 100 + "%", Math.random() * 100 + "%"],
            size: 2 + Math.random() * 3,
            delay: Math.random() * 5,
        }))
        setFlies(newFlies)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {flies.map((fly) => (
                <motion.div
                    key={fly.id}
                    animate={{
                        left: fly.x,
                        top: fly.y,
                        opacity: [0, 0.8, 0],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 10 + Math.random() * 10,
                        repeat: Infinity,
                        delay: fly.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: "absolute",
                        width: fly.size,
                        height: fly.size,
                        backgroundColor: "#fde047",
                        borderRadius: "50%",
                        filter: "blur(1px)",
                        boxShadow: "0 0 10px #fde047",
                    }}
                />
            ))}
        </div>
    )
}

export function CherryBlossomEffect() {
    const [petals, setPetals] = useState<{ id: number; left: string; delay: number; duration: number; size: number; rotate: number }[]>([])

    useEffect(() => {
        const newPetals = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 110}%`, // Start slightly off-screen
            delay: Math.random() * 5,
            duration: 7 + Math.random() * 5,
            size: 8 + Math.random() * 6,
            rotate: Math.random() * 360,
        }))
        setPetals(newPetals)
    }, [])

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {petals.map((petal) => (
                <motion.div
                    key={petal.id}
                    initial={{ y: -20, x: 0, opacity: 0, rotate: petal.rotate }}
                    animate={{
                        y: "110vh",
                        x: [0, 50, -50, 0],
                        opacity: [0, 1, 1, 0],
                        rotate: petal.rotate + 720,
                    }}
                    transition={{
                        y: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: "linear" },
                        x: { duration: petal.duration / 2, repeat: Infinity, ease: "easeInOut" },
                        opacity: { duration: petal.duration, repeat: Infinity, delay: petal.delay },
                        rotate: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: "linear" },
                    }}
                    style={{
                        position: "absolute",
                        left: petal.left,
                        width: petal.size,
                        height: petal.size * 0.7,
                        backgroundColor: "#ffb7c5", // Pink cherry blossom color
                        borderRadius: "80% 0 80% 0",
                        opacity: 0.8,
                    }}
                />
            ))}
        </div>
    )
}
