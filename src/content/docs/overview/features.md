---
title: Features & Capabilities
description: Detailed overview of MultiFlexMeter V3 features and capabilities
---

# Features & Capabilities

MultiFlexMeter V3 provides a comprehensive set of features for IoT sensor deployments.

## Core Features

### 1. LoRaWAN Communication

#### Long-Range Connectivity
- **Range**: Up to 10km in rural areas, 2-5km in urban environments
- **Frequency**: 868MHz (EU), configurable for other regions
- **Modulation**: LoRa chirp spread spectrum
- **Data Rate**: Adaptive (SF7-SF12)

#### LoRaWAN Protocol Support
- **Specification**: LoRaWAN 1.0.x compliant
- **Activation**: OTAA (Over-the-Air Activation)
- **Class A**: Battery-optimized bidirectional communication
- **Adaptive Data Rate (ADR)**: Automatic optimization
- **Duty Cycle**: EU 868MHz regulation compliant

#### Network Integration
- **The Things Network (TTN)**: Native support
- **ChirpStack**: Compatible
- **Private Networks**: Configurable for custom LoRaWAN servers
- **Payload Format**: Customizable binary encoding

### 2. Sensor Integration

#### SMBus/I²C Interface
- **Standard Protocol**: Broad sensor compatibility
- **Multiple Sensors**: Support for sensor chains
- **Auto-Detection**: Automatic sensor identification
- **Configurable Addresses**: Flexible sensor addressing

#### Supported Sensor Types
- **Soil Moisture**: Capacitive and resistive sensors
- **Temperature**: Digital temperature sensors (I²C)
- **Distance/Level**: Ultrasonic sensors (JSN-SR04T compatible)
- **Environmental**: Humidity, pressure, light sensors
- **Custom Sensors**: Any I²C-compatible sensor

#### Measurement Capabilities
- **Configurable Intervals**: From seconds to hours
- **Multiple Readings**: Take multiple samples and average
- **Median Filtering**: Remove outliers from measurements
- **Sensor Polling**: Query sensors before transmission

### 3. Power Management

#### Low-Power Operation
- **Sleep Modes**: Deep sleep between measurements
- **Watchdog Timer**: System reliability and recovery
- **Power-Down Peripherals**: Disable unused components
- **Efficient Wake-Up**: Quick resume from sleep

#### Power Supply
- **Voltage Range**: 3.3V - 5V DC
- **Battery Operation**: Optimized for solar + battery systems
- **Power Consumption**:
  - Sleep: < 1mA
  - Active (measuring): ~20mA
  - Transmitting: ~40mA peak

### 4. Configuration & Storage

#### EEPROM Configuration
- **Non-volatile Storage**: Settings persist across power cycles
- **4KB EEPROM**: Ample space for configuration
- **Configurable Parameters**:
  - LoRaWAN credentials (DevEUI, AppEUI, AppKey)
  - Measurement intervals
  - Sensor configurations
  - Device behavior settings

#### Configuration Methods
- **Pre-programmed EEPROM**: Flash configuration during manufacturing
- **Serial Configuration**: Update via UART (future feature)
- **Downlink Commands**: Remote configuration via LoRaWAN

### 5. Firmware Architecture

#### Modular Design
- **Separation of Concerns**: Clean module boundaries
- **Board Abstraction**: Support multiple hardware variants
- **Sensor Drivers**: Pluggable sensor implementations
- **LoRaWAN Stack**: MCCI LMIC library integration

#### Build System
- **PlatformIO**: Modern build toolchain
- **Multiple Boards**: Support for different ATmega variants
- **Custom Board Definitions**: Easy hardware customization
- **Library Management**: Automatic dependency handling

#### Code Quality
- **C++ Arduino Framework**: Familiar development environment
- **Compile-Time Configuration**: Optimize binary size
- **Debug Support**: Serial debugging capabilities
- **Version Tracking**: Firmware version in uplink messages

### 6. Debugging & Development

#### Programming Interface
- **ISP (In-System Programming)**: Standard 6-pin AVR ISP header
- **AVRDude Compatible**: Works with common programmers
- **Bootloader Support**: Optional Arduino bootloader
- **Fuse Configuration**: Documented fuse settings

#### Debug Interface
- **UART Serial**: FTDI-compatible 6-pin header
- **115200 baud**: Standard communication speed
- **Debug Logging**: Compile-time enabled debug output
- **Build Information**: Timestamp in firmware

### 7. Communication Protocol

#### Uplink Messages
- **Binary Encoding**: Efficient payload format
- **Version Information**: Firmware version in every message
- **Sensor Data**: Flexible sensor data encoding
- **Error Reporting**: Status and error codes

#### Downlink Commands
- **Remote Control**: Execute commands from server
- **Configuration Updates**: Change device settings
- **Ping/Heartbeat**: Check device connectivity
- **Measurement Trigger**: Request immediate measurement

### 8. Reliability Features

#### Watchdog Timer
- **Hardware Watchdog**: ATmega1284P built-in WDT
- **Automatic Recovery**: Reset if firmware hangs
- **Configurable Timeout**: Adjustable watchdog period
- **System Health Monitoring**: Detect and recover from errors

#### Error Handling
- **Error Codes**: Structured error reporting
- **Retry Logic**: Automatic retransmission
- **Fallback Behavior**: Safe operation on errors
- **Status Indicators**: Error reporting via LoRaWAN

## Hardware Variants

### Standard Version (mfm_v3)
- ATmega1284P @ 16MHz
- Full feature set
- Standard pin configuration

### 1284P Variant (mfm_v3_m1284p)
- Enhanced ATmega1284P features
- Same pin compatibility
- Alternative board definition

## Extensibility

### Custom Sensor Integration
- Implement custom sensor drivers
- Follow existing sensor module pattern
- Add to build system easily

### Protocol Extensions
- Extend uplink payload format
- Add custom downlink commands
- Implement application-specific features

### Hardware Modifications
- KiCad source files available
- Modify for specific requirements
- Community contributions welcome

## Limitations

### Current Constraints
- **LoRaWAN Class A only**: No Class B/C support
- **EU868 frequency**: Other regions require code changes
- **Binary size**: Limited by 128KB flash
- **RAM constraints**: 16KB SRAM limits complexity
- **Single sensor type per device**: Currently one sensor driver at compile time

### Future Enhancements
- Multiple sensor types simultaneously
- Over-the-air firmware updates (OTA)
- Extended battery monitoring
- Additional sensor drivers
- Configuration UI

## Performance Characteristics

### Typical Operation
- **Measurement Interval**: 15 minutes (configurable)
- **Transmission Success Rate**: >95% in good coverage
- **Battery Life**: 6-12 months on 3x AA batteries (depends on interval)
- **Cold Start Time**: ~5 seconds to first transmission
- **Join Time**: 5-30 seconds (depends on network)

### Network Requirements
- LoRaWAN gateway within range
- The Things Network account or private server
- Internet connectivity for gateway

## Next Steps

Learn more about:
- [System Architecture](/overview/architecture/) - How it all fits together
- [Hardware Specifications](/hardware/specifications/) - Detailed hardware info
- [Firmware Architecture](/firmware/architecture/) - Understand the code structure
- [Quick Start Guide](/deployment/quick-start/) - Get started quickly
