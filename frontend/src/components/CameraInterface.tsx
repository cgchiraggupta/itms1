import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Camera, 
  Play, 
  Pause, 
  Square,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
  Maximize2,
  RotateCcw
} from 'lucide-react'

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

interface CameraInterfaceProps {
  frames: CameraFrame[]
  isRecording: boolean
  onStartRecording: () => void
  onStopRecording: () => void
  onCaptureFrame: () => void
}

const CameraInterface: React.FC<CameraInterfaceProps> = ({
  frames,
  isRecording,
  onStartRecording,
  onStopRecording,
  onCaptureFrame
}) => {
  const [selectedFrame, setSelectedFrame] = useState<CameraFrame | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [autoCapture, setAutoCapture] = useState(true)
  const [captureInterval, setCaptureInterval] = useState(5) // seconds
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Auto capture effect
  useEffect(() => {
    if (autoCapture && isRecording) {
      const interval = setInterval(() => {
        onCaptureFrame()
      }, captureInterval * 1000)
      
      return () => clearInterval(interval)
    }
  }, [autoCapture, isRecording, captureInterval, onCaptureFrame])

  const getDefectColor = (severity: number) => {
    switch (severity) {
      case 1: return 'rgba(34, 197, 94, 0.7)' // green
      case 2: return 'rgba(234, 179, 8, 0.7)' // yellow
      case 3: return 'rgba(249, 115, 22, 0.7)' // orange
      case 4: return 'rgba(239, 68, 68, 0.7)' // red
      case 5: return 'rgba(127, 29, 29, 0.7)' // dark red
      default: return 'rgba(107, 114, 128, 0.7)' // gray
    }
  }

  const getDefectIcon = (defectType: string) => {
    switch (defectType) {
      case 'rail_wear': return '🔧'
      case 'joint_defect': return '🔗'
      case 'surface_crack': return '💥'
      case 'ballast_issue': return '🪨'
      case 'gauge_anomaly': return '📏'
      default: return '⚠️'
    }
  }

  const drawDefectsOnCanvas = (frame: CameraFrame) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw defects
    frame.defects.forEach(defect => {
      const [x1, y1, x2, y2] = defect.bbox
      
      // Draw bounding box
      ctx.strokeStyle = getDefectColor(defect.severity)
      ctx.lineWidth = 2
      ctx.strokeRect(x1, y1, x2 - x1, y2 - y1)
      
      // Draw label background
      const label = `${defect.type.replace('_', ' ')} (${defect.severity})`
      const textMetrics = ctx.measureText(label)
      const labelWidth = textMetrics.width + 8
      const labelHeight = 20
      
      ctx.fillStyle = getDefectColor(defect.severity)
      ctx.fillRect(x1, y1 - labelHeight, labelWidth, labelHeight)
      
      // Draw label text
      ctx.fillStyle = 'white'
      ctx.font = '12px Arial'
      ctx.fillText(label, x1 + 4, y1 - 6)
      
      // Draw confidence
      ctx.fillStyle = 'white'
      ctx.font = '10px Arial'
      ctx.fillText(`${(defect.confidence * 100).toFixed(0)}%`, x1 + 4, y1 - 2)
    })
  }

  const downloadFrame = (frame: CameraFrame) => {
    const link = document.createElement('a')
    link.href = frame.imageUrl
    link.download = `frame_${frame.chainage.toFixed(1)}m_${frame.timestamp}.jpg`
    link.click()
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Camera Interface</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-sm text-gray-600">
            {isRecording ? 'Recording' : 'Stopped'}
          </span>
        </div>
      </div>

      {/* Camera Controls */}
      <div className="flex items-center space-x-4 mb-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? onStopRecording : onStartRecording}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white ${
            isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          {isRecording ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span>{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCaptureFrame}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Camera className="h-4 w-4" />
          <span>Capture Frame</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          <Maximize2 className="h-4 w-4" />
          <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
        </motion.button>
      </div>

      {/* Auto Capture Settings */}
      <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={autoCapture}
            onChange={(e) => setAutoCapture(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm text-gray-700">Auto Capture</span>
        </label>
        
        <label className="flex items-center space-x-2">
          <span className="text-sm text-gray-700">Interval:</span>
          <select
            value={captureInterval}
            onChange={(e) => setCaptureInterval(Number(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={1}>1 second</option>
            <option value={5}>5 seconds</option>
            <option value={10}>10 seconds</option>
            <option value={30}>30 seconds</option>
          </select>
        </label>
      </div>

      {/* Main Camera View */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'relative h-96'} rounded-lg overflow-hidden mb-6`}>
        {selectedFrame ? (
          <div className="relative w-full h-full">
            <img
              src={selectedFrame.imageUrl}
              alt="Camera Frame"
              className="w-full h-full object-cover"
            />
            
            {/* Defect Overlays */}
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              width={1920}
              height={1080}
            />
            
            {/* Frame Info */}
            <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white p-3 rounded-lg">
              <div className="text-sm">
                <div>Chainage: {selectedFrame.chainage.toFixed(1)}m</div>
                <div>Time: {formatTimestamp(selectedFrame.timestamp)}</div>
                <div>Defects: {selectedFrame.defects.length}</div>
                <div>GPS: {selectedFrame.gps_lat.toFixed(6)}, {selectedFrame.gps_lng.toFixed(6)}</div>
              </div>
            </div>

            {/* Defect Icons */}
            {selectedFrame.defects.map((defect, index) => {
              const [x1, y1] = defect.bbox
              return (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute text-2xl"
                  style={{ left: x1, top: y1 - 30 }}
                >
                  {getDefectIcon(defect.type)}
                </motion.div>
              )
            })}

            {/* Action Buttons */}
            <div className="absolute bottom-4 right-4 flex space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => downloadFrame(selectedFrame)}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Download className="h-4 w-4" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => drawDefectsOnCanvas(selectedFrame)}
                className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Eye className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No frame selected</p>
              <p className="text-sm text-gray-500">Start recording to capture frames</p>
            </div>
          </div>
        )}
      </div>

      {/* Frame Gallery */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Captured Frames</h4>
        
        {frames.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {frames.slice(-8).map((frame) => (
              <motion.div
                key={frame.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedFrame(frame)}
                className={`relative cursor-pointer rounded-lg overflow-hidden border-2 ${
                  selectedFrame?.id === frame.id ? 'border-blue-500' : 'border-gray-200'
                }`}
              >
                <img
                  src={frame.imageUrl}
                  alt="Frame"
                  className="w-full h-24 object-cover"
                />
                
                {/* Defect Indicators */}
                {frame.defects.length > 0 && (
                  <div className="absolute top-1 right-1 flex space-x-1">
                    {frame.defects.map((defect, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          defect.severity > 3 ? 'bg-red-500' : 'bg-yellow-500'
                        }`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Frame Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-2">
                  <div className="text-xs">
                    <div>{frame.chainage.toFixed(1)}m</div>
                    <div>{formatTimestamp(frame.timestamp)}</div>
                    <div>{frame.defects.length} defects</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No frames captured yet</p>
            <p className="text-sm text-gray-500">Start recording to begin capturing frames</p>
          </div>
        )}
      </div>

      {/* Defect Summary */}
      {selectedFrame && selectedFrame.defects.length > 0 && (
        <div className="border-t pt-6 mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Defect Analysis</h4>
          
          <div className="space-y-3">
            {selectedFrame.defects.map((defect, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="text-2xl">{getDefectIcon(defect.type)}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {defect.type.replace('_', ' ').toUpperCase()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Confidence: {(defect.confidence * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    defect.severity > 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    Severity {defect.severity}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default CameraInterface
