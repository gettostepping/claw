"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SocialsDisplay } from "@/components/socials-display"
import { LinkCard } from "@/components/profile/link-card"
import { MusicSection } from "./music-section"
import { YouTubePlayer } from "./youtube-player"
import { VideoPlayer } from "./video-player"

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
    socialSoundcloud: string | null
    socialYoutube: string | null
    socialInstagram: string | null
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
  }
  tracks: {
    id: string
    title: string
    artist: string | null
    coverUrl: string | null
    streamUrl: string
  }[]
  isOwner: boolean
  accessToken?: string
}

export function ProfileCard({ username, profile, tracks, isOwner }: ProfileCardProps) {
  return (
    <motion.div 
      className="relative z-10 w-full max-w-lg p-6 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 shadow-2xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center text-center space-y-4">
              <motion.div 
                className="w-24 h-24 rounded-full overflow-hidden bg-neutral-800 border-2 border-white/20 relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ willChange: 'transform' }}
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
                <motion.h1 
                  className="text-2xl font-bold"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.1, color: "#e5e5e5" }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {profile.displayName}
                </motion.h1>
                <p className="opacity-60 text-sm">@{username}</p>
              </div>

              {profile.bio && (
                <div className="text-sm opacity-80 whitespace-pre-wrap">
                  {profile.bio}
                </div>
              )}

              <SocialsDisplay
                soundcloud={profile.socialSoundcloud}
                youtube={profile.socialYoutube}
                instagram={profile.socialInstagram}
                discord={profile.socialDiscord}
              />

              {profile.musicEmbeds.filter((embed) => embed.type !== "youtube").map((embed) => (
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
              ))}

              <div className="w-full space-y-3 pt-4">
                {profile.links.map((link) => (
                  <LinkCard 
                    key={link.id} 
                    title={link.title} 
                    url={link.url} 
                  />
                ))}
                

              </div>
            </div>
          </motion.div>
        )
      }
      
export function ProfileCardWithMusic({ username, profile, tracks, isOwner, accessToken }: ProfileCardProps) {
  const video = profile.videos[0] // Get the first video (or latest uploaded)
  
  return (
    <div className="relative z-10 w-full max-w-[95vw] flex gap-6 items-center justify-center mx-auto">
      {/* Left: Music Section - Outside main box */}
      <div className="w-96 flex-shrink-0">
        <MusicSection tracks={tracks} isOwner={isOwner} />
      </div>

      {/* Main Profile Card Box */}
      <ProfileCard username={username} profile={profile} tracks={tracks} isOwner={isOwner} />

      {/* Right: Video Player - Outside main box */}
      <div className="w-160 flex-shrink-0">
        {profile.videos[0] && (
          <div className="rounded-xl bg-black/40 backdrop-blur-md border border-white/10 p-4">
            <VideoPlayer video={profile.videos[0]} />
          </div>
        )}
      </div>
    </div>
  )
}
