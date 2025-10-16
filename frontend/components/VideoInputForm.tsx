'use client'

import { useState, useEffect } from 'react'
import { PlayIcon, LinkIcon, ClockIcon } from '@heroicons/react/24/outline'

interface VideoInputFormProps {
  onSubmit: (url: string) => void
}

export function VideoInputForm({ onSubmit }: VideoInputFormProps) {
  const [url, setUrl] = useState('')
  const [isValid, setIsValid] = useState(false)
  const [videoInfo, setVideoInfo] = useState<{title: string, duration: string} | null>(null)
  const [isLoadingVideoInfo, setIsLoadingVideoInfo] = useState(false)

  const validateUrl = (inputUrl: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[\w-]+/
    return youtubeRegex.test(inputUrl)
  }

  const extractVideoId = (url: string) => {
    if (url.includes("youtube.com/watch?v=")) {
      return url.split("v=")[1].split("&")[0]
    } else if (url.includes("youtube.com/shorts/")) {
      return url.split("shorts/")[1].split("?")[0]
    } else if (url.includes("youtu.be/")) {
      return url.split("youtu.be/")[1].split("?")[0]
    }
    return null
  }

  const fetchVideoInfo = async (videoId: string) => {
    setIsLoadingVideoInfo(true)
    try {
      // Fetch video info from backend using Google YouTube Data API
      const response = await fetch(`http://localhost:8000/video-info/${videoId}`)
      if (response.ok) {
        const data = await response.json()
        setVideoInfo(data)
      } else {
        throw new Error('Backend not available')
      }
    } catch (error) {
      // Show error state if backend is not available
      setVideoInfo({
        title: "Backend not available",
        duration: "Please start the backend server"
      })
    } finally {
      setIsLoadingVideoInfo(false)
    }
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputUrl = e.target.value
    setUrl(inputUrl)
    const valid = validateUrl(inputUrl)
    setIsValid(valid)
    
    // Clear previous video info
    setVideoInfo(null)
    
    // Fetch video info if URL is valid
    if (valid) {
      const videoId = extractVideoId(inputUrl)
      if (videoId) {
        fetchVideoInfo(videoId)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (isValid) {
      onSubmit(url)
    }
  }


  return (
    <div className="card animate-fade-in">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <PlayIcon className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Process YouTube Video
        </h2>
        <p className="text-gray-600">
          Enter a YouTube video URL to extract and enhance product images using AI
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="youtube-url" className="block text-sm font-medium text-gray-700 mb-2">
            YouTube Video URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <LinkIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="url"
              id="youtube-url"
              value={url}
              onChange={handleUrlChange}
              placeholder="https://www.youtube.com/watch?v=... or https://youtube.com/shorts/..."
              className={`input-field pl-10 ${isValid ? 'border-green-300 focus:ring-green-500' : url && 'border-red-300 focus:ring-red-500'}`}
              required
            />
          </div>
          {url && !isValid && (
            <p className="mt-2 text-sm text-red-600">
              Please enter a valid YouTube URL
            </p>
          )}
          {isValid && (
            <p className="mt-2 text-sm text-green-600">
              ✓ Valid YouTube URL detected
            </p>
          )}
        </div>

        {/* Video Info Display */}
        {(isValid && (videoInfo || isLoadingVideoInfo)) && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-2">
              <PlayIcon className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Video Information</h3>
            </div>
            {isLoadingVideoInfo ? (
              <div className="mt-2 flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-blue-700">Loading video details...</span>
              </div>
            ) : videoInfo && (
              <div className="mt-2 space-y-1">
                <p className="text-sm text-blue-800 font-medium">{videoInfo.title}</p>
                <div className="flex items-center space-x-1 text-sm text-blue-700">
                  <ClockIcon className="w-4 h-4" />
                  <span>Duration: {videoInfo.duration}</span>
                </div>
              </div>
            )}
          </div>
        )}


        <button
          type="submit"
          disabled={!isValid}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-200 ${
            isValid
              ? 'bg-primary-600 hover:bg-primary-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isValid ? 'Extract Product Images' : 'Enter YouTube URL'}
        </button>
      </form>

    </div>
  )
}
