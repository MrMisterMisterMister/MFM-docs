---
title: Sensor Module Development
description: Guide for developing external sensor modules that communicate with the Multiflexmeter via I2C/SMBus
---

This section covers the development of external sensor modules that connect to the Multiflexmeter main board via the I2C/SMBus interface. These modules detect physical activity such as pumping or spinning on poldermills.

## Overview

The Multiflexmeter supports external sensor modules connected via the SMBus connector. The main board acts as the I2C master, polling connected sensor modules at configurable intervals.

```
┌─────────────────────┐     I2C/SMBus (80kHz)     ┌─────────────────────┐
│   Multiflexmeter    │◄────────────────────────►│   Sensor Module     │
│   (Master @ 1284P)  │                           │   (Slave @ 0x36)    │
│                     │    CMD_PERFORM (0x10)     │                     │
│   - Controls timing │──────────────────────────►│   - Detects events  │
│   - Schedules TX    │                           │   - Stores state    │
│   - LoRaWAN stack   │    CMD_READ (0x11)        │   - Returns data    │
│                     │◄──────────────────────────│                     │
└─────────────────────┘                           └─────────────────────┘
```

## Available Sensor Modules

| Module | Sensor Type | Detection Method | Use Case |
|--------|-------------|------------------|----------|
| [KY-003 Hall Sensor](/sensor-modules/ky-003-hall) | Hall effect | Magnet on rotating wheel | Low-speed rotation detection |
| [IR Break Beam](/sensor-modules/ir-break-beam) | Infrared optical | Teeth passing through beam | High-speed rotation detection |
| [Mock Sensor](/sensor-modules/mock-sensor) | Software simulation | Random activity | Testing without hardware |

## Communication Protocol

### I2C Configuration

- **Slave Address**: `0x36` (configurable)
- **Bus Speed**: 80kHz (SMBus compatible)
- **Protocol**: SMBus Block Read

### Command Sequence

The Multiflexmeter follows a two-phase measurement cycle:

1. **CMD_PERFORM (0x10)**: Master requests sensor to capture current state
2. **Wait 10 seconds**: Allows sensor time to process (if needed)
3. **CMD_READ (0x11)**: Master reads captured data from sensor

### Data Format

**Minimal Format (1 byte)**:
```
Byte 0: Flags
  - Bit 0: spinning (0x01)
  - Bit 1: pumping (0x02)
```

**Full Format (9 bytes)** - for future use with revolution counting:
```
Byte 0:    Flags (bit 0: spinning, bit 1: pumping)
Bytes 1-4: Total revolutions spinning (uint32 big-endian)
Bytes 5-8: Total revolutions pumping (uint32 big-endian)
```

### SMBus Block Read Response

The sensor must respond with a length byte followed by the data:

```
[LENGTH][DATA_0][DATA_1]...[DATA_N-1]
```

Example responses:
- Pumping active: `01 02` (length=1, flags=0x02)
- Both active: `01 03` (length=1, flags=0x03)
- Idle: `01 00` (length=1, flags=0x00)

## Supported Platforms

Each sensor module page includes complete code for:

| Platform | Library | Notes |
|----------|---------|-------|
| **ESP32** | Wire.h | `onReceive`/`onRequest` callbacks, `IRAM_ATTR` for ISR |
| **Arduino (ATmega328P/1284P)** | Wire.h | Standard slave callbacks |
| **ATtiny1614** | Wire.h (megaTinyCore) | Standard API, dedicated TWI hardware |

## Power Considerations

### Mains Powered

- No sleep mode needed
- Continuous interrupt-based detection
- Revolution counters in RAM (reset on power loss)
- Simplest implementation

### Battery Powered

- Sleep between measurements critical
- Wake on external interrupt (sensor) or I2C address match
- EEPROM persistence for revolution counters
- Use `SLEEP_MODE_STANDBY` to keep TWI active

See individual sensor pages for platform-specific power-optimized code.

## Activity Detection

All sensor modules use **timeout-based activity detection**:

```cpp
#define ACTIVITY_TIMEOUT_MS 5000  // 5 seconds

bool isPumping() {
    return (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
}
```

- A pulse resets the timer
- If no pulse for `ACTIVITY_TIMEOUT_MS`, activity is considered stopped
- Timeout can be tuned for different RPM ranges

### Debounce Timing

| Sensor Type | Recommended Debounce | Reasoning |
|-------------|---------------------|-----------|
| Hall (KY-003) | 50ms | Mechanical magnet approach |
| IR Break Beam | 10ms | Faster optical transitions |
| Mock | 0ms | No physical noise |

## Quick Start

1. Choose a sensor module based on your hardware
2. Select your microcontroller platform (ESP32, Arduino, ATtiny1614)
3. Connect sensor to I2C bus (SDA, SCL, VCC, GND)
4. Flash the appropriate code from the sensor page
5. Connect to Multiflexmeter's SMBus connector
6. Verify communication via serial debug output

## Reference Implementation

The core I2C slave structure for all modules:

```cpp
#include <Wire.h>

#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ    0x11

volatile uint8_t currentCommand = 0;
uint8_t dataBuffer[9];

void onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();
        if (currentCommand == CMD_PERFORM) {
            // Capture current state into dataBuffer
            bool pumping = isPumping();
            dataBuffer[0] = pumping ? 0x02 : 0x00;
        }
    }
}

void onRequest() {
    if (currentCommand == CMD_READ) {
        Wire.write(1);  // Length byte (SMBus requirement)
        Wire.write(dataBuffer[0]);  // Flags
    }
}

void setup() {
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);
}
```

## Next Steps

- [KY-003 Hall Sensor](/sensor-modules/ky-003-hall) - Magnet-based detection
- [IR Break Beam](/sensor-modules/ir-break-beam) - Optical tooth detection
- [Mock Sensor](/sensor-modules/mock-sensor) - Testing without hardware
