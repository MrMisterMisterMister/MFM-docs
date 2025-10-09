---
title: System Architecture
description: Understanding the Multiflexmeter V3 system architecture, components, and data flow.
---

This document provides a comprehensive overview of the Multiflexmeter V3 architecture using the C4 model, including system design, component interactions, and operational workflows.

## Architecture Documentation

The Multiflexmeter V3 architecture is documented using the C4 model at four levels:

1. **System Context** - How MFM fits into the broader IoT ecosystem
2. **Container Architecture** - Major software and hardware containers
3. **Component Architecture** - Firmware components and their interactions
4. **Code Context** - Detailed execution flow and implementation

All diagrams are available in two formats:
- **PlantUML** (`.puml`) - For rendering with PlantUML tools
- **LikeC4** (`.likec4`) - For rendering with LikeC4 tools

See the [Diagram Rendering Guide](/diagrams/README.md) for setup instructions.

## System Context

The Multiflexmeter V3 operates within a larger IoT ecosystem:

**View Diagrams:**
- [PlantUML Version](/diagrams/system_context.puml)
- [LikeC4 Version](/diagrams/system_context.likec4)

### External Systems

#### The Things Network (TTN)
- **Purpose**: LoRaWAN network server
- **Function**: Handles device connectivity, message routing, and network management
- **Protocol**: LoRaWAN 1.0.x
- **Interface**: RFM95 radio module

#### Integration Platform
- **Purpose**: Data processing and visualization
- **Examples**: Node-RED, Grafana, custom applications
- **Function**: Receives sensor data, triggers actions, displays dashboards
- **Interface**: MQTT, HTTP, or TTN APIs

#### AVRISP Programmer
- **Purpose**: Firmware and EEPROM programming
- **Function**: Upload compiled firmware, configure device settings
- **Protocol**: ISP (In-System Programming)
- **Interface**: 6-pin ISP header

#### System Operators
- **Purpose**: Device configuration and deployment
- **Function**: Configure credentials, deploy devices, monitor operations
- **Tools**: PlatformIO, AVRDude, serial console

## Container Architecture

The device consists of several key containers working together:

**View Diagrams:**
- [PlantUML Version](/diagrams/container_context.puml)
- [LikeC4 Version](/diagrams/container_context.likec4)

### Main Containers

#### 1. Firmware (C++ with Arduino Framework)
**Technology**: C++, Arduino Framework, PlatformIO
**Runs on**: ATmega1284P microcontroller

The main control application that:
- Orchestrates sensor measurements
- Manages LoRaWAN communication lifecycle
- Handles power management and sleep modes
- Processes downlink commands from network
- Implements measurement scheduling

#### 2. LMIC Library (LoRaWAN Stack)
**Technology**: MCCI Arduino-LMIC (C library)
**Integration**: Linked into firmware

The LoRaWAN MAC-in-C implementation providing:
- LoRaWAN 1.0.x protocol stack
- OTAA (Over-The-Air Activation)
- Duty cycle management (EU868 compliance)
- Adaptive Data Rate (ADR)
- Message queue and timing

#### 3. EEPROM Storage
**Technology**: ATmega1284P internal EEPROM (4KB)
**Access**: Direct memory read/write

Non-volatile memory storing:
- Device credentials (APP_EUI, DEV_EUI, APP_KEY)
- Configuration parameters (measurement interval, TTN fair use policy)
- Hardware version information
- Magic number for validation ("MFM\0")

#### 4. Sensor Module
**Technology**: External I²C/SMBus device
**Protocol**: SMBus over I²C
**Address**: `0x36` (default)

External sensor providing:
- Measurement capabilities (distance, temperature, moisture, etc.)
- Command interface (perform measurement, read data)
- Auto-detection via I²C scan
- Status reporting

#### 5. RFM95 Radio Module
**Technology**: HopeRF RFM95W LoRa transceiver
**Frequency**: 868MHz (EU)
**Interface**: SPI

LoRa transceiver providing:
- 868MHz RF communication
- Long-range connectivity (up to 10km line-of-sight)
- SPI interface to firmware
- Hardware controlled by LMIC library

## Component Architecture

The firmware is organized into logical components:

**View Diagrams:**
- [PlantUML Version](/diagrams/component_context.puml)
- [LikeC4 Version](/diagrams/component_context.likec4)

### Firmware Components

#### Main Controller (`main.cpp`)
**Responsibilities:**
- Application entry point (`setup()`, `loop()`)
- OS event loop coordination
- Job scheduling and orchestration
- High-level control flow

**Key Functions:**
- `setup()` - Initialize all subsystems
- `loop()` - Run LMIC OS scheduler
- `onEvent()` - Process LoRaWAN events

#### LoRaWAN Event Handler
**Responsibilities:**
- Process LMIC library events
- Coordinate network lifecycle
- Handle transmission completion
- Process downlink messages

**Events Processed:**
- `EV_JOINING` - Starting join procedure
- `EV_JOINED` - Successfully joined network
- `EV_TXCOMPLETE` - Transmission complete (with optional downlink)
- `EV_LINK_DEAD` - Network connection lost
- `EV_JOIN_FAILED` - Join attempt failed

#### Job Scheduler
**Responsibilities:**
- Manage timed operations using LMIC OS jobs
- Schedule measurement cycles
- Coordinate sensor interaction timing

**Jobs:**
- `job_pingVersion` - Send firmware/hardware version after join
- `job_performMeasurements` - Trigger sensor measurement
- `job_fetchAndSend` - Read sensor data and transmit
- `job_reset` - Perform device reset (after downlink command)

#### Configuration Manager (`rom_conf.cpp`)
**Responsibilities:**
- Load configuration from EEPROM
- Validate configuration integrity
- Provide accessor functions
- Handle runtime configuration updates

**Functions:**
- `conf_setup()` - Initialize and validate EEPROM
- `conf_get_deveui()` - Get device EUI
- `conf_get_appeui()` - Get application EUI
- `conf_get_appkey()` - Get application key
- `conf_get_interval()` - Get measurement interval
- `conf_set_interval()` - Update measurement interval

#### Sensor Interface (`sensors.cpp`)
**Responsibilities:**
- Abstract sensor communication
- Manage I²C/SMBus protocol
- Handle sensor errors

**Functions:**
- `sensors_init()` - Initialize I²C bus
- `sensors_performMeasurement()` - Send perform command (0x10)
- `sensors_readMeasurement()` - Read measurement results (0x11)

#### SMBus Driver (`smbus.cpp`)
**Responsibilities:**
- Low-level I²C communication
- Implement SMBus protocol
- Handle bus errors and timeouts

**Functions:**
- `smbus_sendByte()` - Send single byte command
- `smbus_blockRead()` - Read block of data
- `smbus_blockWrite()` - Write block of data
- `smbus_writeWord()` - Write 16-bit word

#### Board Support Package (`boards/*.cpp`)
**Responsibilities:**
- Hardware-specific initialization
- Pin configuration
- Peripheral power control
- Board variant support

**Files:**
- `boards/mfm_v3.cpp` - Standard variant
- `boards/mfm_v3_m1284p.cpp` - M1284P variant

**Functions:**
- `board_setup()` - Initialize hardware
- Board-specific pin definitions

#### Watchdog Timer (`wdt.cpp`)
**Responsibilities:**
- System health monitoring
- Detect and recover from firmware hangs
- Forced reset capability

**Functions:**
- `wdt_enable()` - Enable watchdog
- `wdt_disable()` - Disable watchdog
- `wdt_reset()` - Reset watchdog counter

## Execution Flow

The operational flow follows this sequence:

**View Diagrams:**
- [PlantUML Version](/diagrams/code_context.puml)
- [LikeC4 Version](/diagrams/code_context.likec4)

### Startup Sequence

```
1. Power On
   ↓
2. setup() Entry Point
   ↓
3. Board Initialization
   - board_setup()
   - Pin configuration
   - Peripheral power control
   ↓
4. Debug Serial (if DEBUG enabled)
   - 115200 baud
   - Print build timestamp
   ↓
5. Sensor Initialization
   - sensors_init()
   - I²C bus setup
   - Sensor detection
   ↓
6. LoRaWAN Stack Init
   - os_init()
   - LMIC_reset()
   - Load credentials from EEPROM
   ↓
7. Start OTAA Join
   - LMIC_startJoining()
   - EV_JOINING event
   ↓
8. Main Loop
   - os_runloop_once()
```

### OTAA Join Procedure

```
1. Join Request Sent
   - EV_JOINING event fired
   ↓
2. Wait for Network Response
   - Retry with exponential backoff
   ↓
3. Join Accept Received
   - EV_JOINED event fired
   - Session keys established
   ↓
4. Post-Join Actions
   - Schedule job_pingVersion
   - Send firmware version (FPort 2)
```

### Measurement Cycle

```
1. Schedule Measurement
   - Calculate next time based on interval
   - Account for duty cycle availability
   - Schedule job_performMeasurements
   ↓
2. Trigger Sensor
   - sensors_performMeasurement()
   - SMBus command 0x10
   - Sensor begins measurement
   ↓
3. Wait Period
   - Fixed delay (10 seconds)
   - Schedule job_fetchAndSend
   ↓
4. Read Data
   - sensors_readMeasurement()
   - SMBus command 0x11
   - Pack into buffer
   ↓
5. Queue Transmission
   - LMIC_setTxData2(FPort 1)
   - LMIC handles timing
   - Respects duty cycle
   ↓
6. Transmit
   - Radio transmission
   - Wait for TX complete
   ↓
7. TX Complete
   - EV_TXCOMPLETE event
   - Process any downlink
   - Schedule next measurement
```

### Downlink Processing

When a downlink is received during `EV_TXCOMPLETE`:

```
1. Extract Command Byte
   ↓
2. Command Router:
   
   0xDE 0xAD (Reset Device)
   → Schedule job_reset (5 second delay)
   → Device resets
   
   0x10 <interval_hours> (Update Interval)
   → conf_set_interval(interval)
   → Write to EEPROM
   → Apply to next cycle
   
   0x11 <addr> <cmd> [args] (Forward to Sensor)
   → smbus_sendByte() or smbus_blockWrite()
   → Pass command directly to sensor module
   → Sensor executes command
```

## Data Flow

### Uplink Path
```
Sensor Module
  ↓ (SMBus/I²C)
Firmware (sensors.cpp)
  ↓ (Function call)
Main Controller (main.cpp)
  ↓ (LMIC API)
LMIC Library
  ↓ (SPI)
RFM95 Radio
  ↓ (LoRa 868MHz)
LoRaWAN Gateway
  ↓ (IP/Backhaul)
The Things Network
  ↓ (MQTT/HTTP)
Integration Platform
```

### Downlink Path
```
Integration Platform
  ↓ (API)
The Things Network
  ↓ (IP/Backhaul)
LoRaWAN Gateway
  ↓ (LoRa 868MHz)
RFM95 Radio
  ↓ (SPI)
LMIC Library
  ↓ (Event callback)
Main Controller (onEvent)
  ↓ (Function call)
Action Handler or Sensor Module
```

## Power Management Strategy

The device implements several power optimization techniques:

### Sleep Modes
- **Deep Sleep**: Between measurements and during network idle
- **Peripheral Shutdown**: Sensor power controlled via `PIN_PERIF_PWR`
- **Radio Sleep**: RFM95 in sleep mode when not transmitting

### Watchdog Timer
- **Purpose**: System recovery and wake-up
- **Configuration**: Configurable timeout period
- **Function**: Reset device if firmware hangs

### Duty Cycle Management
- **EU868 Regulations**: 1% duty cycle limit
- **LMIC Enforcement**: Automatic duty cycle tracking
- **Fair Use Policy**: Optional TTN fair use limits

### Dynamic Interval Adjustment
- **Adaptive Scheduling**: Based on data rate and duty cycle
- **Network Conditions**: Respond to ADR changes
- **Battery Conservation**: Longer intervals when needed

## Error Handling

### Critical Errors (Non-Recoverable)

#### Invalid EEPROM
- **Detection**: Magic number mismatch
- **Action**: Enter infinite sleep mode
- **Resolution**: Reprogram EEPROM with valid configuration

#### Hardware Failure
- **Detection**: Watchdog timeout
- **Action**: Automatic reset
- **Resolution**: Investigate hardware issues

### Recoverable Errors

#### TXRX Pending
- **Cause**: Transmission already in progress
- **Action**: Skip transmission, reschedule
- **Recovery**: Automatic on next cycle

#### Sensor Communication Failure
- **Cause**: I²C bus error or sensor not responding
- **Action**: Log error, skip reading
- **Recovery**: Retry on next measurement

#### Join Failure
- **Cause**: No network coverage or invalid credentials
- **Action**: Exponential backoff retry
- **Recovery**: Automatic rejoin attempts

#### Link Dead
- **Cause**: Extended period without successful transmission
- **Action**: Automatic rejoin procedure
- **Recovery**: Full OTAA rejoin

## Hardware Variants

### MFM V3 (Standard)
- **Board ID**: `mfm_v3`
- **MCU**: ATmega1284P @ 16MHz
- **Configuration**: `include/board_config/mfm_v3.h`
- **Features**: Full feature set

### MFM V3 M1284P
- **Board ID**: `mfm_v3_m1284p`
- **MCU**: ATmega1284P @ 16MHz
- **Configuration**: `include/board_config/mfm_v3_m1284p.h`
- **Features**: Same as standard, alternative board definition

Both variants share the same pin configuration and firmware codebase.

## Design Decisions

### Why C++ with Arduino Framework?

**Advantages:**
- Familiar development environment
- Large ecosystem of libraries
- Easy prototyping and development
- Cross-platform toolchain support
- Active community

**Trade-offs:**
- Slightly larger code size than bare-metal C
- Arduino abstractions add overhead
- Limited to Arduino-compatible libraries

### Why MCCI Arduino-LMIC?

**Advantages:**
- Mature LoRaWAN 1.0.x implementation
- Wide community support and testing
- Proven reliability in production deployments
- Active maintenance and updates
- Comprehensive documentation

**Trade-offs:**
- Memory footprint (significant RAM usage)
- Some features not needed (Class B/C)
- Complexity for simple use cases

### Why ATmega1284P?

**Advantages:**
- Large flash (128KB) for complex firmware
- Sufficient RAM (16KB) for LoRaWAN stack
- Generous EEPROM (4KB) for configuration
- Native AVR support in Arduino ecosystem
- Cost-effective for production

**Trade-offs:**
- 8-bit architecture limits performance
- No hardware encryption acceleration
- Power consumption higher than ARM Cortex-M0+

### Why SMBus/I²C for Sensors?

**Advantages:**
- Standardized, well-documented protocol
- Easy to implement in firmware
- Supports multiple devices on same bus
- Low pin count (just 2 wires)
- Wide sensor availability

**Trade-offs:**
- Limited distance (PCB-level only)
- Speed limitations (100kHz/400kHz)
- Pull-up resistors required

## Security Considerations

### Authentication & Encryption

#### OTAA Activation
- **Security**: Secure device activation using AppKey
- **Advantage**: No pre-shared session keys needed
- **Key Exchange**: Encrypted join procedure

#### Credential Storage
- **Location**: EEPROM (not in firmware flash)
- **Advantage**: Can be updated without reflashing firmware
- **Caution**: Not encrypted in EEPROM

#### Message Encryption
- **Algorithm**: AES-128
- **Scope**: All LoRaWAN application payloads
- **Keys**: Network session key and application session key

#### Device Identity
- **DevEUI**: Unique 64-bit device identifier
- **AppEUI**: Application identifier
- **Uniqueness**: Each device must have unique DevEUI

### Security Best Practices

:::caution[Credential Management]
**Never commit device credentials to version control!**

- Use environment-specific configuration files
- Generate unique keys per device
- Store credentials securely
- Rotate keys periodically
:::

:::warning[Physical Security]
**EEPROM credentials can be read with ISP programmer**

- Physical access = credential access
- Consider tamper-evident enclosures for critical deployments
- Implement additional application-layer security if needed
:::

## Build System Architecture

### PlatformIO Configuration

The project uses PlatformIO for building:

```ini
[platformio]
boards_dir = boards

[env]
platform = atmelavr
framework = arduino
build_flags = 
	-DARDUINO_LMIC_PROJECT_CONFIG_H_SUPPRESS
	-DDISABLE_BEACONS
	-DDISABLE_PING
```

### Custom Board Definitions

Located in `boards/` directory:
- `mfm_v3.json` - Standard variant
- `mfm_v3_m1284p.json` - M1284P variant

### Compile-Time Configuration

**Debug Mode:**
```cpp
#define DEBUG  // Enable serial debugging
#define PRINT_BUILD_DATE_TIME  // Print build info
```

**Feature Flags:**
```cpp
#define MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S 10
#define MEASUREMENT_DELAY_AFTER_PING_S 45
```

## Performance Characteristics

### Timing

- **Cold Boot**: ~5 seconds to initialization complete
- **OTAA Join**: 5-30 seconds (depends on network response)
- **Measurement Cycle**: Configurable (default 15 minutes)
- **Sensor Reading**: ~10 seconds (sensor-dependent)
- **Transmission**: 1-5 seconds (depends on spreading factor)

### Memory Usage

- **Flash**: ~60-80KB (depends on features enabled)
- **SRAM**: ~10-12KB (mostly LMIC stack)
- **EEPROM**: ~256 bytes used for configuration

### Power Consumption

- **Sleep**: < 1mA
- **Active (measuring)**: ~20mA
- **Transmitting**: ~40mA peak (SF7), ~120mA peak (SF12)

### Network Performance

- **Transmission Success Rate**: >95% in good coverage
- **Battery Life**: 6-12 months on 3× AA batteries (15-min interval)
- **Range**: Up to 10km line-of-sight, 2-5km urban

## Future Architecture Considerations

### Potential Enhancements

- **Multiple Sensor Support**: Load multiple sensor drivers
- **Over-the-Air Updates**: OTA firmware update capability
- **Extended Sleep Modes**: Further power optimization
- **Configuration Interface**: Web-based or Bluetooth configuration
- **Enhanced Security**: Encrypted EEPROM storage

### Scalability

The modular architecture supports:
- Easy addition of new sensor drivers
- Board variant expansion
- Protocol extensions
- Custom application logic

## Next Steps

Continue learning about:
- [Firmware Development](/firmware/development-guide/) - Build and modify firmware
- [Hardware Specifications](/hardware/specifications/) - Detailed hardware information
- [Communication Protocol](/firmware/protocol/) - Message formats and commands
- [Configuration Guide](/deployment/configuration/) - Device setup and credentials
- [Troubleshooting](/troubleshooting/common-issues/) - Debug and resolve issues
