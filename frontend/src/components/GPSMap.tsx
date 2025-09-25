import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Navigation, 
  Target, 
  AlertTriangle,
  Clock,
  Speedometer,
  Compass
} from 'lucide-react'

interface GPSData {
  latitude: number
  longitude: number
  altitude: number
  accuracy: number
  speed: number
  heading: number
  timestamp: string
  chainage: number
}

interface GPSMapProps {
  gpsData: GPSData | null
  defects: Array<{
    location: number
    defect_type: string
    severity: number
    gps_lat: number
    gps_lng: number
  }>
}

const GPSMap: React.FC<GPSMapProps> = ({ gpsData, defects }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]) // Delhi coordinates
  const [zoom, setZoom] = useState(15)
  const [trackHistory, setTrackHistory] = useState<Array<[number, number]>>([])

  // Update map center when GPS data changes
  useEffect(() => {
    if (gpsData) {
      setMapCenter([gpsData.latitude, gpsData.longitude])
      
      // Add to track history
      setTrackHistory(prev => {
        const newHistory = [...prev, [gpsData.latitude, gpsData.longitude]]
        // Keep only last 100 points
        return newHistory.slice(-100)
      })
    }
  }, [gpsData])

  // Generate map tiles (simplified - in real app you'd use Leaflet or Google Maps)
  const generateMapTile = (lat: number, lng: number, zoom: number) => {
    // This is a simplified representation
    return `https://tile.openstreetmap.org/${zoom}/${Math.floor((lng + 180) / 360 * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`
  }

  const getDefectColor = (severity: number) => {
    switch (severity) {
      case 1: return 'bg-green-500'
      case 2: return 'bg-yellow-500'
      case 3: return 'bg-orange-500'
      case 4: return 'bg-red-500'
      case 5: return 'bg-red-700'
      default: return 'bg-gray-500'
    }
  }

  const getDefectIcon = (defectType: string) => {
    switch (defectType) {
      case 'gauge_anomaly': return '📏'
      case 'rail_wear': return '🔧'
      case 'joint_defect': return '🔗'
      case 'surface_crack': return '💥'
      case 'alignment_fault': return '📐'
      default: return '⚠️'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900">GPS Tracking & Mapping</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>Real-time Position</span>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden mb-4">
        <div 
          ref={mapRef}
          className="w-full h-full relative"
          style={{
            backgroundImage: `url(${generateMapTile(mapCenter[0], mapCenter[1], zoom)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {/* Track History */}
          <svg className="absolute inset-0 w-full h-full">
            {trackHistory.map((point, index) => {
              if (index === 0) return null
              const prevPoint = trackHistory[index - 1]
              const x1 = ((prevPoint[1] - mapCenter[1]) * 1000000) + 200
              const y1 = ((prevPoint[0] - mapCenter[0]) * 1000000) + 200
              const x2 = ((point[1] - mapCenter[1]) * 1000000) + 200
              const y2 = ((point[0] - mapCenter[0]) * 1000000) + 200
              
              return (
                <line
                  key={index}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#3B82F6"
                  strokeWidth="2"
                  opacity="0.7"
                />
              )
            })}
          </svg>

          {/* Current Position */}
          {gpsData && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-6 h-6 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
                <div className="absolute inset-0 w-6 h-6 bg-blue-600 rounded-full animate-ping opacity-20" />
              </div>
            </motion.div>
          )}

          {/* Defect Markers */}
          {defects.map((defect, index) => {
            const x = ((defect.gps_lng - mapCenter[1]) * 1000000) + 200
            const y = ((defect.gps_lat - mapCenter[0]) * 1000000) + 200
            
            return (
              <motion.div
                key={index}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute w-4 h-4 ${getDefectColor(defect.severity)} rounded-full border-2 border-white shadow-lg cursor-pointer`}
                style={{ left: x, top: y }}
                title={`${defect.defect_type} - Severity: ${defect.severity}`}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                  {getDefectIcon(defect.defect_type)}
                </div>
              </motion.div>
            )
          })}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 flex flex-col space-y-2">
            <button
              onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
              className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
            >
              +
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(prev - 1, 10))}
              className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50"
            >
              -
            </button>
          </div>
        </div>
      </div>

      {/* GPS Information Panel */}
      {gpsData && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
        >
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Navigation className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Position</span>
            </div>
            <p className="text-xs text-blue-700">
              {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
            </p>
          </div>

          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Speedometer className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-900">Speed</span>
            </div>
            <p className="text-xs text-green-700">
              {gpsData.speed.toFixed(1)} km/h
            </p>
          </div>

          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Compass className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-900">Heading</span>
            </div>
            <p className="text-xs text-purple-700">
              {gpsData.heading.toFixed(0)}°
            </p>
          </div>

          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Target className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">Chainage</span>
            </div>
            <p className="text-xs text-orange-700">
              {gpsData.chainage.toFixed(1)} m
            </p>
          </div>
        </motion.div>
      )}

      {/* Defect Summary */}
      <div className="border-t pt-4">
        <h4 className="text-lg font-medium text-gray-900 mb-3">Defect Summary</h4>
        
        {defects.length > 0 ? (
          <div className="space-y-2">
            {defects.slice(0, 5).map((defect, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
              >
                <div className={`w-3 h-3 rounded-full ${getDefectColor(defect.severity)}`} />
                <span className="text-sm font-medium text-gray-900">
                  {defect.defect_type.replace('_', ' ').toUpperCase()}
                </span>
                <span className="text-xs text-gray-600">
                  Severity: {defect.severity}
                </span>
                <span className="text-xs text-gray-500 ml-auto">
                  {defect.location.toFixed(1)}m
                </span>
              </motion.div>
            ))}
            
            {defects.length > 5 && (
              <p className="text-sm text-gray-500 text-center">
                +{defects.length - 5} more defects
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No defects detected</p>
          </div>
        )}
      </div>

      {/* Map Legend */}
      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full" />
            <span>Current Position</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <span>Low Severity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full" />
            <span>High Severity</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GPSMap
