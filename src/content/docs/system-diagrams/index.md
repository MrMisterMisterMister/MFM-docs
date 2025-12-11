---
title: System Diagrams
description: Visual diagrams explaining how the Multiflexmeter works
---

This section contains interactive Mermaid diagrams that explain how the Multiflexmeter works at various levels.

## Available Diagrams

### Understanding the System

**Start here if you're new:**
- [Measurement Cycle](./measurement-cycle/) - How the device collects and sends data

**Learn how it works:**
- [Data Flow](./data-flow/) - How data moves through the system

### Development

**Building or debugging:**
- [Communication Sequence](./communication-sequence/) - Component interactions and timing
- [Error Handling](./error-handling/) - How errors are detected and handled

## Key System Facts

### Hardware
- **Microcontroller**: ATmega1284P @ 8MHz
- **Radio**: RFM95 (SX1276) LoRa 868MHz
- **Memory**: 4KB EEPROM for settings
- **Sensor**: I2C device at address 0x36

### Firmware
- **Total Code**: 704 lines of C++
- **Framework**: Arduino with PlatformIO
- **Main Files**:
  - `main.cpp` (363 lines) - Control logic
  - `smbus.cpp` (177 lines) - I2C driver
  - `rom_conf.cpp` (80 lines) - Settings
  - `sensors.cpp` (23 lines) - Sensor interface

### Communication
- **I2C**: 80kHz bus speed, sensor address 0x36
- **LoRaWAN**: OTAA, EU868 band, Class A
- **I2C Commands**:
  - `0x10` (CMD_PERFORM) - Trigger measurement
  - `0x11` (CMD_READ) - Read measurement data
- **LoRaWAN Downlink Commands**:
  - `0xDEAD` - Reset device (5s delay)
  - `0x10 [MSB] [LSB]` - Set measurement interval
  - `0x11 [addr] [cmd] [args]` - Forward command to I2C sensor

### Timing
- **Measurement Interval**: 20 - 4270 seconds (configurable, bounds-checked)
- **Sensor Measurement Wait**: 10 seconds (after CMD_PERFORM trigger)
- **LoRa TX Time**: 60-1500ms (depends on spreading factor SF7-SF12)
- **LoRaWAN Join**: 5-10 seconds (OTAA)
- **Initial Version Delay**: 45 seconds after join before first measurement
