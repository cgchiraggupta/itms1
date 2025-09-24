import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const AnalyticsPage: React.FC = () => {
  const [selectedMetric, setSelectedMetric] = useState('vibration')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [analyticsData, setAnalyticsData] = useState({
    vibration: [],
    geometry: [],
    defects: [],
    trends: []
  })

  // Mock data for analytics
  useEffect(() => {
    const generateMockData = () => {
      const vibrationData = []
      const geometryData = []
      const defectsData = []
      
      for (let i = 0; i < 24; i++) {
        vibrationData.push({
          hour: `${i}:00`,
          value: Math.random() * 2,
          threshold: 1.5
        })
        
        geometryData.push({
          chainage: i * 100,
          gauge: 1.676 + (Math.random() - 0.5) * 0.02,
          alignment: (Math.random() - 0.5) * 4,
          level: (Math.random() - 0.5) * 2
        })
        
        defectsData.push({
          chainage: i * 100,
          defects: Math.floor(Math.random() * 5),
          severity: Math.floor(Math.random() * 4) + 1
        })
      }
      
      setAnalyticsData({
        vibration: vibrationData,
        geometry: geometryData,
        defects: defectsData,
        trends: [
          { name: 'Track Vibration', change: 12, trend: 'up' },
          { name: 'Track Quality', change: -3, trend: 'down' },
          { name: 'Defect Count', change: 8, trend: 'up' },
          { name: 'Maintenance Efficiency', change: 15, trend: 'up' }
        ]
      })
    }
    
    generateMockData()
  }, [selectedDate])

  const defectTypes = [
    { name: 'Gauge Excess', value: 25, color: '#ef4444' },
    { name: 'Alignment Fault', value: 20, color: '#f59e0b' },
    { name: 'Rail Wear', value: 30, color: '#3b82f6' },
    { name: 'Joint Defect', value: 15, color: '#10b981' },
    { name: 'Other', value: 10, color: '#6b7280' }
  ]

  const severityDistribution = [
    { name: 'Low', value: 40, color: '#10b981' },
    { name: 'Medium', value: 35, color: '#f59e0b' },
    { name: 'High', value: 20, color: '#ef4444' },
    { name: 'Critical', value: 5, color: '#7c2d12' }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track condition analysis and trend monitoring</p>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric Type
              </label>
              <select
                value={selectedMetric}
                onChange={(e) => setSelectedMetric(e.target.value)}
                className="form-input"
              >
                <option value="vibration">Vibration Analysis</option>
                <option value="geometry">Track Geometry</option>
                <option value="wear">Wear Analysis</option>
                <option value="defects">Defect Detection</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Trends Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {analyticsData.trends.map((trend, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{trend.name}</p>
                  <p className={`text-2xl font-bold ${
                    trend.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {trend.change > 0 ? '+' : ''}{trend.change}%
                  </p>
                </div>
                <div className={`p-3 rounded-full ${
                  trend.trend === 'up' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {trend.trend === 'up' ? (
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  ) : (
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Main Analytics Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mb-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedMetric === 'vibration' && 'Vibration Analysis'}
            {selectedMetric === 'geometry' && 'Track Geometry'}
            {selectedMetric === 'wear' && 'Wear Analysis'}
            {selectedMetric === 'defects' && 'Defect Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            {selectedMetric === 'vibration' && (
              <LineChart data={analyticsData.vibration}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            )}
            {selectedMetric === 'geometry' && (
              <LineChart data={analyticsData.geometry}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chainage" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="gauge" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="alignment" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="level" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            )}
            {selectedMetric === 'defects' && (
              <BarChart data={analyticsData.defects}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="chainage" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="defects" fill="#ef4444" />
              </BarChart>
            )}
          </ResponsiveContainer>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Defect Types Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Defect Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={defectTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {defectTypes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Severity Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Defect Severity</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={severityDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {severityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Key Insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">High Vibration Alert</h4>
                <p className="text-sm text-gray-600">Detected at chainage 1250m with 2.3g acceleration</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Track Quality Good</h4>
                <p className="text-sm text-gray-600">95% of measurements within acceptable limits</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Clock className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-900">Maintenance Due</h4>
                <p className="text-sm text-gray-600">Scheduled maintenance in 2 days at chainage 2000m</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage
