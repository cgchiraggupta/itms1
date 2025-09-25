import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  Gauge,
  Navigation,
  Zap
} from 'lucide-react'
import EnhancedGPSMap from '../components/EnhancedGPSMap'
import LoadingSpinner from '../components/LoadingSpinner'

interface DashboardData {
  gpsData: {
    latitude: number
    longitude: number
    altitude: number
    accuracy: number
    speed: number
    heading: number
    timestamp: string
    chainage: number
  }
  defects: Array<{
    location: number
    defect_type: string
    severity: number
    gps_lat: number
    gps_lng: number
  }>
  metrics: {
    totalTrack: number
    defectsDetected: number
    accuracyRate: number
    responseTime: number
  }
}

const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData({
        gpsData: {
          latitude: 28.6139,
          longitude: 77.209,
          altitude: 216,
          accuracy: 3,
          speed: 45.5,
          heading: 120,
          timestamp: new Date().toISOString(),
          chainage: 1250.5
        },
        defects: [
          {
            location: 1200,
            defect_type: "gauge_anomaly",
            severity: 2,
            gps_lat: 28.614,
            gps_lng: 77.2091
          },
          {
            location: 1300,
            defect_type: "rail_wear",
            severity: 3,
            gps_lat: 28.6142,
            gps_lng: 77.2093
          }
        ],
        metrics: {
          totalTrack: 2500,
          defectsDetected: 15,
          accuracyRate: 99.8,
          responseTime: 95
        }
      })
      setLoading(false)
    }

    loadData()
  }, [])

  if (!loading && data) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Background blur effects */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-blue-300 opacity-10 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 rounded-full bg-green-300 opacity-10 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        
        <div className="container mx-auto px-4 py-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Train Monitoring Dashboard</h1>
            <div className="mt-2 md:mt-0 flex items-center">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                Live Monitoring
              </motion.div>
              <div className="ml-3 text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Gauge className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Current Speed</p>
                  <p className="text-xl font-bold">{data.gpsData.speed} km/h</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <Navigation className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Chainage</p>
                  <p className="text-xl font-bold">{data.gpsData.chainage} km</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Defects</p>
                  <p className="text-xl font-bold">{data.defects.length}</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-4"
            >
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Zap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-xl font-bold">{data.metrics.responseTime} ms</p>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* GPS and Status Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* GPS Map */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 bg-white rounded-xl shadow-sm overflow-hidden backdrop-blur-sm bg-white/90"
            >
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Live GPS Tracking
                  </motion.span>
                </h2>
              </div>
              <div className="p-4">
                <motion.div 
                  whileHover={{ boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.1)" }}
                  style={{ height: '400px', width: '100%' }} 
                  className="rounded-lg overflow-hidden"
                >
                  <EnhancedGPSMap 
                    gpsData={data.gpsData}
                    defects={data.defects}
                  />
                </motion.div>
              </div>
            </motion.div>
            
            {/* Status Cards */}
            <div className="lg:col-span-1">
              <div className="grid grid-cols-1 gap-4">
                {/* GPS Data */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Current GPS Data</h2>
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Latitude:</span>
                        <span className="font-medium">{data.gpsData.latitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Longitude:</span>
                        <span className="font-medium">{data.gpsData.longitude.toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Altitude:</span>
                        <span className="font-medium">{data.gpsData.altitude} m</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Speed:</span>
                        <span className="font-medium">{data.gpsData.speed} km/h</span>
                      </div>
                      <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="text-gray-600">Heading:</span>
                        <span className="font-medium">{data.gpsData.heading}°</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-gray-600">Chainage:</span>
                        <span className="font-medium">{data.gpsData.chainage} km</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* System Status */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">System Status</h2>
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center py-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-gray-600">GPS Signal</span>
                        <span className="ml-auto font-medium text-green-500">Strong</span>
                      </div>
                      <div className="flex items-center py-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-gray-600">Data Connection</span>
                        <span className="ml-auto font-medium text-green-500">Online</span>
                      </div>
                      <div className="flex items-center py-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                        <span className="text-gray-600">Battery</span>
                        <span className="ml-auto font-medium text-yellow-500">75%</span>
                      </div>
                      <div className="flex items-center py-1">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                        <span className="text-gray-600">Sensors</span>
                        <span className="ml-auto font-medium text-green-500">All Active</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return null

  const metricCards = [
    {
      title: "Track Monitored",
      value: `${data.metrics.totalTrack} km`,
      icon: MapPin,
      color: "blue",
      change: "+2.5%"
    },
    {
      title: "Defects Detected",
      value: data.metrics.defectsDetected.toString(),
      icon: AlertTriangle,
      color: "red",
      change: "+3"
    },
    {
      title: "Accuracy Rate",
      value: `${data.metrics.accuracyRate}%`,
      icon: Gauge,
      color: "green",
      change: "+0.2%"
    },
    {
      title: "Response Time",
      value: `${data.metrics.responseTime}ms`,
      icon: Zap,
      color: "yellow",
      change: "-5ms"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Track Monitoring Dashboard
          </h1>
          <p className="text-gray-600">
            Real-time monitoring of railway track conditions and GPS tracking
          </p>
        </motion.div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricCards.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      {metric.change}
                    </p>
                  </div>
                  <div className={`w-12 h-12 bg-${metric.color}-100 rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${metric.color}-600`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-green-600" />
            Current Status
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {data.gpsData.speed} km/h
              </div>
              <div className="text-sm text-gray-600">Current Speed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {data.gpsData.chainage} km
              </div>
              <div className="text-sm text-gray-600">Chainage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ±{data.gpsData.accuracy}m
              </div>
              <div className="text-sm text-gray-600">GPS Accuracy</div>
            </div>
          </div>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-blue-600" />
              Real-time GPS Tracking
            </h2>
          </div>
          <div className="h-[600px]">
            <EnhancedGPSMap
              gpsData={data.gpsData}
              defects={data.defects}
            />
          </div>
        </motion.div>

        {/* Recent Defects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mt-8"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
            Recent Defects
          </h2>
          <div className="space-y-4">
            {data.defects.map((defect, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${
                    defect.severity === 1 ? 'bg-green-500' :
                    defect.severity === 2 ? 'bg-yellow-500' :
                    defect.severity === 3 ? 'bg-orange-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">
                      {defect.defect_type.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="text-sm text-gray-600">
                      Location: {defect.location} km
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    Severity {defect.severity}/4
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default DashboardPage