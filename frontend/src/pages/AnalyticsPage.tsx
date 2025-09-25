import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Activity,
  AlertTriangle,
  Clock,
  MapPin
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import LoadingSpinner from '../components/LoadingSpinner'

interface AnalyticsData {
  trackHealth: Array<{
    date: string
    health: number
    defects: number
  }>
  defectTypes: Array<{
    name: string
    value: number
    color: string
  }>
  performance: Array<{
    metric: string
    value: number
    change: number
    trend: 'up' | 'down'
  }>
}

const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('7d')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setData({
        trackHealth: [
          { date: '2024-01-01', health: 95, defects: 2 },
          { date: '2024-01-02', health: 93, defects: 3 },
          { date: '2024-01-03', health: 97, defects: 1 },
          { date: '2024-01-04', health: 94, defects: 4 },
          { date: '2024-01-05', health: 96, defects: 2 },
          { date: '2024-01-06', health: 98, defects: 1 },
          { date: '2024-01-07', health: 95, defects: 3 }
        ],
        defectTypes: [
          { name: 'Gauge Anomaly', value: 35, color: '#ef4444' },
          { name: 'Rail Wear', value: 25, color: '#f59e0b' },
          { name: 'Track Geometry', value: 20, color: '#3b82f6' },
          { name: 'Surface Defects', value: 15, color: '#10b981' },
          { name: 'Other', value: 5, color: '#6b7280' }
        ],
        performance: [
          { metric: 'Detection Accuracy', value: 99.8, change: 0.2, trend: 'up' },
          { metric: 'Response Time', value: 95, change: -5, trend: 'down' },
          { metric: 'System Uptime', value: 99.9, change: 0.1, trend: 'up' },
          { metric: 'False Positives', value: 2.1, change: -0.3, trend: 'down' }
        ]
      })
      setLoading(false)
    }

    loadData()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600">
                Track performance metrics and system analytics
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {data.performance.map((metric, index) => (
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
                    {metric.metric}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.metric.includes('Time') ? 'ms' : '%'}
                  </p>
                  <div className="flex items-center mt-1">
                    {metric.trend === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}
                      {metric.metric.includes('Time') ? 'ms' : '%'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Track Health Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600" />
              Track Health Trend
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trackHealth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="health" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Health %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Defect Types Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Defect Types Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.defectTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.defectTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Defects Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-600" />
            Defects Detected Over Time
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trackHealth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="defects" fill="#ef4444" name="Defects" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">2,500+ km</div>
            <div className="text-sm text-gray-600">Track Monitored</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">15,000+</div>
            <div className="text-sm text-gray-600">Defects Detected</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
            <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">99.8%</div>
            <div className="text-sm text-gray-600">System Accuracy</div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default AnalyticsPage