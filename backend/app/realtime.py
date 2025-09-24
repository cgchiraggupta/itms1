"""
ITMS Real-time WebSocket Manager
Handles WebSocket connections for live data streaming
"""

import json
import asyncio
from typing import List, Dict, Any
from fastapi import WebSocket
from datetime import datetime, timezone

class ConnectionManager:
    """Manages WebSocket connections for real-time data broadcasting"""
    
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str = None):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Store connection metadata
        self.connection_metadata[websocket] = {
            "client_id": client_id or f"client_{len(self.active_connections)}",
            "connected_at": datetime.now(timezone.utc),
            "last_ping": datetime.now(timezone.utc),
            "subscriptions": set()
        }
        
        print(f"🔌 WebSocket client connected: {self.connection_metadata[websocket]['client_id']}")
        
        # Send welcome message
        await self.send_personal_message({
            "type": "connection_established",
            "client_id": self.connection_metadata[websocket]['client_id'],
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "message": "Connected to ITMS real-time data stream"
        }, websocket)
    
    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            client_id = self.connection_metadata.get(websocket, {}).get('client_id', 'unknown')
            self.active_connections.remove(websocket)
            if websocket in self.connection_metadata:
                del self.connection_metadata[websocket]
            print(f"🔌 WebSocket client disconnected: {client_id}")
    
    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            print(f"❌ Error sending personal message: {e}")
            self.disconnect(websocket)
    
    async def broadcast(self, message: str):
        """Broadcast a message to all connected clients"""
        if not self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception as e:
                print(f"❌ Error broadcasting to client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def broadcast_json(self, message: Dict[str, Any]):
        """Broadcast a JSON message to all connected clients"""
        await self.broadcast(json.dumps(message))
    
    async def broadcast_sensor_data(self, sensor_data: Dict[str, Any]):
        """Broadcast sensor data to subscribed clients"""
        message = {
            "type": "sensor_data",
            "data": sensor_data,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_json(message)
    
    async def broadcast_defect_alert(self, defect_data: Dict[str, Any]):
        """Broadcast defect alert to all clients"""
        message = {
            "type": "defect_alert",
            "data": defect_data,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "priority": "high"
        }
        await self.broadcast_json(message)
    
    async def broadcast_system_status(self, status: Dict[str, Any]):
        """Broadcast system status update"""
        message = {
            "type": "system_status",
            "data": status,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.broadcast_json(message)
    
    def get_connection_count(self) -> int:
        """Get the number of active connections"""
        return len(self.active_connections)
    
    def get_connection_info(self) -> List[Dict[str, Any]]:
        """Get information about all active connections"""
        info = []
        for websocket, metadata in self.connection_metadata.items():
            info.append({
                "client_id": metadata["client_id"],
                "connected_at": metadata["connected_at"].isoformat(),
                "last_ping": metadata["last_ping"].isoformat(),
                "subscriptions": list(metadata["subscriptions"])
            })
        return info
    
    async def ping_all_clients(self):
        """Send ping to all clients to check connection health"""
        ping_message = {
            "type": "ping",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(ping_message))
                # Update last ping time
                if connection in self.connection_metadata:
                    self.connection_metadata[connection]["last_ping"] = datetime.now(timezone.utc)
            except Exception as e:
                print(f"❌ Ping failed for client: {e}")
                disconnected.append(connection)
        
        # Remove disconnected clients
        for connection in disconnected:
            self.disconnect(connection)
    
    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Handle incoming messages from clients"""
        try:
            data = json.loads(message)
            message_type = data.get("type")
            
            if message_type == "ping":
                # Respond to ping
                await self.send_personal_message({
                    "type": "pong",
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }, websocket)
            
            elif message_type == "subscribe":
                # Handle subscription requests
                subscriptions = data.get("subscriptions", [])
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["subscriptions"].update(subscriptions)
                    await self.send_personal_message({
                        "type": "subscription_confirmed",
                        "subscriptions": list(self.connection_metadata[websocket]["subscriptions"]),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }, websocket)
            
            elif message_type == "unsubscribe":
                # Handle unsubscription requests
                subscriptions = data.get("subscriptions", [])
                if websocket in self.connection_metadata:
                    self.connection_metadata[websocket]["subscriptions"].difference_update(subscriptions)
                    await self.send_personal_message({
                        "type": "unsubscription_confirmed",
                        "subscriptions": list(self.connection_metadata[websocket]["subscriptions"]),
                        "timestamp": datetime.now(timezone.utc).isoformat()
                    }, websocket)
            
            else:
                # Echo unknown message types
                await self.send_personal_message({
                    "type": "echo",
                    "original_message": data,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }, websocket)
                
        except json.JSONDecodeError:
            await self.send_personal_message({
                "type": "error",
                "message": "Invalid JSON format",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }, websocket)
        except Exception as e:
            await self.send_personal_message({
                "type": "error",
                "message": f"Error processing message: {str(e)}",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }, websocket)

# Global connection manager instance
manager = ConnectionManager()

# Background task for connection health monitoring
async def monitor_connections():
    """Background task to monitor WebSocket connections"""
    while True:
        try:
            await manager.ping_all_clients()
            await asyncio.sleep(30)  # Ping every 30 seconds
        except Exception as e:
            print(f"❌ Error in connection monitoring: {e}")
            await asyncio.sleep(5)
