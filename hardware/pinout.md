# ITMS Hardware Pinout and Connections

## Raspberry Pi Pico Pin Mapping

### Power Supply
- **VCC**: 3.3V (Pin 36)
- **GND**: Ground (Pin 38)
- **VBUS**: 5V USB power (Pin 40)

### Encoder Interface
- **Encoder A**: GPIO 16 (Pin 21)
- **Encoder B**: GPIO 17 (Pin 22)
- **Encoder Index**: GPIO 18 (Pin 24)
- **Encoder VCC**: 3.3V (Pin 36)
- **Encoder GND**: Ground (Pin 38)

### IMU (MPU-9250) - I2C Interface
- **SDA**: GPIO 20 (Pin 26)
- **SCL**: GPIO 21 (Pin 27)
- **VCC**: 3.3V (Pin 36)
- **GND**: Ground (Pin 38)
- **INT**: GPIO 19 (Pin 25) - Interrupt pin

### Camera Trigger
- **Trigger Signal**: GPIO 22 (Pin 29)
- **Camera Power**: 5V (Pin 40)
- **Camera GND**: Ground (Pin 38)

### UART Communication
- **TX**: GPIO 0 (Pin 1)
- **RX**: GPIO 1 (Pin 2)
- **GND**: Ground (Pin 38)

### Additional GPIO Pins
- **GPIO 2**: Status LED
- **GPIO 3**: Error LED
- **GPIO 4**: System Ready LED
- **GPIO 5**: Data Transmission LED

## Sensor Specifications

### Quadrature Encoder (Avago HEDS-5500)
- **Resolution**: 500 pulses per revolution
- **Supply Voltage**: 5V DC
- **Output**: TTL compatible
- **Max Speed**: 10,000 RPM
- **Connector**: 4-pin JST

### IMU (InvenSense MPU-9250)
- **Accelerometer**: ±16g range, 16-bit resolution
- **Gyroscope**: ±2000°/s range, 16-bit resolution
- **Magnetometer**: ±4800µT range, 16-bit resolution
- **Interface**: I2C (400kHz)
- **Supply Voltage**: 3.3V
- **Package**: QFN 24-pin

### Camera (FLIR Blackfly S)
- **Resolution**: 1920x1200
- **Frame Rate**: 30 FPS
- **Interface**: USB 3.0
- **Trigger**: External trigger input
- **Power**: 5V DC, 2.5W

### Laser Profilometer (Keyence LJ-V7000)
- **Range**: 30-200mm
- **Resolution**: 0.1µm
- **Sampling Rate**: 64kHz
- **Interface**: Ethernet
- **Power**: 24V DC

## Connection Diagram

```
                    Raspberry Pi Pico
                    ┌─────────────────┐
                    │                 │
    Encoder A ──────┤ GPIO 16 (Pin 21)│
    Encoder B ──────┤ GPIO 17 (Pin 22)│
    Encoder I ──────┤ GPIO 18 (Pin 24)│
                    │                 │
    IMU SDA ────────┤ GPIO 20 (Pin 26)│
    IMU SCL ────────┤ GPIO 21 (Pin 27)│
    IMU INT ────────┤ GPIO 19 (Pin 25)│
                    │                 │
    Camera Trig ────┤ GPIO 22 (Pin 29)│
                    │                 │
    UART TX ────────┤ GPIO 0  (Pin 1) │
    UART RX ────────┤ GPIO 1  (Pin 2) │
                    │                 │
    Status LED ─────┤ GPIO 2  (Pin 4) │
    Error LED ──────┤ GPIO 3  (Pin 5) │
    Ready LED ──────┤ GPIO 4  (Pin 6) │
    Data LED ───────┤ GPIO 5  (Pin 7) │
                    │                 │
    VCC ────────────┤ 3.3V   (Pin 36) │
    GND ────────────┤ GND    (Pin 38) │
    VBUS ───────────┤ 5V     (Pin 40) │
                    └─────────────────┘
```

## Wiring Instructions

### 1. Encoder Connection
1. Connect encoder VCC to 3.3V (Pin 36)
2. Connect encoder GND to Ground (Pin 38)
3. Connect encoder A to GPIO 16 (Pin 21)
4. Connect encoder B to GPIO 17 (Pin 22)
5. Connect encoder Index to GPIO 18 (Pin 24)

### 2. IMU Connection
1. Connect IMU VCC to 3.3V (Pin 36)
2. Connect IMU GND to Ground (Pin 38)
3. Connect IMU SDA to GPIO 20 (Pin 26)
4. Connect IMU SCL to GPIO 21 (Pin 27)
5. Connect IMU INT to GPIO 19 (Pin 25)

### 3. Camera Connection
1. Connect camera trigger input to GPIO 22 (Pin 29)
2. Connect camera power to 5V (Pin 40)
3. Connect camera ground to Ground (Pin 38)
4. Connect camera USB to host computer

### 4. UART Connection
1. Connect Pico TX (GPIO 0) to host RX
2. Connect Pico RX (GPIO 1) to host TX
3. Connect common ground

### 5. LED Indicators
1. Connect status LED to GPIO 2 (Pin 4)
2. Connect error LED to GPIO 3 (Pin 5)
3. Connect ready LED to GPIO 4 (Pin 6)
4. Connect data LED to GPIO 5 (Pin 7)
5. Connect all LED cathodes to ground through 220Ω resistors

## Power Requirements

### Total Power Consumption
- **Pico**: 0.5W (3.3V, 150mA)
- **Encoder**: 0.1W (5V, 20mA)
- **IMU**: 0.05W (3.3V, 15mA)
- **Camera**: 2.5W (5V, 500mA)
- **Laser**: 5W (24V, 200mA)
- **Total**: ~8W

### Power Supply Recommendations
- **Primary**: 24V DC, 1A switching power supply
- **Secondary**: 5V DC, 2A linear regulator
- **Tertiary**: 3.3V DC, 1A linear regulator

## Safety Considerations

### Electrical Safety
- Use proper grounding for all components
- Implement overvoltage protection
- Use appropriate fuses and circuit breakers
- Ensure proper insulation and shielding

### Mechanical Safety
- Secure all connections with proper connectors
- Use strain relief for cables
- Implement vibration damping
- Protect against moisture and dust

### Environmental Considerations
- Operating temperature: -20°C to +70°C
- Storage temperature: -40°C to +85°C
- Humidity: 0-95% non-condensing
- Vibration: Up to 5g acceleration

## Troubleshooting

### Common Issues

#### 1. Encoder Not Reading
- Check power supply (5V)
- Verify A/B signal connections
- Check for loose connections
- Verify encoder resolution settings

#### 2. IMU Communication Failure
- Check I2C connections (SDA/SCL)
- Verify 3.3V power supply
- Check I2C address configuration
- Verify pull-up resistors (4.7kΩ)

#### 3. Camera Not Triggering
- Check trigger signal connection
- Verify camera power supply
- Check trigger timing settings
- Verify camera configuration

#### 4. UART Communication Issues
- Check TX/RX connections
- Verify baud rate settings
- Check common ground connection
- Verify signal levels (3.3V)

### Diagnostic Tools
- **Multimeter**: For voltage and continuity checks
- **Oscilloscope**: For signal analysis
- **Logic Analyzer**: For digital signal debugging
- **I2C Scanner**: For I2C device detection

## Maintenance

### Regular Checks
- Inspect all connections monthly
- Check power supply voltages
- Verify sensor calibration
- Clean connectors and contacts

### Calibration Procedures
- **Encoder**: Verify pulse count accuracy
- **IMU**: Perform gyroscope and accelerometer calibration
- **Camera**: Check trigger timing accuracy
- **Laser**: Verify measurement accuracy

### Replacement Parts
- **Encoder**: Avago HEDS-5500
- **IMU**: InvenSense MPU-9250
- **Camera**: FLIR Blackfly S
- **Laser**: Keyence LJ-V7000
- **Connectors**: JST, Molex, and USB connectors

## Documentation References
- Raspberry Pi Pico Datasheet
- MPU-9250 Register Map
- HEDS-5500 Encoder Manual
- Blackfly S Camera Manual
- LJ-V7000 Laser Manual
