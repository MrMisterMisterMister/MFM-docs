---
title: Firmware Specifications
description: Complete technical specifications for Multiflexmeter 3.7.0 firmware
---

# Firmware Specifications

Complete technical specifications for the Multiflexmeter 3.7.0 firmware platform.

## Firmware Information

| Specification | Value |
|--------------|-------|
| **Version** | 0.0.0 (Development, set via build flags) |
| **Build System** | PlatformIO |
| **Framework** | Arduino Core |
| **Language** | C++ (C++11) |
| **Compiler** | AVR-GCC |
| **Flash Usage** | ~50-60 KB (application + LMIC) |
| **RAM Usage** | ~4-6 KB (LMIC buffers + application) |
| **EEPROM Usage** | 41 bytes (configuration) |

## Core Libraries

| Library | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| **MCCI Arduino LoRaWAN (LMIC)** | Git (mcci-catena/arduino-lmic) | LoRaWAN protocol stack | ~30KB flash |
| **MedianFilter** | Local (lib/) | Sensor data filtering (available but unused) | 0KB |
| **Adafruit SleepyDog** | ^1.4.0 | Declared dependency (unused in current code) | 0KB |

## Communication Protocols

### LoRaWAN Configuration

| Parameter | Value |
|-----------|-------|
| **Region** | EU868 |
| **Class** | Class A |
| **Activation** | OTAA (Over-The-Air) |
| **Data Rate** | DR0-DR7 (SF12-SF7) |
| **TX Power** | 14 dBm default |
| **Duty Cycle** | EU regulations compliant |
| **Port** | 1 (application data) |

### SMBus/I²C Interface

| Parameter | Value |
|-----------|-------|
| **Protocol** | SMBus/I²C |
| **Clock Speed** | 80 kHz (F_SMBUS = 80000L in smbus.cpp) |
| **Slave Address** | 0x36 (SENSOR_BOARD_ADDR) |
| **Commands** | CMD_PERFORM (0x10), CMD_READ (0x11) |
| **Data Format** | Variable length block read |

## EEPROM Configuration Structure

### Configuration Layout (41 bytes)

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0x00 | 4 bytes | `MAGIC` | Magic header "MFM\0" (validation) |
| 0x04 | 2 bytes | `HW_VERSION` | Hardware version (MSB, LSB) |
| 0x06 | 8 bytes | `APP_EUI` | Application EUI (LSB-first for LMIC) |
| 0x0E | 8 bytes | `DEV_EUI` | Device EUI (LSB-first for LMIC) |
| 0x16 | 16 bytes | `APP_KEY` | Application Key (MSB-first, 128-bit) |
| 0x26 | 2 bytes | `MEASUREMENT_INTERVAL` | Interval in seconds (little-endian uint16_t) |
| 0x28 | 1 byte | `USE_TTN_FAIR_USE_POLICY` | Fair use flag (0=disabled, 1=enabled) |

:::note[OTAA Only]
This firmware uses **OTAA (Over-The-Air Activation) only**. There are no ABP session keys (NwkSKey/AppSKey) or device address stored in EEPROM. Session keys are derived during the join procedure.
:::

### Version Encoding

Versions are encoded as 16-bit values with the following bit layout:

```cpp
// Version encoding: [proto:1][major:5][minor:5][patch:5]
// Bit 15: Proto (0=dev, 1=release)
// Bits 14-10: Major version (0-31)
// Bits 9-5: Minor version (0-31)
// Bits 4-0: Patch version (0-31)

// Example: v3.7.0 (release) = 0b1 00011 00111 00000 = 0x8E00
version conf_getHardwareVersion();  // From EEPROM HW_VERSION
version conf_getFirmwareVersion();  // From build flags
uint16_t versionToUint16(version v); // Convert to uint16 for transmission
```

## Build Configurations

### Board Variants

| Board ID | MCU | Flash | RAM | Clock | Core |
|----------|-----|-------|-----|-------|------|
| `mfm_v3_m1284p` | ATmega1284P | 128KB | 16KB | 8MHz | MightyCore |
| `mfm_v3` | ATmega328P | 32KB | 2KB | 8MHz | MiniCore |

### Compiler Flags

```ini
build_flags = 
    -DCFG_eu868=1
    -DCFG_sx1276_radio=1
    -DARDUINO_LMIC_PROJECT_CONFIG_H_SUPPRESS
    -DSERIAL_BAUD=115200
```

## Power Consumption

| Mode | Current Draw | Duration | Notes |
|------|-------------|----------|--------|
| **Active** | ~50-100mA | <1 second | During transmission |
| **Sleep** | ~5-10µA | 95%+ of time | LMIC power management |
| **Sensor Read** | ~20-30mA | <100ms | I²C communication |

## Timing Specifications

| Event | Interval | Variation | Notes |
|-------|----------|-----------|--------|
| **Sensor Perform → Read** | 10 seconds | Fixed | `MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S` |
| **Join → Version Ping** | 45 seconds | Fixed | `MEASUREMENT_DELAY_AFTER_PING_S` |
| **Measurement Interval** | 20-4270 seconds | Configurable | From EEPROM, bounds checked |
| **Reset Delay** | 5 seconds | Fixed | After 0xDEAD command |
| **LoRaWAN TX** | Duty cycle limited | EU868 regulations | Max 1% duty cycle |
| **Watchdog Reset** | 8 seconds | Hardware timer | Safety mechanism |

## Memory Layout

### Flash Memory Usage (ATmega1284P)

| Section | Size | Description |
|---------|------|-------------|
| **Application** | ~58KB | Main firmware code |
| **LMIC Library** | ~30KB | LoRaWAN protocol stack |
| **Arduino Core** | ~20KB | Hardware abstraction (MightyCore) |
| **Free Space** | ~20KB | Available for expansion |
| **Total Available** | 128KB | ATmega1284P Flash |

### RAM Usage (ATmega1284P)

| Section | Size | Description |
|---------|------|-------------|
| **LMIC Buffers** | ~4KB | LoRaWAN TX/RX buffers and state |
| **Application** | ~2KB | Global variables and buffers |
| **Stack** | ~2KB | Function call stack |
| **Heap** | ~8KB | Dynamic allocation (if used) |
| **Total Available** | 16KB | ATmega1284P SRAM |

### EEPROM Usage (ATmega1284P)

| Section | Size | Description |
|---------|------|-------------|
| **Configuration** | 41 bytes | Device configuration at address 0x00 |
| **Free Space** | 4055 bytes | Available for extensions |
| **Total Available** | 4KB | ATmega1284P EEPROM |

## API Interface

### Main Functions

| Function | Purpose | Call Frequency |
|----------|---------|----------------|
| `setup()` | Board, sensor, LMIC initialization | Once at boot |
| `loop()` | LMIC job scheduler only | Continuous (`os_runloop_once()`) |
| `onEvent()` | LMIC event handler | On LoRaWAN events |
| `job_performMeasurements()` | Trigger sensor measurement | LMIC scheduled |
| `job_fetchAndSend()` | Read and transmit sensor data | After 10s delay |
| `job_pingVersion()` | Send version after join | After join completion |
| `scheduleNextMeasurement()` | Calculate next measurement time | After transmission |
| `processDownlink()` | Handle downlink commands | On RX data |

### Job Functions

```cpp
// Actual job functions used in firmware
void job_pingVersion(osjob_t *job);      // Send version info after join
void job_performMeasurements(osjob_t *job); // Start sensor measurement  
void job_fetchAndSend(osjob_t *job);     // Read sensor and transmit
void job_reset(osjob_t *job);            // Device reset via watchdog
void job_error(osjob_t *job);            // Error state (infinite loop)
```

## Compatibility

### Arduino IDE Compatibility

| IDE Version | Support | Notes |
|-------------|---------|--------|
| **Arduino IDE 1.8.x** | ✅ Yes | Recommended |
| **Arduino IDE 2.x** | ✅ Yes | Modern interface |
| **PlatformIO** | ✅ Yes | Primary development |

### Core Dependencies

| Core | Board | Compatibility |
|------|-------|--------------|
| **MightyCore** | ATmega1284P | Required for mfm_v3_m1284p |
| **MiniCore** | ATmega328P | Required for mfm_v3 |

## Legacy Documentation

### MFM v2.0 Firmware Specification (Reference)

:::note
The document below is for the previous MFM v2.0 firmware version. While some architectural concepts remain applicable, refer to the current 3.7.0 specifications above for accurate implementation details.
:::

<iframe 
  src="/pdfs/Firmware-P22296-10-SPEC-MFM-v2.0.pdf" 
  width="100%" 
  height="100vh"
  style="min-height: 842px; border: none;"
  title="MFM v2.0 Firmware Specification">
  <p>Your browser doesn't support PDF viewing. 
     <a href="/pdfs/Firmware-P22296-10-SPEC-MFM-v2.0.pdf" download>Download Firmware Specification PDF</a>
  </p>
</iframe>

[📄 Download Firmware Specification (PDF)](/pdfs/Firmware-P22296-10-SPEC-MFM-v2.0.pdf)