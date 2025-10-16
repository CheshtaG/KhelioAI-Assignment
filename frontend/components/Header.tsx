'use client'

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              AI Product Imagery
            </h1>
            <p className="text-gray-600 mt-1">
              Extract and enhance product images from YouTube videos
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
