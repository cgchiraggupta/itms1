#!/usr/bin/env python3
"""
ITMS Hardware Simulator
Complete simulation of all hardware components including camera, laser, GPS, and sensors
"""

import asyncio
import json
import random
import time
import cv2
import numpy as np
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional
import httpx
import websockets
import argparse
import logging
import base64
from PIL import Image, ImageDraw, ImageFont
import io

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class HardwareSimulator:
    def __init__(self, backend_url: str = "http://localhost:8000", websocket_url: str = "ws://localhost:8000"):
        self.backend_url = backend_url
        self.websocket_url = websocket_url
        self.chainage = 0.0
        self.speed = 0.0
        self.session_id = f"sim_{int(time.time())}"
        
        # GPS coordinates (simulating a railway track in Delhi)
        self.current_lat = 28.6139
        self.current_lng = 77.2090
        self.gps_accuracy = 3.0  # meters
        
        # Hardware components
        self.camera = CameraSimulator()
        self.laser = LaserSimulator()
        self.gps = GPSSimulator()
        self.encoder = EncoderSimulator()
        self.imu = IMUSimulator()
        
        # Track conditions and defects
        self.track_conditions = {
            'gauge_variation': 0.02,
            'alignment_faults': 0.1,
            'surface_defects': 0.05,
            'joint_defects': 0.03,
            'rail_wear': 0.02
        }
        
        # Defect detection
        self.defect_detector = DefectDetector()
        
        # Control flags
        self.camera_enabled = True
        self.laser_enabled = True
        self.gps_enabled = True
        self.auto_scan = True

    async def start_simulation(self, duration: int = 3600):
        """Start the complete hardware simulation"""
        logger.info(f"Starting ITMS Hardware Simulation for {duration} seconds")
        logger.info(f"Session ID: {self.session_id}")
        
        # Connect to backend
        websocket = None
        try:
            websocket = await websockets.connect(f"{self.websocket_url}/ws/realtime")
            logger.info("WebSocket connected to backend")
        except Exception as e:
            logger.error(f"WebSocket connection failed: {e}")
            websocket = None
        
        start_time = time.time()
        measurement_count = 0
        
        try:
            while time.time() - start_time < duration:
                # Update position and GPS
                await self.update_position()
                
                # Generate sensor data
                sensor_data = await self.generate_sensor_data()
                
                # Camera scanning and image capture
                if self.camera_enabled:
                    await self.camera_scanning()
                
                # Laser gauge measurement
                if self.laser_enabled:
                    await self.laser_scanning()
                
                # GPS tracking
                if self.gps_enabled:
                    await self.gps_tracking()
                
                # Defect detection
                defects = await self.detect_defects()
                
                # Send data to backend
                await self.send_data_to_backend(sensor_data, websocket)
                
                # Send defects if any
                for defect in defects:
                    await self.send_defect_to_backend(defect)
                
                measurement_count += 1
                
                # Log progress
                if measurement_count % 50 == 0:
                    logger.info(f"Processed {measurement_count} measurements, "
                              f"Chainage: {self.chainage:.1f}m, "
                              f"GPS: {self.current_lat:.6f}, {self.current_lng:.6f}")
                
                # Wait for next measurement cycle
                await asyncio.sleep(0.1)  # 10Hz sampling rate
                
        except KeyboardInterrupt:
            logger.info("Simulation interrupted by user")
        except Exception as e:
            logger.error(f"Simulation error: {e}")
        finally:
            if websocket:
                await websocket.close()
                logger.info("WebSocket disconnected")
            
            logger.info(f"Simulation completed. Total measurements: {measurement_count}")

    async def update_position(self):
        """Update train position and GPS coordinates"""
        # Simulate train movement
        self.speed = random.uniform(50, 200)  # km/h
        distance_increment = (self.speed / 3.6) * 0.1  # Convert to m/s and multiply by 0.1s interval
        self.chainage += distance_increment
        
        # Update GPS coordinates (simulating movement along a railway track)
        # Small random movement to simulate real GPS
        lat_offset = random.gauss(0, 0.00001)  # ~1m accuracy
        lng_offset = random.gauss(0, 0.00001)
        
        self.current_lat += lat_offset
        self.current_lng += lng_offset

    async def generate_sensor_data(self) -> List[Dict[str, Any]]:
        """Generate comprehensive sensor data"""
        measurements = []
        
        # Encoder data
        encoder_data = self.encoder.generate_data(self.chainage, self.speed)
        measurements.append(encoder_data)
        
        # IMU data
        imu_data = self.imu.generate_data(self.chainage, self.speed)
        measurements.append(imu_data)
        
        # GPS data
        gps_data = self.gps.generate_data(self.current_lat, self.current_lng, self.chainage)
        measurements.append(gps_data)
        
        return measurements

    async def camera_scanning(self):
        """Simulate camera scanning and image capture"""
        # Generate a simulated track image
        image = self.camera.capture_image(self.chainage, self.speed)
        
        # Detect defects in the image
        defects = self.defect_detector.analyze_image(image, self.chainage)
        
        if defects:
            # Save image with annotations
            annotated_image = self.camera.annotate_image(image, defects)
            
            # Send image to backend
            await self.send_image_to_backend(annotated_image, defects, self.chainage)
            
            logger.info(f"Camera detected {len(defects)} defects at chainage {self.chainage:.1f}m")

    async def laser_scanning(self):
        """Simulate laser gauge measurement"""
        # Generate laser measurement data
        laser_data = self.laser.measure_gauge(self.chainage, self.speed)
        
        # Check for gauge anomalies
        if laser_data['anomaly_detected']:
            logger.warning(f"Laser detected gauge anomaly: {laser_data['gauge']:.3f}m at chainage {self.chainage:.1f}m")
            
            # Create defect record
            defect = {
                'location': self.chainage,
                'defect_type': 'gauge_anomaly',
                'severity': laser_data['severity'],
                'reviewed': False,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'session_id': self.session_id,
                'gps_lat': self.current_lat,
                'gps_lng': self.current_lng,
                'measurement_value': laser_data['gauge'],
                'threshold': laser_data['threshold']
            }
            
            await self.send_defect_to_backend(defect)

    async def gps_tracking(self):
        """Simulate GPS tracking and mapping"""
        # Generate GPS data
        gps_data = {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'gps_position',
            'value': 1.0,  # GPS signal strength
            'sensor_id': 'gps_tracker',
            'session_id': self.session_id,
            'latitude': self.current_lat,
            'longitude': self.current_lng,
            'altitude': 216.0,  # Delhi altitude
            'accuracy': self.gps_accuracy,
            'speed': self.speed,
            'heading': random.uniform(0, 360)
        }
        
        # Send GPS data to backend
        await self.send_data_to_backend([gps_data], None)

    async def detect_defects(self) -> List[Dict[str, Any]]:
        """Detect various types of defects"""
        defects = []
        
        # Random defect detection
        if random.random() < 0.01:  # 1% chance per measurement
            defect_types = ['gauge_excess', 'alignment_fault', 'rail_wear', 'joint_defect', 'surface_crack']
            defect_type = random.choice(defect_types)
            
            severity = random.randint(1, 5)
            
            defect = {
                'location': self.chainage,
                'defect_type': defect_type,
                'severity': severity,
                'reviewed': False,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'session_id': self.session_id,
                'gps_lat': self.current_lat,
                'gps_lng': self.current_lng,
                'confidence': random.uniform(0.7, 0.95)
            }
            
            defects.append(defect)
        
        return defects

    async def send_data_to_backend(self, data: List[Dict[str, Any]], websocket):
        """Send sensor data to backend"""
        for measurement in data:
            try:
                # Send via HTTP
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        f"{self.backend_url}/api/v1/measurements",
                        json=measurement,
                        timeout=5.0
                    )
                
                # Send via WebSocket if available
                if websocket:
                    message = {
                        'type': 'sensor_data',
                        'data': [measurement],
                        'timestamp': datetime.now(timezone.utc).isoformat()
                    }
                    await websocket.send(json.dumps(message))
                    
            except Exception as e:
                logger.error(f"Failed to send data: {e}")

    async def send_defect_to_backend(self, defect: Dict[str, Any]):
        """Send defect data to backend"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/v1/defects",
                    json=defect,
                    timeout=5.0
                )
                logger.info(f"Defect sent to backend: {defect['defect_type']} at {defect['location']:.1f}m")
        except Exception as e:
            logger.error(f"Failed to send defect: {e}")

    async def send_image_to_backend(self, image: np.ndarray, defects: List[Dict], chainage: float):
        """Send captured image to backend"""
        try:
            # Convert image to base64
            _, buffer = cv2.imencode('.jpg', image)
            image_base64 = base64.b64encode(buffer).decode('utf-8')
            
            # Create image metadata
            image_data = {
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'camera_id': 'front_camera',
                'filepath': f"images/chainage_{chainage:.1f}m_{int(time.time())}.jpg",
                'annotations': json.dumps(defects),
                'chainage': chainage,
                'gps_lat': self.current_lat,
                'gps_lng': self.current_lng,
                'image_data': image_base64,
                'defect_count': len(defects)
            }
            
            # Send to backend
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/v1/video-frames",
                    json=image_data,
                    timeout=10.0
                )
                
            logger.info(f"Image sent to backend: {len(defects)} defects detected")
            
        except Exception as e:
            logger.error(f"Failed to send image: {e}")


class CameraSimulator:
    """Simulates camera functionality"""
    
    def capture_image(self, chainage: float, speed: float) -> np.ndarray:
        """Generate a simulated track image"""
        # Create a realistic track image
        width, height = 1920, 1080
        image = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Background (sky/ground)
        image[:height//2] = [135, 206, 235]  # Sky blue
        image[height//2:] = [34, 139, 34]    # Forest green
        
        # Draw railway track
        track_y = height // 2
        track_width = 100
        
        # Rails
        cv2.rectangle(image, (0, track_y - 10), (width, track_y + 10), (64, 64, 64), -1)
        cv2.rectangle(image, (0, track_y - 5), (width, track_y + 5), (192, 192, 192), -1)
        
        # Sleepers
        for x in range(0, width, 50):
            cv2.rectangle(image, (x, track_y - 20), (x + 20, track_y + 20), (139, 69, 19), -1)
        
        # Add some realistic details
        self.add_track_details(image, chainage, speed)
        
        return image
    
    def add_track_details(self, image: np.ndarray, chainage: float, speed: float):
        """Add realistic track details"""
        height, width = image.shape[:2]
        track_y = height // 2
        
        # Add some wear patterns
        if random.random() < 0.3:
            wear_x = random.randint(0, width)
            cv2.rectangle(image, (wear_x, track_y - 3), (wear_x + 30, track_y + 3), (100, 100, 100), -1)
        
        # Add ballast
        for _ in range(100):
            x = random.randint(0, width)
            y = random.randint(track_y + 20, height)
            cv2.circle(image, (x, y), random.randint(2, 5), (105, 105, 105), -1)
    
    def annotate_image(self, image: np.ndarray, defects: List[Dict]) -> np.ndarray:
        """Add defect annotations to image"""
        annotated = image.copy()
        
        for defect in defects:
            # Draw bounding box
            x1, y1 = defect['bbox'][:2]
            x2, y2 = defect['bbox'][2:]
            
            color = (0, 0, 255) if defect['severity'] > 3 else (0, 255, 255)
            cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
            
            # Add label
            label = f"{defect['type']} (Severity: {defect['severity']})"
            cv2.putText(annotated, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        return annotated


class LaserSimulator:
    """Simulates laser profilometer"""
    
    def measure_gauge(self, chainage: float, speed: float) -> Dict[str, Any]:
        """Simulate laser gauge measurement"""
        # Standard gauge is 1.676m (5'6")
        base_gauge = 1.676
        
        # Add some variation
        variation = random.gauss(0, 0.005)  # ±5mm standard deviation
        
        # Add speed-related effects
        speed_effect = (speed - 100) * 0.0001  # Slight gauge widening at high speed
        
        gauge = base_gauge + variation + speed_effect
        
        # Check for anomalies
        threshold = 0.02  # ±2cm tolerance
        anomaly_detected = abs(gauge - base_gauge) > threshold
        
        severity = 1
        if anomaly_detected:
            deviation = abs(gauge - base_gauge)
            if deviation > 0.05:  # >5cm
                severity = 5
            elif deviation > 0.03:  # >3cm
                severity = 4
            elif deviation > 0.02:  # >2cm
                severity = 3
            else:
                severity = 2
        
        return {
            'gauge': gauge,
            'threshold': threshold,
            'anomaly_detected': anomaly_detected,
            'severity': severity,
            'deviation': abs(gauge - base_gauge),
            'measurement_quality': random.uniform(0.8, 1.0)
        }


class GPSSimulator:
    """Simulates GPS tracking"""
    
    def generate_data(self, lat: float, lng: float, chainage: float) -> Dict[str, Any]:
        """Generate GPS data"""
        return {
            'chainage': chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'gps_position',
            'value': 1.0,
            'sensor_id': 'gps_tracker',
            'latitude': lat,
            'longitude': lng,
            'altitude': 216.0,
            'accuracy': random.uniform(2.0, 5.0),
            'satellites': random.randint(8, 12),
            'hdop': random.uniform(0.8, 2.0)
        }


class EncoderSimulator:
    """Simulates axle encoder"""
    
    def generate_data(self, chainage: float, speed: float) -> Dict[str, Any]:
        """Generate encoder data"""
        return {
            'chainage': chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'position',
            'value': chainage,
            'sensor_id': 'encoder_axle',
            'speed': speed,
            'pulses': int(chainage * 1000),  # 1000 pulses per meter
            'direction': 1 if speed > 0 else -1
        }


class IMUSimulator:
    """Simulates IMU sensor"""
    
    def generate_data(self, chainage: float, speed: float) -> Dict[str, Any]:
        """Generate IMU data"""
        # Base acceleration with vibration
        t = time.time()
        vibration = 0.5 * random.gauss(0, 1) * (1 + 0.5 * random.sin(2 * 3.14159 * 10 * t))
        
        accel_x = vibration + random.gauss(0, 0.1)
        accel_y = random.gauss(0, 0.1)
        accel_z = 9.81 + random.gauss(0, 0.1)  # Gravity + noise
        
        magnitude = (accel_x**2 + accel_y**2 + accel_z**2)**0.5
        
        return {
            'chainage': chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'acceleration',
            'value': magnitude,
            'sensor_id': 'imu_axle',
            'accel_x': accel_x,
            'accel_y': accel_y,
            'accel_z': accel_z,
            'gyro_x': random.gauss(0, 0.1),
            'gyro_y': random.gauss(0, 0.1),
            'gyro_z': random.gauss(0, 0.1)
        }


class DefectDetector:
    """Simulates AI defect detection"""
    
    def analyze_image(self, image: np.ndarray, chainage: float) -> List[Dict[str, Any]]:
        """Analyze image for defects"""
        defects = []
        
        # Random defect detection
        if random.random() < 0.05:  # 5% chance
            defect_types = ['rail_wear', 'joint_defect', 'surface_crack', 'ballast_issue']
            defect_type = random.choice(defect_types)
            
            # Generate random bounding box
            height, width = image.shape[:2]
            x1 = random.randint(0, width - 100)
            y1 = random.randint(0, height - 100)
            x2 = x1 + random.randint(50, 100)
            y2 = y1 + random.randint(50, 100)
            
            defect = {
                'type': defect_type,
                'severity': random.randint(1, 5),
                'confidence': random.uniform(0.7, 0.95),
                'bbox': [x1, y1, x2, y2],
                'chainage': chainage,
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            
            defects.append(defect)
        
        return defects


async def main():
    parser = argparse.ArgumentParser(description='ITMS Hardware Simulator')
    parser.add_argument('--backend-url', default='http://localhost:8000',
                       help='Backend API URL')
    parser.add_argument('--websocket-url', default='ws://localhost:8000',
                       help='WebSocket URL')
    parser.add_argument('--duration', type=int, default=3600,
                       help='Simulation duration in seconds')
    
    args = parser.parse_args()
    
    simulator = HardwareSimulator(args.backend_url, args.websocket_url)
    await simulator.start_simulation(duration=args.duration)


if __name__ == "__main__":
    asyncio.run(main())
