import React from 'react'

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 mb-8">
          🚂 ITMS Enhanced Dashboard Test
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">📷 Camera Control</h2>
            <div className="space-y-4">
              <button className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700">
                Start Recording
              </button>
              <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700">
                Capture Frame
              </button>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Camera Status: <span className="text-green-600 font-semibold">ONLINE</span></p>
                <p className="text-sm text-gray-600">Frames Captured: <span className="font-semibold">0</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎯 Laser Scanner</h2>
            <div className="space-y-4">
              <button className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700">
                Start Scanning
              </button>
              <button className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700">
                Measure Gauge
              </button>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Gauge Reading: <span className="font-semibold">1.676 m</span></p>
                <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-semibold">READY</span></p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">🗺️ GPS Tracking</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Latitude: <span className="font-semibold">28.6139°</span></p>
                <p className="text-sm text-gray-600">Longitude: <span className="font-semibold">77.2090°</span></p>
                <p className="text-sm text-gray-600">Speed: <span className="font-semibold">0.0 km/h</span></p>
                <p className="text-sm text-gray-600">Chainage: <span className="font-semibold">0.0 m</span></p>
              </div>
              <button className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700">
                Update Position
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">⚠️ Defect Detection</h2>
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">Defects Found: <span className="font-semibold">0</span></p>
                <p className="text-sm text-gray-600">Last Scan: <span className="font-semibold">Never</span></p>
                <p className="text-sm text-gray-600">Status: <span className="text-green-600 font-semibold">MONITORING</span></p>
              </div>
              <button className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700">
                Run Defect Scan
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">🎮 Hardware Control Panel</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">📷</span>
              </div>
              <p className="text-sm font-medium">Camera</p>
              <p className="text-xs text-green-600">ONLINE</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🎯</span>
              </div>
              <p className="text-sm font-medium">Laser</p>
              <p className="text-xs text-green-600">READY</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">🗺️</span>
              </div>
              <p className="text-sm font-medium">GPS</p>
              <p className="text-xs text-green-600">LOCKED</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-2xl">⚡</span>
              </div>
              <p className="text-sm font-medium">Auto Scan</p>
              <p className="text-xs text-green-600">ACTIVE</p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            This is the enhanced ITMS dashboard with full hardware simulation capabilities!
          </p>
          <div className="flex justify-center space-x-4">
            <a href="/dashboard" className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700">
              Standard Dashboard
            </a>
            <a href="/enhanced" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
              Enhanced Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TestPage
