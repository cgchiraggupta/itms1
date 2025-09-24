"""
ITMS Backend - FastAPI Application
Integrated Track Monitoring System Backend Server
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import uvicorn
import asyncio
from typing import List

from app.db import engine, create_db_and_tables
from app.models import Measurement, DefectLog, VideoFrame
from app.routers import measurements, video, reports, admin
from app.realtime import ConnectionManager

# Global WebSocket connection manager
manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting ITMS Backend Server...")
    create_db_and_tables()
    print("✅ Database tables created")
    
    # Start background task for sensor simulation
    asyncio.create_task(simulate_sensor_data())
    
    yield
    
    # Shutdown
    print("🛑 Shutting down ITMS Backend Server...")

# Create FastAPI app
app = FastAPI(
    title="ITMS - Integrated Track Monitoring System",
    description="Backend API for railway track monitoring and data acquisition",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(measurements.router, prefix="/api/v1", tags=["measurements"])
app.include_router(video.router, prefix="/api/v1", tags=["video"])
app.include_router(reports.router, prefix="/api/v1", tags=["reports"])
app.include_router(admin.router, prefix="/api/v1", tags=["admin"])

# WebSocket endpoint for real-time data
@app.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and handle client messages
            data = await websocket.receive_text()
            # Echo back or process client messages
            await websocket.send_text(f"Echo: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ITMS Backend",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "ITMS - Integrated Track Monitoring System API",
        "docs": "/docs",
        "websocket": "/ws/realtime"
    }

# Background task to simulate sensor data
async def simulate_sensor_data():
    """Simulate sensor data for demo purposes"""
    import random
    import json
    from datetime import datetime, timezone
    from app.db import get_session
    from app.models import Measurement
    
    chainage = 0.0
    while True:
        try:
            # Simulate different sensor types
            sensor_data = [
                {
                    "chainage": chainage,
                    "timestamp": datetime.now(timezone.utc),
                    "type": "gauge",
                    "value": 1.676 + random.gauss(0, 0.02),  # Standard gauge with noise
                    "sensor_id": "laser_front"
                },
                {
                    "chainage": chainage,
                    "timestamp": datetime.now(timezone.utc),
                    "type": "acceleration",
                    "value": random.gauss(0, 0.5),  # Lateral acceleration
                    "sensor_id": "imu_axle"
                },
                {
                    "chainage": chainage,
                    "timestamp": datetime.now(timezone.utc),
                    "type": "alignment",
                    "value": random.gauss(0, 2.0),  # Track alignment
                    "sensor_id": "laser_side"
                }
            ]
            
            # Store in database
            with get_session() as session:
                for data in sensor_data:
                    measurement = Measurement(**data)
                    session.add(measurement)
                session.commit()
            
            # Broadcast to WebSocket clients
            await manager.broadcast_json({
                "type": "sensor_data",
                "data": sensor_data,
                "timestamp": datetime.now(timezone.utc).isoformat()
            })
            
            chainage += 0.25  # 25cm increments
            await asyncio.sleep(0.1)  # 10Hz update rate
            
        except Exception as e:
            print(f"Error in sensor simulation: {e}")
            await asyncio.sleep(1)

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
