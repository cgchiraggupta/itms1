"""
ITMS Measurements API Router
Handles measurement data ingestion and retrieval
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.db import get_session
from app.models import (
    Measurement, MeasurementCreate, MeasurementResponse,
    MeasurementType, SensorType, MeasurementStats
)

router = APIRouter()

@router.post("/measurements", response_model=MeasurementResponse)
async def create_measurement(
    measurement: MeasurementCreate,
    session: Session = Depends(get_session)
):
    """Create a new measurement record"""
    try:
        db_measurement = Measurement(**measurement.dict())
        session.add(db_measurement)
        session.commit()
        session.refresh(db_measurement)
        
        # Broadcast to WebSocket clients
        from app.realtime import manager
        await manager.broadcast_sensor_data({
            "chainage": db_measurement.chainage,
            "type": db_measurement.type,
            "value": db_measurement.value,
            "sensor_id": db_measurement.sensor_id,
            "timestamp": db_measurement.timestamp.isoformat()
        })
        
        return db_measurement
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating measurement: {str(e)}")

@router.post("/measurements/batch", response_model=List[MeasurementResponse])
async def create_measurements_batch(
    measurements: List[MeasurementCreate],
    session: Session = Depends(get_session)
):
    """Create multiple measurement records in a batch"""
    try:
        db_measurements = []
        for measurement in measurements:
            db_measurement = Measurement(**measurement.dict())
            session.add(db_measurement)
            db_measurements.append(db_measurement)
        
        session.commit()
        
        # Refresh all measurements
        for measurement in db_measurements:
            session.refresh(measurement)
        
        # Broadcast batch data to WebSocket clients
        from app.realtime import manager
        batch_data = []
        for measurement in db_measurements:
            batch_data.append({
                "chainage": measurement.chainage,
                "type": measurement.type,
                "value": measurement.value,
                "sensor_id": measurement.sensor_id,
                "timestamp": measurement.timestamp.isoformat()
            })
        
        await manager.broadcast_json({
            "type": "batch_measurements",
            "data": batch_data,
            "count": len(batch_data),
            "timestamp": datetime.utcnow().isoformat()
        })
        
        return db_measurements
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating measurements: {str(e)}")

@router.get("/measurements", response_model=List[MeasurementResponse])
async def get_measurements(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    measurement_type: Optional[MeasurementType] = Query(None, description="Filter by measurement type"),
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    limit: int = Query(1000, description="Maximum number of records to return"),
    offset: int = Query(0, description="Number of records to skip"),
    session: Session = Depends(get_session)
):
    """Get measurements with optional filtering"""
    query = session.query(Measurement)
    
    # Apply filters
    if start_chainage is not None:
        query = query.filter(Measurement.chainage >= start_chainage)
    if end_chainage is not None:
        query = query.filter(Measurement.chainage <= end_chainage)
    if start_time is not None:
        query = query.filter(Measurement.timestamp >= start_time)
    if end_time is not None:
        query = query.filter(Measurement.timestamp <= end_time)
    if measurement_type is not None:
        query = query.filter(Measurement.type == measurement_type)
    if sensor_id is not None:
        query = query.filter(Measurement.sensor_id == sensor_id)
    
    # Apply pagination
    query = query.order_by(Measurement.timestamp.desc())
    query = query.offset(offset).limit(limit)
    
    measurements = query.all()
    return measurements

@router.get("/measurements/stats", response_model=List[MeasurementStats])
async def get_measurement_stats(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    group_by: str = Query("sensor_id", description="Group by: sensor_id, type, or both"),
    session: Session = Depends(get_session)
):
    """Get measurement statistics"""
    query = session.query(Measurement)
    
    # Apply filters
    if start_chainage is not None:
        query = query.filter(Measurement.chainage >= start_chainage)
    if end_chainage is not None:
        query = query.filter(Measurement.chainage <= end_chainage)
    if start_time is not None:
        query = query.filter(Measurement.timestamp >= start_time)
    if end_time is not None:
        query = query.filter(Measurement.timestamp <= end_time)
    
    # Group by specified field
    if group_by == "sensor_id":
        stats = query.with_entities(
            Measurement.sensor_id,
            func.count(Measurement.id).label('total_count'),
            func.avg(Measurement.value).label('avg_value'),
            func.min(Measurement.value).label('min_value'),
            func.max(Measurement.value).label('max_value'),
            func.stddev(Measurement.value).label('std_dev')
        ).group_by(Measurement.sensor_id).all()
        
        return [
            MeasurementStats(
                total_count=stat.total_count,
                avg_value=float(stat.avg_value or 0),
                min_value=float(stat.min_value or 0),
                max_value=float(stat.max_value or 0),
                std_dev=float(stat.std_dev or 0),
                measurement_type=None,
                sensor_id=stat.sensor_id,
                time_range=f"{start_time or 'all'} to {end_time or 'now'}"
            )
            for stat in stats
        ]
    
    elif group_by == "type":
        stats = query.with_entities(
            Measurement.type,
            func.count(Measurement.id).label('total_count'),
            func.avg(Measurement.value).label('avg_value'),
            func.min(Measurement.value).label('min_value'),
            func.max(Measurement.value).label('max_value'),
            func.stddev(Measurement.value).label('std_dev')
        ).group_by(Measurement.type).all()
        
        return [
            MeasurementStats(
                total_count=stat.total_count,
                avg_value=float(stat.avg_value or 0),
                min_value=float(stat.min_value or 0),
                max_value=float(stat.max_value or 0),
                std_dev=float(stat.std_dev or 0),
                measurement_type=stat.type,
                sensor_id="all",
                time_range=f"{start_time or 'all'} to {end_time or 'now'}"
            )
            for stat in stats
        ]
    
    else:
        raise HTTPException(status_code=400, detail="Invalid group_by parameter")

@router.get("/measurements/latest", response_model=List[MeasurementResponse])
async def get_latest_measurements(
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    limit: int = Query(100, description="Number of latest measurements to return"),
    session: Session = Depends(get_session)
):
    """Get the latest measurements"""
    query = session.query(Measurement)
    
    if sensor_id is not None:
        query = query.filter(Measurement.sensor_id == sensor_id)
    
    measurements = query.order_by(Measurement.timestamp.desc()).limit(limit).all()
    return measurements

@router.get("/measurements/chainage/{chainage}", response_model=List[MeasurementResponse])
async def get_measurements_at_chainage(
    chainage: float,
    tolerance: float = Query(1.0, description="Tolerance in meters"),
    session: Session = Depends(get_session)
):
    """Get measurements at a specific chainage with tolerance"""
    measurements = session.query(Measurement).filter(
        and_(
            Measurement.chainage >= chainage - tolerance,
            Measurement.chainage <= chainage + tolerance
        )
    ).order_by(Measurement.timestamp.desc()).all()
    
    return measurements

@router.delete("/measurements/{measurement_id}")
async def delete_measurement(
    measurement_id: int,
    session: Session = Depends(get_session)
):
    """Delete a measurement record"""
    measurement = session.query(Measurement).filter(Measurement.id == measurement_id).first()
    
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    
    session.delete(measurement)
    session.commit()
    
    return {"message": "Measurement deleted successfully"}

@router.get("/sensors", response_model=List[str])
async def get_sensor_list(session: Session = Depends(get_session)):
    """Get list of all sensor IDs that have made measurements"""
    sensors = session.query(Measurement.sensor_id).distinct().all()
    return [sensor[0] for sensor in sensors]

@router.get("/measurement-types", response_model=List[str])
async def get_measurement_types():
    """Get list of all available measurement types"""
    return [measurement_type.value for measurement_type in MeasurementType]
