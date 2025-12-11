# Technical Reference

**Version**: Multiflexmeter 3.7.0
**Last Updated**: 2025-10-30
**Audience**: Technical reference for all diagrams

This file contains constants, protocols, and specifications referenced throughout the diagram series.

---

## Hardware Specifications

### Microcontroller
- **Model**: ATmega1284P
- **Clock Speed**: 8MHz
- **Memory**: 128KB Flash, 16KB SRAM, 4KB EEPROM
- **Architecture**: 8-bit AVR

### Radio Module
- **Model**: RFM95 (SX1276)
- **Frequency**: 868MHz
- **Protocol**: LoRaWAN 1.0.2
- **Region**: EU868
- **Class**: Class A (bidirectional)

### External Sensor
- **Interface**: I2C/SMBus
- **Address**: 0x36
- **Bus Speed**: 80kHz

---

## Timing Constants

| Operation | Duration | Notes |
|-----------|----------|-------|
| **Device Boot** | <1 second | Self-tests and hardware initialization |
| **Initialization** | 1-2 seconds | Load settings, initialize peripherals |
| **LoRaWAN Join** | 5-10 seconds | OTAA join procedure |
| **Measurement Interval** | 20-4270 seconds | User-configurable, bounds-checked |
| **Sensor Wait After Trigger** | 10 seconds | `MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S` |
| **I2C Transaction** | ~1ms | Single command/response |
| **LoRaWAN Transmission** | 200-500ms | Depends on spreading factor (SF7-SF12) |
| **RX Window 1** | +1 second | After TX complete |
| **RX Window 2** | +2 seconds | After TX complete |
| **Version Uplink Delay** | 45 seconds | After join, before first measurement |
| **Watchdog Timeout** | 15ms | Critical error recovery |

---

## Communication Protocols

### I2C Commands (To Sensor at 0x36)

| Command | Hex | Description | Response |
|---------|-----|-------------|----------|
| **CMD_PERFORM** | `0x10` | Trigger new measurement | ACK only |
| **CMD_READ** | `0x11` | Read measurement results | Data bytes |

**Format**: Single byte command, followed by optional parameters

### LoRaWAN Uplink (Device → Network)

| Port | Purpose | Payload Format |
|------|---------|----------------|
| **1** | Sensor data | `[sensor_address][sensor_type][data_blob]` |
| **2** | Version ping | `[fw_msb][fw_lsb][hw_msb][hw_lsb]` (4 bytes) |

**Sending**: After each measurement cycle (Port 1) or on boot/reset (Port 2)

### LoRaWAN Downlink (Network → Device)

| Command | Hex | Payload | Description |
|---------|-----|---------|-------------|
| **Reset** | `0xDE 0xAD` | 2 bytes | Force device reset after 5 seconds |
| **Set Interval** | `0x10 [MSB] [LSB]` | 3 bytes | Update measurement interval (seconds, big-endian) |
| **Forward Command** | `0x11 [addr] [cmd] [data...]` | Variable | Forward command to I2C sensor |

**Validation**: Interval must be 20-4270 seconds, enforced by firmware

---

## EEPROM Configuration Structure

**Total Size**: 41 bytes
**Start Address**: 0x00
**Endianness**: Big-endian for multi-byte values

```c
struct rom_conf_t {
  uint8_t  MAGIC[4];              // Offset 0-3:   "MFM\0" identifier
  uint8_t  HW_VERSION[2];         // Offset 4-5:   Hardware version (MSB, LSB)
  uint8_t  APP_EUI[8];            // Offset 6-13:  LoRaWAN Application EUI
  uint8_t  DEV_EUI[8];            // Offset 14-21: LoRaWAN Device EUI
  uint8_t  APP_KEY[16];           // Offset 22-37: LoRaWAN Application Key
  uint16_t MEASUREMENT_INTERVAL;  // Offset 38-39: Interval in seconds (20-4270)
  uint8_t  USE_TTN_FAIR_USE_POLICY; // Offset 40: Boolean flag
};
```

**Persistence**: All settings survive resets and power cycles

---

## Error Codes

| Error Type | Detection Method | Recovery Strategy | Data Loss |
|------------|------------------|-------------------|-----------|
| **Sensor NACK** | I2C ACK bit missing | Skip measurement, retry next cycle | 1 reading |
| **Sensor Timeout** | No response after CMD_PERFORM | Skip measurement, retry next cycle | 1 reading |
| **Join Failure** | OTAA timeout | Retry with backoff (max 10 attempts) | Delayed start |
| **TX Failure** | Transmission error | Retry on next cycle | 1 transmission |
| **Link Dead** | No network response | Continue measuring, attempt rejoin | Data not sent |
| **Invalid Config** | Magic bytes incorrect | Load default settings | Settings lost |
| **Memory Corruption** | EEPROM read/write error | Watchdog reset | Device restarts |
| **Critical Fault** | Unrecoverable error | Watchdog reset | Device restarts |

---

## Network Configuration

### LoRaWAN Parameters
- **Activation**: OTAA (Over-The-Air Activation)
- **MAC Version**: 1.0.2
- **Region**: EU868
- **Data Rate**: ADR (Adaptive Data Rate) enabled
- **Max EIRP**: 16 dBm
- **Duty Cycle**: <1% (EU regulation)

### The Things Network Integration
- **Network**: The Things Network (TTN) V3
- **Uplink**: Device → Gateway → TTN → Backend
- **Downlink**: Backend → TTN → Gateway → Device
- **Fair Use Policy**: Optional, configurable via EEPROM

---

## Power Management

### Power States
- **Active**: MCU running, radio TX/RX, sensor powered
- **Sleep**: MCU sleep mode, radio idle, sensor off
- **Deep Sleep**: Lowest power, only RTC/watchdog active

### Power Budget (Typical)
- **Active (measuring)**: ~50mA @ 3.3V
- **Active (transmitting)**: ~120mA @ 3.3V
- **Sleep**: ~0.5mA @ 3.3V

**Battery Life Estimate**: Depends on measurement interval and battery capacity

---

## Color Scheme for Diagrams

Consistent styling across all diagrams:

```css
/* Component Categories */
Device/Hardware:    #e1f5ff  (light blue)
Firmware/Software:  #fff4e1  (light orange)
Power/Critical:     #ffe1e1  (light red)
Environment/Sensor: #e1ffe1  (light green)
Network/Cloud:      #f4e1ff  (light purple)
Warning/Error:      #fff4e1  (light yellow)
```

---

## Cross-References

- **Firmware Source**: `../Multiflexmeter-3.7.0/src/`
- **C4 Architecture Model**: `../src/likec4/model.c4`
- **Protocol Documentation**: `../src/content/docs/firmware/protocol.md`
- **API Reference**: `../src/content/docs/firmware/api.md`

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.7.0 | 2025-10-30 | Initial reference file created |

**Note**: When firmware is updated, this file must be reviewed and updated accordingly.
