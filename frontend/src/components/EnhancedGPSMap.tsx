import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Search, 
  Navigation, 
  Layers, 
  ZoomIn, 
  ZoomOut,
  Eye,
  EyeOff
} from 'lucide-react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers in React Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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

interface Defect {
  location: number
  defect_type: string
  severity: number
  gps_lat: number
  gps_lng: number
}

interface EnhancedGPSMapProps {
  latitude?: number
  longitude?: number
  gpsData?: GPSData
  defects?: Defect[]
}

const MapController: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
  const map = useMap()
  
  useEffect(() => {
    map.setView(center, zoom)
  }, [map, center, zoom])
  
  return null
}

const EnhancedGPSMap: React.FC<EnhancedGPSMapProps> = ({ latitude, longitude, gpsData, defects = [] }) => {
  // Handle both prop formats (backward compatibility)
  const lat = latitude || (gpsData ? gpsData.latitude : 28.6139)
  const lng = longitude || (gpsData ? gpsData.longitude : 77.209)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [latInput, setLatInput] = useState(lat.toString())
  const [lngInput, setLngInput] = useState(lng.toString())
  const [currentLayer, setCurrentLayer] = useState('street')
  const [showDefects, setShowDefects] = useState(true)
  const [mapCenter, setMapCenter] = useState<[number, number]>([lat, lng])
  const [mapZoom, setMapZoom] = useState(15)

  const layers = {
    street: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  }

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Simple geocoding simulation - in real app, use a geocoding service
      console.log('Searching for:', searchQuery)
    }
  }

  const handleCoordinateUpdate = () => {
    const lat = parseFloat(latInput)
    const lng = parseFloat(lngInput)
    
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setMapCenter([lat, lng])
    }
  }

  const formatCoordinate = (coord: number, type: 'lat' | 'lng') => {
    const abs = Math.abs(coord)
    const deg = Math.floor(abs)
    const min = Math.floor((abs - deg) * 60)
    const sec = ((abs - deg) * 60 - min) * 60
    
    const direction = type === 'lat' 
      ? (coord >= 0 ? 'N' : 'S')
      : (coord >= 0 ? 'E' : 'W')
    
    return `${deg}°${min}'${sec.toFixed(2)}"${direction}`
  }

  const getDefectColor = (severity: number) => {
    switch (severity) {
      case 1: return 'green'
      case 2: return 'yellow'
      case 3: return 'orange'
      case 4: return 'red'
      default: return 'gray'
    }
  }

  const getDefectIcon = (severity: number) => {
    const color = getDefectColor(severity)
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    })
  }

  return (
    <div className="w-full h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex flex-col lg:flex-row h-full">
        {/* Left Panel - Search and Coordinates */}
        <div className="w-full lg:w-80 bg-gray-50 p-6 border-r border-gray-200">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Location Finder
            </h3>

            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Place
              </label>
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter place name..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Coordinate Inputs */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  value={latInput}
                  onChange={(e) => setLatInput(e.target.value)}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  value={lngInput}
                  onChange={(e) => setLngInput(e.target.value)}
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={handleCoordinateUpdate}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Update Location
              </button>
            </div>

            {/* Current GPS Data */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Current GPS Data</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-mono">{gpsData.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-mono">{gpsData.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Altitude:</span>
                  <span className="font-mono">{gpsData.altitude}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-mono">{gpsData.speed} km/h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chainage:</span>
                  <span className="font-mono">{gpsData.chainage} km</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Map */}
        <div className="flex-1 relative">
          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
            {/* Layer Controls */}
            <div className="bg-white rounded-lg shadow-lg p-2">
              <div className="flex space-x-1">
                {Object.keys(layers).map((layer) => (
                  <button
                    key={layer}
                    onClick={() => setCurrentLayer(layer)}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      currentLayer === layer
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {layer.charAt(0).toUpperCase() + layer.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Defect Toggle */}
            <button
              onClick={() => setShowDefects(!showDefects)}
              className={`p-2 rounded-lg shadow-lg transition-colors ${
                showDefects ? 'bg-red-600 text-white' : 'bg-white text-gray-700'
              }`}
            >
              {showDefects ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>

          {/* Map */}
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <MapController center={mapCenter} zoom={mapZoom} />
            <TileLayer
              url={layers[currentLayer as keyof typeof layers]}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Current Location Marker */}
            <Marker position={[gpsData.latitude, gpsData.longitude]}>
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-blue-600 mb-2">Current Location</h4>
                  <p className="text-sm text-gray-600">
                    Chainage: {gpsData.chainage} km<br/>
                    Speed: {gpsData.speed} km/h<br/>
                    Accuracy: ±{gpsData.accuracy}m
                  </p>
                </div>
              </Popup>
            </Marker>

            {/* Defect Markers */}
            {showDefects && defects.map((defect, index) => (
              <Marker
                key={index}
                position={[defect.gps_lat, defect.gps_lng]}
                icon={getDefectIcon(defect.severity)}
              >
                <Popup>
                  <div className="p-2">
                    <h4 className="font-semibold text-red-600 mb-2">
                      Defect #{defect.location}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Type: {defect.defect_type.replace('_', ' ')}<br/>
                      Severity: {defect.severity}/4<br/>
                      Location: {defect.location} km
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </div>

      {/* Bottom Panel - Coordinate Display */}
      <div className="bg-gray-900 text-white p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="text-center sm:text-left">
            <div className="text-sm text-gray-300">Decimal Format</div>
            <div className="font-mono text-lg">
              {gpsData.latitude.toFixed(6)}, {gpsData.longitude.toFixed(6)}
            </div>
          </div>
          <div className="text-center sm:text-right">
            <div className="text-sm text-gray-300">DMS Format</div>
            <div className="font-mono text-lg">
              {formatCoordinate(gpsData.latitude, 'lat')}, {formatCoordinate(gpsData.longitude, 'lng')}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedGPSMap