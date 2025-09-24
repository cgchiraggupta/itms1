"""
ITMS Admin API Router
Handles administrative functions and system management
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.db import get_session
from app.models import SystemConfig, DataSession, Measurement, DefectLog, VideoFrame

router = APIRouter()

@router.get("/system/config")
async def get_system_config(session: Session = Depends(get_session)):
    """Get all system configuration parameters"""
    configs = session.query(SystemConfig).all()
    return {config.key: {
        "value": config.value,
        "description": config.description,
        "updated_at": config.updated_at
    } for config in configs}

@router.put("/system/config/{config_key}")
async def update_system_config(
    config_key: str,
    value: str,
    description: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Update a system configuration parameter"""
    config = session.query(SystemConfig).filter(SystemConfig.key == config_key).first()
    
    if not config:
        # Create new config if it doesn't exist
        config = SystemConfig(
            key=config_key,
            value=value,
            description=description or f"Configuration for {config_key}"
        )
        session.add(config)
    else:
        config.value = value
        if description:
            config.description = description
        config.updated_at = datetime.utcnow()
    
    session.commit()
    session.refresh(config)
    
    return {"message": f"Configuration {config_key} updated successfully"}

@router.get("/system/status")
async def get_system_status(session: Session = Depends(get_session)):
    """Get overall system status and health"""
    from sqlalchemy import func
    
    # Get database statistics
    total_measurements = session.query(func.count(Measurement.id)).scalar()
    total_defects = session.query(func.count(DefectLog.id)).scalar()
    total_video_frames = session.query(func.count(VideoFrame.id)).scalar()
    
    # Get recent activity (last 24 hours)
    recent_time = datetime.utcnow() - timedelta(hours=24)
    recent_measurements = session.query(func.count(Measurement.id)).filter(
        Measurement.timestamp >= recent_time
    ).scalar()
    
    recent_defects = session.query(func.count(DefectLog.id)).filter(
        DefectLog.chainage >= 0  # Assuming recent defects have higher chainage
    ).scalar()
    
    # Get active sessions
    active_sessions = session.query(DataSession).filter(
        DataSession.status == "active"
    ).count()
    
    # Calculate system health score
    health_score = 100
    if total_defects > 0:
        # Reduce health score based on defect count
        health_score -= min(50, total_defects * 2)
    
    if recent_measurements == 0:
        # No recent measurements - system might be down
        health_score -= 30
    
    health_score = max(0, health_score)
    
    return {
        "status": "healthy" if health_score > 70 else "warning" if health_score > 40 else "critical",
        "health_score": health_score,
        "database": {
            "total_measurements": total_measurements,
            "total_defects": total_defects,
            "total_video_frames": total_video_frames,
            "recent_measurements_24h": recent_measurements,
            "recent_defects": recent_defects
        },
        "sessions": {
            "active_sessions": active_sessions
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@router.post("/sessions")
async def create_data_session(
    session_name: str,
    start_chainage: float,
    notes: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Create a new data collection session"""
    data_session = DataSession(
        session_name=session_name,
        start_time=datetime.utcnow(),
        start_chainage=start_chainage,
        status="active",
        notes=notes
    )
    
    session.add(data_session)
    session.commit()
    session.refresh(data_session)
    
    return {
        "message": "Data session created successfully",
        "session_id": data_session.id,
        "session_name": data_session.session_name
    }

@router.get("/sessions")
async def get_data_sessions(
    status: Optional[str] = Query(None, description="Filter by session status"),
    limit: int = Query(50, description="Maximum number of sessions to return"),
    session: Session = Depends(get_session)
):
    """Get data collection sessions"""
    query = session.query(DataSession)
    
    if status is not None:
        query = query.filter(DataSession.status == status)
    
    sessions = query.order_by(DataSession.start_time.desc()).limit(limit).all()
    
    return sessions

@router.put("/sessions/{session_id}/end")
async def end_data_session(
    session_id: int,
    end_chainage: Optional[float] = None,
    notes: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """End a data collection session"""
    data_session = session.query(DataSession).filter(DataSession.id == session_id).first()
    
    if not data_session:
        raise HTTPException(status_code=404, detail="Data session not found")
    
    if data_session.status != "active":
        raise HTTPException(status_code=400, detail="Session is not active")
    
    data_session.end_time = datetime.utcnow()
    data_session.end_chainage = end_chainage
    data_session.status = "completed"
    
    if notes:
        data_session.notes = (data_session.notes or "") + f"\nEnd notes: {notes}"
    
    # Calculate session statistics
    from sqlalchemy import func
    
    measurement_count = session.query(func.count(Measurement.id)).filter(
        Measurement.chainage >= data_session.start_chainage,
        Measurement.chainage <= (end_chainage or data_session.start_chainage)
    ).scalar()
    
    defect_count = session.query(func.count(DefectLog.id)).filter(
        DefectLog.chainage >= data_session.start_chainage,
        DefectLog.chainage <= (end_chainage or data_session.start_chainage)
    ).scalar()
    
    data_session.total_measurements = measurement_count
    data_session.total_defects = defect_count
    
    session.commit()
    session.refresh(data_session)
    
    return {
        "message": "Data session ended successfully",
        "session_id": data_session.id,
        "total_measurements": measurement_count,
        "total_defects": defect_count
    }

@router.get("/sessions/{session_id}")
async def get_data_session(
    session_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific data collection session"""
    data_session = session.query(DataSession).filter(DataSession.id == session_id).first()
    
    if not data_session:
        raise HTTPException(status_code=404, detail="Data session not found")
    
    return data_session

@router.delete("/sessions/{session_id}")
async def delete_data_session(
    session_id: int,
    session: Session = Depends(get_session)
):
    """Delete a data collection session"""
    data_session = session.query(DataSession).filter(DataSession.id == session_id).first()
    
    if not data_session:
        raise HTTPException(status_code=404, detail="Data session not found")
    
    session.delete(data_session)
    session.commit()
    
    return {"message": "Data session deleted successfully"}

@router.get("/system/cleanup")
async def get_cleanup_recommendations(session: Session = Depends(get_session)):
    """Get recommendations for data cleanup and maintenance"""
    from sqlalchemy import func
    
    # Get data retention configuration
    retention_config = session.query(SystemConfig).filter(
        SystemConfig.key == "data_retention_days"
    ).first()
    
    retention_days = int(retention_config.value) if retention_config else 30
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
    
    # Count old records
    old_measurements = session.query(func.count(Measurement.id)).filter(
        Measurement.timestamp < cutoff_date
    ).scalar()
    
    old_defects = session.query(func.count(DefectLog.id)).filter(
        DefectLog.chainage < 0  # Assuming old defects have negative chainage
    ).scalar()
    
    old_video_frames = session.query(func.count(VideoFrame.id)).filter(
        VideoFrame.timestamp < cutoff_date
    ).scalar()
    
    # Get database size estimate
    total_records = (
        session.query(func.count(Measurement.id)).scalar() +
        session.query(func.count(DefectLog.id)).scalar() +
        session.query(func.count(VideoFrame.id)).scalar()
    )
    
    recommendations = []
    
    if old_measurements > 1000:
        recommendations.append(f"Consider archiving {old_measurements} old measurements")
    
    if old_defects > 100:
        recommendations.append(f"Review and archive {old_defects} old defect records")
    
    if old_video_frames > 50:
        recommendations.append(f"Archive {old_video_frames} old video frames")
    
    if total_records > 100000:
        recommendations.append("Database size is large, consider implementing data archiving")
    
    return {
        "retention_policy": {
            "retention_days": retention_days,
            "cutoff_date": cutoff_date.isoformat()
        },
        "old_records": {
            "measurements": old_measurements,
            "defects": old_defects,
            "video_frames": old_video_frames
        },
        "total_records": total_records,
        "recommendations": recommendations,
        "generated_at": datetime.utcnow().isoformat()
    }

@router.post("/system/cleanup/execute")
async def execute_cleanup(
    cleanup_measurements: bool = False,
    cleanup_defects: bool = False,
    cleanup_video: bool = False,
    dry_run: bool = True,
    session: Session = Depends(get_session)
):
    """Execute data cleanup operations"""
    from sqlalchemy import func
    
    # Get data retention configuration
    retention_config = session.query(SystemConfig).filter(
        SystemConfig.key == "data_retention_days"
    ).first()
    
    retention_days = int(retention_config.value) if retention_config else 30
    cutoff_date = datetime.utcnow() - timedelta(days=retention_days)
    
    results = {
        "dry_run": dry_run,
        "cutoff_date": cutoff_date.isoformat(),
        "operations": []
    }
    
    if cleanup_measurements:
        old_measurements = session.query(Measurement).filter(
            Measurement.timestamp < cutoff_date
        )
        
        count = old_measurements.count()
        
        if not dry_run and count > 0:
            old_measurements.delete()
            session.commit()
        
        results["operations"].append({
            "type": "measurements",
            "records_affected": count,
            "executed": not dry_run
        })
    
    if cleanup_defects:
        old_defects = session.query(DefectLog).filter(
            DefectLog.chainage < 0  # Assuming old defects have negative chainage
        )
        
        count = old_defects.count()
        
        if not dry_run and count > 0:
            old_defects.delete()
            session.commit()
        
        results["operations"].append({
            "type": "defects",
            "records_affected": count,
            "executed": not dry_run
        })
    
    if cleanup_video:
        old_video_frames = session.query(VideoFrame).filter(
            VideoFrame.timestamp < cutoff_date
        )
        
        count = old_video_frames.count()
        
        if not dry_run and count > 0:
            old_video_frames.delete()
            session.commit()
        
        results["operations"].append({
            "type": "video_frames",
            "records_affected": count,
            "executed": not dry_run
        })
    
    results["timestamp"] = datetime.utcnow().isoformat()
    
    return results
