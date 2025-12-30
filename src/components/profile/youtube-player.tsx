"use client"

import React, { useState, useEffect } from 'react'

interface YouTubePlayerProps {
  videoId: string
}

interface YouTubePlayerProps {
  videoId: string
  accessToken?: string
}

export function YouTubePlayer({ videoId, accessToken }: YouTubePlayerProps) {
  const [isAgeRestricted, setIsAgeRestricted] = useState<boolean | null>(null)
  const [videoInfo, setVideoInfo] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    const checkAgeRestriction = async () => {
      try {
        console.log('Checking age restriction for video:', videoId);
        console.log('Access token available:', !!accessToken);

        let response

        if (accessToken) {
          console.log('Using authenticated request with access token');
          response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          )
        } else {
          console.log('Using unauthenticated request with API key');
          response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY || ''}`
          )
        }

        console.log('Response status:', response.status);

        if (!response.ok) {
          console.error('API request failed:', response.status);

          // If authenticated request fails, try unauthenticated request as fallback
          if (accessToken) {
            console.log('Authenticated request failed, trying unauthenticated request');
            const fallbackResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY || ''}`
            )

            console.log('Fallback response status:', fallbackResponse.status);

            if (!fallbackResponse.ok) {
              console.error('Fallback request also failed:', fallbackResponse.status);
              // If both requests fail, we can't determine if it's age-restricted, so assume it's not
              setIsAgeRestricted(false)
              return
            }

            const fallbackData = await fallbackResponse.json()
            console.log('Fallback YouTube API response:', fallbackData);

            if (fallbackData.items && fallbackData.items.length > 0) {
              const video = fallbackData.items[0]
              setVideoInfo(video)

              // For unauthenticated requests, we can only check basic info
              // YouTube might not return content rating info in unauthenticated requests
              console.log('Video snippet:', video.snippet?.title);
              setIsAgeRestricted(false) // Default to not restricted if we can't verify
            } else {
              console.log('No video items found in fallback API response');
              setIsAgeRestricted(false)
            }
            return
          } else {
            console.error('Unauthenticated request failed:', await response.text());
            // If API request fails, we can't determine if it's age-restricted, so assume it's not
            setIsAgeRestricted(false)
            return
          }
        }

        const data = await response.json()
        console.log('YouTube API response:', data);

        if (data.items && data.items.length > 0) {
          const video = data.items[0]
          setVideoInfo(video)

          // Check if the video has age restrictions
          const contentRating = video.contentDetails?.contentRating?.ytRating
          console.log('Video content rating:', contentRating);

          // Check for other possible age restriction indicators
          const containsAdultContent = video.contentDetails?.contentRating?.reasons?.some((reason: string) =>
            reason.toLowerCase().includes('adult') || reason.toLowerCase().includes('violence') || reason.toLowerCase().includes('sexual')
          );

          console.log('Contains adult content indicators:', containsAdultContent);

          const isRestricted = contentRating === 'ytAgeRestricted' || containsAdultContent;
          console.log('Is age restricted?', isRestricted);

          setIsAgeRestricted(isRestricted)
        } else {
          console.log('No video items found in API response');
          // Video not found - treat as not age restricted but will fail to play
          setIsAgeRestricted(false)
        }
      } catch (error) {
        console.error('Error checking age restriction:', error)
        setIsAgeRestricted(false) // Default to not restricted if we can't determine
      }
    }

    checkAgeRestriction()
  }, [videoId, accessToken])

  if (isAgeRestricted === null) {
    return (
      <div className="flex items-center justify-center w-full h-64 bg-current/10 rounded-lg">
        <div className="opacity-70">Checking video restrictions...</div>
      </div>
    )
  }

  if (isAgeRestricted) {
    // If the user has an access token, they are authenticated and have verified their age
    if (accessToken) {
      console.log('User is authenticated, allowing age-restricted content to play');
      // Allow the video to play since the user is authenticated
      return (
        <div className="relative pt-[56.25%] h-0 rounded-lg overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&controls=1&modestbranding=1`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute top-0 left-0 w-full h-full"
          />
        </div>
      )
    } else {
      // If not authenticated, show the restriction message
      return (
        <div className="w-full bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
          <p className="text-red-400 font-medium">This video is age-restricted.</p>
          <p className="text-red-400 text-sm mt-1">Sign in with Google to verify your age and access this content.</p>
        </div>
      )
    }
  }

  return (
    <div className="relative pt-[56.25%] h-0 rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&loop=1&controls=1&modestbranding=1`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  )
}