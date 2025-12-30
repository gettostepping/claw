"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Play, Music, Layout, Shield } from "lucide-react"
import { FeatureCard } from "./feature-card"

export function HeroContent() {
    return (
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 pt-20 pb-32">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-12 mb-32">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-4"
                >
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 font-medium text-sm tracking-widest uppercase">
                        The new wave of digital identity
                    </span>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-none"
                >
                    CLAW<br className="sm:hidden" />SOME
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-purple-500 to-purple-800">.BEAUTY</span>
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="max-w-2xl text-xl md:text-2xl text-neutral-400 font-light leading-relaxed"
                >
                    The underground identity layer. Built for creators, artists, and the next generation of digital culture.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-6 mt-8"
                >
                    <Link
                        href="/signup"
                        className="group relative px-10 py-5 bg-purple-600 rounded-full text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_-12px_rgba(147,51,234,0.5)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:opacity-80 transition-opacity" />
                        <span className="relative flex items-center gap-2">
                            Claim Your Profile <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                    </Link>

                    <Link
                        href="/login"
                        className="px-10 py-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold text-lg backdrop-blur-sm transition-all hover:scale-105 active:scale-95"
                    >
                        Sign In
                    </Link>
                </motion.div>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
                <FeatureCard
                    icon={Play}
                    title="Video Backgrounds"
                    description="Bring your profile to life with looping, high-definition video backgrounds up to 50MB."
                    delay={0.5}
                />
                <FeatureCard
                    icon={Music}
                    title="Music Integration"
                    description="Feature your latest tracks directly from SoundCloud, Spotify, or custom embeds."
                    delay={0.6}
                />
                <FeatureCard
                    icon={Layout}
                    title="Custom Layouts"
                    description="Choose from multiple premium card styles and themes tailored to your aesthetic."
                    delay={0.7}
                />
            </div>

            {/* Decorative background effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-[800px] pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-purple-600/30 rounded-full blur-[120px] animate-slow-glow" />
                <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-600/20 rounded-full blur-[120px] animate-slow-glow" style={{ animationDelay: '-4s' }} />
            </div>
        </div>
    )
}
