import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  FileCsv,
  FileCode,
  Database,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react'

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('daily')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [includeData, setIncludeData] = useState({
    sensorData: true,
    images: true,
    analytics: false,
    alerts: false
  })
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      // Here you would typically trigger the actual report generation
    }, 2000)
  }

  const handleExport = (format: string) => {
    // Simulate export functionality
    console.log(`Exporting data in ${format} format`)
  }

  const recentReports = [
    {
      id: 1,
      name: 'Daily Summary - 2024-01-15',
      type: 'Daily Summary',
      generated: '2024-01-15 18:30:00',
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: 2,
      name: 'Weekly Analysis - Week 3',
      type: 'Weekly Analysis',
      generated: '2024-01-14 16:45:00',
      size: '15.7 MB',
      status: 'completed'
    },
    {
      id: 3,
      name: 'Monthly Report - January 2024',
      type: 'Monthly Report',
      generated: '2024-01-13 14:20:00',
      size: '89.2 MB',
      status: 'completed'
    },
    {
      id: 4,
      name: 'Custom Report - Defect Analysis',
      type: 'Custom Report',
      generated: '2024-01-12 11:15:00',
      size: '5.1 MB',
      status: 'completed'
    }
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
          <p className="text-gray-600">Generate and export track monitoring reports</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Report Generation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
            <form onSubmit={handleGenerateReport} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="form-input"
                >
                  <option value="daily">Daily Summary</option>
                  <option value="weekly">Weekly Analysis</option>
                  <option value="monthly">Monthly Report</option>
                  <option value="custom">Custom Period</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="form-input"
                      placeholder="Start Date"
                    />
                  </div>
                  <div>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="form-input"
                      placeholder="End Date"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include Data
                </label>
                <div className="space-y-2">
                  {Object.entries(includeData).map(([key, value]) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setIncludeData(prev => ({
                          ...prev,
                          [key]: e.target.checked
                        }))}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="btn btn-primary w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </button>
            </form>
          </motion.div>

          {/* Data Export */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => handleExport('csv')}
                  className="btn btn-secondary justify-start"
                >
                  <FileCsv className="h-4 w-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="btn btn-secondary justify-start"
                >
                  <FileCode className="h-4 w-4 mr-2" />
                  Export JSON
                </button>
                <button
                  onClick={() => handleExport('hdf5')}
                  className="btn btn-secondary justify-start"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Export HDF5
                </button>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Export Options</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Include metadata</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" defaultChecked />
                    <span className="ml-2 text-sm text-gray-700">Compress files</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                    <span className="ml-2 text-sm text-gray-700">Include images</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Reports */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6 mt-8"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reports</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{report.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge badge-primary">{report.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.generated}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.size}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Completed</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Report Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">22</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">2</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ReportsPage
