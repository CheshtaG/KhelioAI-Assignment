'use client'

import { useState } from 'react'
import { VideoInputForm } from '@/components/VideoInputForm'
import { ResultsDisplay } from '@/components/ResultsDisplay'
import { Header } from '@/components/Header'
import { ProcessingStatus } from '@/components/ProcessingStatus'
import { apiService } from '@/services/api'

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

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleVideoSubmit = async (youtubeUrl: string) => {
    setIsProcessing(true)
    setError(null)
    setResult(null)

    try {
      const response = await apiService.processVideo(youtubeUrl)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'An error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReset = () => {
    setResult(null)
    setError(null)
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {!isProcessing && !result && (
            <VideoInputForm onSubmit={handleVideoSubmit} />
          )}
          
          {isProcessing && (
            <ProcessingStatus />
          )}
          
          {error && (
            <div className="card mb-8">
              <div className="text-red-600 text-center">
                <h3 className="text-lg font-semibold mb-2">Processing Error</h3>
                <p>{error}</p>
                <button 
                  onClick={handleReset}
                  className="btn-secondary mt-4"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {result && (
            <ResultsDisplay result={result} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  )
}
