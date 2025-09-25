# ITMS Hardware Simulation System

## 🚀 **Complete Hardware Simulation Interface**

This system provides a **complete simulation** of all ITMS hardware components, allowing you to control and interact with cameras, lasers, GPS tracking, and defect detection from your computer without any physical hardware.

## 🎯 **What You Can Do**

### 📷 **Camera Control & Image Capture**
- **Real-time Camera Simulation**: Generate realistic track images
- **Automatic Defect Detection**: AI-powered analysis of track conditions
- **Manual Frame Capture**: Click to capture images at any time
- **Defect Annotation**: Visual overlays showing detected issues
- **Image Gallery**: View all captured frames with defect information
- **Download Images**: Save captured frames with annotations

### 🎯 **Laser Scanner & Gauge Measurement**
- **Real-time Gauge Scanning**: Simulate laser profilometer measurements
- **Anomaly Detection**: Automatic detection of gauge variations
- **Severity Assessment**: 1-5 scale severity rating for defects
- **Threshold Monitoring**: Configurable tolerance levels
- **Measurement Quality**: Simulated measurement accuracy

### 🗺️ **GPS Tracking & Mapping**
- **Real-time Position Tracking**: Live GPS coordinates
- **Interactive Map**: Visual track representation with OpenStreetMap
- **Defect Markers**: Color-coded markers for different severity levels
- **Track History**: Visual trail of train movement
- **GPS Information Panel**: Speed, heading, altitude, accuracy
- **Chainage Mapping**: Distance-based position tracking

### ⚡ **Hardware Control Panel**
- **Component Toggle**: Enable/disable individual sensors
- **Auto Scan Mode**: Continuous monitoring simulation
- **Manual Controls**: Start/stop scanning operations
- **System Status**: Real-time component health monitoring
- **Settings Configuration**: Adjustable parameters

## 🌐 **Access Points**

### **Enhanced Dashboard**: http://localhost:3000/enhanced
- Complete hardware control interface
- Real-time sensor data visualization
- Interactive camera and laser controls
- GPS mapping with defect visualization

### **API Documentation**: http://localhost:8000/docs
- Complete API reference
- Interactive endpoint testing
- WebSocket documentation
- Data format specifications

### **Standard Dashboard**: http://localhost:3000/dashboard
- Traditional monitoring interface
- System health metrics
- Real-time charts and graphs

## 🔧 **Hardware Components Simulated**

### 1. **Camera System**
```python
# Simulated Features:
- Track image generation
- Defect detection algorithms
- Image annotation
- Frame capture and storage
- GPS coordinate tagging
```

### 2. **Laser Profilometer**
```python
# Simulated Features:
- Gauge measurement (1.676m standard)
- Anomaly detection
- Severity assessment
- Measurement quality simulation
- Threshold monitoring
```

### 3. **GPS Tracker**
```python
# Simulated Features:
- Real-time position updates
- Speed and heading calculation
- Accuracy simulation
- Chainage mapping
- Satellite information
```

### 4. **IMU Sensor**
```python
# Simulated Features:
- 3-axis acceleration
- Gyroscope data
- Vibration analysis
- Motion detection
- Real-time filtering
```

### 5. **Axle Encoder**
```python
# Simulated Features:
- Position tracking
- Speed calculation
- Direction detection
- Pulse counting
- Distance measurement
```

## 📊 **Real-time Data Flow**

```
Hardware Simulator → Backend API → WebSocket → Frontend Dashboard
     ↓                    ↓           ↓            ↓
  Sensor Data        Database    Real-time    Interactive
  Generation         Storage     Updates      Visualization
```

## 🎮 **How to Use**

### **1. Start the System**
```bash
# Backend API Server
cd backend && source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Hardware Simulator
python3 scripts/hardware_simulator.py --duration 3600

# Frontend Dashboard
cd frontend && npm run dev
```

### **2. Access the Interface**
- Open http://localhost:3000/enhanced
- Navigate to "Hardware Control" in the menu
- Use the control panel to enable/disable components

### **3. Camera Operations**
- Click "Start Recording" to begin image capture
- Use "Capture Frame" for manual image capture
- Enable "Auto Capture" for continuous monitoring
- View captured images in the gallery below

### **4. Laser Scanning**
- Enable "Laser Scanner" in the control panel
- Monitor gauge measurements in real-time
- View anomaly alerts in the defect summary

### **5. GPS Tracking**
- Enable "GPS Tracker" in the control panel
- View real-time position on the interactive map
- Monitor speed, heading, and chainage

## 🔍 **Defect Detection Features**

### **Automatic Detection**
- **Gauge Anomalies**: Variations from standard 1.676m gauge
- **Rail Wear**: Simulated wear patterns
- **Joint Defects**: Rail joint issues
- **Surface Cracks**: Track surface problems
- **Alignment Faults**: Track alignment issues

### **Severity Levels**
- **Level 1**: Minor issues (Green)
- **Level 2**: Low severity (Yellow)
- **Level 3**: Medium severity (Orange)
- **Level 4**: High severity (Red)
- **Level 5**: Critical issues (Dark Red)

### **Visual Indicators**
- **Map Markers**: Color-coded defect locations
- **Image Annotations**: Bounding boxes on captured images
- **Alert Notifications**: Real-time defect alerts
- **Severity Badges**: Visual severity indicators

## 📈 **Data Visualization**

### **Real-time Charts**
- Sensor data trends
- Speed and acceleration graphs
- Gauge measurement history
- Defect frequency analysis

### **Interactive Maps**
- GPS position tracking
- Defect location mapping
- Track history visualization
- Zoom and pan controls

### **System Status**
- Component health monitoring
- Data rate indicators
- Connection status
- Performance metrics

## 🛠️ **Configuration Options**

### **Camera Settings**
- Capture interval (1-30 seconds)
- Image quality settings
- Auto-capture mode
- Defect detection sensitivity

### **Laser Settings**
- Measurement frequency
- Gauge tolerance levels
- Anomaly detection thresholds
- Quality assessment criteria

### **GPS Settings**
- Update frequency
- Accuracy requirements
- Coordinate system
- Map tile provider

## 📱 **Mobile Responsive**

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones
- Touch screen devices

## 🔒 **Security Features**

- CORS protection
- Input validation
- Error handling
- Rate limiting
- Secure WebSocket connections

## 📊 **Performance Monitoring**

- Real-time system health
- Data throughput metrics
- Component status monitoring
- Error rate tracking
- Performance optimization

## 🚀 **Future Enhancements**

- **Machine Learning**: Enhanced defect detection algorithms
- **3D Visualization**: 3D track modeling
- **AR Interface**: Augmented reality overlay
- **Mobile App**: Native mobile application
- **Cloud Integration**: Cloud-based data storage

## 🆘 **Troubleshooting**

### **Common Issues**
1. **WebSocket Connection Failed**: Check if backend is running
2. **No Data Updates**: Verify hardware simulator is running
3. **Images Not Loading**: Check network connection
4. **Map Not Displaying**: Verify internet connection for map tiles

### **Debug Mode**
```bash
# Enable debug logging
export DEBUG=true
python3 scripts/hardware_simulator.py --duration 3600
```

## 📞 **Support**

For technical support or questions:
- Check the API documentation at http://localhost:8000/docs
- Review the system logs
- Verify all components are running
- Check network connectivity

---

## 🎉 **You're All Set!**

Your ITMS hardware simulation system is now running with:
- ✅ Complete camera control and image capture
- ✅ Real-time laser scanning and gauge measurement
- ✅ GPS tracking with interactive mapping
- ✅ Automatic defect detection and visualization
- ✅ Full hardware control interface
- ✅ Real-time data streaming and visualization

**Access your enhanced dashboard at: http://localhost:3000/enhanced**

Enjoy exploring the complete ITMS hardware simulation system! 🚂📊🎯
