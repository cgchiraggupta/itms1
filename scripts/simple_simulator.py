#!/usr/bin/env python3
"""
Simple ITMS Sensor Simulator
Generates realistic sensor data without external dependencies
"""

import asyncio
import json
import random
import time
import math
from datetime import datetime, timezone
from typing import Dict, List, Any
import argparse
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SimpleSensorSimulator:
    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.chainage = 0.0
        self.speed = 0.0
        self.session_id = f"sim_{int(time.time())}"
        
        # GPS coordinates (simulating a railway track in Delhi)
        self.current_lat = 28.6139
        self.current_lng = 77.2090
        
        # Track conditions
        self.track_conditions = {
            'gauge_variation': 0.02,
            'alignment_faults': 0.1,
            'surface_defects': 0.05,
            'joint_defects': 0.03,
            'rail_wear': 0.02
        }

    async def start_simulation(self, duration: int = 3600):
        """Start the sensor simulation"""
        logger.info(f"Starting Simple ITMS Sensor Simulation for {duration} seconds")
        logger.info(f"Session ID: {self.session_id}")
        
        start_time = time.time()
        measurement_count = 0
        
        try:
            while time.time() - start_time < duration:
                # Update position
                await self.update_position()
                
                # Generate sensor data
                sensor_data = await self.generate_sensor_data()
                
                # Send data to backend
                await self.send_data_to_backend(sensor_data)
                
                # Generate defects occasionally
                if random.random() < 0.01:  # 1% chance
                    await self.generate_defect()
                
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
            logger.info(f"Simulation completed. Total measurements: {measurement_count}")

    async def update_position(self):
        """Update train position and GPS coordinates"""
        # Simulate train movement
        self.speed = random.uniform(50, 200)  # km/h
        distance_increment = (self.speed / 3.6) * 0.1  # Convert to m/s and multiply by 0.1s interval
        self.chainage += distance_increment
        
        # Update GPS coordinates (simulating movement along a railway track)
        lat_offset = random.gauss(0, 0.00001)  # ~1m accuracy
        lng_offset = random.gauss(0, 0.00001)
        
        self.current_lat += lat_offset
        self.current_lng += lng_offset

    async def generate_sensor_data(self) -> List[Dict[str, Any]]:
        """Generate comprehensive sensor data"""
        measurements = []
        
        # Encoder data
        encoder_data = {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'position',
            'value': self.chainage,
            'sensor_id': 'encoder_axle',
            'speed': self.speed,
            'pulses': int(self.chainage * 1000),  # 1000 pulses per meter
            'direction': 1 if self.speed > 0 else -1
        }
        measurements.append(encoder_data)
        
        # IMU data
        t = time.time()
        vibration = 0.5 * random.gauss(0, 1) * (1 + 0.5 * math.sin(2 * math.pi * 10 * t))
        
        accel_x = vibration + random.gauss(0, 0.1)
        accel_y = random.gauss(0, 0.1)
        accel_z = 9.81 + random.gauss(0, 0.1)  # Gravity + noise
        
        magnitude = math.sqrt(accel_x**2 + accel_y**2 + accel_z**2)
        
        imu_data = {
            'chainage': self.chainage,
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
        measurements.append(imu_data)
        
        # GPS data
        gps_data = {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'gps_position',
            'value': 1.0,
            'sensor_id': 'gps_tracker',
            'latitude': self.current_lat,
            'longitude': self.current_lng,
            'altitude': 216.0,
            'accuracy': random.uniform(2.0, 5.0),
            'speed': self.speed,
            'heading': random.uniform(0, 360)
        }
        measurements.append(gps_data)
        
        # Laser gauge data
        base_gauge = 1.676  # Standard gauge
        variation = random.gauss(0, 0.005)  # ±5mm standard deviation
        speed_effect = (self.speed - 100) * 0.0001  # Slight gauge widening at high speed
        gauge = base_gauge + variation + speed_effect
        
        gauge_data = {
            'chainage': self.chainage,
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'type': 'gauge',
            'value': gauge,
            'sensor_id': 'laser_profilometer',
            'threshold': 0.02,
            'anomaly_detected': abs(gauge - base_gauge) > 0.02,
            'deviation': abs(gauge - base_gauge)
        }
        measurements.append(gauge_data)
        
        return measurements

    async def generate_defect(self):
        """Generate a random defect"""
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
        
        await self.send_defect_to_backend(defect)

    async def send_data_to_backend(self, data: List[Dict[str, Any]]):
        """Send sensor data to backend"""
        for measurement in data:
            try:
                # Simulate HTTP request (in real implementation, use httpx)
                logger.debug(f"Sending measurement: {measurement['type']} at {measurement['chainage']:.1f}m")
                
                # In a real implementation, you would use:
                # async with httpx.AsyncClient() as client:
                #     response = await client.post(
                #         f"{self.backend_url}/api/v1/measurements",
                #         json=measurement,
                #         timeout=5.0
                #     )
                
            except Exception as e:
                logger.error(f"Failed to send data: {e}")

    async def send_defect_to_backend(self, defect: Dict[str, Any]):
        """Send defect data to backend"""
        try:
            logger.info(f"Defect detected: {defect['defect_type']} at {defect['location']:.1f}m (Severity: {defect['severity']})")
            
            # In a real implementation, you would use:
            # async with httpx.AsyncClient() as client:
            #     response = await client.post(
            #         f"{self.backend_url}/api/v1/defects",
            #         json=defect,
            #         timeout=5.0
            #     )
                
        except Exception as e:
            logger.error(f"Failed to send defect: {e}")


async def main():
    parser = argparse.ArgumentParser(description='Simple ITMS Sensor Simulator')
    parser.add_argument('--backend-url', default='http://localhost:8000',
                       help='Backend API URL')
    parser.add_argument('--duration', type=int, default=3600,
                       help='Simulation duration in seconds')
    
    args = parser.parse_args()
    
    simulator = SimpleSensorSimulator(args.backend_url)
    await simulator.start_simulation(duration=args.duration)


if __name__ == "__main__":
    asyncio.run(main())
