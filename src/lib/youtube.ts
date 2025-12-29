import { getServerSession } from "next-auth"
import { authOptions } from "./auth"

interface YouTubeVideo {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      default?: { url: string }
      medium?: { url: string }
      high?: { url: string }
      maxres?: { url: string }
    }
    publishedAt: string
    channelTitle: string
  }
  contentDetails?: {
    contentRating?: {
      ytRating?: string
    }
  }
}

export async function checkYouTubeVideo(videoId: string): Promise<YouTubeVideo | null> {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      // If no access token, try to get basic info without auth
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY || ''}`
      )
      
      if (!response.ok) {
        console.error('Failed to fetch video info without auth:', response.status)
        return null
      }
      
      const data = await response.json()
      if (data.items && data.items.length > 0) {
        return data.items[0]
      }
      return null
    }

    // Use authenticated request with access token
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}`,
      {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch video info with auth:', response.status)
      
      // Fallback to unauthenticated request
      const fallbackResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY || ''}`
      )
      
      if (!fallbackResponse.ok) {
        console.error('Fallback request also failed:', fallbackResponse.status)
        return null
      }
      
      const data = await fallbackResponse.json()
      if (data.items && data.items.length > 0) {
        return data.items[0]
      }
      return null
    }

    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0]
    }
    return null
  } catch (error) {
    console.error('Error fetching YouTube video:', error)
    return null
  }
}

export async function checkAgeRestriction(videoId: string): Promise<boolean> {
  try {
    const video = await checkYouTubeVideo(videoId)
    
    if (!video) {
      return false // If we can't get info, assume not age-restricted
    }

    // Check if the video has age restrictions
    const contentRating = video.contentDetails?.contentRating?.ytRating
    return contentRating === 'ytAgeRestricted'
  } catch (error) {
    console.error('Error checking age restriction:', error)
    return false
  }
}