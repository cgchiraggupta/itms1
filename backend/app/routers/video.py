"""
ITMS Video API Router
Handles video frame metadata and processing
"""

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import os
import shutil

from app.db import get_session
from app.models import VideoFrame, VideoFrameCreate, VideoFrameResponse

router = APIRouter()

# Video storage configuration
VIDEO_STORAGE_PATH = os.getenv("VIDEO_STORAGE_PATH", "./storage/videos")
os.makedirs(VIDEO_STORAGE_PATH, exist_ok=True)

@router.post("/video-frames", response_model=VideoFrameResponse)
async def create_video_frame(
    video_frame: VideoFrameCreate,
    session: Session = Depends(get_session)
):
    """Create a new video frame record"""
    try:
        db_video_frame = VideoFrame(**video_frame.dict())
        session.add(db_video_frame)
        session.commit()
        session.refresh(db_video_frame)
        return db_video_frame
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Error creating video frame: {str(e)}")

@router.post("/video-frames/upload")
async def upload_video_frame(
    file: UploadFile = File(...),
    chainage: float = Query(..., description="Track chainage where frame was captured"),
    camera_id: str = Query(..., description="Camera ID that captured the frame"),
    frame_number: Optional[int] = Query(None, description="Frame number in video"),
    session: Session = Depends(get_session)
):
    """Upload a video frame file and create metadata record"""
    try:
        # Generate unique filename
        timestamp = datetime.utcnow()
        filename = f"{camera_id}_{timestamp.strftime('%Y%m%d_%H%M%S')}_{frame_number or 0}.jpg"
        filepath = os.path.join(VIDEO_STORAGE_PATH, filename)
        
        # Save file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Create database record
        video_frame = VideoFrame(
            timestamp=timestamp,
            chainage=chainage,
            camera_id=camera_id,
            filepath=filepath,
            frame_number=frame_number
        )
        
        session.add(video_frame)
        session.commit()
        session.refresh(video_frame)
        
        return {
            "message": "Video frame uploaded successfully",
            "video_frame_id": video_frame.id,
            "filepath": filepath
        }
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=400, detail=f"Error uploading video frame: {str(e)}")

@router.get("/video-frames", response_model=List[VideoFrameResponse])
async def get_video_frames(
    start_chainage: Optional[float] = Query(None, description="Start chainage in meters"),
    end_chainage: Optional[float] = Query(None, description="End chainage in meters"),
    start_time: Optional[datetime] = Query(None, description="Start timestamp"),
    end_time: Optional[datetime] = Query(None, description="End timestamp"),
    camera_id: Optional[str] = Query(None, description="Filter by camera ID"),
    processed: Optional[bool] = Query(None, description="Filter by processing status"),
    limit: int = Query(100, description="Maximum number of records to return"),
    offset: int = Query(0, description="Number of records to skip"),
    session: Session = Depends(get_session)
):
    """Get video frames with optional filtering"""
    query = session.query(VideoFrame)
    
    # Apply filters
    if start_chainage is not None:
        query = query.filter(VideoFrame.chainage >= start_chainage)
    if end_chainage is not None:
        query = query.filter(VideoFrame.chainage <= end_chainage)
    if start_time is not None:
        query = query.filter(VideoFrame.timestamp >= start_time)
    if end_time is not None:
        query = query.filter(VideoFrame.timestamp <= end_time)
    if camera_id is not None:
        query = query.filter(VideoFrame.camera_id == camera_id)
    if processed is not None:
        query = query.filter(VideoFrame.processed == processed)
    
    # Apply pagination
    query = query.order_by(VideoFrame.timestamp.desc())
    query = query.offset(offset).limit(limit)
    
    video_frames = query.all()
    return video_frames

@router.get("/video-frames/{video_frame_id}", response_model=VideoFrameResponse)
async def get_video_frame(
    video_frame_id: int,
    session: Session = Depends(get_session)
):
    """Get a specific video frame by ID"""
    video_frame = session.query(VideoFrame).filter(VideoFrame.id == video_frame_id).first()
    
    if not video_frame:
        raise HTTPException(status_code=404, detail="Video frame not found")
    
    return video_frame

@router.put("/video-frames/{video_frame_id}/annotations")
async def update_video_frame_annotations(
    video_frame_id: int,
    annotations: str,
    confidence: Optional[float] = None,
    session: Session = Depends(get_session)
):
    """Update video frame annotations and processing status"""
    video_frame = session.query(VideoFrame).filter(VideoFrame.id == video_frame_id).first()
    
    if not video_frame:
        raise HTTPException(status_code=404, detail="Video frame not found")
    
    video_frame.annotations = annotations
    video_frame.confidence = confidence
    video_frame.processed = True
    
    session.commit()
    session.refresh(video_frame)
    
    return {"message": "Video frame annotations updated successfully"}

@router.get("/video-frames/chainage/{chainage}", response_model=List[VideoFrameResponse])
async def get_video_frames_at_chainage(
    chainage: float,
    tolerance: float = Query(5.0, description="Tolerance in meters"),
    session: Session = Depends(get_session)
):
    """Get video frames at a specific chainage with tolerance"""
    video_frames = session.query(VideoFrame).filter(
        VideoFrame.chainage >= chainage - tolerance,
        VideoFrame.chainage <= chainage + tolerance
    ).order_by(VideoFrame.timestamp.desc()).all()
    
    return video_frames

@router.get("/cameras", response_model=List[str])
async def get_camera_list(session: Session = Depends(get_session)):
    """Get list of all camera IDs that have captured frames"""
    cameras = session.query(VideoFrame.camera_id).distinct().all()
    return [camera[0] for camera in cameras]

@router.delete("/video-frames/{video_frame_id}")
async def delete_video_frame(
    video_frame_id: int,
    session: Session = Depends(get_session)
):
    """Delete a video frame record and file"""
    video_frame = session.query(VideoFrame).filter(VideoFrame.id == video_frame_id).first()
    
    if not video_frame:
        raise HTTPException(status_code=404, detail="Video frame not found")
    
    # Delete file if it exists
    if os.path.exists(video_frame.filepath):
        try:
            os.remove(video_frame.filepath)
        except Exception as e:
            print(f"Warning: Could not delete file {video_frame.filepath}: {e}")
    
    session.delete(video_frame)
    session.commit()
    
    return {"message": "Video frame deleted successfully"}
