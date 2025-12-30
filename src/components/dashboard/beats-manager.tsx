"use client"

import { deleteBeat } from "@/actions/beats"
import { motion } from "framer-motion"
import { Trash2, Music } from "lucide-react"

type BeatType = {
    id: string;
    title: string;
    artist?: string | null;
    url: string;
    createdAt: Date;
};

export function BeatsManager({ beats = [] }: { beats: BeatType[] }) {
    return (
        <div className="space-y-4">
            {beats && beats.length > 0 ? (
                beats.map((beat) => (
                    <motion.div
                        key={beat.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-black/40 border border-white/10 hover:border-white/20 transition-all group"
                    >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded bg-neutral-800 flex items-center justify-center text-neutral-500">
                                <Music size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-white text-sm truncate">{beat.title}</div>
                                <div className="text-[10px] text-neutral-400 truncate font-mono uppercase tracking-tighter">
                                    {beat.artist || "No Artist"} • {new Date(beat.createdAt).toLocaleDateString()}
                                </div>
                            </div>
                        </div>
                        <motion.button
                            onClick={async () => {
                                if (confirm("Delete this beat?")) {
                                    await deleteBeat(beat.id)
                                }
                            }}
                            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all ml-4"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Trash2 size={16} />
                        </motion.button>
                    </motion.div>
                ))
            ) : (
                <div className="p-8 rounded-xl bg-black/20 border border-white/5 text-center">
                    <p className="text-neutral-400 text-sm font-mono">No beats uploaded yet.</p>
                </div>
            )}
        </div>
    )
}
