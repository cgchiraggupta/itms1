import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Gauge, 
  Camera, 
  Zap, 
  MapPin, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Database
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

const DashboardPage: React.FC = () => {
  const [systemData, setSystemData] = useState({
    trainSpeed: 0,
    distanceTraveled: 0,
    sessionTime: '00:00:00',
    dataRate: 0,
    encoderPosition: 0,
    imuAcceleration: 0,
    cameraFrames: 0,
    laserDistance: 0
  })

  const [chartData, setChartData] = useState([])
  const [alerts, setAlerts] = useState([
    { id: 1, type: 'info', message: 'System initialized successfully', time: '2 minutes ago' },
    { id: 2, type: 'warning', message: 'High vibration detected at chainage 1250m', time: '5 minutes ago' }
  ])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemData(prev => ({
        trainSpeed: Math.random() * 200,
        distanceTraveled: prev.distanceTraveled + 0.1,
        sessionTime: new Date().toLocaleTimeString(),
        dataRate: Math.random() * 50,
        encoderPosition: prev.encoderPosition + Math.floor(Math.random() * 10),
        imuAcceleration: Math.random() * 2,
        cameraFrames: prev.cameraFrames + 1,
        laserDistance: 100 + Math.random() * 50
      }))

      // Update chart data
      setChartData(prev => {
        const newData = [...prev]
        if (newData.length > 20) newData.shift()
        newData.push({
          time: new Date().toLocaleTimeString(),
          vibration: Math.random() * 2,
          gauge: 1.676 + Math.random() * 0.02,
          acceleration: Math.random() * 1
        })
        return newData
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const sensors = [
    {
      icon: Gauge,
      name: 'Axle Encoder',
      status: 'online',
      value: `${systemData.encoderPosition} pulses`,
      color: 'blue'
    },
    {
      icon: Zap,
      name: 'IMU',
      status: 'online',
      value: `${systemData.imuAcceleration.toFixed(1)} g`,
      color: 'purple'
    },
    {
      icon: Camera,
      name: 'Camera',
      status: 'online',
      value: `${systemData.cameraFrames} frames`,
      color: 'cyan'
    },
    {
      icon: Activity,
      name: 'Laser Profilometer',
      status: 'online',
      value: `${systemData.laserDistance.toFixed(1)} mm`,
      color: 'green'
    }
  ]

  const healthMetrics = [
    { label: 'CPU Usage', value: 45, color: 'green' },
    { label: 'Memory Usage', value: 62, color: 'yellow' },
    { label: 'Storage', value: 23, color: 'green' },
    { label: 'Network', value: 78, color: 'red' }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ITMS Dashboard</h1>
          <p className="text-gray-600">Real-time track monitoring and system status</p>
        </motion.div>

        {/* System Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Train Speed</p>
                <p className="text-2xl font-bold text-gray-900">{systemData.trainSpeed.toFixed(1)} km/h</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Distance Traveled</p>
                <p className="text-2xl font-bold text-gray-900">{systemData.distanceTraveled.toFixed(1)} km</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <MapPin className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Session Time</p>
                <p className="text-2xl font-bold text-gray-900">{systemData.sessionTime}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Rate</p>
                <p className="text-2xl font-bold text-gray-900">{systemData.dataRate.toFixed(1)} MB/s</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Database className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sensor Status */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensor Status</h3>
            <div className="space-y-4">
              {sensors.map((sensor, index) => {
                const Icon = sensor.icon
                return (
                  <div key={index} className="flex items-center space-x-3">
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
          </motion.div>

          {/* Real-time Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Data</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="vibration" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="gauge" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="acceleration" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alerts */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {alerts.length}
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                    alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-4">
              {healthMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{metric.label}</span>
                    <span className="font-medium">{metric.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        metric.value < 50 ? 'bg-green-500' : 
                        metric.value < 80 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
