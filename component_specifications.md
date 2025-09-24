# DAQ System Component Specifications

## Prototype Build Components

### 1. Axle Encoder
**Recommended: Avago HEDS-5500/5600 Series or Bourns ENC-03R**
- **Type**: Incremental Quadrature Encoder
- **Resolution**: 1000-4000 PPR (Pulses Per Revolution)
- **Max Speed**: 10,000 RPM (suitable for 200 km/h train speeds)
- **Output**: 5V TTL/CMOS compatible
- **Interface**: A/B quadrature signals + Index pulse
- **Mounting**: Shaft-mounted with flexible coupling
- **Price**: $50-150

**Alternative: Industrial Grade**
- **Hengstler RI-58H/RI-76H Series**
- **Resolution**: Up to 10,000 PPR
- **Interface**: RS422 differential outputs
- **Price**: $200-500

### 2. IMU (Inertial Measurement Unit)
**Recommended: Bosch BMI088 or InvenSense MPU-9250**
- **Accelerometer**: ±16g range, 16-bit resolution
- **Gyroscope**: ±2000°/s range, 16-bit resolution
- **Interface**: I2C (400 kHz) or SPI (10 MHz)
- **Sample Rate**: Up to 8 kHz
- **Operating Temperature**: -40°C to +85°C
- **Price**: $15-50

**Alternative: Industrial Grade**
- **Analog Devices ADIS16495**
- **Interface**: SPI only
- **Higher precision and temperature range**
- **Price**: $500-1000

### 3. Camera System
**Recommended: FLIR Blackfly S or Basler acA1300-200um**
- **Resolution**: 1.3 MP (1280x1024)
- **Frame Rate**: 200+ FPS
- **Interface**: GigE Ethernet or USB 3.0
- **Trigger**: Hardware trigger input (5V TTL)
- **Lens**: Industrial C-mount lens with appropriate focal length
- **Price**: $500-2000

**Alternative: Raspberry Pi Camera Module v3**
- **Resolution**: 12 MP
- **Interface**: MIPI CSI
- **Trigger**: Software-based (less precise)
- **Price**: $25-50

### 4. Laser/Profilometer
**Recommended: Keyence LJ-V7000 Series or Sick LMS111**
- **Type**: Laser displacement sensor
- **Range**: 30-200mm
- **Resolution**: 0.1μm
- **Sampling Rate**: 64 kHz
- **Interface**: Ethernet or RS232
- **Price**: $2000-5000

**Alternative: Budget Option**
- **Sharp GP2Y0A21YK0F IR Distance Sensor**
- **Range**: 10-80cm
- **Interface**: Analog output
- **Price**: $10-20

### 5. Processing Units

#### Prototype: Raspberry Pi Pico
- **MCU**: RP2040 dual-core ARM Cortex-M0+
- **Clock**: 133 MHz
- **Memory**: 264 KB SRAM
- **GPIO**: 26 pins
- **Interfaces**: I2C, SPI, UART, PWM
- **Price**: $4

#### Prototype: Raspberry Pi 4 or Jetson Nano
- **Raspberry Pi 4**: 4GB RAM, Gigabit Ethernet, USB 3.0
- **Jetson Nano**: 4GB RAM, GPU for image processing
- **Price**: $75-100

#### Production: FPGA/DAQ Board
- **Recommended**: National Instruments cRIO-9045 or Xilinx Zynq-7000
- **Features**: Real-time processing, deterministic timing
- **Price**: $2000-5000

### 6. Power Supply
**Recommended: Mean Well LRS-100-24**
- **Input**: 85-264V AC
- **Output**: 24V DC, 4.2A
- **Efficiency**: >90%
- **Operating Temperature**: -30°C to +70°C
- **Price**: $30-50

**DC-DC Converters:**
- **24V to 5V**: Mean Well DDM-5A-5
- **5V to 3.3V**: Linear Technology LT1763
- **Price**: $10-20 each

### 7. Storage
**Recommended: Samsung 980 PRO NVMe SSD**
- **Capacity**: 1TB
- **Interface**: PCIe 4.0
- **Write Speed**: 5000 MB/s
- **Operating Temperature**: 0°C to +70°C
- **Price**: $100-200

## Pin Mappings for Raspberry Pi Pico

### Encoder Interface
```
Pico Pin    | Function        | Encoder Pin
GPIO16      | Encoder A       | Channel A
GPIO17      | Encoder B       | Channel B
GPIO18      | Encoder Index   | Index (optional)
3.3V        | Power           | VCC
GND         | Ground          | GND
```

### IMU Interface (I2C)
```
Pico Pin    | Function        | IMU Pin
GPIO20      | SDA             | SDA
GPIO21      | SCL             | SCL
3.3V        | Power           | VCC
GND         | Ground          | GND
```

### Camera Trigger
```
Pico Pin    | Function        | Camera/Trigger Circuit
GPIO22      | Trigger Output  | Optocoupler Input
3.3V        | Power           | Optocoupler VCC
GND         | Ground          | Optocoupler GND
```

### UART Communication
```
Pico Pin    | Function        | Pi4/Jetson Pin
GPIO0       | UART TX         | UART RX
GPIO1       | UART RX         | UART TX
GND         | Ground          | GND
```

### Additional GPIO
```
GPIO2       | Status LED       | LED + Resistor
GPIO3       | Error LED        | LED + Resistor
GPIO4       | Reset Button     | Button + Pull-up
GPIO5       | Config Button    | Button + Pull-up
```

## Interface Circuits

### Camera Trigger Circuit
```
Pico GPIO22 → 1kΩ Resistor → Optocoupler LED Anode
Optocoupler LED Cathode → GND
Optocoupler Transistor Collector → Camera Trigger Input
Optocoupler Transistor Emitter → GND
Pull-up Resistor (10kΩ) → Camera Trigger Input → 5V
```

### Encoder Interface Circuit
```
Encoder A → 1kΩ Resistor → Pico GPIO16
Encoder B → 1kΩ Resistor → Pico GPIO17
Pull-up Resistors (10kΩ) → 3.3V
```

### Power Distribution
```
24V Input → DC-DC Converter → 5V Rail
5V Rail → Linear Regulator → 3.3V Rail
5V Rail → Raspberry Pi 4/Jetson
3.3V Rail → Pico, IMU, Encoder
```

## Environmental Considerations

### Temperature Range
- **Operating**: -40°C to +85°C
- **Storage**: -55°C to +125°C
- **Thermal Management**: Heat sinks, fans, or conduction cooling

### Vibration and Shock
- **Vibration**: 5-2000 Hz, 20g RMS
- **Shock**: 50g, 11ms duration
- **Mounting**: Vibration-isolated mounting

### EMI/EMC
- **Shielding**: Metal enclosures
- **Filtering**: Ferrite cores on cables
- **Grounding**: Single-point ground system

### IP Rating
- **Recommended**: IP65 or higher
- **Protection**: Dust and water ingress
