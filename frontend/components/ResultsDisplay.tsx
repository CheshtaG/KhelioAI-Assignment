'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowPathIcon, EyeIcon, PhotoIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { ProcessingResult, ProductResult } from '@/app/page'
import { ImageGallery } from './ImageGallery'

interface ResultsDisplayProps {
  result: ProcessingResult
  onReset: () => void
}

export function ResultsDisplay({ result, onReset }: ResultsDisplayProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductResult | null>(
    result.products[0] || null
  )
  const [activeTab, setActiveTab] = useState<'frames' | 'segmented' | 'enhanced'>('frames')

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100'
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Complete! 🎉
            </h2>
            <p className="text-gray-600">
              Found {result.products.length} product{result.products.length !== 1 ? 's' : ''} in your video
            </p>
          </div>
          <button
            onClick={onReset}
            className="btn-secondary flex items-center space-x-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            <span>Process Another Video</span>
          </button>
        </div>
      </div>

      {result.products.length === 0 ? (
        <div className="card text-center">
          <div className="text-gray-500">
            <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold mb-2">No Products Detected</h3>
            <p>No clear product images were found in this video. Try a different video with more prominent product shots.</p>
          </div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Product List */}
          <div className="lg:col-span-1">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Products</h3>
              <div className="space-y-3">
                {result.products.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedProduct(product)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
                      selectedProduct?.product_name === product.product_name
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.product_name}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(product.confidence)}`}>
                        {Math.round(product.confidence * 100)}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Frame at {Math.round(product.frame_timestamp)}s
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Image Display */}
          <div className="lg:col-span-2">
            {selectedProduct && (
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {selectedProduct.product_name}
                  </h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('frames')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'frames'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <EyeIcon className="w-4 h-4 inline mr-1" />
                      Original
                    </button>
                    <button
                      onClick={() => setActiveTab('segmented')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'segmented'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <PhotoIcon className="w-4 h-4 inline mr-1" />
                      Segmented
                    </button>
                    <button
                      onClick={() => setActiveTab('enhanced')}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === 'enhanced'
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <SparklesIcon className="w-4 h-4 inline mr-1" />
                      Enhanced
                    </button>
                  </div>
                </div>

                <ImageGallery
                  product={selectedProduct}
                  activeTab={activeTab}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Summary</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Video Information</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Video ID: {result.video_id}</li>
              <li>Products Found: {result.products.length}</li>
              <li>Processing Status: {result.status}</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">AI Processing</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ Frame extraction completed</li>
              <li>✓ Product identification completed</li>
              <li>✓ Image segmentation completed</li>
              <li>✓ Image enhancement completed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
