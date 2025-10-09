---
title: Architecture Overview
description: Understanding the MultiFlexMeter V3 system architecture, components, and data flow.
---

This document provides a comprehensive overview of the MultiFlexMeter V3 architecture, including system design, component interactions, and operational workflows.

## System Context

The MultiFlexMeter V3 operates within a larger IoT ecosystem:

**Diagrams:**
- [PlantUML Version](/diagrams/system_context.puml)
- [LikeC4 Version](/diagrams/system_context.likec4)

### External Systems

- **The Things Network (TTN):** LoRaWAN network server handling device connectivity
- **Integration Platform:** Data processing and visualization (e.g., Node-RED, Grafana)
- **AVRISP Programmer:** Used for firmware and EEPROM programming
- **System Operators:** Configure and monitor deployments

## Container Architecture

The device consists of several key containers working together:

**Diagrams:**
- [PlantUML Version](/diagrams/container_context.puml)
- [LikeC4 Version](/diagrams/container_context.likec4)

### Main Containers

#### 1. Firmware (C/C++, Arduino Framework)
The main control application that:
- Orchestrates sensor measurements
- Manages LoRaWAN communication
- Handles power management
- Processes downlink commands

#### 2. LMIC Library
The LoRaWAN MAC-in-C implementation providing:
- LoRaWAN 1.0.x protocol stack
- OTAA (Over-The-Air Activation)
- Duty cycle management
- Adaptive Data Rate (ADR)

#### 3. EEPROM Storage
Non-volatile memory storing:
- Device credentials (APP_EUI, DEV_EUI, APP_KEY)
- Configuration (measurement interval, TTN fair use policy)
- Hardware version information

#### 4. Sensor Module
External I2C/SMBus sensor device providing:
- Measurement capabilities (distance, temperature, etc.)
- Command interface (perform, read)
- Module address: `0x36`

#### 5. RFM95 Radio Module
LoRa transceiver providing:
- 868MHz RF communication
- Long-range connectivity (up to 10km)
- SPI interface to firmware

## Component Architecture

The firmware is organized into logical components:

**Diagrams:**
- [PlantUML Version](/diagrams/component_context.puml)
- [LikeC4 Version](/diagrams/component_context.likec4)

### Firmware Components

#### Main Controller (`main.cpp`)
- Entry point (`setup()`, `loop()`)
- OS event loop coordination
- Job scheduling and orchestration

#### LoRaWAN Event Handler
Processes LMIC events:
- `EV_JOINING` - Starting join procedure
- `EV_JOINED` - Successfully joined network
- `EV_TXCOMPLETE` - Transmission complete (with optional downlink)
- `EV_LINK_DEAD` - Network connection lost

#### Job Scheduler
Manages timed operations:
- `job_pingVersion` - Send firmware/hardware version after join
- `job_performMeasurements` - Trigger sensor measurement
- `job_fetchAndSend` - Read sensor data and transmit
- `job_reset` - Perform device reset

#### Configuration Manager (`rom_conf.cpp`)
- Loads configuration from EEPROM
- Validates magic number ("MFM\0")
- Provides accessor functions for credentials
- Handles measurement interval updates

#### Sensor Interface (`sensors.cpp`)
Abstracts sensor communication:
- `sensors_init()` - Initialize I2C bus
- `sensors_performMeasurement()` - Send perform command
- `sensors_readMeasurement()` - Read measurement results

#### SMBus Driver (`smbus.cpp`)
Low-level I2C communication:
- `smbus_sendByte()` - Send single byte command
- `smbus_blockRead()` - Read block of data
- `smbus_blockWrite()` - Write block of data

#### Board Support (`boards/*.cpp`)
Hardware-specific initialization:
- Pin configuration
- Peripheral power control
- Board variant support

#### Watchdog Timer (`wdt.cpp`)
System monitoring:
- Detect and recover from hangs
- Forced reset capability

## Execution Flow

The operational flow follows this sequence:

**Diagrams:**
- [PlantUML Version](/diagrams/code_context.puml)
- [LikeC4 Version](/diagrams/code_context.likec4)

### Startup Sequence

1. **Power On**
   - `setup()` called
   - Board-specific initialization (`board_setup()`)
   - Serial debug initialized (if DEBUG enabled)

2. **Sensor Initialization**
   - I2C bus setup
   - Sensor module detection

3. **LoRaWAN Stack Initialization**
   - `os_init()` - Initialize LMIC OS
   - `LMIC_reset()` - Reset MAC state
   - Load credentials from EEPROM
   - Start OTAA join procedure

4. **Join Procedure**
   - `EV_JOINING` event fired
   - Device sends join request
   - Waits for accept from network server

5. **Post-Join Operations**
   - `EV_JOINED` event fired
   - Schedule `job_pingVersion`
   - Send firmware/hardware version (FPort 2)

### Measurement Cycle

1. **Trigger Measurement**
   - `job_performMeasurements` scheduled
   - Command sent to sensor module (CMD `0x10`)
   - Sensor begins measurement

2. **Wait Period**
   - Fixed delay (10 seconds) for sensor to complete
   - `job_fetchAndSend` scheduled

3. **Data Retrieval**
   - Read measurement from sensor (CMD `0x11`)
   - Pack data into buffer

4. **Transmission**
   - `LMIC_setTxData2()` queues data (FPort 1)
   - LMIC handles transmission timing
   - Respects duty cycle regulations

5. **Completion**
   - `EV_TXCOMPLETE` event fired
   - Process any downlink data
   - Schedule next measurement

6. **Next Cycle**
   - Calculate next measurement time
   - Account for duty cycle availability
   - Apply TTN Fair Use Policy (if enabled)
   - Schedule `job_performMeasurements`

### Downlink Processing

When a downlink is received during `EV_TXCOMPLETE`:

1. Extract command byte
2. Route to appropriate handler:
   - `0xDE 0xAD` - Reset device after 5 seconds
   - `0x10 <interval>` - Update measurement interval
   - `0x11 <addr> <cmd> [args]` - Forward command to sensor module

## Data Flow

### Uplink Messages

```
Sensor Module → SMBus → Firmware → LMIC → RFM95 → Gateway → TTN → Integration
```

### Downlink Messages

```
Integration → TTN → Gateway → RFM95 → LMIC → Firmware → [Action/Sensor Module]
```

## Power Management

The device uses several power optimization strategies:

1. **Sleep Between Measurements**
   - AVR sleep modes during idle
   - Watchdog timer for wake-up

2. **Peripheral Control**
   - Sensor power can be controlled via `PIN_PERIF_PWR`
   - Radio sleep between transmissions

3. **Adaptive Transmission**
   - TTN Fair Use Policy limits airtime
   - Dynamic interval adjustment based on data rate

## Error Handling

### Critical Errors

- **Invalid EEPROM:** Device enters infinite sleep mode
- **Join Failure:** Automatic retry with exponential backoff

### Recoverable Errors

- **TXRX Pending:** Skip transmission, reschedule
- **Sensor Communication Failure:** Log error, continue operation
- **Link Dead:** Automatic rejoin procedure

## Hardware Variants

### MFM V3 (Standard)
- Board ID: `mfm_v3`
- MCU: ATmega1284P
- Configuration: `include/board_config/mfm_v3.h`

### MFM V3 M1284P
- Board ID: `mfm_v3_m1284p`
- MCU: ATmega1284P
- Configuration: `include/board_config/mfm_v3_m1284p.h`

Both variants share the same pin configuration but may differ in peripheral support.

## Design Decisions

### Why LMIC?

The MCCI Arduino-LMIC library provides:
- Mature LoRaWAN 1.0.x implementation
- Wide community support
- Proven reliability
- Active maintenance

### Why ATmega1284P?

- Large flash (128KB) for complex firmware
- Sufficient RAM (16KB) for LoRaWAN stack
- EEPROM (4KB) for configuration storage
- Native AVR support in Arduino ecosystem

### Why SMBus/I2C for Sensors?

- Standardized protocol
- Easy to implement
- Supports multiple devices
- Low pin count

## Security Considerations

1. **OTAA Authentication:** Secure device activation
2. **App Key Storage:** Keys stored in EEPROM (not in flash)
3. **AES-128 Encryption:** All LoRaWAN messages encrypted
4. **Device EUI:** Unique identifier per device

:::caution
**Security Best Practice:** Never commit device credentials to version control. Use environment-specific configuration files.
:::

## Next Steps

- **[Configuration Guide](/guides/configuration/)** - Configure device settings
- **[Protocol Reference](/reference/protocol/)** - Detailed message formats
- **[Hardware Reference](/reference/hardware/)** - Pin mappings and specifications
- **[API Reference](/reference/api/)** - Function documentation
