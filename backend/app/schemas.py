"""
Pydantic schemas for request/response validation
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

# Base schemas
class MeasurementBase(BaseModel):
    chainage: float = Field(..., description="Track chainage in meters")
    timestamp: datetime = Field(..., description="Measurement timestamp")
    type: str = Field(..., description="Measurement type (gauge, alignment, acceleration, etc.)")
    value: float = Field(..., description="Measurement value")
    sensor_id: str = Field(..., description="Sensor identifier")

class DefectLogBase(BaseModel):
    location: float = Field(..., description="Defect location in meters")
    defect_type: str = Field(..., description="Type of defect")
    severity: int = Field(..., ge=1, le=5, description="Defect severity (1-5)")
    reviewed: bool = Field(default=False, description="Whether defect has been reviewed")
    photo_path: Optional[str] = Field(None, description="Path to defect photo")

class VideoFrameBase(BaseModel):
    timestamp: datetime = Field(..., description="Video frame timestamp")
    camera_id: str = Field(..., description="Camera identifier")
    filepath: str = Field(..., description="Path to video file")
    annotations: Optional[str] = Field(None, description="AI annotations")

# Request schemas
class MeasurementCreate(MeasurementBase):
    pass

class DefectLogCreate(DefectLogBase):
    pass

class VideoFrameCreate(VideoFrameBase):
    pass

# Response schemas
class Measurement(MeasurementBase):
    id: int = Field(..., description="Measurement ID")
    
    class Config:
        from_attributes = True

class DefectLog(DefectLogBase):
    id: int = Field(..., description="Defect log ID")
    
    class Config:
        from_attributes = True

class VideoFrame(VideoFrameBase):
    id: int = Field(..., description="Video frame ID")
    
    class Config:
        from_attributes = True

# Batch schemas
class BatchMeasurementCreate(BaseModel):
    measurements: List[MeasurementCreate] = Field(..., description="List of measurements")

class BatchDefectLogCreate(BaseModel):
    defects: List[DefectLogCreate] = Field(..., description="List of defects")

# Query schemas
class MeasurementQuery(BaseModel):
    start_timestamp: Optional[datetime] = None
    end_timestamp: Optional[datetime] = None
    sensor_id: Optional[str] = None
    measurement_type: Optional[str] = None
    chainage_start: Optional[float] = None
    chainage_end: Optional[float] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)

class DefectLogQuery(BaseModel):
    start_location: Optional[float] = None
    end_location: Optional[float] = None
    defect_type: Optional[str] = None
    min_severity: Optional[int] = None
    reviewed: Optional[bool] = None
    limit: int = Field(default=100, le=1000)
    offset: int = Field(default=0, ge=0)

# Statistics schemas
class MeasurementStats(BaseModel):
    total_count: int
    avg_value: float
    min_value: float
    max_value: float
    std_dev: float
    time_range: dict

class DefectStats(BaseModel):
    total_defects: int
    by_type: dict
    by_severity: dict
    reviewed_count: int
    pending_count: int

# System status schemas
class SystemStatus(BaseModel):
    status: str = Field(..., description="System status (online, offline, error)")
    timestamp: datetime = Field(..., description="Status timestamp")
    components: dict = Field(..., description="Component statuses")
    metrics: dict = Field(..., description="System metrics")

class HealthCheck(BaseModel):
    status: str = Field(..., description="Health status")
    timestamp: datetime = Field(..., description="Check timestamp")
    version: str = Field(..., description="System version")
    uptime: float = Field(..., description="System uptime in seconds")
    database: bool = Field(..., description="Database connectivity")
    sensors: dict = Field(..., description="Sensor statuses")

# WebSocket message schemas
class WebSocketMessage(BaseModel):
    type: str = Field(..., description="Message type")
    data: dict = Field(..., description="Message data")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class SensorDataMessage(WebSocketMessage):
    type: str = Field(default="sensor_data")
    data: List[MeasurementCreate] = Field(..., description="Sensor data")

class DefectAlertMessage(WebSocketMessage):
    type: str = Field(default="defect_alert")
    data: DefectLogCreate = Field(..., description="Defect alert data")

class SystemStatusMessage(WebSocketMessage):
    type: str = Field(default="system_status")
    data: SystemStatus = Field(..., description="System status data")

# Export schemas
class ExportRequest(BaseModel):
    format: str = Field(..., description="Export format (csv, json, hdf5)")
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    measurement_types: Optional[List[str]] = None
    sensor_ids: Optional[List[str]] = None
    include_metadata: bool = Field(default=True)
    compress: bool = Field(default=True)

class ExportResponse(BaseModel):
    filename: str = Field(..., description="Export filename")
    size: int = Field(..., description="File size in bytes")
    download_url: str = Field(..., description="Download URL")
    expires_at: datetime = Field(..., description="URL expiration time")
