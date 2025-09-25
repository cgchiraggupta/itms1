import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Navigation, 
  Target, 
  Search,
  Layers,
  ZoomIn,
  ZoomOut,
  Locate,
  Satellite,
  Map as MapIcon,
  Facebook,
  Twitter
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

interface EnhancedGPSMapProps {
  gpsData: GPSData | null
  defects: Array<{
    location: number
    defect_type: string
    severity: number
    gps_lat: number
    gps_lng: number
  }>
}

type MapLayer = 'street' | 'satellite' | 'terrain'

const EnhancedGPSMap: React.FC<EnhancedGPSMapProps> = ({ gpsData, defects }) => {
  const mapRef = useRef<HTMLDivElement>(null)
  const worldMapRef = useRef<HTMLDivElement>(null)
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]) // Delhi coordinates
  const [zoom, setZoom] = useState(13)
  const [currentLayer, setCurrentLayer] = useState<MapLayer>('street')
  const [searchQuery, setSearchQuery] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: 0.000000, lng: 0.000000 })
  const [isSearching, setIsSearching] = useState(false)
  const [showLayerControl, setShowLayerControl] = useState(false)

  // Update map center when GPS data changes
  useEffect(() => {
    if (gpsData) {
      setMapCenter([gpsData.latitude, gpsData.longitude])
      setCoordinates({ lat: gpsData.latitude, lng: gpsData.longitude })
    }
  }, [gpsData])

  // Generate map tiles based on selected layer
  const getMapTileUrl = (lat: number, lng: number, zoom: number, layer: MapLayer) => {
    const x = Math.floor((lng + 180) / 360 * Math.pow(2, zoom))
    const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom))
    
    switch (layer) {
      case 'satellite':
        return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${y}/${x}`
      case 'terrain':
        return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/${zoom}/${y}/${x}`
      default:
        return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`
    }
  }

  // Handle map click to get coordinates
  const handleMapClick = (event: React.MouseEvent) => {
    const rect = mapRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    
    // Convert pixel coordinates to lat/lng (simplified calculation)
    const lng = mapCenter[1] + ((x - rect.width / 2) / rect.width) * (360 / Math.pow(2, zoom))
    const lat = mapCenter[0] - ((y - rect.height / 2) / rect.height) * (180 / Math.pow(2, zoom))
    
    setCoordinates({ lat, lng })
  }

  // Handle search functionality
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    try {
      // In a real implementation, you would use a geocoding service
      // For now, we'll simulate with some common locations
      const mockLocations: { [key: string]: [number, number] } = {
        'delhi': [28.6139, 77.2090],
        'mumbai': [19.0760, 72.8777],
        'bangalore': [12.9716, 77.5946],
        'chennai': [13.0827, 80.2707],
        'kolkata': [22.5726, 88.3639],
        'hyderabad': [17.3850, 78.4867],
        'pune': [18.5204, 73.8567],
        'ahmedabad': [23.0225, 72.5714],
        'london': [51.5074, -0.1278],
        'new york': [40.7128, -74.0060],
        'tokyo': [35.6762, 139.6503],
        'paris': [48.8566, 2.3522]
      }
      
      const query = searchQuery.toLowerCase()
      const location = mockLocations[query]
      
      if (location) {
        setMapCenter(location)
        setCoordinates({ lat: location[0], lng: location[1] })
      } else {
        alert('Location not found. Try: Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, London, New York, Tokyo, Paris')
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  // Convert decimal degrees to DMS format
  const toDMS = (coord: number, isLat: boolean) => {
    const absolute = Math.abs(coord)
    const degrees = Math.floor(absolute)
    const minutes = Math.floor((absolute - degrees) * 60)
    const seconds = ((absolute - degrees) * 60 - minutes) * 60
    
    const direction = isLat 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W')
    
    return `${degrees}° ${minutes}' ${seconds.toFixed(2)}" ${direction}`
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

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MapIcon className="h-6 w-6" />
            <h2 className="text-xl font-semibold">Latitude and Longitude Finder</h2>
          </div>
        </div>
        <p className="text-blue-100 text-sm mt-2">
          Latitude and Longitude are the units that represent the coordinates at geographic coordinate system. 
          To make a search, use the name of a place, city, state, or address, or click the location on the map to find lat long coordinates.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Left Panel - Search and Controls */}
        <div className="lg:w-1/3 bg-green-50 p-4 border-r">
          <div className="space-y-4">
            {/* Search Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Place Name
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Type a place name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  <Search className="h-4 w-4" />
                  <span>Find</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Add the country code for better results. Ex: London, UK
              </p>
            </div>

            {/* Coordinate Inputs */}
            <div className="bg-white p-4 rounded-lg border">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    value={coordinates.lat.toFixed(6)}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    step="0.000001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    value={coordinates.lng.toFixed(6)}
                    onChange={(e) => setCoordinates(prev => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    step="0.000001"
                  />
                </div>
              </div>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-3">
              <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                <Facebook className="h-4 w-4" />
                <span className="text-sm">Facebook</span>
              </button>
              <button className="flex items-center space-x-2 text-blue-400 hover:text-blue-600">
                <Twitter className="h-4 w-4" />
                <span className="text-sm">Twitter</span>
              </button>
            </div>

            {/* Accuracy Hint */}
            <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-xs text-yellow-800">
                For better accuracy please type Name Address City State Zipcode.
              </p>
            </div>

            {/* Layer Control */}
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-medium text-gray-900 mb-3">Map Layers</h3>
              <div className="space-y-2">
                {[
                  { key: 'street', label: 'Street Map', icon: MapIcon },
                  { key: 'satellite', label: 'Satellite', icon: Satellite },
                  { key: 'terrain', label: 'Terrain', icon: Navigation }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setCurrentLayer(key as MapLayer)}
                    className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors ${
                      currentLayer === key 
                        ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Maps */}
        <div className="lg:w-2/3">
          {/* Map Views Container */}
          <div className="grid grid-cols-1 lg:grid-cols-2 h-96">
            {/* Basic World Map (Left) */}
            <div className="relative border-r">
              <div 
                ref={worldMapRef}
                className="w-full h-full cursor-crosshair"
                style={{
                  backgroundImage: 'url(https://tile.openstreetmap.org/2/1/1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
              >
                {/* World Map Marker */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg" />
                </div>
                
                {/* Zoom Controls */}
                <div className="absolute top-2 left-2 flex flex-col space-y-1">
                  <button
                    onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                    className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                  >
                    -
                  </button>
                </div>

                {/* Attribution */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                  Leaflet | © OpenStreetMap
                </div>
              </div>
            </div>

            {/* Satellite/Street View Map (Right) */}
            <div className="relative">
              <div 
                ref={mapRef}
                className="w-full h-full cursor-crosshair"
                style={{
                  backgroundImage: `url(${getMapTileUrl(mapCenter[0], mapCenter[1], zoom, currentLayer)})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}
                onClick={handleMapClick}
              >
                {/* Map Controls */}
                <div className="absolute top-2 right-2 flex flex-col space-y-1">
                  <button
                    onClick={() => setZoom(prev => Math.min(prev + 1, 18))}
                    className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                  >
                    +
                  </button>
                  <button
                    onClick={() => setZoom(prev => Math.max(prev - 1, 1))}
                    className="w-8 h-8 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 text-sm font-bold"
                  >
                    -
                  </button>
                </div>

                {/* View Larger Map Button */}
                <button className="absolute top-2 left-2 bg-white px-3 py-1 rounded shadow-lg text-xs hover:bg-gray-50">
                  View larger map
                </button>

                {/* Current Position Marker */}
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
                    />
                  )
                })}

                {/* Attribution */}
                <div className="absolute bottom-2 left-2 text-xs text-gray-600 bg-white/80 px-2 py-1 rounded">
                  {currentLayer === 'satellite' ? '© Esri' : 'Leaflet | © OpenStreetMap contributors'}
                </div>
              </div>
            </div>
          </div>

          {/* Coordinate Display Panel */}
          <div className="bg-white border-t p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Lat Long</h3>
                <p className="text-sm text-gray-600">
                  ({coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)})
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">GPS Coordinates</h3>
                <div className="text-sm text-gray-600">
                  <p>{toDMS(coordinates.lat, true)}</p>
                  <p>{toDMS(coordinates.lng, false)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedGPSMap
