"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Upload, Play, Pause, Music, Volume2, MoreVertical, Edit, Trash2, X } from "lucide-react"
import { uploadTrack, updateTrack, deleteTrack } from "@/actions/music"
import { useFormStatus } from "react-dom"
import { useActionState } from "react"
import { useRouter } from "next/navigation"

interface Track {
  id: string
  title: string
  artist: string | null
  coverUrl: string | null
  streamUrl: string
  duration?: number | null
}

function UploadForm() {
  const { pending } = useFormStatus()

  return (
    <div className="flex gap-2">
      <input
        name="url"
        placeholder="SoundCloud URL"
        required
        className="flex-1 bg-neutral-900 border border-neutral-800 rounded p-2 text-sm text-white focus:outline-none focus:border-neutral-600"
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-white text-black px-3 py-2 rounded text-sm font-bold hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
      >
        {pending ? <div className="animate-spin w-4 h-4 border-2 border-black border-t-transparent rounded-full" /> : <Upload size={16} />}
      </button>
    </div>
  )
}

interface EditTrackModalProps {
  track: Track
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

function EditTrackModal({ track, isOpen, onClose, onSuccess }: EditTrackModalProps) {
  const [state, formAction] = useActionState(updateTrack, null)
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
          <h3 className="text-xl font-bold">Edit Track</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          <input type="hidden" name="trackId" value={track.id} />

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
            <input
              name="title"
              defaultValue={track.title}
              required
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Cover Image URL</label>
            <input
              name="coverUrl"
              type="url"
              defaultValue={track.coverUrl || ""}
              placeholder="https://..."
              className="w-full bg-neutral-800 border border-neutral-700 rounded p-2 text-white focus:outline-none focus:border-neutral-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Duration (seconds)</label>
            <input
              name="duration"
              type="number"
              defaultValue={track.duration || ""}
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

export function MusicSection({ tracks, isOwner, accentColor = "#a855f7" }: { tracks: Track[], isOwner: boolean, accentColor?: string }) {
  const router = useRouter()
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.9)
  const [playingSrc, setPlayingSrc] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastSrcRef = useRef<string | null>(null)
  const [uploadState, formAction] = useActionState(uploadTrack, null)
  const loadedTracksRef = useRef<Map<string, { url: string, timestamp: number }>>(new Map())
  const autoRefreshRef = useRef<Set<string>>(new Set())

  // Simple state for current track's time and duration (like the working Soundcloud implementation)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Menu and edit modal state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)

  const activeTrack = useMemo(() => tracks.find(t => t.id === currentTrack), [tracks, currentTrack])

  const formatTime = (s: number) => {
    if (!isFinite(s) || isNaN(s)) return "0:00"
    const minutes = Math.floor(s / 60)
    const seconds = Math.floor(s % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const cleanTitle = (title: string) => {
    return title.replace(/\.(mp3|wav|ogg|flac|m4a|opus)$/i, "")
  }

  // Setup audio element listeners - keep them always attached (like working Soundcloud implementation)
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (audio) {
        setCurrentTime(audio.currentTime || 0)
      }
    }

    const updateDuration = () => {
      if (audio && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }

    const handleLoadedMetadata = () => {
      if (audio && audio.duration && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(audio.duration)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
    }
    const handleError = async (e: Event) => {
      const audioEl = e.target as HTMLAudioElement
      const error = audioEl.error
      if (error) {
        console.error("Audio error code:", error.code, "src:", audioEl.src.substring(0, 50))

        // Error code 4 (MEDIA_ERR_SRC_NOT_SUPPORTED) often means the Cobalt tunnel expired (400 Bad Request)
        if (error.code === 4 && currentTrack && !autoRefreshRef.current.has(currentTrack)) {
          console.log("Attempting auto-refresh for track:", currentTrack)
          autoRefreshRef.current.add(currentTrack)

          const fresh = await fetchFreshUrl(currentTrack)
          if (fresh) {
            loadedTracksRef.current.set(currentTrack, { url: fresh, timestamp: Date.now() })
            setPlayingSrc(fresh)
            setIsPlaying(true)
            return
          }
        }
      }
      setIsPlaying(false)
    }

    // Add event listeners
    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('durationchange', updateDuration)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)

    // Set volume
    audio.volume = volume

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('durationchange', updateDuration)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
    }
  }, [volume]) // Don't include currentTrack - listeners should stay attached

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume
  }, [volume])

  // Update audio source when track or playingSrc changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (!currentTrack || !activeTrack) {
      if (audio.src) {
        audio.pause()
        audio.removeAttribute("src")
        audio.load()
        lastSrcRef.current = null
      }
      return
    }

    let src = playingSrc
    if (!src && loadedTracksRef.current.has(currentTrack)) {
      src = loadedTracksRef.current.get(currentTrack)!.url
    }
    if (!src) {
      src = activeTrack.streamUrl
    }

    if (!src) {
      if (audio.src) {
        audio.pause()
        audio.removeAttribute("src")
        audio.load()
        lastSrcRef.current = null
      }
      return
    }

    try {
      new URL(src)
    } catch {
      return
    }

    if (lastSrcRef.current !== src) {
      lastSrcRef.current = src
      audio.src = src
      audio.load()

      // Duration will be set by the audio event listeners
    }
  }, [currentTrack, activeTrack, playingSrc])

  // Play audio when isPlaying becomes true
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !isPlaying || !currentTrack) return

    const playAudio = async () => {
      try {
        await audio.play()
      } catch (err) {
        console.error("Failed to play audio:", err)
        setIsPlaying(false)
      }
    }

    if (audio.readyState >= 2) {
      playAudio()
    } else {
      const onCanPlay = () => {
        playAudio()
        audio.removeEventListener("canplay", onCanPlay)
      }
      audio.addEventListener("canplay", onCanPlay)
      return () => audio.removeEventListener("canplay", onCanPlay)
    }
  }, [isPlaying, currentTrack])

  const fetchFreshUrl = async (trackId: string) => {
    try {
      const res = await fetch(`/api/track/${trackId}/refresh`, {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      if (!res.ok) return null
      const data = await res.json()
      if (typeof data?.url === "string") return data.url
      return null
    } catch {
      return null
    }
  }

  const handlePlay = async (trackId: string) => {
    const audio = audioRef.current

    if (currentTrack === trackId && isPlaying) {
      if (audio) {
        audio.pause()
      }
      setIsPlaying(false)
      return
    }

    if (currentTrack === trackId && !isPlaying) {
      if (audio) {
        audio.play().catch((err) => {
          console.error("Failed to resume audio:", err)
          setIsPlaying(false)
        })
      }
      setIsPlaying(true)
      return
    }

    // URL cache with 15-minute TTL (Cobalt tunnels usually last longer, but let's be safe)
    const CACHE_TTL = 15 * 60 * 1000
    if (loadedTracksRef.current.has(trackId)) {
      const cached = loadedTracksRef.current.get(trackId)!
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        setCurrentTrack(trackId)
        setCurrentTime(0)
        setPlayingSrc(cached.url)
        setIsPlaying(true)
        return
      }
    }

    const next = tracks.find(t => t.id === trackId)
    if (!next) return

    setCurrentTrack(trackId)
    setCurrentTime(0)
    setDuration(0) // Reset duration when switching tracks
    setIsPlaying(false)
    autoRefreshRef.current.delete(trackId) // Reset auto-refresh attempt for new play session

    if (audio && currentTrack && currentTrack !== trackId) {
      audio.pause()
      audio.removeAttribute("src")
      audio.load()
      lastSrcRef.current = null
    }

    const fresh = await fetchFreshUrl(trackId)

    if (fresh) {
      loadedTracksRef.current.set(trackId, { url: fresh, timestamp: Date.now() })
      setPlayingSrc(fresh)
      setIsPlaying(true)
    } else {
      // If refresh fails, try using the original streamUrl as fallback
      setPlayingSrc(next.streamUrl)
      setIsPlaying(true)
    }
  }

  const handleSeek = (trackId: string, ratio: number) => {
    const audio = audioRef.current
    if (!audio || currentTrack !== trackId) return

    const audioDuration = audio.duration || duration
    if (audioDuration > 0) {
      const newTime = ratio * audioDuration
      audio.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleDelete = async (trackId: string) => {
    if (!confirm("Are you sure you want to delete this track?")) return

    const result = await deleteTrack(trackId)
    if (result?.success) {
      router.refresh()
    } else {
      alert(result?.error || "Failed to delete track")
    }
  }

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

  return (
    <div className="h-full flex flex-col overflow-hidden">


      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Music size={20} style={{ color: accentColor }} />
          SoundCloud Tracks
        </h3>
      </div>

      <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-current/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-current/20">
        {tracks.length === 0 && <div className="text-center opacity-50 text-sm">No tracks yet</div>}

        {tracks.map((track) => {
          const isActive = currentTrack === track.id
          const showMenu = openMenuId === track.id

          // For active track, use current duration state (which comes from the audio element)
          // For others, use the stored duration from metadata
          const trackDuration = isActive && duration > 0 ? duration : (track.duration || 0)
          const trackCurrentTime = isActive ? currentTime : 0

          const progressPercent = trackDuration > 0
            ? Math.min((trackCurrentTime / trackDuration) * 100, 100)
            : 0

          return (
            <div
              key={track.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-current/10' : 'hover:bg-current/5'}`}
            >
              <div className="relative w-12 h-12 rounded overflow-hidden bg-neutral-800 flex-shrink-0 group">
                {track.coverUrl ? (
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-50">
                    <Music size={20} />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => handlePlay(track.id)}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {isActive && isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
              </div>

              <div className="flex-1 min-w-0 text-left">
                <h4 className={`font-medium text-sm truncate ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {cleanTitle(track.title)}
                </h4>
                <div className="mt-1 flex items-center gap-3">
                  <div
                    className="flex-1 h-1.5 rounded bg-current/10 overflow-hidden cursor-pointer relative"
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
                      const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1)
                      handleSeek(track.id, ratio)
                    }}
                  >
                    <div
                      className="h-full bg-current/60 transition-all"
                      style={{
                        width: `${progressPercent}%`,
                        minWidth: progressPercent > 0 ? "2px" : "0px"
                      }}
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
                      className="w-16 h-1.5"
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
                          setOpenMenuId(showMenu ? null : track.id)
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
                              setEditingTrack(track)
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
                              handleDelete(track.id)
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

      {/* Hidden Audio Player */}
      <audio
        ref={audioRef}
        preload="metadata"
        style={{ display: 'none' }}
      />

      {/* Edit Modal */}
      {editingTrack && (
        <EditTrackModal
          track={editingTrack}
          isOpen={!!editingTrack}
          onClose={() => setEditingTrack(null)}
          onSuccess={() => router.refresh()}
        />
      )}
    </div>
  )
}
