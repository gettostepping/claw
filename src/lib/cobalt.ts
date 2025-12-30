import axios from 'axios'

const COBALT_API_URL = process.env.NEXT_PUBLIC_COBALT_API_URL || process.env.COBALT_API_URL || 'https://cobalt-jinx9912.fly.dev/'

interface CobaltRequest {
  url: string
  audioFormat?: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus'
  downloadMode?: 'auto' | 'audio' | 'mute'
  disableMetadata?: boolean
}

interface CobaltTunnelResponse {
  status: 'tunnel' | 'redirect'
  url: string
  filename: string
  author?: string
  artist?: string
  title?: string
  thumbnail?: string
  picture?: string
  artwork?: string
  cover?: string
  duration?: number
  fileMetadata?: {
    title?: string
    artist?: string
    author?: string
    album?: string
    album_artist?: string
    genre?: string
    date?: string
  }
  [key: string]: unknown
}

interface CobaltErrorResponse {
  status: 'error'
  error: {
    code: string
    context?: unknown
  }
}

export type CobaltResponse = CobaltTunnelResponse | CobaltErrorResponse

/**
 * Process a SoundCloud URL and get streaming audio URL
 */
export async function processSoundCloudUrl(soundcloudUrl: string): Promise<CobaltResponse | null> {
  try {
    console.log('🎵 Processing SoundCloud URL:', soundcloudUrl)
    console.log('📍 Cobalt API URL:', COBALT_API_URL)

    // Ensure no double slashes in URL
    const apiUrl = COBALT_API_URL.endsWith('/') ? COBALT_API_URL : `${COBALT_API_URL}/`

    // Cobalt.tools API endpoint - uses root path /
    const response = await axios.post(apiUrl, {
      url: soundcloudUrl,
      audioFormat: 'best',
      downloadMode: 'audio',
      disableMetadata: false
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      timeout: 60000, // Increased timeout for processing instance
      validateStatus: (status) => status < 500 // Don't throw on 4xx errors
    })

    console.log('✅ Cobalt response status:', response.status)
    console.log('✅ Cobalt response data:', JSON.stringify(response.data, null, 2))

    // Check if response indicates an error (even with 200 status)
    if (response.data && typeof response.data === 'object' && response.data.status === 'error') {
      console.error('❌ Cobalt returned error status:', response.data.error)
      return response.data
    }

    return response.data
  } catch (error: unknown) {
    // Enhanced error logging
    const err = error as { message?: string; code?: string; response?: { status?: number; data?: unknown } }
    console.error('❌ Cobalt API error details:')
    console.error('  - Message:', err.message)
    console.error('  - Code:', err.code)
    console.error('  - Response Status:', err.response?.status)
    console.error('  - Response Data:', err.response?.data)

    // Check for specific error types
    if (err.response?.data) {
      const errorData = err.response.data
      // Check if it's a processing instance error
      if (typeof errorData === 'object' && errorData && 'error' in errorData) {
        const e = (errorData as { error?: { code?: string; message?: string }; message?: string })
        if (e.error?.code?.includes('processing') ||
          e.error?.message?.includes('processing instance') ||
          e.message?.includes('processing instance')) {
          console.error('⚠️ Processing instance unavailable - Cobalt API cannot connect to processing workers')
          return {
            status: 'error',
            error: {
              code: 'processing_instance_unavailable',
              context: 'The Cobalt API cannot connect to its processing instance. This may be a deployment issue on Vercel.'
            }
          }
        }
      }
      return errorData as CobaltResponse
    }

    // Network/timeout errors
    if (err.code === 'ECONNABORTED' || err.message?.includes('timeout')) {
      console.error('⚠️ Request timeout - Cobalt API took too long to respond')
      return {
        status: 'error',
        error: {
          code: 'timeout',
          context: 'The Cobalt API request timed out. The processing instance may be overloaded or unavailable.'
        }
      }
    }

    // Connection errors
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      console.error('⚠️ Connection refused - Cannot reach Cobalt API')
      return {
        status: 'error',
        error: {
          code: 'connection_refused',
          context: `Cannot connect to Cobalt API at ${COBALT_API_URL}. Check if the service is running.`
        }
      }
    }

    return {
      status: 'error',
      error: {
        code: err.code || 'cobalt.fetch.fail',
        context: err.message || 'Unknown error occurred while connecting to Cobalt API'
      }
    }
  }
}
