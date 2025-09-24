#!/usr/bin/env python3
"""
ITMS Sensor Simulator
Simulates real-time sensor data for testing the ITMS system
"""

import asyncio
import json
import random
import time
from datetime import datetime, timezone
from typing import Dict, List, Any
import httpx
import websockets
import argparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SensorSimulator:
    def __init__(self, backend_url: str = "http://localhost:8000", websocket_url: str = "ws://localhost:8000"):
        self.backend_url = backend_url
        self.websocket_url = websocket_url
        self.chainage = 0.0
        self.speed = 0.0
        self.session_id = f"sim_{int(time.time())}"
        
        # Sensor configurations
        self.sensors = {
            'encoder': {
                'pulses_per_meter': 1000,
                'noise_level': 0.01
            },
            'imu': {
                'base_acceleration': 0.0,
                'noise_level': 0.1,
                'vibration_frequency': 10.0
            },
            'laser': {
                'base_distance': 150.0,  # mm
                'noise_level': 0.5,
                'defect_probability': 0.05
            },
            'camera': {
                'trigger_interval': 100,  # pulses
                'last_trigger': 0
            }
        }
        
        # Track conditions
        self.track_conditions = {
            'gauge_variation': 0.02,  # ±2cm
            'alignment_faults': 0.1,  # 10% chance
            'surface_defects': 0.05,  # 5% chance
            'joint_defects': 0.03     # 3% chance
        }

    async def generate_encoder_data(self) -> Dict[str, Any]:
        """Generate encoder position data"""
        # Simulate train movement
        self.speed = random.uniform(50, 200)  # km/h
        distance_increment = (self.speed / 3.6) * 0.1  # Convert to m/s and multiply by 0.1s interval
        self.chainage += distance_increment
        
        # Add some noise
        noise = random.gauss(0, self.sensors['encoder']['noise_level'])
        position = self.chainage + noise
        
        return {
            'chainage': position,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'position',
            'value': position,
            'sensor_id': 'encoder_axle',
            'speed': self.speed,
            'session_id': self.session_id
        }

    async def generate_imu_data(self) -> Dict[str, Any]:
        """Generate IMU acceleration data"""
        # Base acceleration with vibration
        t = time.time()
        vibration = 0.5 * random.gauss(0, 1) * (1 + 0.5 * random.sin(2 * 3.14159 * self.sensors['imu']['vibration_frequency'] * t))
        
        # Add track-induced vibrations
        if random.random() < self.track_conditions['surface_defects']:
            vibration += random.uniform(1.0, 3.0)  # Defect-induced vibration
        
        # Simulate different axes
        accel_x = vibration + random.gauss(0, self.sensors['imu']['noise_level'])
        accel_y = random.gauss(0, self.sensors['imu']['noise_level'])
        accel_z = 9.81 + random.gauss(0, self.sensors['imu']['noise_level'])  # Gravity + noise
        
        # Calculate magnitude
        magnitude = (accel_x**2 + accel_y**2 + accel_z**2)**0.5
        
        return {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'acceleration',
            'value': magnitude,
            'sensor_id': 'imu_axle',
            'accel_x': accel_x,
            'accel_y': accel_y,
            'accel_z': accel_z,
            'session_id': self.session_id
        }

    async def generate_laser_data(self) -> Dict[str, Any]:
        """Generate laser profilometer data"""
        # Base distance measurement
        base_distance = self.sensors['laser']['base_distance']
        noise = random.gauss(0, self.sensors['laser']['noise_level'])
        
        # Simulate gauge measurement
        gauge = 1.676 + random.gauss(0, 0.005)  # Standard gauge with variation
        
        # Add defects occasionally
        if random.random() < self.track_conditions['gauge_variation']:
            gauge += random.uniform(-0.02, 0.02)  # Gauge variation
        
        return {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'gauge',
            'value': gauge,
            'sensor_id': 'laser_gauge',
            'distance': base_distance + noise,
            'session_id': self.session_id
        }

    async def generate_alignment_data(self) -> Dict[str, Any]:
        """Generate track alignment data"""
        # Base alignment
        alignment = random.gauss(0, 1.0)  # mm
        
        # Add alignment faults
        if random.random() < self.track_conditions['alignment_faults']:
            alignment += random.uniform(-5, 5)  # Significant alignment fault
        
        return {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'alignment',
            'value': alignment,
            'sensor_id': 'laser_alignment',
            'session_id': self.session_id
        }

    async def generate_camera_trigger(self) -> Dict[str, Any]:
        """Generate camera trigger data"""
        # Check if it's time to trigger camera
        if self.chainage - self.sensors['camera']['last_trigger'] >= self.sensors['camera']['trigger_interval']:
            self.sensors['camera']['last_trigger'] = self.chainage
            
            return {
                'chainage': self.chainage,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'type': 'camera_trigger',
                'value': 1,
                'sensor_id': 'camera_front',
                'frame_number': int(self.chainage / self.sensors['camera']['trigger_interval']),
                'session_id': self.session_id
            }
        return None

    async def detect_defects(self) -> List[Dict[str, Any]]:
        """Detect and generate defect data"""
        defects = []
        
        # Check for various defect types
        if random.random() < 0.01:  # 1% chance per measurement
            defect_types = ['gauge_excess', 'alignment_fault', 'rail_wear', 'joint_defect']
            defect_type = random.choice(defect_types)
            
            severity = random.randint(1, 5)
            
            defects.append({
                'location': self.chainage,
                'defect_type': defect_type,
                'severity': severity,
                'reviewed': False,
                'timestamp': datetime.now(timezone.utc).isoformat(),
                'session_id': self.session_id
            })
        
        return defects

    async def send_http_data(self, data: Dict[str, Any]) -> bool:
        """Send data via HTTP POST"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/v1/measurements",
                    json=data,
                    timeout=5.0
                )
                return response.status_code == 201
        except Exception as e:
            logger.error(f"HTTP send error: {e}")
            return False

    async def send_websocket_data(self, websocket, data: Dict[str, Any]) -> bool:
        """Send data via WebSocket"""
        try:
            message = {
                'type': 'sensor_data',
                'data': [data],
                'timestamp': datetime.now(timezone.utc).isoformat()
            }
            await websocket.send(json.dumps(message))
            return True
        except Exception as e:
            logger.error(f"WebSocket send error: {e}")
            return False

    async def run_simulation(self, duration: int = 3600, use_websocket: bool = True):
        """Run the sensor simulation"""
        logger.info(f"Starting sensor simulation for {duration} seconds")
        logger.info(f"Session ID: {self.session_id}")
        
        websocket = None
        if use_websocket:
            try:
                websocket = await websockets.connect(f"{self.websocket_url}/ws/realtime")
                logger.info("WebSocket connected")
            except Exception as e:
                logger.error(f"WebSocket connection failed: {e}")
                use_websocket = False
        
        start_time = time.time()
        measurement_count = 0
        
        try:
            while time.time() - start_time < duration:
                # Generate sensor data
                encoder_data = await self.generate_encoder_data()
                imu_data = await self.generate_imu_data()
                laser_data = await self.generate_laser_data()
                alignment_data = await self.generate_alignment_data()
                camera_trigger = await self.generate_camera_trigger()
                
                # Send data
                measurements = [encoder_data, imu_data, laser_data, alignment_data]
                if camera_trigger:
                    measurements.append(camera_trigger)
                
                for measurement in measurements:
                    # Send via HTTP
                    await self.send_http_data(measurement)
                    
                    # Send via WebSocket if available
                    if websocket and use_websocket:
                        await self.send_websocket_data(websocket, measurement)
                    
                    measurement_count += 1
                
                # Check for defects
                defects = await self.detect_defects()
                for defect in defects:
                    try:
                        async with httpx.AsyncClient() as client:
                            await client.post(
                                f"{self.backend_url}/api/v1/defects",
                                json=defect,
                                timeout=5.0
                            )
                    except Exception as e:
                        logger.error(f"Defect send error: {e}")
                
                # Log progress
                if measurement_count % 100 == 0:
                    logger.info(f"Sent {measurement_count} measurements, chainage: {self.chainage:.1f}m")
                
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

async def main():
    parser = argparse.ArgumentParser(description='ITMS Sensor Simulator')
    parser.add_argument('--backend-url', default='http://localhost:8000',
                       help='Backend API URL')
    parser.add_argument('--websocket-url', default='ws://localhost:8000',
                       help='WebSocket URL')
    parser.add_argument('--duration', type=int, default=3600,
                       help='Simulation duration in seconds')
    parser.add_argument('--no-websocket', action='store_true',
                       help='Disable WebSocket communication')
    
    args = parser.parse_args()
    
    simulator = SensorSimulator(args.backend_url, args.websocket_url)
    await simulator.run_simulation(
        duration=args.duration,
        use_websocket=not args.no_websocket
    )

if __name__ == "__main__":
    asyncio.run(main())
