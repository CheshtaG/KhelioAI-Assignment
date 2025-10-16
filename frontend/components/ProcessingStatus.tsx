'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export function ProcessingStatus() {
  const [currentStep, setCurrentStep] = useState(0)
  const [dots, setDots] = useState('')

  const steps = [
    'Downloading video from YouTube...',
    'Extracting key frames...',
    'Identifying products with AI...',
    'Segmenting product images...',
    'Enhancing product shots...',
    'Finalizing results...'
  ]

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length)
    }, 3000)

    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'))
    }, 500)

    return () => {
      clearInterval(stepInterval)
      clearInterval(dotsInterval)
    }
  }, [])

  return (
    <div className="card animate-fade-in">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Processing Your Video{dots}
        </h2>
        
        <p className="text-gray-600 mb-8">
          This may take a few minutes depending on video length and complexity
        </p>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ 
                opacity: index <= currentStep ? 1 : 0.5,
                x: 0,
                color: index === currentStep ? '#2563eb' : index < currentStep ? '#10b981' : '#9ca3af'
              }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center space-x-3 ${
                index === currentStep ? 'text-primary-600' : 
                index < currentStep ? 'text-green-600' : 'text-gray-400'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                index === currentStep ? 'bg-primary-100' : 
                index < currentStep ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                {index < currentStep ? (
                  <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : index === currentStep ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="w-2 h-2 bg-primary-600 rounded-full"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">{index + 1}</span>
                )}
              </div>
              <span className="font-medium">{step}</span>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Keep this tab open while processing. The AI is analyzing frames, 
            identifying products, and creating enhanced images for you.
          </p>
        </div>
      </div>
    </div>
  )
}
