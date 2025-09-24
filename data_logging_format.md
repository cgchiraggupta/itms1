# Data Logging Format Specification

## Overview
This document defines the data logging format for the Integrated Track Monitoring System. The format is designed for high-speed, synchronized multi-sensor data streams with efficient storage and retrieval capabilities.

## Design Principles
1. **Synchronization**: All sensor data must be timestamped with microsecond precision
2. **Efficiency**: Binary format for minimal storage overhead
3. **Scalability**: Support for variable number of sensors and data rates
4. **Integrity**: Built-in checksums and error detection
5. **Compatibility**: Easy conversion to standard formats (CSV, JSON, HDF5)

## Data Format Structure

### 1. File Header (Fixed Size: 256 bytes)
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | uint32  | Magic Number (0x544D5353 = "TMSS")
4      | 4    | uint32  | Format Version (1)
8      | 8    | uint64  | File Creation Timestamp (Unix microseconds)
16     | 8    | uint64  | System Start Timestamp
24     | 4    | uint32  | Number of Sensors
28     | 4    | uint32  | Sample Rate (Hz)
32     | 4    | uint32  | Block Size (bytes)
36     | 4    | uint32  | Checksum (CRC32 of header)
40     | 216  | char[]  | Reserved for future use
```

### 2. Sensor Configuration Block
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | uint32  | Sensor ID
4      | 4    | uint32  | Sensor Type (enum)
8      | 4    | uint32  | Data Size per Sample (bytes)
12     | 4    | uint32  | Sample Rate (Hz)
16     | 32   | char[]  | Sensor Name
48     | 32   | char[]  | Sensor Model
80     | 32   | char[]  | Calibration Data
112    | 16   | char[]  | Reserved
```

### 3. Data Block Structure
Each data block contains synchronized samples from all sensors:

```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 8    | uint64  | Block Timestamp (microseconds)
8      | 4    | uint32  | Block Sequence Number
12     | 4    | uint32  | Number of Samples in Block
16     | 4    | uint32  | Block Size (bytes)
20     | 4    | uint32  | Block Checksum (CRC32)
24     | N    | data[]  | Sensor Data (interleaved)
```

### 4. Individual Sensor Data Packets
Each sensor data packet within a block:

```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | uint32  | Sensor ID
4      | 4    | uint32  | Data Size (bytes)
8      | 4    | uint32  | Sample Count
12     | 4    | uint32  | Data Checksum
16     | N    | data[]  | Actual Sensor Data
```

## Sensor Data Types

### 1. Encoder Data (Sensor ID: 0x01)
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | int32   | Position (pulses)
4      | 4    | int32   | Velocity (pulses/second)
8      | 4    | uint32  | Pulse Count
12     | 1    | uint8   | Direction (0=reverse, 1=forward)
13     | 1    | uint8   | Index Detected
14     | 2    | uint16  | Reserved
```

### 2. IMU Data (Sensor ID: 0x02)
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | float   | Accelerometer X (g)
4      | 4    | float   | Accelerometer Y (g)
8      | 4    | float   | Accelerometer Z (g)
12     | 4    | float   | Gyroscope X (deg/s)
16     | 4    | float   | Gyroscope Y (deg/s)
20     | 4    | float   | Gyroscope Z (deg/s)
24     | 4    | float   | Temperature (°C)
28     | 4    | uint32  | Sample Quality (0-100)
```

### 3. Camera Data (Sensor ID: 0x03)
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | uint32  | Frame Number
4      | 4    | uint32  | Trigger Timestamp
8      | 4    | uint32  | Exposure Time (μs)
12     | 4    | uint32  | Image Width
16     | 4    | uint32  | Image Height
20     | 4    | uint32  | Image Size (bytes)
24     | 4    | uint32  | Image Checksum
28     | 256  | char[]  | Image File Path
```

### 4. Laser/Profilometer Data (Sensor ID: 0x04)
```
Offset | Size | Type    | Description
-------|------|---------|------------
0      | 4    | uint32  | Measurement Count
4      | 4    | float   | Average Distance (mm)
8      | 4    | float   | Min Distance (mm)
12     | 4    | float   | Max Distance (mm)
16     | 4    | float   | Standard Deviation
20     | 4    | uint32  | Data Points per Sample
24     | N    | float[] | Distance Measurements
```

## Data Synchronization Strategy

### 1. Master Clock
- System uses high-resolution timer (1μs precision)
- All sensors synchronized to master clock
- Timestamp propagation through data chain

### 2. Sample Alignment
- Data blocks contain samples from same time window
- Missing samples marked with special flags
- Interpolation for minor timing differences

### 3. Buffer Management
- Circular buffers for each sensor
- Overflow protection and error handling
- Real-time data streaming capability

## File Organization

### 1. Directory Structure
```
/data/
├── sessions/
│   ├── 2024-01-15_10-30-00/
│   │   ├── header.bin
│   │   ├── config.bin
│   │   ├── data_000001.bin
│   │   ├── data_000002.bin
│   │   └── ...
│   └── 2024-01-15_11-45-00/
└── images/
    ├── 2024-01-15_10-30-00/
    │   ├── frame_000001.jpg
    │   ├── frame_000002.jpg
    │   └── ...
    └── 2024-01-15_11-45-00/
```

### 2. File Naming Convention
- **Sessions**: `YYYY-MM-DD_HH-MM-SS`
- **Data Files**: `data_XXXXXX.bin` (sequential numbering)
- **Images**: `frame_XXXXXX.jpg` (sequential numbering)
- **Logs**: `system_YYYY-MM-DD.log`

## Data Export Formats

### 1. CSV Export
```csv
timestamp_us,encoder_position,encoder_velocity,accel_x,accel_y,accel_z,gyro_x,gyro_y,gyro_z,frame_number
1705312200000000,1250,1500,0.123,-0.456,9.801,0.012,-0.034,0.056,1
1705312200010000,1251,1500,0.124,-0.455,9.802,0.013,-0.033,0.057,1
```

### 2. JSON Export
```json
{
  "session_info": {
    "start_time": "2024-01-15T10:30:00.000Z",
    "duration": 3600,
    "sensors": ["encoder", "imu", "camera", "laser"]
  },
  "data": [
    {
      "timestamp": 1705312200000000,
      "encoder": {"position": 1250, "velocity": 1500},
      "imu": {"accel": [0.123, -0.456, 9.801], "gyro": [0.012, -0.034, 0.056]},
      "camera": {"frame": 1, "path": "images/frame_000001.jpg"}
    }
  ]
}
```

### 3. HDF5 Export
- Hierarchical data format for scientific computing
- Compression and chunking support
- Metadata preservation
- Cross-platform compatibility

## Performance Specifications

### 1. Data Rates
- **Encoder**: 10,000 samples/second
- **IMU**: 1,000 samples/second
- **Camera**: 10-100 frames/second
- **Laser**: 1,000 samples/second
- **Total**: ~50 MB/second

### 2. Storage Requirements
- **1 hour session**: ~180 GB
- **8 hour shift**: ~1.4 TB
- **Compression ratio**: 3:1 (with lossless compression)

### 3. Real-time Processing
- **Latency**: <10ms end-to-end
- **Buffer size**: 1 second of data
- **Overflow handling**: Drop oldest data

## Error Handling

### 1. Data Integrity
- CRC32 checksums for all blocks
- Redundant timestamp verification
- Sensor health monitoring

### 2. Recovery Mechanisms
- Automatic file rotation on errors
- Partial data recovery
- Corrupted block detection

### 3. Logging
- System events and errors
- Performance metrics
- Data quality statistics

## Implementation Notes

### 1. C/C++ Implementation
```c
typedef struct {
    uint64_t timestamp_us;
    uint32_t sequence;
    uint32_t sample_count;
    uint32_t checksum;
    sensor_data_t sensors[MAX_SENSORS];
} data_block_t;
```

### 2. Python Reader
```python
import struct
import numpy as np

def read_data_block(file_handle):
    header = struct.unpack('<QIIII', file_handle.read(24))
    timestamp, sequence, samples, size, checksum = header
    
    data = file_handle.read(size - 24)
    # Verify checksum and parse sensor data
    return timestamp, sequence, samples, data
```

### 3. MATLAB Interface
```matlab
function data = readDAQFile(filename)
    fid = fopen(filename, 'r');
    header = fread(fid, 256, 'uint8');
    % Parse header and read data blocks
    fclose(fid);
end
```

This format provides a robust foundation for high-speed railway track monitoring data acquisition with excellent performance and reliability characteristics.
