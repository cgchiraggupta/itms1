import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Zap, 
  MapPin, 
  Play, 
  Pause, 
  Square,
  Settings,
  Eye,
  Target,
  Navigation,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface HardwareControlProps {
  onCameraToggle: (enabled: boolean) => void
  onLaserToggle: (enabled: boolean) => void
  onGPSToggle: (enabled: boolean) => void
  onAutoScanToggle: (enabled: boolean) => void
}

const HardwareControl: React.FC<HardwareControlProps> = ({
  onCameraToggle,
  onLaserToggle,
  onGPSToggle,
  onAutoScanToggle
}) => {
  const [cameraEnabled, setCameraEnabled] = useState(true)
  const [laserEnabled, setLaserEnabled] = useState(true)
  const [gpsEnabled, setGpsEnabled] = useState(true)
  const [autoScan, setAutoScan] = useState(true)
  const [isScanning, setIsScanning] = useState(false)
  const [scanProgress, setScanProgress] = useState(0)

  const handleCameraToggle = () => {
    const newState = !cameraEnabled
    setCameraEnabled(newState)
    onCameraToggle(newState)
  }

  const handleLaserToggle = () => {
    const newState = !laserEnabled
    setLaserEnabled(newState)
    onLaserToggle(newState)
  }

  const handleGPSToggle = () => {
    const newState = !gpsEnabled
    setGpsEnabled(newState)
    onGPSToggle(newState)
  }

  const handleAutoScanToggle = () => {
    const newState = !autoScan
    setAutoScan(newState)
    onAutoScanToggle(newState)
  }

  const startScan = () => {
    setIsScanning(true)
    setScanProgress(0)
    
    // Simulate scan progress
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsScanning(false)
          return 0
        }
        return prev + 2
      })
    }, 100)
  }

  const stopScan = () => {
    setIsScanning(false)
    setScanProgress(0)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Hardware Control Panel</h3>
      
      {/* Control Toggles */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            cameraEnabled ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
          }`}
          onClick={handleCameraToggle}
        >
          <div className="flex items-center space-x-3">
            <Camera className={`h-6 w-6 ${cameraEnabled ? 'text-green-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">Camera</p>
              <p className="text-sm text-gray-600">Track imaging</p>
            </div>
            <div className="ml-auto">
              {cameraEnabled ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            laserEnabled ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}
          onClick={handleLaserToggle}
        >
          <div className="flex items-center space-x-3">
            <Target className={`h-6 w-6 ${laserEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">Laser Scanner</p>
              <p className="text-sm text-gray-600">Gauge measurement</p>
            </div>
            <div className="ml-auto">
              {laserEnabled ? (
                <CheckCircle className="h-5 w-5 text-blue-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            gpsEnabled ? 'border-purple-500 bg-purple-50' : 'border-gray-300 bg-gray-50'
          }`}
          onClick={handleGPSToggle}
        >
          <div className="flex items-center space-x-3">
            <Navigation className={`h-6 w-6 ${gpsEnabled ? 'text-purple-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">GPS Tracker</p>
              <p className="text-sm text-gray-600">Position tracking</p>
            </div>
            <div className="ml-auto">
              {gpsEnabled ? (
                <CheckCircle className="h-5 w-5 text-purple-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
              )}
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
            autoScan ? 'border-orange-500 bg-orange-50' : 'border-gray-300 bg-gray-50'
          }`}
          onClick={handleAutoScanToggle}
        >
          <div className="flex items-center space-x-3">
            <Zap className={`h-6 w-6 ${autoScan ? 'text-orange-600' : 'text-gray-400'}`} />
            <div>
              <p className="font-medium text-gray-900">Auto Scan</p>
              <p className="text-sm text-gray-600">Continuous monitoring</p>
            </div>
            <div className="ml-auto">
              {autoScan ? (
                <CheckCircle className="h-5 w-5 text-orange-600" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Manual Controls */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Manual Controls</h4>
        
        <div className="flex space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startScan}
            disabled={isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="h-4 w-4" />
            <span>Start Scan</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={stopScan}
            disabled={!isScanning}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Square className="h-4 w-4" />
            <span>Stop Scan</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </motion.button>
        </div>

        {/* Scan Progress */}
        {isScanning && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Scanning in progress...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-green-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${scanProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Status Indicators */}
      <div className="border-t pt-6 mt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">System Status</h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Camera: Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Laser: Ready</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">GPS: Locked</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600">Auto Scan: On</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HardwareControl
