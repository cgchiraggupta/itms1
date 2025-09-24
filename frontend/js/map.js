/**
 * ITMS Frontend - Map and Location Services
 * Handles track mapping, location display, and GPS integration
 */

class ITMSMap {
    constructor() {
        this.map = null;
        this.trackLayer = null;
        this.currentLocationMarker = null;
        this.defectMarkers = [];
        this.heatmapLayer = null;
        this.isInitialized = false;
        this.currentPosition = null;
        this.trackData = [];
        this.init();
    }

    init() {
        this.initializeMap();
        this.setupEventListeners();
        console.log('ITMS Map initialized');
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map('track-map').setView([28.6139, 77.2090], 13); // Default to Delhi

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Add satellite tiles option
        const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri'
        });

        // Add layer control
        const baseMaps = {
            "Street Map": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }),
            "Satellite": satelliteLayer
        };

        L.control.layers(baseMaps).addTo(this.map);

        this.isInitialized = true;
        this.loadTrackData();
    }

    setupEventListeners() {
        // Listen for location updates
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(
                (position) => this.updateCurrentLocation(position),
                (error) => this.handleLocationError(error),
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 30000
                }
            );
        }

        // Listen for WebSocket location updates
        if (window.itmsWebSocket) {
            window.itmsWebSocket.registerHandler('location_update', this.handleLocationUpdate.bind(this));
            window.itmsWebSocket.registerHandler('defect_location', this.handleDefectLocation.bind(this));
        }
    }

    loadTrackData() {
        // Load track geometry data (mock data for demonstration)
        this.trackData = [
            { lat: 28.6139, lng: 77.2090, chainage: 0, name: 'Start Point' },
            { lat: 28.6149, lng: 77.2100, chainage: 100, name: 'Station 1' },
            { lat: 28.6159, lng: 77.2110, chainage: 200, name: 'Station 2' },
            { lat: 28.6169, lng: 77.2120, chainage: 300, name: 'Station 3' },
            { lat: 28.6179, lng: 77.2130, chainage: 400, name: 'End Point' }
        ];

        this.drawTrack();
        this.addTrackMarkers();
    }

    drawTrack() {
        if (this.trackLayer) {
            this.map.removeLayer(this.trackLayer);
        }

        // Create track polyline
        const trackCoordinates = this.trackData.map(point => [point.lat, point.lng]);
        this.trackLayer = L.polyline(trackCoordinates, {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8
        }).addTo(this.map);

        // Add track information
        this.trackLayer.bindPopup('Railway Track Line');
    }

    addTrackMarkers() {
        this.trackData.forEach(point => {
            const marker = L.marker([point.lat, point.lng], {
                icon: this.createTrackIcon()
            }).addTo(this.map);

            marker.bindPopup(`
                <div class="track-popup">
                    <h4>${point.name}</h4>
                    <p>Chainage: ${point.chainage}m</p>
                    <p>Coordinates: ${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}</p>
                </div>
            `);
        });
    }

    createTrackIcon() {
        return L.divIcon({
            className: 'track-marker',
            html: '<div class="track-marker-icon"><i class="fas fa-train"></i></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        });
    }

    updateCurrentLocation(position) {
        this.currentPosition = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
        };

        this.updateCurrentLocationMarker();
        this.updateLocationDisplay();
    }

    updateCurrentLocationMarker() {
        if (!this.currentPosition) return;

        if (this.currentLocationMarker) {
            this.map.removeLayer(this.currentLocationMarker);
        }

        // Create current location marker
        this.currentLocationMarker = L.marker([this.currentPosition.lat, this.currentPosition.lng], {
            icon: this.createCurrentLocationIcon()
        }).addTo(this.map);

        // Add accuracy circle
        const accuracyCircle = L.circle([this.currentPosition.lat, this.currentPosition.lng], {
            radius: this.currentPosition.accuracy,
            color: '#ef4444',
            fillColor: '#ef4444',
            fillOpacity: 0.2
        }).addTo(this.map);

        // Bind popup
        this.currentLocationMarker.bindPopup(`
            <div class="location-popup">
                <h4>Current Location</h4>
                <p>Lat: ${this.currentPosition.lat.toFixed(6)}</p>
                <p>Lng: ${this.currentPosition.lng.toFixed(6)}</p>
                <p>Accuracy: ±${this.currentPosition.accuracy.toFixed(0)}m</p>
                <p>Time: ${new Date(this.currentPosition.timestamp).toLocaleTimeString()}</p>
            </div>
        `);

        // Center map on current location
        this.map.setView([this.currentPosition.lat, this.currentPosition.lng], 15);
    }

    createCurrentLocationIcon() {
        return L.divIcon({
            className: 'current-location-marker',
            html: '<div class="current-location-icon"><i class="fas fa-map-marker-alt"></i></div>',
            iconSize: [30, 30],
            iconAnchor: [15, 30]
        });
    }

    updateLocationDisplay() {
        if (!this.currentPosition) return;

        // Update location display elements
        const latElement = document.getElementById('current-lat');
        const lngElement = document.getElementById('current-lng');
        const accuracyElement = document.getElementById('location-accuracy');

        if (latElement) latElement.textContent = this.currentPosition.lat.toFixed(6);
        if (lngElement) lngElement.textContent = this.currentPosition.lng.toFixed(6);
        if (accuracyElement) accuracyElement.textContent = `±${this.currentPosition.accuracy.toFixed(0)}m`;
    }

    handleLocationUpdate(data) {
        // Handle location updates from WebSocket
        if (data.latitude && data.longitude) {
            this.currentPosition = {
                lat: data.latitude,
                lng: data.longitude,
                accuracy: data.accuracy || 10,
                timestamp: Date.now()
            };

            this.updateCurrentLocationMarker();
            this.updateLocationDisplay();
        }
    }

    handleDefectLocation(data) {
        // Add defect marker to map
        this.addDefectMarker(data);
    }

    addDefectMarker(defectData) {
        const marker = L.marker([defectData.lat, defectData.lng], {
            icon: this.createDefectIcon(defectData.severity)
        }).addTo(this.map);

        marker.bindPopup(`
            <div class="defect-popup">
                <h4>Defect Alert</h4>
                <p><strong>Type:</strong> ${defectData.type}</p>
                <p><strong>Severity:</strong> ${defectData.severity}</p>
                <p><strong>Chainage:</strong> ${defectData.chainage}m</p>
                <p><strong>Detected:</strong> ${new Date(defectData.timestamp).toLocaleString()}</p>
                <button class="btn btn-sm btn-primary" onclick="viewDefectDetails(${defectData.id})">
                    View Details
                </button>
            </div>
        `);

        this.defectMarkers.push(marker);
    }

    createDefectIcon(severity) {
        const colors = {
            low: '#10b981',
            medium: '#f59e0b',
            high: '#ef4444',
            critical: '#7c2d12'
        };

        return L.divIcon({
            className: 'defect-marker',
            html: `<div class="defect-marker-icon" style="background-color: ${colors[severity] || colors.medium}">
                <i class="fas fa-exclamation-triangle"></i>
            </div>`,
            iconSize: [25, 25],
            iconAnchor: [12, 12]
        });
    }

    createHeatmap(data) {
        if (this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
        }

        const heatmapData = data.map(point => ({
            lat: point.lat,
            lng: point.lng,
            intensity: point.intensity || 1
        }));

        this.heatmapLayer = L.heatLayer(heatmapData, {
            radius: 25,
            blur: 15,
            maxZoom: 17,
            max: 1.0,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.7: 'lime',
                0.8: 'yellow',
                1.0: 'red'
            }
        }).addTo(this.map);
    }

    clearDefectMarkers() {
        this.defectMarkers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.defectMarkers = [];
    }

    clearHeatmap() {
        if (this.heatmapLayer) {
            this.map.removeLayer(this.heatmapLayer);
            this.heatmapLayer = null;
        }
    }

    fitTrackBounds() {
        if (this.trackData.length > 0) {
            const bounds = L.latLngBounds(this.trackData.map(point => [point.lat, point.lng]));
            this.map.fitBounds(bounds, { padding: [20, 20] });
        }
    }

    handleLocationError(error) {
        console.error('Location error:', error);
        
        let message = 'Location access denied';
        switch (error.code) {
            case error.PERMISSION_DENIED:
                message = 'Location access denied by user';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'Location information unavailable';
                break;
            case error.TIMEOUT:
                message = 'Location request timed out';
                break;
        }

        this.showLocationError(message);
    }

    showLocationError(message) {
        // Show location error notification
        if (window.itmsWebSocket && window.itmsWebSocket.showNotification) {
            window.itmsWebSocket.showNotification(message, 'error');
        }
    }

    exportMapImage() {
        // Export map as image
        this.map.getContainer().toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `itms-map-${new Date().toISOString().split('T')[0]}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
        });
    }

    getCurrentPosition() {
        return this.currentPosition;
    }

    getTrackData() {
        return this.trackData;
    }

    destroy() {
        if (this.map) {
            this.map.remove();
            this.map = null;
        }
        this.isInitialized = false;
    }
}

// Global function for defect details
window.viewDefectDetails = function(defectId) {
    console.log('Viewing defect details for ID:', defectId);
    // Implementation would open defect details modal or navigate to defect page
};

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for map container to be available
    const mapContainer = document.getElementById('track-map');
    if (mapContainer) {
        window.itmsMap = new ITMSMap();
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ITMSMap;
}
