"""
Utility functions for the ITMS backend
"""

import os
import json
import csv
import io
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi.responses import StreamingResponse
import pandas as pd
import numpy as np

def generate_timestamp() -> str:
    """Generate ISO format timestamp"""
    return datetime.utcnow().isoformat()

def validate_chainage(chainage: float) -> bool:
    """Validate chainage value"""
    return 0 <= chainage <= 100000  # Max 100km

def validate_measurement_value(value: float, measurement_type: str) -> bool:
    """Validate measurement value based on type"""
    validators = {
        'gauge': lambda v: 1.4 <= v <= 1.8,  # Standard gauge range
        'alignment': lambda v: -10 <= v <= 10,  # Alignment in mm
        'acceleration': lambda v: 0 <= v <= 10,  # Acceleration in g
        'level': lambda v: -50 <= v <= 50,  # Level in mm
        'twist': lambda v: -10 <= v <= 10,  # Twist in mm
    }
    
    validator = validators.get(measurement_type)
    return validator(value) if validator else True

def calculate_statistics(data: List[float]) -> Dict[str, float]:
    """Calculate basic statistics for a dataset"""
    if not data:
        return {}
    
    data_array = np.array(data)
    return {
        'count': len(data),
        'mean': float(np.mean(data_array)),
        'median': float(np.median(data_array)),
        'std': float(np.std(data_array)),
        'min': float(np.min(data_array)),
        'max': float(np.max(data_array)),
        'q25': float(np.percentile(data_array, 25)),
        'q75': float(np.percentile(data_array, 75))
    }

def detect_anomalies(data: List[float], threshold: float = 2.0) -> List[int]:
    """Detect anomalies using z-score method"""
    if len(data) < 3:
        return []
    
    data_array = np.array(data)
    z_scores = np.abs((data_array - np.mean(data_array)) / np.std(data_array))
    return np.where(z_scores > threshold)[0].tolist()

def format_chainage(chainage: float) -> str:
    """Format chainage for display"""
    if chainage < 1000:
        return f"{chainage:.1f}m"
    else:
        return f"{chainage/1000:.2f}km"

def create_csv_response(data: List[Dict], filename: str) -> StreamingResponse:
    """Create CSV response from data"""
    output = io.StringIO()
    
    if data:
        writer = csv.DictWriter(output, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
    
    output.seek(0)
    
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def create_json_response(data: List[Dict], filename: str) -> StreamingResponse:
    """Create JSON response from data"""
    json_data = json.dumps(data, indent=2, default=str)
    
    return StreamingResponse(
        io.BytesIO(json_data.encode('utf-8')),
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def create_hdf5_response(data: List[Dict], filename: str) -> StreamingResponse:
    """Create HDF5 response from data"""
    # Convert to pandas DataFrame
    df = pd.DataFrame(data)
    
    # Create HDF5 in memory
    buffer = io.BytesIO()
    df.to_hdf(buffer, 'data', mode='w', format='table')
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

def get_measurement_color(value: float, measurement_type: str) -> str:
    """Get color code for measurement value"""
    if measurement_type == 'gauge':
        if 1.65 <= value <= 1.68:
            return 'green'  # Normal
        elif 1.63 <= value <= 1.70:
            return 'yellow'  # Warning
        else:
            return 'red'  # Critical
    
    elif measurement_type == 'acceleration':
        if value <= 1.0:
            return 'green'  # Normal
        elif value <= 2.0:
            return 'yellow'  # Warning
        else:
            return 'red'  # Critical
    
    return 'blue'  # Default

def calculate_track_quality_score(measurements: List[Dict]) -> float:
    """Calculate overall track quality score (0-100)"""
    if not measurements:
        return 0.0
    
    scores = []
    for measurement in measurements:
        value = measurement['value']
        measurement_type = measurement['type']
        
        if measurement_type == 'gauge':
            # Gauge quality score
            if 1.65 <= value <= 1.68:
                scores.append(100)
            elif 1.63 <= value <= 1.70:
                scores.append(80)
            else:
                scores.append(40)
        
        elif measurement_type == 'acceleration':
            # Acceleration quality score
            if value <= 1.0:
                scores.append(100)
            elif value <= 2.0:
                scores.append(80)
            else:
                scores.append(40)
        
        elif measurement_type == 'alignment':
            # Alignment quality score
            if abs(value) <= 2:
                scores.append(100)
            elif abs(value) <= 5:
                scores.append(80)
            else:
                scores.append(40)
    
    return float(np.mean(scores)) if scores else 0.0

def generate_report_summary(measurements: List[Dict], defects: List[Dict]) -> Dict[str, Any]:
    """Generate summary for reports"""
    if not measurements:
        return {}
    
    # Calculate statistics
    gauge_measurements = [m for m in measurements if m['type'] == 'gauge']
    acceleration_measurements = [m for m in measurements if m['type'] == 'acceleration']
    
    summary = {
        'total_measurements': len(measurements),
        'measurement_period': {
            'start': min(m['timestamp'] for m in measurements),
            'end': max(m['timestamp'] for m in measurements)
        },
        'chainage_range': {
            'start': min(m['chainage'] for m in measurements),
            'end': max(m['chainage'] for m in measurements)
        },
        'gauge_stats': calculate_statistics([m['value'] for m in gauge_measurements]) if gauge_measurements else {},
        'acceleration_stats': calculate_statistics([m['value'] for m in acceleration_measurements]) if acceleration_measurements else {},
        'total_defects': len(defects),
        'defects_by_severity': {},
        'track_quality_score': calculate_track_quality_score(measurements)
    }
    
    # Defect severity breakdown
    if defects:
        severity_counts = {}
        for defect in defects:
            severity = defect['severity']
            severity_counts[severity] = severity_counts.get(severity, 0) + 1
        summary['defects_by_severity'] = severity_counts
    
    return summary

def validate_file_upload(filename: str, max_size: int = 10 * 1024 * 1024) -> bool:
    """Validate uploaded file"""
    # Check file extension
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.mp4', '.avi', '.mov'}
    file_ext = os.path.splitext(filename)[1].lower()
    
    if file_ext not in allowed_extensions:
        return False
    
    # Check file size (would need file object for actual size check)
    return True

def sanitize_filename(filename: str) -> str:
    """Sanitize filename for safe storage"""
    # Remove dangerous characters
    dangerous_chars = ['..', '/', '\\', ':', '*', '?', '"', '<', '>', '|']
    for char in dangerous_chars:
        filename = filename.replace(char, '_')
    
    # Limit length
    if len(filename) > 255:
        name, ext = os.path.splitext(filename)
        filename = name[:255-len(ext)] + ext
    
    return filename

def get_storage_path(category: str, filename: str) -> str:
    """Get storage path for files"""
    base_path = os.getenv('STORAGE_PATH', './storage')
    timestamp = datetime.now().strftime('%Y/%m/%d')
    return os.path.join(base_path, category, timestamp, filename)

def create_directory_if_not_exists(path: str) -> None:
    """Create directory if it doesn't exist"""
    os.makedirs(path, exist_ok=True)

def cleanup_old_files(directory: str, days: int = 30) -> int:
    """Clean up files older than specified days"""
    if not os.path.exists(directory):
        return 0
    
    cutoff_date = datetime.now() - timedelta(days=days)
    deleted_count = 0
    
    for root, dirs, files in os.walk(directory):
        for file in files:
            file_path = os.path.join(root, file)
            if os.path.getmtime(file_path) < cutoff_date.timestamp():
                try:
                    os.remove(file_path)
                    deleted_count += 1
                except OSError:
                    pass
    
    return deleted_count

def format_bytes(bytes_value: int) -> str:
    """Format bytes to human readable format"""
    for unit in ['B', 'KB', 'MB', 'GB', 'TB']:
        if bytes_value < 1024.0:
            return f"{bytes_value:.1f} {unit}"
        bytes_value /= 1024.0
    return f"{bytes_value:.1f} PB"

def get_system_info() -> Dict[str, Any]:
    """Get system information"""
    import psutil
    import platform
    
    return {
        'platform': platform.system(),
        'platform_version': platform.version(),
        'python_version': platform.python_version(),
        'cpu_count': psutil.cpu_count(),
        'memory_total': psutil.virtual_memory().total,
        'memory_available': psutil.virtual_memory().available,
        'disk_usage': psutil.disk_usage('/').percent,
        'uptime': psutil.boot_time()
    }
