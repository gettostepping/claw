"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface FeatureCardProps {
    icon: LucideIcon
    title: string
    description: string
    delay?: number
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            whileHover={{ y: -5, scale: 1.02 }}
            className="group relative p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 overflow-hidden"
        >
            {/* Decorative gradient glow on hover */}
            <div className="absolute -inset-px bg-gradient-to-r from-purple-600/50 to-pink-600/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10" />

            <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center mb-6 group-hover:bg-purple-600/30 transition-colors">
                <Icon className="w-6 h-6 text-purple-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-neutral-400 leading-relaxed text-sm sm:text-base">
                {description}
            </p>
        </motion.div>
    )
}
