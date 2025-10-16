import axios from 'axios'

// Route all calls through Next.js rewrite to local backend
const API_BASE_URL = '/api'

export interface VideoRequest {
  youtube_url: string
}

export interface ProductResult {
  product_name: string
  confidence: number
  frame_timestamp: number
  frame_image_path: string
  segmented_image_path: string
  enhanced_images: string[]
}

export interface ProcessingResult {
  video_id: string
  products: ProductResult[]
  status: string
  message: string
}

class ApiService {
  private client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 300000, // 5 minutes timeout for video processing
    headers: {
      'Content-Type': 'application/json',
    },
  })

  async processVideo(youtubeUrl: string): Promise<{ data: ProcessingResult }> {
    try {
      const response = await this.client.post<ProcessingResult>('/process-video', {
        youtube_url: youtubeUrl,
      })
      return response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message)
      }
      throw error
    }
  }

  async healthCheck(): Promise<{ data: { status: string } }> {
    try {
      const response = await this.client.get('/health')
      return response
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.detail || error.message)
      }
      throw error
    }
  }
}

export const apiService = new ApiService()
