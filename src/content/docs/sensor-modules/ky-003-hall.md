---
title: KY-003 Hall Sensor Module
description: Magnetic Hall effect sensor module for detecting rotation via magnets on a wheel or gear
---

The KY-003 Hall sensor module detects magnetic fields to sense rotation. A magnet attached to a rotating wheel or gear triggers the sensor each time it passes, enabling rotation detection and counting.

## Overview

- **Sensor**: KY-003 Hall effect sensor (A3144 or equivalent)
- **Detection Method**: Magnetic field detection (South pole triggers)
- **Output**: Digital LOW when magnet detected, HIGH otherwise
- **I2C Address**: `0x36`
- **Debounce**: 50ms (configurable)

## Use Cases

- Poldermill wheel rotation detection
- Slow-speed shaft monitoring
- Pump mechanism activity detection
- Any application with 1+ magnets on a rotating component

## Hardware Requirements

| Component | Quantity | Notes |
|-----------|----------|-------|
| KY-003 Hall sensor module | 1 | Or A3144 Hall sensor |
| Neodymium magnet | 1+ | 5-10mm diameter, strong |
| ESP32 / Arduino / ATtiny1614 | 1 | Microcontroller |
| Pull-up resistor | 1 | 10kΩ (often built into module) |
| Wires | 4 | For I2C and sensor connections |

### Wiring Diagram

```
KY-003 Module          Microcontroller
┌─────────────┐       ┌─────────────────┐
│             │       │                 │
│  Signal ────┼───────┼─► GPIO (INT)    │
│  VCC ───────┼───────┼─► 3.3V / 5V     │
│  GND ───────┼───────┼─► GND           │
│             │       │                 │
└─────────────┘       │  SDA ──────────►│ To Multiflexmeter
                      │  SCL ──────────►│ SMBus connector
                      │  VCC ──────────►│
                      │  GND ──────────►│
                      └─────────────────┘

Physical Installation:
┌──────────────────────────────────────┐
│                                      │
│   Rotating Wheel                     │
│   ┌───────────┐                      │
│   │           │   ←── Magnet (N-S)   │
│   │     ○     │                      │
│   │    /│\    │                      │
│   │   / │ \   │                      │
│   │  ●  │  ●  │   ←── Optional       │
│   └─────┼─────┘       additional     │
│         │             magnets        │
│         │                            │
│    ┌────┴────┐                       │
│    │ KY-003  │   ←── Hall sensor     │
│    │ Sensor  │       facing wheel    │
│    └─────────┘       (1-5mm gap)     │
│                                      │
└──────────────────────────────────────┘
```

### Pin Configuration

| Platform | Sensor Pin | SDA Pin | SCL Pin | Notes |
|----------|------------|---------|---------|-------|
| ESP32 | GPIO 4 | GPIO 21 | GPIO 22 | Default I2C pins |
| Arduino Uno | D2 (INT0) | A4 | A5 | Hardware interrupt |
| Arduino Nano | D2 (INT0) | A4 | A5 | Hardware interrupt |
| ATmega1284P | D10 (INT0) | SDA | SCL | Check pinout |
| ATtiny1614 | PA3 (pin 13) | PA1 (pin 11) | PA2 (pin 12) | megaTinyCore |

## Configuration Options

```cpp
// Sensor configuration
#define HALL_SENSOR_PIN     4       // GPIO connected to sensor output
#define DEBOUNCE_MS         50      // Debounce time in milliseconds
#define ACTIVITY_TIMEOUT_MS 5000    // Time without pulse = inactive

// I2C configuration
#define I2C_SLAVE_ADDRESS   0x36
#define CMD_PERFORM         0x10
#define CMD_READ            0x11
```

### Tuning Debounce Time

The debounce time prevents false triggers from electrical noise or mechanical vibration:

```
debounce_ms = 1000 / (max_rpm * magnets_per_rev) / 4

Example: 60 RPM, 1 magnet
= 1000 / (60 * 1) / 4
= 4.2ms minimum

With safety margin: 50ms recommended
```

For faster rotation, reduce debounce:
- 60 RPM, 1 magnet: 50ms OK
- 300 RPM, 1 magnet: 10ms recommended
- 600 RPM, 4 magnets: 1ms recommended

## Software Implementation

### ESP32 Version (Mains Powered)

```cpp
/**
 * KY-003 Hall Sensor Module - ESP32
 *
 * Detects magnets on a rotating wheel to sense pumping activity.
 * Communicates with Multiflexmeter via I2C/SMBus.
 */
#include <Wire.h>

// Pin configuration
#define HALL_SENSOR_PIN 4  // GPIO connected to sensor output

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters
#define DEBOUNCE_MS 50
#define ACTIVITY_TIMEOUT_MS 5000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastPulseTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// Hall sensor interrupt - triggered on magnet detection
void IRAM_ATTR hallISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastPulseTime = now;
        totalRevolutionsPumping++;  // Count as pumping revolution
    }
}

// I2C receive handler
void IRAM_ATTR onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            // Capture current state
            bool pumping = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
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

            Serial.printf("CMD_PERFORM: pumping=%d, revs=%lu\n",
                pumping, totalRevolutionsPumping);
        }
    }
}

// I2C request handler
void IRAM_ATTR onRequest() {
    if (currentCommand == CMD_READ) {
        // SMBus Block Read: length byte first
        Wire.write(1);  // Minimal: flags only
        Wire.write(dataBuffer[0]);

        Serial.printf("CMD_READ: sent flags=0x%02X\n", dataBuffer[0]);
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("KY-003 Hall Sensor Module - ESP32");
    Serial.printf("I2C Address: 0x%02X\n", I2C_SLAVE_ADDRESS);

    // Configure Hall sensor pin with interrupt
    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    // Initialize data buffer
    memset(dataBuffer, 0, sizeof(dataBuffer));

    Serial.println("Ready - waiting for magnet triggers...");
}

void loop() {
    // Status output for debugging
    static unsigned long lastStatusTime = 0;
    if (millis() - lastStatusTime >= 5000) {
        lastStatusTime = millis();
        bool active = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
        Serial.printf("Status: pumping=%d, revs=%lu\n", active, totalRevolutionsPumping);
    }
}
```

### Arduino Version (ATmega328P / ATmega1284P)

```cpp
/**
 * KY-003 Hall Sensor Module - Arduino
 *
 * Compatible with ATmega328P (Uno/Nano) and ATmega1284P.
 * Uses D2 (INT0) for hardware interrupt.
 */
#include <Wire.h>

// Pin configuration
#define HALL_SENSOR_PIN 2  // D2 = INT0

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters
#define DEBOUNCE_MS 50
#define ACTIVITY_TIMEOUT_MS 5000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastPulseTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// Hall sensor interrupt
void hallISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastPulseTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void receiveEvent(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
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

void setup() {
    Serial.begin(9600);
    Serial.println(F("KY-003 Hall Sensor - Arduino"));

    // Configure Hall sensor pin with interrupt
    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(receiveEvent);
    Wire.onRequest(requestEvent);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    // Optional: status output
    static unsigned long lastStatusTime = 0;
    if (millis() - lastStatusTime >= 5000) {
        lastStatusTime = millis();
        bool active = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
        Serial.print(F("Pumping: "));
        Serial.print(active);
        Serial.print(F(", Revs: "));
        Serial.println(totalRevolutionsPumping);
    }
}
```

### ATtiny1614 Version (Mains Powered)

```cpp
/**
 * KY-003 Hall Sensor Module - ATtiny1614
 *
 * Requires megaTinyCore: https://github.com/SpenceKonde/megaTinyCore
 *
 * Pin Configuration:
 * - PA3 (pin 13): Hall sensor output
 * - PA1 (pin 11): SDA
 * - PA2 (pin 12): SCL
 */
#include <Wire.h>

// Pin configuration
#define HALL_SENSOR_PIN PIN_PA3

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters
#define DEBOUNCE_MS 50
#define ACTIVITY_TIMEOUT_MS 5000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastPulseTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// Hall sensor interrupt
void hallISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastPulseTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
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

void setup() {
    // Configure Hall sensor pin with interrupt
    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    // Mains powered - no sleep, everything handled by interrupts
}
```

### ATtiny1614 Version (Battery Powered)

```cpp
/**
 * KY-003 Hall Sensor Module - ATtiny1614 (Battery Powered)
 *
 * Includes sleep mode and EEPROM persistence for revolution counters.
 * Uses STANDBY sleep to maintain I2C responsiveness.
 */
#include <Wire.h>
#include <avr/sleep.h>
#include <EEPROM.h>

// Pin configuration
#define HALL_SENSOR_PIN PIN_PA3

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters
#define DEBOUNCE_MS 50
#define ACTIVITY_TIMEOUT_MS 5000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastPulseTime = 0;
volatile unsigned long lastDebounceTime = 0;
volatile bool i2cActive = false;

uint8_t dataBuffer[9];

// Hall sensor interrupt - wakes from sleep
void hallISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastPulseTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void onReceive(int numBytes) {
    i2cActive = true;
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastPulseTime) < ACTIVITY_TIMEOUT_MS;
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
        Wire.write(1);  // Length byte
        Wire.write(dataBuffer[0]);  // Flags

        // Save to EEPROM periodically (every 10th read to reduce wear)
        static uint8_t saveCounter = 0;
        if (++saveCounter >= 10) {
            EEPROM.put(0, totalRevolutionsSpinning);
            EEPROM.put(4, totalRevolutionsPumping);
            saveCounter = 0;
        }
    }
    i2cActive = false;
}

void enterSleep() {
    // Use STANDBY to keep TWI active
    set_sleep_mode(SLEEP_MODE_STANDBY);
    sleep_enable();
    sei();
    sleep_cpu();
    sleep_disable();
}

void setup() {
    // Load saved counters from EEPROM
    EEPROM.get(0, totalRevolutionsSpinning);
    EEPROM.get(4, totalRevolutionsPumping);
    if (totalRevolutionsSpinning == 0xFFFFFFFF) totalRevolutionsSpinning = 0;
    if (totalRevolutionsPumping == 0xFFFFFFFF) totalRevolutionsPumping = 0;

    // Configure Hall sensor pin with interrupt
    pinMode(HALL_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(HALL_SENSOR_PIN), hallISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    if (!i2cActive) {
        enterSleep();  // Sleep until interrupt or I2C
    }
}
```

## Installation Tips

### Magnet Placement

1. **Orientation**: South pole facing the sensor (most Hall sensors are South-detecting)
2. **Distance**: 1-5mm gap between magnet and sensor face
3. **Alignment**: Center magnet path over sensor center
4. **Multiple magnets**: Space evenly for consistent RPM readings

### Sensor Mounting

1. Mount sensor on fixed bracket facing rotation path
2. Protect from moisture with conformal coating or enclosure
3. Keep wires away from high-current paths to reduce noise
4. Consider vibration dampening in harsh environments

## Troubleshooting

### No Trigger Detection

1. **Check polarity**: Try flipping magnet (South pole must face sensor)
2. **Reduce gap**: Move sensor closer to magnet path
3. **Test sensor**: Connect LED to output (should light on magnet pass)
4. **Check pull-up**: Ensure 10kΩ pull-up on signal line

### False Triggers / Noise

1. **Increase debounce**: Try 100ms or higher
2. **Add filtering**: 100nF capacitor between signal and GND
3. **Check wiring**: Use twisted pair for sensor connection
4. **Shielding**: Route signal wire away from motor/power cables

### Inconsistent Counting

1. **Stabilize mounting**: Vibration causes gap variation
2. **Stronger magnet**: Use N35 or N52 neodymium
3. **Reduce gap**: Closer = more reliable triggering
4. **Check timeout**: May be marking inactive between slow pulses

### I2C Communication Issues

1. **Verify address**: Run I2C scanner on master
2. **Check pull-ups**: 4.7kΩ on SDA and SCL
3. **Bus speed**: Ensure 80kHz or slower
4. **Wire length**: Keep under 1m for reliable communication

## Next Steps

- [IR Break Beam](/sensor-modules/ir-break-beam) - Optical tooth detection
- [Mock Sensor](/sensor-modules/mock-sensor) - Testing without hardware
- [Module Overview](/sensor-modules) - Back to overview
