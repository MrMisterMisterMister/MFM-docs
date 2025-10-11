---
title: Firmware Specifications
description: Complete technical specifications for Multiflexmeter V3.7.0 firmware
---

# Firmware Specifications

Complete technical specifications for the Multiflexmeter V3.7.0 firmware platform.

## Firmware Information

| Specification | Value |
|--------------|-------|
| **Version** | 0.0.0 (Development) |
| **Build System** | PlatformIO |
| **Framework** | Arduino Core |
| **Language** | C++ (C++11) |
| **Compiler** | AVR-GCC |
| **Flash Usage** | ~30-35 KB (varies by board) |
| **RAM Usage** | ~2-4 KB (varies by board) |
| **EEPROM Usage** | 64 bytes (configuration) |

## Core Libraries

| Library | Version | Purpose | Size Impact |
|---------|---------|---------|-------------|
| **MCCI Arduino LoRaWAN** | ^0.9.2 | LoRaWAN protocol stack | ~30KB flash |
| **MedianFilter** | Local | Sensor data filtering | <1KB flash |
| **Adafruit SleepyDog** | ^1.6.4 | Declared dependency (unused) | 0KB |

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
| **Clock Speed** | 100 kHz (standard mode) |
| **Slave Address** | 0x36 |
| **Data Format** | 16-bit big-endian |
| **Commands** | Read sensor data |

## EEPROM Configuration Structure

### Configuration Layout (64 bytes)

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0x00 | 8 bytes | `deveui` | Device EUI for LoRaWAN |
| 0x08 | 8 bytes | `appeui` | Application EUI |
| 0x10 | 16 bytes | `appkey` | Application Key |
| 0x20 | 4 bytes | `devaddr` | Device Address |
| 0x24 | 16 bytes | `nwkskey` | Network Session Key |
| 0x34 | 16 bytes | `appskey` | Application Session Key |
| 0x44 | 4 bytes | `netid` | Network ID |
| 0x48 | 4 bytes | `seqnoUp` | Uplink sequence number |
| 0x4C | 4 bytes | `seqnoDn` | Downlink sequence number |
| 0x50 | 1 byte | `version` | Configuration version |
| 0x51 | 15 bytes | *Reserved* | Future use |

### Version Encoding

```cpp
// Version format: 0xMMmmpp (Major.minor.patch)
#define CONFIG_VERSION_MAJOR 3
#define CONFIG_VERSION_MINOR 7
#define CONFIG_VERSION_PATCH 0
// Results in version byte: 0x37 (3.7.0)
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

### Flash Memory Usage

| Section | Size | Description |
|---------|------|-------------|
| **Bootloader** | ~2KB | Arduino bootloader |
| **Application** | ~30-35KB | Main firmware |
| **LMIC Library** | ~25KB | LoRaWAN stack |
| **Arduino Core** | ~5KB | Hardware abstraction |
| **Free Space** | ~60-90KB | Available for expansion |

### RAM Usage

| Section | Size | Description |
|---------|------|-------------|
| **LMIC Stack** | ~1.5KB | LoRaWAN buffers |
| **Application** | ~0.5-1KB | Variables and buffers |
| **Arduino Core** | ~0.5KB | System overhead |
| **Free Stack** | Remaining | Available for local variables |

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
The document below is for the previous MFM v2.0 firmware version. While some architectural concepts remain applicable, refer to the current V3.7.0 specifications above for accurate implementation details.
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