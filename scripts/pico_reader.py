#!/usr/bin/env python3
"""
ITMS Pico Data Reader
Reads JSON data from Raspberry Pi Pico and forwards to backend
"""

import serial
import json
import asyncio
import httpx
import websockets
import argparse
import logging
import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PicoDataReader:
    def __init__(self, port: str, baudrate: int = 115200, backend_url: str = "http://localhost:8000"):
        self.port = port
        self.baudrate = baudrate
        self.backend_url = backend_url
        self.serial_connection: Optional[serial.Serial] = None
        self.session_id = f"pico_{int(time.time())}"
        self.measurement_count = 0
        self.error_count = 0

    def connect_serial(self) -> bool:
        """Connect to Pico via serial"""
        try:
            self.serial_connection = serial.Serial(
                port=self.port,
                baudrate=self.baudrate,
                timeout=1,
                parity=serial.PARITY_NONE,
                stopbits=serial.STOPBITS_ONE,
                bytesize=serial.EIGHTBITS
            )
            logger.info(f"Connected to Pico on {self.port} at {self.baudrate} baud")
            return True
        except Exception as e:
            logger.error(f"Failed to connect to Pico: {e}")
            return False

    def disconnect_serial(self):
        """Disconnect from Pico"""
        if self.serial_connection and self.serial_connection.is_open:
            self.serial_connection.close()
            logger.info("Disconnected from Pico")

    def read_line(self) -> Optional[str]:
        """Read a line from Pico"""
        if not self.serial_connection or not self.serial_connection.is_open:
            return None
        
        try:
            line = self.serial_connection.readline().decode('utf-8').strip()
            return line if line else None
        except Exception as e:
            logger.error(f"Serial read error: {e}")
            self.error_count += 1
            return None

    def parse_pico_data(self, line: str) -> Optional[Dict[str, Any]]:
        """Parse JSON data from Pico"""
        try:
            data = json.loads(line)
            
            # Add session metadata
            data['session_id'] = self.session_id
            data['source'] = 'pico'
            data['received_at'] = datetime.now(timezone.utc).isoformat()
            
            return data
        except json.JSONDecodeError as e:
            logger.warning(f"Invalid JSON from Pico: {line[:100]}... Error: {e}")
            self.error_count += 1
            return None
        except Exception as e:
            logger.error(f"Data parsing error: {e}")
            self.error_count += 1
            return None

    async def send_to_backend(self, data: Dict[str, Any]) -> bool:
        """Send data to backend API"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.backend_url}/api/v1/measurements",
                    json=data,
                    timeout=5.0
                )
                return response.status_code == 201
        except Exception as e:
            logger.error(f"Backend send error: {e}")
            return False

    async def send_to_websocket(self, websocket, data: Dict[str, Any]) -> bool:
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

    async def run(self, duration: int = 3600, use_websocket: bool = True):
        """Run the Pico data reader"""
        logger.info(f"Starting Pico data reader for {duration} seconds")
        logger.info(f"Session ID: {self.session_id}")
        
        if not self.connect_serial():
            return
        
        websocket = None
        if use_websocket:
            try:
                websocket = await websockets.connect(f"{self.backend_url.replace('http', 'ws')}/ws/realtime")
                logger.info("WebSocket connected")
            except Exception as e:
                logger.error(f"WebSocket connection failed: {e}")
                use_websocket = False
        
        start_time = time.time()
        last_stats_time = start_time
        
        try:
            while time.time() - start_time < duration:
                # Read data from Pico
                line = self.read_line()
                
                if line:
                    # Parse the data
                    data = self.parse_pico_data(line)
                    
                    if data:
                        # Send to backend
                        success = await self.send_to_backend(data)
                        
                        # Send to WebSocket if available
                        if websocket and use_websocket:
                            await self.send_to_websocket(websocket, data)
                        
                        if success:
                            self.measurement_count += 1
                        else:
                            self.error_count += 1
                    
                    # Log progress every 10 seconds
                    if time.time() - last_stats_time >= 10:
                        logger.info(f"Processed {self.measurement_count} measurements, {self.error_count} errors")
                        last_stats_time = time.time()
                
                # Small delay to prevent excessive CPU usage
                await asyncio.sleep(0.01)
                
        except KeyboardInterrupt:
            logger.info("Data reader interrupted by user")
        except Exception as e:
            logger.error(f"Data reader error: {e}")
        finally:
            self.disconnect_serial()
            if websocket:
                await websocket.close()
                logger.info("WebSocket disconnected")
            
            logger.info(f"Data reader completed. Processed {self.measurement_count} measurements, {self.error_count} errors")

    def get_available_ports(self) -> list:
        """Get list of available serial ports"""
        import serial.tools.list_ports
        ports = serial.tools.list_ports.comports()
        return [port.device for port in ports]

def main():
    parser = argparse.ArgumentParser(description='ITMS Pico Data Reader')
    parser.add_argument('--port', required=True,
                       help='Serial port (e.g., /dev/ttyUSB0 or COM3)')
    parser.add_argument('--baudrate', type=int, default=115200,
                       help='Serial baudrate')
    parser.add_argument('--backend-url', default='http://localhost:8000',
                       help='Backend API URL')
    parser.add_argument('--duration', type=int, default=3600,
                       help='Reading duration in seconds')
    parser.add_argument('--no-websocket', action='store_true',
                       help='Disable WebSocket communication')
    parser.add_argument('--list-ports', action='store_true',
                       help='List available serial ports')
    
    args = parser.parse_args()
    
    reader = PicoDataReader(args.port, args.baudrate, args.backend_url)
    
    if args.list_ports:
        ports = reader.get_available_ports()
        print("Available serial ports:")
        for port in ports:
            print(f"  {port}")
        return
    
    asyncio.run(reader.run(
        duration=args.duration,
        use_websocket=not args.no_websocket
    ))

if __name__ == "__main__":
    main()
