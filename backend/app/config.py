"""
Configuration settings for the ITMS backend
"""

import os
from typing import Optional
from pydantic import BaseSettings, Field

class Settings(BaseSettings):
    # Database settings
    database_url: str = Field(
        default="postgresql://itms:secret@localhost:5432/itmsdb",
        env="DATABASE_URL"
    )
    
    # API settings
    api_title: str = Field(default="ITMS API", env="API_TITLE")
    api_version: str = Field(default="1.0.0", env="API_VERSION")
    api_description: str = Field(
        default="Integrated Track Monitoring System API",
        env="API_DESCRIPTION"
    )
    
    # Security settings
    secret_key: str = Field(
        default="your-secret-key-change-in-production",
        env="SECRET_KEY"
    )
    access_token_expire_minutes: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    
    # CORS settings
    cors_origins: list = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="CORS_ORIGINS"
    )
    
    # File storage settings
    storage_path: str = Field(default="./storage", env="STORAGE_PATH")
    max_file_size: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB
    allowed_file_types: list = Field(
        default=["jpg", "jpeg", "png", "mp4", "avi", "mov"],
        env="ALLOWED_FILE_TYPES"
    )
    
    # Data retention settings
    data_retention_days: int = Field(default=30, env="DATA_RETENTION_DAYS")
    cleanup_interval_hours: int = Field(default=24, env="CLEANUP_INTERVAL_HOURS")
    
    # Sensor settings
    max_sample_rate: int = Field(default=1000, env="MAX_SAMPLE_RATE")
    default_sample_rate: int = Field(default=200, env="DEFAULT_SAMPLE_RATE")
    
    # Alert settings
    vibration_threshold: float = Field(default=2.0, env="VIBRATION_THRESHOLD")
    gauge_tolerance: float = Field(default=0.02, env="GAUGE_TOLERANCE")
    speed_threshold: float = Field(default=200, env="SPEED_THRESHOLD")
    
    # WebSocket settings
    websocket_heartbeat_interval: int = Field(default=30, env="WEBSOCKET_HEARTBEAT_INTERVAL")
    max_websocket_connections: int = Field(default=100, env="MAX_WEBSOCKET_CONNECTIONS")
    
    # Logging settings
    log_level: str = Field(default="INFO", env="LOG_LEVEL")
    log_file: Optional[str] = Field(default=None, env="LOG_FILE")
    
    # Redis settings (for production scaling)
    redis_url: Optional[str] = Field(default=None, env="REDIS_URL")
    
    # Email settings (for notifications)
    smtp_server: Optional[str] = Field(default=None, env="SMTP_SERVER")
    smtp_port: int = Field(default=587, env="SMTP_PORT")
    smtp_username: Optional[str] = Field(default=None, env="SMTP_USERNAME")
    smtp_password: Optional[str] = Field(default=None, env="SMTP_PASSWORD")
    smtp_use_tls: bool = Field(default=True, env="SMTP_USE_TLS")
    
    # Development settings
    debug: bool = Field(default=False, env="DEBUG")
    reload: bool = Field(default=False, env="RELOAD")
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# Global settings instance
settings = Settings()

# Environment-specific configurations
class DevelopmentSettings(Settings):
    debug: bool = True
    reload: bool = True
    log_level: str = "DEBUG"

class ProductionSettings(Settings):
    debug: bool = False
    reload: bool = False
    log_level: str = "WARNING"

class TestingSettings(Settings):
    database_url: str = "sqlite:///./test.db"
    debug: bool = True
    log_level: str = "DEBUG"

def get_settings() -> Settings:
    """Get settings based on environment"""
    env = os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()
