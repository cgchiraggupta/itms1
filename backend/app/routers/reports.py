"""
ITMS Reports API Router
Handles report generation and data export
"""

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import csv
import io
import json
import zipfile
import os

from app.db import get_session
from app.models import Measurement, DefectLog, VideoFrame, MeasurementStats, DefectStats

router = APIRouter()

@router.get("/reports/measurements/csv")
async def export_measurements_csv(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    measurement_type: Optional[str] = Query(None, description="Filter by measurement type"),
    sensor_id: Optional[str] = Query(None, description="Filter by sensor ID"),
    session: Session = Depends(get_session)
):
    """Export measurements to CSV format"""
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
    
    measurements = query.order_by(Measurement.timestamp).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Chainage', 'Timestamp', 'Type', 'Value', 'Sensor ID', 'Quality', 'Metadata'
    ])
    
    # Write data
    for measurement in measurements:
        writer.writerow([
            measurement.id,
            measurement.chainage,
            measurement.timestamp.isoformat(),
            measurement.type,
            measurement.value,
            measurement.sensor_id,
            measurement.quality,
            measurement.metadata
        ])
    
    # Return CSV response
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=measurements.csv"}
    )

@router.get("/reports/defects/csv")
async def export_defects_csv(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    defect_type: Optional[str] = Query(None, description="Filter by defect type"),
    severity: Optional[int] = Query(None, description="Filter by severity level"),
    reviewed: Optional[bool] = Query(None, description="Filter by review status"),
    session: Session = Depends(get_session)
):
    """Export defects to CSV format"""
    query = session.query(DefectLog)
    
    # Apply filters
    if start_chainage is not None:
        query = query.filter(DefectLog.chainage >= start_chainage)
    if end_chainage is not None:
        query = query.filter(DefectLog.chainage <= end_chainage)
    if start_time is not None:
        query = query.filter(DefectLog.chainage >= start_chainage)  # Assuming chainage correlates with time
    if end_time is not None:
        query = query.filter(DefectLog.chainage <= end_chainage)
    if defect_type is not None:
        query = query.filter(DefectLog.defect_type == defect_type)
    if severity is not None:
        query = query.filter(DefectLog.severity == severity)
    if reviewed is not None:
        query = query.filter(DefectLog.reviewed == reviewed)
    
    defects = query.order_by(DefectLog.chainage).all()
    
    # Create CSV content
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        'ID', 'Chainage', 'Defect Type', 'Severity', 'Description', 
        'Reviewed', 'Reviewed By', 'Reviewed At', 'Photo Path', 'Measurement ID'
    ])
    
    # Write data
    for defect in defects:
        writer.writerow([
            defect.id,
            defect.chainage,
            defect.defect_type,
            defect.severity,
            defect.description,
            defect.reviewed,
            defect.reviewed_by,
            defect.reviewed_at.isoformat() if defect.reviewed_at else None,
            defect.photo_path,
            defect.measurement_id
        ])
    
    # Return CSV response
    output.seek(0)
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=defects.csv"}
    )

@router.get("/reports/summary")
async def get_report_summary(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    session: Session = Depends(get_session)
):
    """Generate a summary report with statistics"""
    from sqlalchemy import func
    
    # Get measurement statistics
    measurement_query = session.query(Measurement)
    if start_chainage is not None:
        measurement_query = measurement_query.filter(Measurement.chainage >= start_chainage)
    if end_chainage is not None:
        measurement_query = measurement_query.filter(Measurement.chainage <= end_chainage)
    if start_time is not None:
        measurement_query = measurement_query.filter(Measurement.timestamp >= start_time)
    if end_time is not None:
        measurement_query = measurement_query.filter(Measurement.timestamp <= end_time)
    
    measurement_stats = measurement_query.with_entities(
        func.count(Measurement.id).label('total_measurements'),
        func.avg(Measurement.value).label('avg_value'),
        func.min(Measurement.value).label('min_value'),
        func.max(Measurement.value).label('max_value'),
        func.count(func.distinct(Measurement.sensor_id)).label('active_sensors')
    ).first()
    
    # Get defect statistics
    defect_query = session.query(DefectLog)
    if start_chainage is not None:
        defect_query = defect_query.filter(DefectLog.chainage >= start_chainage)
    if end_chainage is not None:
        defect_query = defect_query.filter(DefectLog.chainage <= end_chainage)
    
    defect_stats = defect_query.with_entities(
        func.count(DefectLog.id).label('total_defects'),
        func.count(func.distinct(DefectLog.defect_type)).label('defect_types'),
        func.sum(func.case([(DefectLog.reviewed == True, 1)], else_=0)).label('reviewed_defects')
    ).first()
    
    # Get video frame statistics
    video_query = session.query(VideoFrame)
    if start_chainage is not None:
        video_query = video_query.filter(VideoFrame.chainage >= start_chainage)
    if end_chainage is not None:
        video_query = video_query.filter(VideoFrame.chainage <= end_chainage)
    if start_time is not None:
        video_query = video_query.filter(VideoFrame.timestamp >= start_time)
    if end_time is not None:
        video_query = video_query.filter(VideoFrame.timestamp <= end_time)
    
    video_stats = video_query.with_entities(
        func.count(VideoFrame.id).label('total_frames'),
        func.count(func.distinct(VideoFrame.camera_id)).label('active_cameras')
    ).first()
    
    return {
        "report_period": {
            "start_chainage": start_chainage,
            "end_chainage": end_chainage,
            "start_time": start_time,
            "end_time": end_time
        },
        "measurements": {
            "total_count": measurement_stats.total_measurements or 0,
            "average_value": float(measurement_stats.avg_value or 0),
            "min_value": float(measurement_stats.min_value or 0),
            "max_value": float(measurement_stats.max_value or 0),
            "active_sensors": measurement_stats.active_sensors or 0
        },
        "defects": {
            "total_count": defect_stats.total_defects or 0,
            "defect_types": defect_stats.defect_types or 0,
            "reviewed_count": defect_stats.reviewed_defects or 0,
            "pending_count": (defect_stats.total_defects or 0) - (defect_stats.reviewed_defects or 0)
        },
        "video": {
            "total_frames": video_stats.total_frames or 0,
            "active_cameras": video_stats.active_cameras or 0
        },
        "generated_at": datetime.utcnow().isoformat()
    }

@router.get("/reports/export/all")
async def export_all_data(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    session: Session = Depends(get_session)
):
    """Export all data as a ZIP file containing CSV files"""
    
    # Create in-memory ZIP file
    zip_buffer = io.BytesIO()
    
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        # Export measurements
        measurements_csv = await export_measurements_csv(
            start_chainage, end_chainage, start_time, end_time, None, None, session
        )
        zip_file.writestr("measurements.csv", measurements_csv.body)
        
        # Export defects
        defects_csv = await export_defects_csv(
            start_chainage, end_chainage, start_time, end_time, None, None, None, session
        )
        zip_file.writestr("defects.csv", defects_csv.body)
        
        # Export summary report
        summary = await get_report_summary(
            start_chainage, end_chainage, start_time, end_time, session
        )
        zip_file.writestr("summary.json", json.dumps(summary, indent=2))
    
    zip_buffer.seek(0)
    
    return StreamingResponse(
        io.BytesIO(zip_buffer.getvalue()),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=itms_export.zip"}
    )

@router.get("/reports/health-assessment")
async def get_track_health_assessment(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    session: Session = Depends(get_session)
):
    """Generate track health assessment report"""
    from sqlalchemy import func
    
    # Get defect statistics by severity
    defect_query = session.query(DefectLog)
    if start_chainage is not None:
        defect_query = defect_query.filter(DefectLog.chainage >= start_chainage)
    if end_chainage is not None:
        defect_query = defect_query.filter(DefectLog.chainage <= end_chainage)
    
    severity_stats = defect_query.with_entities(
        DefectLog.severity,
        func.count(DefectLog.id).label('count')
    ).group_by(DefectLog.severity).all()
    
    # Calculate health score (0-100)
    total_defects = sum(stat.count for stat in severity_stats)
    critical_defects = sum(stat.count for stat in severity_stats if stat.severity == 4)
    high_defects = sum(stat.count for stat in severity_stats if stat.severity == 3)
    
    # Health score calculation (higher score = better health)
    health_score = 100
    if total_defects > 0:
        health_score -= (critical_defects * 20)  # -20 points per critical defect
        health_score -= (high_defects * 10)      # -10 points per high severity defect
        health_score = max(0, health_score)
    
    # Generate recommendations
    recommendations = []
    if critical_defects > 0:
        recommendations.append("Immediate attention required for critical defects")
    if high_defects > 5:
        recommendations.append("High number of high-severity defects detected")
    if health_score < 50:
        recommendations.append("Track condition requires comprehensive inspection")
    if health_score > 80:
        recommendations.append("Track condition is good, continue regular monitoring")
    
    return {
        "chainage_range": {
            "start": start_chainage,
            "end": end_chainage
        },
        "health_score": health_score,
        "defect_summary": {
            "total_defects": total_defects,
            "critical_defects": critical_defects,
            "high_severity_defects": high_defects,
            "by_severity": {stat.severity: stat.count for stat in severity_stats}
        },
        "recommendations": recommendations,
        "assessment_date": datetime.utcnow().isoformat()
    }
