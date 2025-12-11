---
title: Mock Sensor Module
description: Software-simulated sensor module for testing the Multiflexmeter I2C interface without physical hardware
---

The Mock Sensor module provides a software-simulated sensor for testing the Multiflexmeter's I2C/SMBus interface without requiring physical detection hardware. It randomly simulates pumping activity, making it useful for development, debugging, and demonstration purposes.

## Overview

- **Purpose**: Testing and development without physical sensors
- **Detection Method**: Random simulation (configurable probability)
- **I2C Address**: `0x36`
- **Data Format**: 1 byte (flags only) or 9 bytes (with revolution counters)

## Use Cases

1. **Development**: Test I2C communication before hardware is ready
2. **Debugging**: Isolate firmware issues from sensor hardware problems
3. **Demonstration**: Show dashboard functionality without field deployment
4. **CI/CD Testing**: Automated testing without physical sensors

## Hardware Requirements

Only the microcontroller board is needed - no external sensors.

| Component | Quantity | Notes |
|-----------|----------|-------|
| ESP32 / Arduino / ATtiny1614 | 1 | Any I2C-capable microcontroller |
| Pull-up resistors | 2 | 4.7kΩ for SDA and SCL (often built-in) |

### Wiring Diagram

```
Multiflexmeter             Sensor Module
┌─────────────┐           ┌─────────────┐
│             │           │             │
│  SMBus SDA ─┼───────────┼─ SDA        │
│  SMBus SCL ─┼───────────┼─ SCL        │
│  VCC (3.3V)─┼───────────┼─ VCC        │
│  GND ───────┼───────────┼─ GND        │
│             │           │             │
└─────────────┘           └─────────────┘
```

## Configuration Options

```cpp
// Simulation parameters
#define SIMULATION_INTERVAL_MS  1000   // How often to update state
#define PUMPING_PROBABILITY     30     // % chance of pumping each update
#define REVOLUTIONS_PER_UPDATE  5      // Revolutions added when active

// Protocol constants
#define I2C_SLAVE_ADDRESS       0x36
#define CMD_PERFORM             0x10
#define CMD_READ                0x11
#define ACTIVITY_TIMEOUT_MS     5000
```

## Software Implementation

### ESP32 Version

```cpp
/**
 * Mock Sensor Module - ESP32
 *
 * Simulates pumping activity with random state changes.
 * Responds to Multiflexmeter I2C commands.
 */
#include <Wire.h>

// I2C Configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Simulation parameters
#define SIMULATION_INTERVAL_MS 1000
#define PUMPING_PROBABILITY 30
#define ACTIVITY_TIMEOUT_MS 5000
#define REVOLUTIONS_PER_UPDATE 5

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastActivityTime = 0;
volatile bool simulatedPumping = false;

uint8_t dataBuffer[9];
unsigned long lastSimulationUpdate = 0;

// I2C receive handler
// void IRAM_ATTR onReceive(int numBytes) {
//     if (numBytes > 0) {
//         currentCommand = Wire.read();

//         if (currentCommand == CMD_PERFORM) {
//             // Capture current simulated state
//             bool pumping = (millis() - lastActivityTime) < ACTIVITY_TIMEOUT_MS;
//             dataBuffer[0] = pumping ? 0x02 : 0x00;

//             // Pack revolution counters (big-endian)
//             dataBuffer[1] = (totalRevolutionsSpinning >> 24) & 0xFF;
//             dataBuffer[2] = (totalRevolutionsSpinning >> 16) & 0xFF;
//             dataBuffer[3] = (totalRevolutionsSpinning >> 8) & 0xFF;
//             dataBuffer[4] = totalRevolutionsSpinning & 0xFF;

//             dataBuffer[5] = (totalRevolutionsPumping >> 24) & 0xFF;
//             dataBuffer[6] = (totalRevolutionsPumping >> 16) & 0xFF;
//             dataBuffer[7] = (totalRevolutionsPumping >> 8) & 0xFF;
//             dataBuffer[8] = totalRevolutionsPumping & 0xFF;

//             Serial.printf("CMD_PERFORM: pumping=%d, revs=%lu\n",
//                 pumping, totalRevolutionsPumping);
//         }
//     }
// }

void IRAM_ATTR onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            // Capture current simulated state
            bool pumping = (millis() - lastActivityTime) < ACTIVITY_TIMEOUT_MS;
            dataBuffer[0] = pumping ? 0x02 : 0x00;

            // Pack revolution counters (big-endian)
            // Bytes 1-4: PUMPING revolutions (decoder expects this first)
            dataBuffer[1] = (totalRevolutionsPumping >> 24) & 0xFF;
            dataBuffer[2] = (totalRevolutionsPumping >> 16) & 0xFF;
            dataBuffer[3] = (totalRevolutionsPumping >> 8) & 0xFF;
            dataBuffer[4] = totalRevolutionsPumping & 0xFF;

            // Bytes 5-8: SPINNING revolutions (decoder expects this second)
            dataBuffer[5] = (totalRevolutionsSpinning >> 24) & 0xFF;
            dataBuffer[6] = (totalRevolutionsSpinning >> 16) & 0xFF;
            dataBuffer[7] = (totalRevolutionsSpinning >> 8) & 0xFF;
            dataBuffer[8] = totalRevolutionsSpinning & 0xFF;

            Serial.printf("CMD_PERFORM: pumping=%d, pump_revs=%lu, spin_revs=%lu\n",
                pumping, totalRevolutionsPumping, totalRevolutionsSpinning);
        }
    }
}


// I2C request handler
// void IRAM_ATTR onRequest() {
//     if (currentCommand == CMD_READ) {
//         // SMBus Block Read: length byte first
//         Wire.write(1);  // Minimal: flags only
//         Wire.write(dataBuffer[0]);

//         // For full 9-byte response, use:
//         // Wire.write(9);
//         // Wire.write(dataBuffer, 9);

//         Serial.printf("CMD_READ: sent flags=0x%02X\n", dataBuffer[0]);
//     }
// }

void IRAM_ATTR onRequest() {
    if (currentCommand == CMD_READ) {
        // Send 9 bytes directly (no SMBus length byte)
        Wire.write(dataBuffer, 9);
        
        Serial.printf("CMD_READ: sent 9 bytes, flags=0x%02X, pumping_revs=%lu\n", 
            dataBuffer[0], totalRevolutionsPumping);
    }
}

// Update simulation state
void updateSimulation() {
    // Random chance of activity
    if (random(100) < PUMPING_PROBABILITY) {
        simulatedPumping = true;
        lastActivityTime = millis();
        totalRevolutionsPumping += REVOLUTIONS_PER_UPDATE;
        Serial.printf("Simulated activity: revs=%lu\n", totalRevolutionsPumping);
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Mock Sensor Module - ESP32");
    Serial.printf("I2C Address: 0x%02X\n", I2C_SLAVE_ADDRESS);

    // Initialize random seed
    randomSeed(analogRead(0));

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    // Initialize data buffer
    memset(dataBuffer, 0, sizeof(dataBuffer));

    Serial.println("Ready - waiting for I2C commands...");
}

void loop() {
    // Update simulation periodically
    if (millis() - lastSimulationUpdate >= SIMULATION_INTERVAL_MS) {
        lastSimulationUpdate = millis();
        updateSimulation();
    }
}
```

### Arduino Version (ATmega328P / ATmega1284P)

```cpp
/**
 * Mock Sensor Module - Arduino
 *
 * Simulates pumping activity with random state changes.
 * Compatible with ATmega328P (Uno/Nano) and ATmega1284P.
 */
#include <Wire.h>

// I2C Configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Simulation parameters
#define SIMULATION_INTERVAL_MS 1000
#define PUMPING_PROBABILITY 30
#define ACTIVITY_TIMEOUT_MS 5000
#define REVOLUTIONS_PER_UPDATE 5

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastActivityTime = 0;

uint8_t dataBuffer[9];
unsigned long lastSimulationUpdate = 0;

// I2C receive handler
void receiveEvent(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastActivityTime) < ACTIVITY_TIMEOUT_MS;
            dataBuffer[0] = pumping ? 0x02 : 0x00;

            // Pack revolution counters (big-endian)
            dataBuffer[1] = (totalRevolutionsSpinning >> 24) & 0xFF;
            dataBuffer[2] = (totalRevolutionsSpinning >> 16) & 0xFF;
            dataBuffer[3] = (totalRevolutionsSpinning >> 8) & 0xFF;
            dataBuffer[4] = totalRevolutionsSpinning & 0xFF;

            dataBuffer[5] = (totalRevolutionsPumping >> 24) & 0xFF;
            dataBuffer[6] = (totalRevolutionsPumping >> 16) & 0xFF;
            dataBuffer[7] = (totalRevolutionsPumping >> 8) & 0xFF;
            dataBuffer[8] = totalRevolutionsPumping & 0xFF;
        }
    }
}

// I2C request handler
void requestEvent() {
    if (currentCommand == CMD_READ) {
        Wire.write(1);  // Length byte
        Wire.write(dataBuffer[0]);  // Flags
    }
}

void updateSimulation() {
    if (random(100) < PUMPING_PROBABILITY) {
        lastActivityTime = millis();
        totalRevolutionsPumping += REVOLUTIONS_PER_UPDATE;
        Serial.print(F("Activity: revs="));
        Serial.println(totalRevolutionsPumping);
    }
}

void setup() {
    Serial.begin(9600);
    Serial.println(F("Mock Sensor - Arduino"));

    randomSeed(analogRead(0));

    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(receiveEvent);
    Wire.onRequest(requestEvent);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    if (millis() - lastSimulationUpdate >= SIMULATION_INTERVAL_MS) {
        lastSimulationUpdate = millis();
        updateSimulation();
    }
}
```

### ATtiny1614 Version (Mains Powered)

```cpp
/**
 * Mock Sensor Module - ATtiny1614
 *
 * Requires megaTinyCore: https://github.com/SpenceKonde/megaTinyCore
 * Board: ATtiny1614
 *
 * Pin Configuration:
 * - PA1 (pin 11): SDA
 * - PA2 (pin 12): SCL
 * - VCC (pin 1): 3.3V or 5V
 * - GND (pin 14): Ground
 */
#include <Wire.h>

// I2C Configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Simulation parameters
#define SIMULATION_INTERVAL_MS 1000
#define PUMPING_PROBABILITY 30
#define ACTIVITY_TIMEOUT_MS 5000
#define REVOLUTIONS_PER_UPDATE 5

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastActivityTime = 0;

uint8_t dataBuffer[9];
unsigned long lastSimulationUpdate = 0;
uint16_t lfsr = 0xACE1;  // Simple LFSR for random numbers

// Simple pseudo-random number generator (no analogRead on ATtiny1614)
uint8_t pseudoRandom() {
    uint8_t bit = ((lfsr >> 0) ^ (lfsr >> 2) ^ (lfsr >> 3) ^ (lfsr >> 5)) & 1;
    lfsr = (lfsr >> 1) | (bit << 15);
    return lfsr & 0xFF;
}

// I2C receive handler
void onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastActivityTime) < ACTIVITY_TIMEOUT_MS;
            dataBuffer[0] = pumping ? 0x02 : 0x00;

            // Pack revolution counters (big-endian)
            dataBuffer[1] = (totalRevolutionsSpinning >> 24) & 0xFF;
            dataBuffer[2] = (totalRevolutionsSpinning >> 16) & 0xFF;
            dataBuffer[3] = (totalRevolutionsSpinning >> 8) & 0xFF;
            dataBuffer[4] = totalRevolutionsSpinning & 0xFF;

            dataBuffer[5] = (totalRevolutionsPumping >> 24) & 0xFF;
            dataBuffer[6] = (totalRevolutionsPumping >> 16) & 0xFF;
            dataBuffer[7] = (totalRevolutionsPumping >> 8) & 0xFF;
            dataBuffer[8] = totalRevolutionsPumping & 0xFF;
        }
    }
}

// I2C request handler
void onRequest() {
    if (currentCommand == CMD_READ) {
        Wire.write(1);  // Length byte (SMBus requirement)
        Wire.write(dataBuffer[0]);  // Flags
    }
}

void updateSimulation() {
    if ((pseudoRandom() % 100) < PUMPING_PROBABILITY) {
        lastActivityTime = millis();
        totalRevolutionsPumping += REVOLUTIONS_PER_UPDATE;
    }
}

void setup() {
    // Initialize I2C slave (PA1=SDA, PA2=SCL on ATtiny1614)
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    if (millis() - lastSimulationUpdate >= SIMULATION_INTERVAL_MS) {
        lastSimulationUpdate = millis();
        updateSimulation();
    }
}
```

## Testing

### With Serial Monitor

1. Flash the code to your microcontroller
2. Open Serial Monitor (115200 baud for ESP32, 9600 for Arduino)
3. Observe simulation messages showing random activity

### With Multiflexmeter

1. Connect sensor module to Multiflexmeter's SMBus connector
2. Enable DEBUG in Multiflexmeter firmware
3. Watch serial output for I2C communication:
   ```
   I2C read result: 0
   Data bytes: 01 02
   ```

### With I2C Scanner

Run an I2C scanner on the master to verify the sensor responds at address `0x36`:

```cpp
// Run on ESP32/Arduino as I2C master
#include <Wire.h>

void setup() {
    Serial.begin(115200);
    Wire.begin();
}

void loop() {
    Wire.beginTransmission(0x36);
    int error = Wire.endTransmission();

    if (error == 0) {
        Serial.println("Sensor found at 0x36");
    } else {
        Serial.println("Sensor not responding");
    }

    delay(1000);
}
```

## Simulation Parameters

Adjust these parameters to match your testing needs:

| Parameter | Default | Description |
|-----------|---------|-------------|
| `SIMULATION_INTERVAL_MS` | 1000 | How often to check for activity |
| `PUMPING_PROBABILITY` | 30 | Percentage chance of activity per interval |
| `ACTIVITY_TIMEOUT_MS` | 5000 | How long activity persists after trigger |
| `REVOLUTIONS_PER_UPDATE` | 5 | Revolution increment when active |

### Example Scenarios

**Continuous Activity** (for dashboard testing):
```cpp
#define PUMPING_PROBABILITY 100
#define SIMULATION_INTERVAL_MS 500
```

**Occasional Bursts**:
```cpp
#define PUMPING_PROBABILITY 10
#define SIMULATION_INTERVAL_MS 2000
```

**Always Idle** (for negative testing):
```cpp
#define PUMPING_PROBABILITY 0
```

## Troubleshooting

### No I2C Response

1. Check wiring: SDA to SDA, SCL to SCL
2. Verify pull-up resistors (4.7kΩ) are present
3. Confirm correct I2C address (0x36)
4. Check power supply voltage

### Random Number Issues (ATtiny)

The ATtiny1614 lacks `analogRead()` for seeding randomness. The LFSR implementation provides adequate pseudo-randomness for testing.

### I2C Hangs

- Ensure sensor releases bus properly (no SCL stretching)
- Add timeout handling in master code
- Check for bus contention with other devices

## Next Steps

- [KY-003 Hall Sensor](/sensor-modules/ky-003-hall) - Real magnet-based detection
- [IR Break Beam](/sensor-modules/ir-break-beam) - Optical tooth detection
- [Module Overview](/sensor-modules) - Back to overview
