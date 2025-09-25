"""
ITMS Database Models - SQLModel ORM
Defines the database schema for the Integrated Track Monitoring System
"""

from typing import Optional, List
from datetime import datetime
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum

class MeasurementType(str, Enum):
    """Types of measurements collected by ITMS sensors"""
    GAUGE = "gauge"
    ALIGNMENT = "alignment"
    ACCELERATION = "acceleration"
    PROFILE = "profile"
    VERTICAL = "vertical"
    LATERAL = "lateral"
    TWIST = "twist"
    CANT = "cant"
    LEVEL = "level"

class SensorType(str, Enum):
    """Types of sensors in the ITMS system"""
    LASER_FRONT = "laser_front"
    LASER_SIDE = "laser_side"
    IMU_AXLE = "imu_axle"
    IMU_BOGIE = "imu_bogie"
    LIDAR = "lidar"
    CAMERA_FRONT = "camera_front"
    CAMERA_REAR = "camera_rear"
    ENCODER = "encoder"

class DefectSeverity(int, Enum):
    """Defect severity levels"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

class DefectType(str, Enum):
    """Types of track defects detected"""
    GAUGE_EXCESS = "gauge_excess"
    GAUGE_DEFICIENCY = "gauge_deficiency"
    ALIGNMENT_FAULT = "alignment_fault"
    VERTICAL_FAULT = "vertical_fault"
    TWIST_FAULT = "twist_fault"
    CANT_FAULT = "cant_fault"
    RAIL_WEAR = "rail_wear"
    JOINT_DEFECT = "joint_defect"
    SLEEPER_DEFECT = "sleeper_defect"
    BALLAST_DEFECT = "ballast_defect"

# Base model for common fields
class TimestampMixin(SQLModel):
    """Mixin for timestamp fields"""
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = Field(default=None)

# Core measurement model
class Measurement(SQLModel, table=True):
    """Sensor measurement data"""
    id: Optional[int] = Field(default=None, primary_key=True)
    chainage: float = Field(description="Distance along track in meters")
    timestamp: datetime = Field(description="Measurement timestamp")
    type: MeasurementType = Field(description="Type of measurement")
    value: float = Field(description="Measured value")
    sensor_id: str = Field(description="ID of the sensor that made the measurement")
    quality: Optional[float] = Field(default=None, description="Data quality score (0-1)")
    sensor_metadata: Optional[str] = Field(default=None, description="Additional sensor metadata as JSON")
    
    # Relationships
    defects: List["DefectLog"] = Relationship(back_populates="measurement")

# Defect logging model
class DefectLog(SQLModel, table=True):
    """Track defects and anomalies detected"""
    id: Optional[int] = Field(default=None, primary_key=True)
    chainage: float = Field(description="Location of defect in meters")
    defect_type: DefectType = Field(description="Type of defect")
    severity: DefectSeverity = Field(description="Severity level")
    description: Optional[str] = Field(default=None, description="Detailed description")
    reviewed: bool = Field(default=False, description="Whether defect has been reviewed")
    reviewed_by: Optional[str] = Field(default=None, description="Reviewer name")
    reviewed_at: Optional[datetime] = Field(default=None, description="Review timestamp")
    photo_path: Optional[str] = Field(default=None, description="Path to evidence photo")
    measurement_id: Optional[int] = Field(default=None, foreign_key="measurement.id")
    
    # Relationships
    measurement: Optional[Measurement] = Relationship(back_populates="defects")

# Video frame model
class VideoFrame(SQLModel, table=True):
    """Video frame metadata and annotations"""
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(description="Frame capture timestamp")
    chainage: float = Field(description="Track location when frame was captured")
    camera_id: str = Field(description="Camera that captured the frame")
    filepath: str = Field(description="Path to video file")
    frame_number: Optional[int] = Field(default=None, description="Frame number in video")
    annotations: Optional[str] = Field(default=None, description="ML annotations as JSON")
    confidence: Optional[float] = Field(default=None, description="ML confidence score")
    processed: bool = Field(default=False, description="Whether frame has been processed")

# System configuration model
class SystemConfig(SQLModel, table=True):
    """System configuration parameters"""
    id: Optional[int] = Field(default=None, primary_key=True)
    key: str = Field(unique=True, description="Configuration key")
    value: str = Field(description="Configuration value")
    description: Optional[str] = Field(default=None, description="Configuration description")
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Session tracking model
class DataSession(SQLModel, table=True):
    """Data collection session tracking"""
    id: Optional[int] = Field(default=None, primary_key=True)
    session_name: str = Field(description="Name of the data collection session")
    start_time: datetime = Field(description="Session start time")
    end_time: Optional[datetime] = Field(default=None, description="Session end time")
    start_chainage: float = Field(description="Starting chainage")
    end_chainage: Optional[float] = Field(default=None, description="Ending chainage")
    total_measurements: int = Field(default=0, description="Total measurements collected")
    total_defects: int = Field(default=0, description="Total defects detected")
    status: str = Field(default="active", description="Session status")
    notes: Optional[str] = Field(default=None, description="Session notes")

# Pydantic models for API requests/responses
class MeasurementCreate(SQLModel):
    """Schema for creating new measurements"""
    chainage: float
    timestamp: datetime
    type: MeasurementType
    value: float
    sensor_id: str
    quality: Optional[float] = None
    sensor_metadata: Optional[str] = None

class MeasurementResponse(SQLModel):
    """Schema for measurement API responses"""
    id: int
    chainage: float
    timestamp: datetime
    type: MeasurementType
    value: float
    sensor_id: str
    quality: Optional[float] = None
    sensor_metadata: Optional[str] = None

class DefectCreate(SQLModel):
    """Schema for creating new defects"""
    chainage: float
    defect_type: DefectType
    severity: DefectSeverity
    description: Optional[str] = None
    photo_path: Optional[str] = None
    measurement_id: Optional[int] = None

class DefectResponse(SQLModel):
    """Schema for defect API responses"""
    id: int
    chainage: float
    defect_type: DefectType
    severity: DefectSeverity
    description: Optional[str] = None
    reviewed: bool
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    photo_path: Optional[str] = None
    measurement_id: Optional[int] = None

class VideoFrameCreate(SQLModel):
    """Schema for creating new video frames"""
    timestamp: datetime
    chainage: float
    camera_id: str
    filepath: str
    frame_number: Optional[int] = None
    annotations: Optional[str] = None
    confidence: Optional[float] = None

class VideoFrameResponse(SQLModel):
    """Schema for video frame API responses"""
    id: int
    timestamp: datetime
    chainage: float
    camera_id: str
    filepath: str
    frame_number: Optional[int] = None
    annotations: Optional[str] = None
    confidence: Optional[float] = None
    processed: bool

# Statistics and analytics models
class MeasurementStats(SQLModel):
    """Statistics for measurements"""
    total_count: int
    avg_value: float
    min_value: float
    max_value: float
    std_dev: float
    measurement_type: MeasurementType
    sensor_id: str
    time_range: str

class DefectStats(SQLModel):
    """Statistics for defects"""
    total_count: int
    by_severity: dict
    by_type: dict
    reviewed_count: int
    pending_count: int
    time_range: str

class TrackHealth(SQLModel):
    """Overall track health assessment"""
    chainage_range: str
    overall_score: float
    critical_defects: int
    high_severity_defects: int
    last_inspection: datetime
    recommendations: List[str]
