import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar,
  Filter,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

interface Report {
  id: string
  title: string
  type: 'defect' | 'maintenance' | 'inspection' | 'summary'
  status: 'completed' | 'pending' | 'in_progress'
  date: string
  location: string
  severity?: number
  description: string
}

const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setReports([
        {
          id: '1',
          title: 'Track Inspection Report - Section A',
          type: 'inspection',
          status: 'completed',
          date: '2024-01-15',
          location: 'Chainage 1200-1250 km',
          description: 'Comprehensive track inspection completed with no critical issues found.'
        },
        {
          id: '2',
          title: 'Gauge Anomaly Detection',
          type: 'defect',
          status: 'completed',
          date: '2024-01-14',
          location: 'Chainage 1180 km',
          severity: 2,
          description: 'Minor gauge anomaly detected and documented for maintenance scheduling.'
        },
        {
          id: '3',
          title: 'Monthly Maintenance Summary',
          type: 'summary',
          status: 'completed',
          date: '2024-01-10',
          location: 'Entire Network',
          description: 'Monthly summary of all maintenance activities and system performance.'
        },
        {
          id: '4',
          title: 'Rail Wear Analysis',
          type: 'defect',
          status: 'in_progress',
          date: '2024-01-16',
          location: 'Chainage 1300 km',
          severity: 3,
          description: 'Rail wear analysis in progress, preliminary results show moderate wear.'
        },
        {
          id: '5',
          title: 'Emergency Maintenance Report',
          type: 'maintenance',
          status: 'pending',
          date: '2024-01-17',
          location: 'Chainage 1150 km',
          description: 'Emergency maintenance required due to critical track condition.'
        }
      ])
      setLoading(false)
    }

    loadReports()
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'all' || report.type === filterType
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-600" />
      case 'pending':
        return <AlertTriangle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'pending':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'defect':
        return 'bg-red-100 text-red-800'
      case 'maintenance':
        return 'bg-blue-100 text-blue-800'
      case 'inspection':
        return 'bg-green-100 text-green-800'
      case 'summary':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

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
            Reports & Documentation
          </h1>
          <p className="text-gray-600">
            View and manage all system reports, inspections, and maintenance records
          </p>
        </motion.div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="defect">Defects</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspections</option>
              <option value="summary">Summaries</option>
            </select>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
            </select>

            {/* Export Button */}
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center">
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report, index) => (
            <motion.div
              key={report.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(report.type)}`}>
                      {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.replace('_', ' ').charAt(0).toUpperCase() + report.status.replace('_', ' ').slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-3">
                    {report.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {report.location}
                    </div>
                    {report.severity && (
                      <div className="flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-1" />
                        Severity: {report.severity}/4
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 mt-4 lg:mt-0">
                  {getStatusIcon(report.status)}
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    View
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredReports.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage