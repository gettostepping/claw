"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Music, Volume2, MoreVertical, Edit, Trash2, X } from "lucide-react"
import { deleteBeat } from "@/actions/beats"
import { useRouter } from "next/navigation"

import { useActionState } from "react"
import { updateBeat } from "@/actions/beats"

interface Beat {
    id: string
    title: string
    artist: string | null
    coverUrl: string | null
    url: string
    duration?: number | null
}

interface EditBeatModalProps {
    beat: Beat
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

function EditBeatModal({ beat, isOpen, onClose, onSuccess }: EditBeatModalProps) {
    const [state, formAction] = useActionState(updateBeat, null)
    const formRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (state?.success) {
            onSuccess()
            onClose()
        }
    }, [state, onSuccess, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-neutral-900 rounded-lg p-6 max-w-md w-full mx-4 border border-neutral-800" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Edit Beat</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <form ref={formRef} action={formAction} className="space-y-4">
                    <input type="hidden" name="beatId" value={beat.id} />

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                        <input
                            name="title"
                            defaultValue={beat.title}
                            required
                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Artist</label>
                        <input
                            name="artist"
                            defaultValue={beat.artist || ""}
                            placeholder="Producer Name"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Duration (seconds)</label>
                        <input
                            name="duration"
                            type="number"
                            defaultValue={beat.duration || ""}
                            placeholder="e.g. 180"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm">{state.error}</p>
                    )}

                    <div className="flex gap-2 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-neutral-800 text-white hover:bg-neutral-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-white text-black hover:bg-gray-200 font-bold"
                        >
                            Save
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export function BeatSection({ beats, isOwner, accentColor = "#a855f7" }: { beats: Beat[], isOwner: boolean, accentColor?: string }) {
    const router = useRouter()
    const [currentBeatId, setCurrentBeatId] = useState<string | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [volume, setVolume] = useState(0.9)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [editingBeat, setEditingBeat] = useState<Beat | null>(null)
    const [playbackError, setPlaybackError] = useState<string | null>(null)

    const activeBeat = beats.find(b => b.id === currentBeatId)

    const formatTime = (s: number) => {
        if (!isFinite(s) || isNaN(s)) return "0:00"
        const minutes = Math.floor(s / 60)
        const seconds = Math.floor(s % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    // Setup audio element listeners
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const updateTime = () => setCurrentTime(audio.currentTime || 0)
        const handleLoadedMetadata = () => {
            if (audio.duration && isFinite(audio.duration)) {
                setDuration(audio.duration)
            }
        }
        const handlePlay = () => setIsPlaying(true)
        const handlePause = () => setIsPlaying(false)
        const handleEnded = () => {
            setIsPlaying(false)
            setCurrentTime(0)
        }
        const handleError = (e: Event) => {
            const error = audio.error;
            let message = "Playback error";
            if (error) {
                switch (error.code) {
                    case 1: message = "Playback aborted"; break;
                    case 2: message = "Network error"; break;
                    case 3: message = "Audio decoding failed"; break;
                    case 4: message = "Format not supported"; break;
                }
            }
            console.error(`Audio error (ID: ${currentBeatId}):`, message, error);
            setPlaybackError(`Error playing beat: ${message}.`);
            setIsPlaying(false);
        }

        audio.addEventListener('timeupdate', updateTime)
        audio.addEventListener('loadedmetadata', handleLoadedMetadata)
        audio.addEventListener('play', handlePlay)
        audio.addEventListener('pause', handlePause)
        audio.addEventListener('ended', handleEnded)
        audio.addEventListener('error', handleError)

        return () => {
            audio.removeEventListener('timeupdate', updateTime)
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
            audio.removeEventListener('play', handlePlay)
            audio.removeEventListener('pause', handlePause)
            audio.removeEventListener('ended', handleEnded)
            audio.removeEventListener('error', handleError)
        }
    }, [currentBeatId])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            setOpenMenuId(null)
        }
        if (openMenuId) {
            document.addEventListener("click", handleClickOutside)
            return () => document.removeEventListener("click", handleClickOutside)
        }
    }, [openMenuId])

    const handlePlayToggle = (beatId: string) => {
        const audio = audioRef.current
        if (!audio) return

        setPlaybackError(null) // Reset error on any interaction

        if (currentBeatId === beatId) {
            if (isPlaying) {
                audio.pause()
            } else {
                audio.play().catch((err) => {
                    console.error("Play error:", err)
                    setPlaybackError("Failed to play this beat.")
                })
            }
        } else {
            const beat = beats.find(b => b.id === beatId)
            if (beat) {
                setCurrentBeatId(beatId)
                setDuration(0) // Reset duration for new beat
                audio.src = beat.url
                audio.load() // Explicitly load
                audio.play().catch((err) => {
                    console.error("Load/Play error:", err)
                    setPlaybackError("Failed to load this beat.")
                })
                setCurrentTime(0)
            }
        }
    }

    const handleSeek = (beatId: string, ratio: number) => {
        const audio = audioRef.current
        if (!audio || currentBeatId !== beatId) return

        const audioDuration = audio.duration || duration
        if (audioDuration > 0 && isFinite(audioDuration)) {
            const newTime = ratio * audioDuration
            audio.currentTime = newTime
            setCurrentTime(newTime)
        }
    }

    const handleDelete = async (beatId: string) => {
        if (!confirm("Are you sure you want to delete this beat?")) return
        const result = await deleteBeat(beatId)
        if (result?.success) {
            router.refresh()
        } else {
            alert(result?.error || "Failed to delete beat")
        }
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <div className="mb-4 flex items-center justify-between flex-shrink-0">
                <h3 className="font-bold text-lg flex items-center gap-2">
                    <Music size={20} style={{ color: accentColor }} />
                    Beat Posts
                </h3>
            </div>

            {playbackError && (
                <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-500 flex items-center justify-between">
                    <span>{playbackError}</span>
                    <button onClick={() => setPlaybackError(null)} className="hover:text-red-400">
                        <X size={12} />
                    </button>
                </div>
            )}

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-current/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-current/20">
                {beats.length === 0 && <div className="text-center opacity-50 text-sm py-8">No beats uploaded yet</div>}

                {beats.map((beat) => {
                    const isActive = currentBeatId === beat.id
                    const showMenu = openMenuId === beat.id
                    const trackDuration = isActive && duration > 0 ? duration : (beat.duration || 0)
                    const trackCurrentTime = isActive ? currentTime : 0
                    const progressPercent = trackDuration > 0 ? (trackCurrentTime / trackDuration) * 100 : 0

                    return (
                        <div
                            key={beat.id}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-current/10' : 'hover:bg-current/5'}`}
                        >
                            <div className="relative w-12 h-12 rounded overflow-hidden bg-neutral-800 flex-shrink-0 group">
                                {beat.coverUrl ? (
                                    <img src={beat.coverUrl} alt={beat.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-50">
                                        <Music size={20} />
                                    </div>
                                )}
                                <button
                                    type="button"
                                    onClick={() => handlePlayToggle(beat.id)}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {isActive && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                </button>
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                                <h4 className={`font-medium text-sm truncate ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                                    {beat.title}
                                </h4>
                                {beat.artist && (
                                    <p className="text-[10px] opacity-70 font-mono uppercase tracking-tighter truncate">
                                        {beat.artist}
                                    </p>
                                )}
                                <div className="mt-1 flex items-center gap-3">
                                    <div
                                        className="flex-1 h-1.5 rounded bg-current/10 overflow-hidden cursor-pointer relative"
                                        onClick={(e) => {
                                            const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                                            const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
                                            handleSeek(beat.id, ratio)
                                        }}
                                    >
                                        <div
                                            className="h-full bg-current/60 transition-all"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] opacity-50 whitespace-nowrap">
                                        <span>{formatTime(trackCurrentTime)}</span>
                                        <span>/</span>
                                        <span>{formatTime(trackDuration)}</span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <Volume2 size={14} className="opacity-50" />
                                        <input
                                            type="range"
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            value={volume}
                                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                                            className="w-16 h-1.5 cursor-pointer"
                                            style={{ accentColor: accentColor }}
                                            aria-label="Volume"
                                        />
                                    </div>

                                    {isOwner && (
                                        <div className="relative">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenMenuId(showMenu ? null : beat.id)
                                                }}
                                                className="p-1 opacity-50 hover:opacity-100 transition-opacity"
                                            >
                                                <MoreVertical size={16} />
                                            </button>
                                            {showMenu && (
                                                <div
                                                    className="absolute right-0 top-8 bg-neutral-800 rounded border border-neutral-700 shadow-lg z-10 min-w-[120px]"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setEditingBeat(beat)
                                                            setOpenMenuId(null)
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2"
                                                    >
                                                        <Edit size={14} />
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleDelete(beat.id)
                                                            setOpenMenuId(null)
                                                        }}
                                                        className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2 text-red-400"
                                                    >
                                                        <Trash2 size={14} />
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <audio ref={audioRef} style={{ display: 'none' }} />

            {/* Edit Modal */}
            {editingBeat && (
                <EditBeatModal
                    beat={editingBeat}
                    isOpen={!!editingBeat}
                    onClose={() => setEditingBeat(null)}
                    onSuccess={() => router.refresh()}
                />
            )}
        </div>
    )
}
