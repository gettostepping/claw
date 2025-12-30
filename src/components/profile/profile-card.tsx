"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SocialsDisplay } from "@/components/socials-display"
import { LinkCard } from "@/components/profile/link-card"
import { MusicSection } from "./music-section"
import { BeatSection } from "./beat-section"
import { YouTubePlayer } from "./youtube-player"
import { VideoPlayer } from "./video-player"
import { Eye } from "lucide-react"
import { PurpleParticlesEffect, GoldenGlowEffect, RainbowEffect, GlitchEffect } from "../effects/name-effects"
import { getCardStyles } from "@/lib/styles"

function TenorAvatar({ url, mp4Url, isGif, username }: { url: string; mp4Url: string; isGif: boolean; username: string }) {
  const [useGif, setUseGif] = useState(false)
  const gifUrl = isGif ? url : (url.includes('media.tenor.com') && !url.includes('.gif') && !url.includes('.mp4') ? url + '.gif' : url)

  // If MP4 URL is same as original, just use GIF directly
  if (mp4Url === url) {
    return (
      <img
        src={gifUrl}
        alt={username}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ pointerEvents: 'none' }}
      />
    )
  }

  // Only render one element at a time to prevent glitches
  if (useGif) {
    return (
      <img
        src={gifUrl}
        alt={username}
        className="w-full h-full object-cover"
        loading="lazy"
        style={{ pointerEvents: 'none' }}
      />
    )
  }

  return (
    <video
      src={mp4Url}
      autoPlay
      loop
      muted
      playsInline
      className="w-full h-full object-cover"
      style={{ pointerEvents: 'none' }}
      onError={() => {
        // MP4 failed, switch to GIF
        setUseGif(true)
      }}
    />
  )
}

interface ProfileCardProps {
  username: string
  profile: {
    displayName: string | null
    bio: string | null
    avatarUrl: string | null
    accentColor?: string
    cardStyle?: string
    showViews?: boolean
    views: number
    socialSoundcloud: string | null
    socialYoutube: string | null
    socialInstagram: string | null
    socialSpotify: string | null
    socialDiscord: string | null
    links: {
      id: string
      title: string
      url: string
    }[]
    musicEmbeds: {
      id: string
      embedUrl: string
      type: string
    }[]
    videos: {
      id: string
      title: string
      url: string
      thumbnailUrl: string | null
      description: string | null
    }[]
    backgroundEffect?: string
    nameEffect?: string
    featuredContent?: string
  }
  tracks: {
    id: string
    title: string
    artist: string | null
    coverUrl: string | null
    streamUrl: string
  }[]
  beats: {
    id: string
    title: string
    artist: string | null
    coverUrl: string | null
    url: string
  }[]
  isOwner: boolean
  accessToken?: string
}

export function ProfileCard({ username, profile, tracks, isOwner }: ProfileCardProps) {
  const cardStyle = profile.cardStyle || "standard"

  const accentColor = profile.accentColor || "#a855f7"

  const styles = getCardStyles(cardStyle, accentColor, (profile as any).textTheme || "white")

  const isNeon = cardStyle === "neon"
  const isBrutal = cardStyle === "brutal"

  return (
    <motion.div
      className={`relative z-10 w-full max-w-lg p-6 ${styles.card} ${styles.font} ${styles.text} ${styles.glow}`}
      style={{
        borderColor: isNeon ? accentColor : undefined,
        boxShadow: isNeon ? `0 0 20px ${accentColor}44, inset 0 0 10px ${accentColor}22` : undefined,
        borderWidth: isBrutal ? '4px' : isNeon ? '2px' : undefined
      }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {profile.showViews && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/5 text-[10px] font-mono opacity-60 hover:opacity-100 transition-opacity">
          <Eye size={12} className="text-neutral-400" />
          <span className="text-white">{profile.views.toLocaleString()}</span>
        </div>
      )}

      <div className="flex flex-col items-center text-center space-y-4">
        <motion.div
          className={`w-24 h-24 overflow-hidden relative ${styles.avatar} bg-neutral-800`}
          style={{ borderColor: accentColor, transform: 'none' }}
          whileHover={{ scale: 1.1, rotate: 5 }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {profile.avatarUrl ? (
            (() => {
              const url = profile.avatarUrl
              const isMp4 = url.includes('.mp4') || url.endsWith('/mp4')
              const isTenor = url.includes('tenor.com') || url.includes('media.tenor.com')
              const isGif = url.includes('.gif') || url.endsWith('/gif')

              // Use video tag for MP4 files (including Tenor MP4 GIFs)
              if (isMp4) {
                return (
                  <video
                    src={url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ pointerEvents: 'none' }}
                  />
                )
              }

              // For Tenor URLs, try MP4 first (more efficient), fallback to GIF
              if (isTenor) {
                // Construct MP4 URL from GIF URL if it's a media URL
                let mp4Url = url
                if (url.includes('media.tenor.com') && isGif) {
                  mp4Url = url.replace(/\.gif$/, '.mp4')
                } else if (url.includes('media.tenor.com') && !url.includes('.mp4') && !url.includes('.gif')) {
                  // If no extension, try adding .mp4
                  mp4Url = url + '.mp4'
                }

                return (
                  <TenorAvatar url={url} mp4Url={mp4Url} isGif={isGif} username={username} />
                )
              }

              // Regular GIF or image - use img tag (GIFs will animate automatically)
              return (
                <img
                  src={url}
                  alt={username}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  style={{ pointerEvents: 'none' }}
                />
              )
            })()
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-gray-500">
              {username[0].toUpperCase()}
            </div>
          )}
        </motion.div>

        <div>
          <motion.div
            className="relative inline-block"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {profile.nameEffect === "purple-particles" && <PurpleParticlesEffect />}
            {profile.nameEffect === "golden-glow" && <GoldenGlowEffect />}

            <motion.h1
              className="text-2xl font-bold relative z-10"
              animate={{ opacity: 1 }}
            >
              {profile.nameEffect === "rainbow" ? (
                <RainbowEffect>{profile.displayName}</RainbowEffect>
              ) : profile.nameEffect === "glitch" ? (
                <GlitchEffect>{profile.displayName}</GlitchEffect>
              ) : (
                profile.displayName
              )}
            </motion.h1>
            <p className="opacity-60 text-sm">@{username}</p>
          </motion.div>
        </div>

        {
          profile.bio && (
            <div className="text-sm opacity-80 whitespace-pre-wrap">
              {profile.bio}
            </div>
          )
        }

        <SocialsDisplay
          soundcloud={profile.socialSoundcloud}
          youtube={profile.socialYoutube}
          instagram={profile.socialInstagram}
          spotify={profile.socialSpotify}
          discord={profile.socialDiscord}
        />

        {
          profile.musicEmbeds.filter((embed) => embed.type !== "youtube").map((embed) => (
            <div key={embed.id} className="w-full rounded-lg overflow-hidden my-2">
              <iframe
                src={embed.embedUrl}
                width="100%"
                height="80"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
              ></iframe>
            </div>
          ))
        }

      </div >
    </motion.div >
  )
}

export function ProfileCardWithMusic({ username, profile, tracks, beats, isOwner, accessToken }: ProfileCardProps) {
  const video = profile.videos[0] // Get the first video (or latest uploaded)
  const accentColor = profile.accentColor || "#a855f7"
  const cardStyle = profile.cardStyle || "standard"
  const styles = getCardStyles(cardStyle, accentColor, (profile as any).textTheme || "white")

  const isNeon = cardStyle === "neon"
  const isBrutal = cardStyle === "brutal"
  const containerStyle = {
    borderColor: isNeon ? accentColor : undefined,
    boxShadow: isNeon ? `0 0 20px ${accentColor}44, inset 0 0 10px ${accentColor}22` : undefined,
    borderWidth: isBrutal ? '4px' : isNeon ? '2px' : undefined
  }

  // Show beats if chosen, or if video is chosen but none exists and beats DO exist
  const showBeats = profile.featuredContent === "beats" ||
    (profile.featuredContent === "video" && profile.videos.length === 0 && beats.length > 0)

  return (
    <div className="relative z-10 w-full max-w-[95vw] flex flex-col md:flex-row gap-6 items-center justify-center mx-auto p-4">
      {/* Left: Music Section - Outside main box */}
      <div className={`w-full md:w-96 flex-shrink-0 p-6 ${styles.card} ${styles.font} ${styles.text} ${styles.glow}`} style={containerStyle}>
        <MusicSection tracks={tracks} isOwner={isOwner} accentColor={accentColor} />
      </div>

      {/* Main Profile Card Box */}
      <ProfileCard username={username} profile={profile} tracks={tracks} isOwner={isOwner} beats={beats} />

      {/* Right: Video Player or Beat Section - Outside main box */}
      {showBeats ? (
        <div className={`w-full md:w-96 flex-shrink-0 p-6 ${styles.card} ${styles.font} ${styles.text} ${styles.glow}`} style={containerStyle}>
          <BeatSection beats={beats} isOwner={isOwner} accentColor={accentColor} />
        </div>
      ) : profile.videos[0] ? (
        <div className={`w-full md:w-100 flex-shrink-0 p-6 ${styles.card} ${styles.font} ${styles.text} ${styles.glow}`} style={containerStyle}>
          <VideoPlayer video={profile.videos[0]} />
        </div>
      ) : (
        /* Empty spacer to balance the left side music section (w-96) so the main card stays centered */
        <div className="hidden md:block w-96 flex-shrink-0" aria-hidden="true" />
      )}
    </div>
  )
}
