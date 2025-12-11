---
title: IR Break Beam Sensor Module
description: Infrared break beam sensor for detecting teeth or spokes passing through the sensor gap
---

The IR Break Beam sensor (Adafruit 2168 or equivalent) detects objects passing through an infrared beam. Teeth on a gear or spokes on a wheel interrupt the beam, enabling high-speed rotation detection.

## Overview

- **Sensor**: Adafruit 2168 IR Break Beam (3mm) or equivalent
- **Detection Method**: Infrared beam interruption
- **Output**: Digital LOW when beam broken, HIGH when clear
- **I2C Address**: `0x36`
- **Debounce**: 10ms (configurable for high-speed applications)

## Use Cases

- High-speed gear tooth counting
- Spoke detection on wheels
- Fast rotation monitoring
- Precision RPM measurement
- Applications requiring non-contact detection

## Hardware Requirements

| Component | Quantity | Notes |
|-----------|----------|-------|
| IR Break Beam sensor (3mm or 5mm) | 1 | Adafruit 2168 or equivalent |
| ESP32 / Arduino / ATtiny1614 | 1 | Microcontroller |
| Pull-up resistor | 1 | 10kΩ (usually built into receiver) |
| Mounting bracket | 1 | To align transmitter and receiver |
| Wires | 5+ | Power and signal connections |

### Sensor Components

The IR break beam consists of two parts:
- **Transmitter (TX)**: Always-on IR LED
- **Receiver (RX)**: Phototransistor with signal output

### Wiring Diagram

```
IR Break Beam               Microcontroller
┌─────────────┐           ┌─────────────────┐
│ Transmitter │           │                 │
│  (IR LED)   │           │                 │
│  VCC ───────┼───────────┼─► VCC           │
│  GND ───────┼───────────┼─► GND           │
└─────────────┘           │                 │
                          │                 │
┌─────────────┐           │                 │
│  Receiver   │           │                 │
│(Phototrans) │           │                 │
│  Signal ────┼───────────┼─► GPIO (INT)    │
│  VCC ───────┼───────────┼─► VCC           │
│  GND ───────┼───────────┼─► GND           │
└─────────────┘           │                 │
                          │  SDA ──────────►│ To Multiflexmeter
                          │  SCL ──────────►│ SMBus connector
                          └─────────────────┘

Physical Installation:
┌────────────────────────────────────────────┐
│                                            │
│   Gear with Teeth                          │
│   ┌─────────────────┐                      │
│   │    ▲   ▲   ▲    │  ←── Teeth pass     │
│   │   █ █ █ █ █ █   │      through gap    │
│   │    ▼   ▼   ▼    │                      │
│   └────────┼────────┘                      │
│            │                               │
│   ┌────┐   │   ┌────┐                      │
│   │ TX │◄──┼──►│ RX │  ←── IR beam        │
│   │    │   │   │    │      broken by      │
│   └────┘   │   └────┘      passing tooth  │
│            │                               │
│      3-5mm gap each side                   │
│                                            │
└────────────────────────────────────────────┘
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
#define IR_SENSOR_PIN       4       // GPIO connected to receiver output
#define DEBOUNCE_MS         10      // Shorter debounce for optical sensor
#define ACTIVITY_TIMEOUT_MS 2000    // Faster timeout for high-speed detection

// I2C configuration
#define I2C_SLAVE_ADDRESS   0x36
#define CMD_PERFORM         0x10
#define CMD_READ            0x11
```

### Tuning Debounce Time

IR sensors have faster transitions than mechanical sensors:

```
debounce_ms = 1000 / (max_rpm * teeth_per_rev) / 4

Example: 300 RPM, 20 teeth
= 1000 / (300 * 20) / 4
= 0.04ms minimum

With safety margin: 1-10ms recommended
```

For very high-speed applications (>1000 RPM), consider reducing debounce to 1ms.

## Software Implementation

### ESP32 Version (Mains Powered)

```cpp
/**
 * IR Break Beam Sensor Module - ESP32
 *
 * Detects teeth/spokes passing through IR beam.
 * Optimized for high-speed detection with shorter debounce.
 */
#include <Wire.h>

// Pin configuration
#define IR_SENSOR_PIN 4  // GPIO connected to receiver output

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters - optimized for IR
#define DEBOUNCE_MS 10  // Shorter for optical sensor
#define ACTIVITY_TIMEOUT_MS 2000  // Faster timeout

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastBreakTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// IR sensor interrupt - triggered on beam break
void IRAM_ATTR irISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastBreakTime = now;
        totalRevolutionsPumping++;  // Count beam breaks
    }
}

// I2C receive handler
void IRAM_ATTR onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            // Capture current state
            bool pumping = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
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

            Serial.printf("CMD_PERFORM: pumping=%d, breaks=%lu\n",
                pumping, totalRevolutionsPumping);
        }
    }
}

// I2C request handler
void IRAM_ATTR onRequest() {
    if (currentCommand == CMD_READ) {
        Wire.write(1);  // Length byte
        Wire.write(dataBuffer[0]);  // Flags

        Serial.printf("CMD_READ: sent flags=0x%02X\n", dataBuffer[0]);
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("IR Break Beam Sensor Module - ESP32");
    Serial.printf("I2C Address: 0x%02X\n", I2C_SLAVE_ADDRESS);

    // Configure IR sensor pin with interrupt
    pinMode(IR_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), irISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));

    Serial.println("Ready - monitoring IR beam...");
}

void loop() {
    // Status output for debugging
    static unsigned long lastStatusTime = 0;
    if (millis() - lastStatusTime >= 5000) {
        lastStatusTime = millis();
        bool active = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
        Serial.printf("Status: active=%d, breaks=%lu\n", active, totalRevolutionsPumping);
    }
}
```

### Arduino Version (ATmega328P / ATmega1284P)

```cpp
/**
 * IR Break Beam Sensor Module - Arduino
 *
 * Compatible with ATmega328P (Uno/Nano) and ATmega1284P.
 * Optimized for high-speed optical detection.
 */
#include <Wire.h>

// Pin configuration
#define IR_SENSOR_PIN 2  // D2 = INT0

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters - optimized for IR
#define DEBOUNCE_MS 10
#define ACTIVITY_TIMEOUT_MS 2000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastBreakTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// IR sensor interrupt
void irISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastBreakTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void receiveEvent(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
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
    Serial.println(F("IR Break Beam Sensor - Arduino"));

    // Configure IR sensor pin with interrupt
    pinMode(IR_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), irISR, FALLING);

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
        bool active = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
        Serial.print(F("Active: "));
        Serial.print(active);
        Serial.print(F(", Breaks: "));
        Serial.println(totalRevolutionsPumping);
    }
}
```

### ATtiny1614 Version (Mains Powered)

```cpp
/**
 * IR Break Beam Sensor Module - ATtiny1614
 *
 * Requires megaTinyCore: https://github.com/SpenceKonde/megaTinyCore
 *
 * Pin Configuration:
 * - PA3 (pin 13): IR receiver output
 * - PA1 (pin 11): SDA
 * - PA2 (pin 12): SCL
 */
#include <Wire.h>

// Pin configuration
#define IR_SENSOR_PIN PIN_PA3

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters - optimized for IR
#define DEBOUNCE_MS 10
#define ACTIVITY_TIMEOUT_MS 2000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastBreakTime = 0;
volatile unsigned long lastDebounceTime = 0;

uint8_t dataBuffer[9];

// IR sensor interrupt
void irISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastBreakTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void onReceive(int numBytes) {
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
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
    // Configure IR sensor pin with interrupt
    pinMode(IR_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), irISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    // Mains powered - no sleep needed
}
```

### ATtiny1614 Version (Battery Powered)

```cpp
/**
 * IR Break Beam Sensor Module - ATtiny1614 (Battery Powered)
 *
 * Includes sleep mode and EEPROM persistence.
 * Uses STANDBY sleep to maintain I2C responsiveness.
 */
#include <Wire.h>
#include <avr/sleep.h>
#include <EEPROM.h>

// Pin configuration
#define IR_SENSOR_PIN PIN_PA3

// I2C configuration
#define I2C_SLAVE_ADDRESS 0x36
#define CMD_PERFORM 0x10
#define CMD_READ 0x11

// Detection parameters - optimized for IR
#define DEBOUNCE_MS 10
#define ACTIVITY_TIMEOUT_MS 2000

// State variables
volatile uint8_t currentCommand = 0;
volatile uint32_t totalRevolutionsSpinning = 0;
volatile uint32_t totalRevolutionsPumping = 0;
volatile unsigned long lastBreakTime = 0;
volatile unsigned long lastDebounceTime = 0;
volatile bool i2cActive = false;

uint8_t dataBuffer[9];

// IR sensor interrupt - wakes from sleep
void irISR() {
    unsigned long now = millis();
    if (now - lastDebounceTime > DEBOUNCE_MS) {
        lastDebounceTime = now;
        lastBreakTime = now;
        totalRevolutionsPumping++;
    }
}

// I2C receive handler
void onReceive(int numBytes) {
    i2cActive = true;
    if (numBytes > 0) {
        currentCommand = Wire.read();

        if (currentCommand == CMD_PERFORM) {
            bool pumping = (millis() - lastBreakTime) < ACTIVITY_TIMEOUT_MS;
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

        // Save to EEPROM periodically
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
    set_sleep_mode(SLEEP_MODE_STANDBY);
    sleep_enable();
    sei();
    sleep_cpu();
    sleep_disable();
}

void setup() {
    // Load saved counters
    EEPROM.get(0, totalRevolutionsSpinning);
    EEPROM.get(4, totalRevolutionsPumping);
    if (totalRevolutionsSpinning == 0xFFFFFFFF) totalRevolutionsSpinning = 0;
    if (totalRevolutionsPumping == 0xFFFFFFFF) totalRevolutionsPumping = 0;

    // Configure IR sensor pin with interrupt
    pinMode(IR_SENSOR_PIN, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(IR_SENSOR_PIN), irISR, FALLING);

    // Initialize I2C slave
    Wire.begin(I2C_SLAVE_ADDRESS);
    Wire.onReceive(onReceive);
    Wire.onRequest(onRequest);

    memset(dataBuffer, 0, sizeof(dataBuffer));
}

void loop() {
    if (!i2cActive) {
        enterSleep();
    }
}
```

## Installation Tips

### Sensor Alignment

1. **Beam alignment**: TX and RX must face each other directly
2. **Gap size**: 3-10mm between sensor and teeth (sensor-dependent)
3. **Tooth size**: Teeth should fully break beam (no partial detection)
4. **Stability**: Mount firmly to prevent vibration misalignment

### Environmental Considerations

1. **Ambient light**: Avoid direct sunlight on receiver
2. **Dust/debris**: Can block beam - consider protective housing
3. **Condensation**: Moisture can affect IR transmission
4. **Temperature**: Most IR sensors work -20°C to +70°C

### Transmitter Power

The Adafruit 2168 transmitter runs continuously:
- Current draw: ~20mA at 5V
- For battery applications, consider switching TX only during measurements

## Troubleshooting

### No Detection

1. **Check alignment**: Beam must hit receiver directly
2. **Verify power**: TX LED on? (may need IR camera to see)
3. **Test receiver**: Cover beam manually, check signal change
4. **Clean lenses**: Dust blocks IR light

### Continuous "Active" State

1. **Beam blocked**: Check for debris or misalignment
2. **Receiver malfunction**: Test with known-good sensor
3. **Electrical issue**: Check power supply stability
4. **Ambient IR**: Strong sunlight can interfere

### Missed Counts

1. **Increase sensitivity**: Move sensors closer
2. **Reduce debounce**: Try 1-5ms for high-speed
3. **Check tooth size**: Must fully break beam
4. **Interrupt priority**: Ensure ISR isn't being blocked

### Erratic Counting

1. **Add filtering**: 100nF capacitor on signal line
2. **Stabilize mounting**: Vibration affects alignment
3. **Check for reflections**: Nearby surfaces can bounce IR
4. **Shield from interference**: Route signal away from motors

## Comparison with Hall Sensor

| Feature | IR Break Beam | KY-003 Hall |
|---------|--------------|-------------|
| Detection method | Optical beam break | Magnetic field |
| Speed capability | Very high (>10kHz) | Moderate (<1kHz) |
| Debounce needed | 1-10ms | 50-100ms |
| Installation | Requires alignment | Single point mount |
| Environmental sensitivity | Dust, light, moisture | Magnetic interference |
| Power consumption | Higher (TX always on) | Lower |
| Best for | High-speed, many teeth | Slow rotation, magnets |

## Next Steps

- [KY-003 Hall Sensor](/sensor-modules/ky-003-hall) - Magnet-based detection
- [Mock Sensor](/sensor-modules/mock-sensor) - Testing without hardware
- [Module Overview](/sensor-modules) - Back to overview
