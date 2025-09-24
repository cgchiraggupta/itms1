"""
ITMS Database Configuration
Database engine, session management, and connection setup
"""

from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event
from sqlalchemy.engine import Engine
import os
from typing import Generator

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://itms:secret@localhost:5432/itmsdb"
)

# For development, fallback to SQLite
if DATABASE_URL.startswith("postgresql://") and "localhost" in DATABASE_URL:
    # Check if PostgreSQL is available, fallback to SQLite
    try:
        import psycopg2
        # Test connection
        conn = psycopg2.connect(DATABASE_URL)
        conn.close()
    except:
        print("⚠️  PostgreSQL not available, using SQLite for development")
        DATABASE_URL = "sqlite:///./itms.db"

# Create database engine
engine = create_engine(
    DATABASE_URL,
    echo=os.getenv("DEBUG", "false").lower() == "true",
    pool_pre_ping=True,
    pool_recycle=300
)

# SQLite specific configuration
if DATABASE_URL.startswith("sqlite"):
    @event.listens_for(Engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

def create_db_and_tables():
    """Create database tables"""
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    """Dependency to get database session"""
    with Session(engine) as session:
        yield session

# Database health check
def check_db_connection() -> bool:
    """Check if database connection is healthy"""
    try:
        with Session(engine) as session:
            session.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

# Database initialization
def init_database():
    """Initialize database with default data"""
    create_db_and_tables()
    
    # Add default system configuration
    with Session(engine) as session:
        from app.models import SystemConfig
        
        # Check if config already exists
        existing_config = session.query(SystemConfig).first()
        if not existing_config:
            default_configs = [
                SystemConfig(
                    key="sample_rate",
                    value="1000",
                    description="Default sensor sample rate in Hz"
                ),
                SystemConfig(
                    key="camera_trigger_interval",
                    value="100",
                    description="Camera trigger interval in encoder pulses"
                ),
                SystemConfig(
                    key="data_retention_days",
                    value="30",
                    description="Data retention period in days"
                ),
                SystemConfig(
                    key="vibration_threshold",
                    value="2.0",
                    description="Vibration alert threshold in g"
                ),
                SystemConfig(
                    key="speed_threshold",
                    value="200",
                    description="Speed alert threshold in km/h"
                ),
                SystemConfig(
                    key="gauge_tolerance",
                    value="0.02",
                    description="Gauge measurement tolerance in meters"
                )
            ]
            
            for config in default_configs:
                session.add(config)
            
            session.commit()
            print("✅ Default system configuration added")

if __name__ == "__main__":
    # Test database connection
    if check_db_connection():
        print("✅ Database connection successful")
        init_database()
    else:
        print("❌ Database connection failed")
