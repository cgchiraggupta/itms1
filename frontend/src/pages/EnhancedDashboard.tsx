import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import HardwareControl from '../components/HardwareControl'
import EnhancedGPSMap from '../components/EnhancedGPSMap'
import CameraInterface from '../components/CameraInterface'
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  MapPin,
  Camera,
  Target,
  Zap,
  Gauge,
  Database
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface SensorData {
  chainage: number
  timestamp: string
  type: string
  value: number
  sensor_id: string
  latitude?: number
  longitude?: number
  speed?: number
  heading?: number
}

interface DefectData {
  location: number
  defect_type: string
  severity: number
  reviewed: boolean
  gps_lat: number
  gps_lng: number
  timestamp: string
}

interface CameraFrame {
  id: string
  timestamp: string
  chainage: number
  imageUrl: string
  defects: Array<{
    type: string
    severity: number
    confidence: number
    bbox: [number, number, number, number]
  }>
  gps_lat: number
  gps_lng: number
}

const EnhancedDashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>([])
  const [defects, setDefects] = useState<DefectData[]>([])
  const [cameraFrames, setCameraFrames] = useState<CameraFrame[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [systemStatus, setSystemStatus] = useState({
    camera: true,
    laser: true,
    gps: true,
    autoScan: true
  })
  const [chartData, setChartData] = useState<any[]>([])

  // WebSocket connection for real-time data
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws/realtime')
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'sensor_data') {
        setSensorData(prev => [...prev.slice(-99), ...data.data])
        
        // Update chart data
        data.data.forEach((measurement: SensorData) => {
          if (measurement.type === 'acceleration' || measurement.type === 'gauge') {
            setChartData(prev => {
              const newData = [...prev]
              if (newData.length > 50) newData.shift()
              newData.push({
                time: new Date(measurement.timestamp).toLocaleTimeString(),
                chainage: measurement.chainage,
                value: measurement.value,
                type: measurement.type
              })
              return newData
            })
          }
        })
      } else if (data.type === 'defect_detected') {
        setDefects(prev => [...prev, data.defect])
      } else if (data.type === 'camera_frame') {
        setCameraFrames(prev => [...prev, data.frame])
      }
    }

    return () => ws.close()
  }, [])

  // Get latest sensor data
  const latestGPS = sensorData.find(d => d.type === 'gps_position')
  const latestPosition = sensorData.find(d => d.type === 'position')
  const latestAcceleration = sensorData.find(d => d.type === 'acceleration')
  const latestGauge = sensorData.find(d => d.type === 'gauge')

  const handleCameraToggle = (enabled: boolean) => {
    setSystemStatus(prev => ({ ...prev, camera: enabled }))
  }

  const handleLaserToggle = (enabled: boolean) => {
    setSystemStatus(prev => ({ ...prev, laser: enabled }))
  }

  const handleGPSToggle = (enabled: boolean) => {
    setSystemStatus(prev => ({ ...prev, gps: enabled }))
  }

  const handleAutoScanToggle = (enabled: boolean) => {
    setSystemStatus(prev => ({ ...prev, autoScan: enabled }))
  }

  const startRecording = () => {
    setIsRecording(true)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const captureFrame = () => {
    const newFrame: CameraFrame = {
      id: `frame_${Date.now()}`,
      timestamp: new Date().toISOString(),
      chainage: latestPosition?.chainage || 0,
      imageUrl: `https://picsum.photos/1920/1080?random=${Date.now()}`,
      defects: [],
      gps_lat: latestGPS?.latitude || 28.6139,
      gps_lng: latestGPS?.longitude || 77.2090
    }
    setCameraFrames(prev => [...prev, newFrame])
  }

  const sensors = [
    {
      icon: Gauge,
      name: 'Axle Encoder',
      status: 'online',
      value: `${latestPosition?.chainage?.toFixed(1) || '0.0'} m`,
      color: 'blue'
    },
    {
      icon: Zap,
      name: 'IMU',
      status: 'online',
      value: `${latestAcceleration?.value?.toFixed(2) || '0.00'} g`,
      color: 'purple'
    },
    {
      icon: Camera,
      name: 'Camera',
      status: 'online',
      value: `${cameraFrames.length} frames`,
      color: 'cyan'
    },
    {
      icon: Target,
      name: 'Laser Scanner',
      status: 'online',
      value: `${latestGauge?.value?.toFixed(3) || '1.676'} m`,
      color: 'green'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">ITMS Enhanced Dashboard</h1>
            <p className="text-gray-600">Complete hardware simulation and control interface</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-600">System Online</span>
            </div>
            <div className="text-sm text-gray-600">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-3">
              <Activity className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Current Speed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestGPS?.speed?.toFixed(1) || '0.0'} km/h
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-3">
              <MapPin className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Chainage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestPosition?.chainage?.toFixed(1) || '0.0'} m
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Defects Detected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {defects.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-lg shadow p-6"
          >
            <div className="flex items-center space-x-3">
              <Camera className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Frames Captured</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cameraFrames.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Hardware Control */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <HardwareControl
              onCameraToggle={handleCameraToggle}
              onLaserToggle={handleLaserToggle}
              onGPSToggle={handleGPSToggle}
              onAutoScanToggle={handleAutoScanToggle}
            />
          </motion.div>

          {/* GPS Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <EnhancedGPSMap
              gpsData={latestGPS ? {
                latitude: latestGPS.latitude!,
                longitude: latestGPS.longitude!,
                altitude: 216.0,
                accuracy: 3.0,
                speed: latestGPS.speed || 0,
                heading: latestGPS.heading || 0,
                timestamp: latestGPS.timestamp,
                chainage: latestGPS.chainage
              } : null}
              defects={defects}
            />
          </motion.div>
        </div>

        {/* Real-time Data Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-lg shadow p-6 mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Real-time Sensor Data</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Camera Interface */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <CameraInterface
            frames={cameraFrames}
            isRecording={isRecording}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onCaptureFrame={captureFrame}
          />
        </motion.div>

        {/* Sensor Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-8"
        >
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Sensor Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {sensors.map((sensor, index) => {
                const Icon = sensor.icon
                return (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg bg-${sensor.color}-100`}>
                      <Icon className={`h-5 w-5 text-${sensor.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{sensor.name}</p>
                      <p className="text-xs text-gray-500">{sensor.value}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600">Online</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Recent Defects */}
        {defects.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mt-8"
          >
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Recent Defects</h3>
              
              <div className="space-y-3">
                {defects.slice(-5).map((defect, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      defect.severity > 3 ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {defect.defect_type.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-600">
                        Chainage: {defect.location.toFixed(1)}m
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">
                        {new Date(defect.timestamp).toLocaleTimeString()}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        defect.severity > 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        Severity {defect.severity}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default EnhancedDashboard
