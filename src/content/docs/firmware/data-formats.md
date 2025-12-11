---
title: Data Formats
description: Complete specification of all data formats used in the Multiflexmeter firmware, including EEPROM structure, LoRaWAN messages, and sensor protocols.
---

This page provides a complete technical specification of all data formats used in the Multiflexmeter firmware.

:::note[Version Information]
This documentation covers Multiflexmeter **3.7.0**. Version 3.8.0 is planned with structured sensor data formats.
:::

## Firmware Data Handling

### AS IS (Version 3.7.0)

The current firmware operates as a **sensor passthrough**:

1. Sends measurement trigger command to sensor module at I²C address `0x36`
2. Waits 10 seconds for measurement completion
3. Reads raw sensor data via SMBus Block Read (up to 32 bytes)
4. Transmits raw sensor data without firmware-level interpretation via LoRaWAN FPort 1

**Passthrough Architecture**: The firmware does not decode or interpret sensor data. The data format depends entirely on the sensor module connected at address `0x36`. All data interpretation happens at the application layer (TTN decoder + backend).

### TO BE (Version 3.8.0)

Future firmware will implement structured data handling:

```cpp
struct tx_pkt_t {
    uint8_t flags;           // Bit 0: spinning, Bit 1: pumping
    uint32_t revolutions;    // Total revolution counter
};
```

This structured format will standardize sensor data transmission and enable firmware-level validation.

#### Flag Interpretation

The `flags` byte encodes the poldermill operational state:

| Bit | Name | Description |
|-----|------|-------------|
| 0 | **spinning** | Poldermill rotor is rotating (wind-powered) |
| 1 | **pumping** | Water pumping mechanism is active |

**Operational Modes**:

- **spinning=1, pumping=0**: Wind-powered rotation only (no pumping load)
  - Revolutions counted normally
- **spinning=1, pumping=1**: Wind-powered pumping
  - Revolutions counted (may be slower due to pumping load)
- **spinning=0, pumping=1**: **Electric motor pumping**
  - No wind-driven rotation
  - **Revolutions should be 0** (no wind power)
- **spinning=0, pumping=0**: Idle poldermill
  - Revolutions should be 0

:::tip[Electric Motor Detection]
When `pumping=true` and `spinning=false`, the poldermill is using an **electric motor** for pumping. In this mode, the revolutions counter should report **0** because there is no wind-powered rotation. This is expected behavior, not an error.
:::

## EEPROM Configuration Structure

The device stores its configuration in EEPROM starting at address `0x00`.

### Memory Layout

```
Offset  Size   Field                    Endianness
------  ----   -----                    ----------
0x00    4      MAGIC ("MFM\0")          N/A
0x04    1      HW_VERSION.MSB           Big-endian
0x05    1      HW_VERSION.LSB           Big-endian
0x06    8      APP_EUI                  Little-endian
0x0E    8      DEV_EUI                  Little-endian
0x16    16     APP_KEY                  Big-endian
0x26    2      MEASUREMENT_INTERVAL     Little-endian
0x28    1      USE_TTN_FAIR_USE_POLICY  N/A
------
Total: 41 bytes
```

### Field Specifications

| Field | Type | Range | Description |
|-------|------|-------|-------------|
| **MAGIC** | char[4] | "MFM\0" | Magic bytes for validation (0x4D 0x46 0x4D 0x00) |
| **HW_VERSION** | uint16_t | 0x0000-0xFFFF | Hardware version (encoded, see below) |
| **APP_EUI** | uint8_t[8] | - | LoRaWAN Application EUI |
| **DEV_EUI** | uint8_t[8] | - | LoRaWAN Device EUI |
| **APP_KEY** | uint8_t[16] | - | LoRaWAN Application Key (AES-128) |
| **MEASUREMENT_INTERVAL** | uint16_t | 20-4270 | Measurement interval in seconds |
| **USE_TTN_FAIR_USE_POLICY** | uint8_t | 0-1 | Fair use policy (0=disabled, 1=enabled) |

:::tip[Validation]
Configuration is only considered valid if `MAGIC == "MFM\0"`. The measurement interval is automatically clamped to the range 20-4270 seconds.
:::

### Version Number Encoding

Both firmware and hardware versions use a 16-bit encoding scheme:

```
┌──────┬────────────┬────────────┬────────────┐
│ Bit  │ 15         │ 14-10      │ 9-5        │ 4-0        │
├──────┼────────────┼────────────┼────────────┼────────────┤
│ Field│ Proto      │ Major      │ Minor      │ Patch      │
│ Bits │ 1 bit      │ 5 bits     │ 5 bits     │ 5 bits     │
│ Range│ 0-1        │ 0-31       │ 0-31       │ 0-31       │
└──────┴────────────┴────────────┴────────────┴────────────┘

Proto: 0 = development, 1 = release
```

**Example**: Version 3.7.0 (release)
- Proto: 1, Major: 3, Minor: 7, Patch: 0
- Binary: `1 00011 00111 00000`
- Encoded: `0x8E00`

## LoRaWAN Uplink Messages

### FPort 1: Measurement Data

Raw sensor measurement data transmitted after each measurement cycle.

**Properties**:
- **FPort**: 1
- **Maximum Size**: 32 bytes
- **Frequency**: Based on `MEASUREMENT_INTERVAL` (20-4270 seconds)
- **Content**: Raw sensor module response (passthrough)

**Measurement Flow**:

1. **Trigger**: Send CMD_PERFORM (`0x10`) to sensor at address `0x36`
2. **Wait**: 10 seconds for measurement completion
3. **Read**: Send CMD_READ (`0x11`) to sensor, receive data via SMBus Block Read
4. **Transmit**: Send raw sensor response via LoRaWAN FPort 1 (no interpretation)

**Data Format**:

The payload contains unmodified bytes from the sensor module. The firmware does not validate, decode, or structure this data.

```
┌──────────────────────────────────────────┐
│ Raw sensor module data (0-32 bytes)      │
│ Format determined by sensor module       │
└──────────────────────────────────────────┘
```

:::caution[Sensor-Dependent Format]
The data format depends on the sensor module connected at I2C address `0x36`. The firmware transmits this data without interpretation. Decoding must be performed by the receiving application based on the specific sensor module in use.
:::

#### Poldermill Sensor Module Format (Type 0x01)

According to the firmware specification ([`readme.md:64-66`](https://github.com/MultiFlexMeter/Multiflexmeter-3.7.0)), all sensor modules follow this format:

```
<Module Address> <Module Type> <Module Data Blob>
```

For the **poldermill monitoring sensor** at I²C address `0x36`, the complete payload is **7 bytes**:

```
┌────────┬────────┬────────┬──────────────────────────┐
│ Byte 0 │ Byte 1 │ Byte 2 │ Bytes 3-6                │
├────────┼────────┼────────┼──────────────────────────┤
│ 0x36   │ 0x01   │ Flags  │ Revolutions (uint32 BE)  │
└────────┴────────┴────────┴──────────────────────────┘
```

| Field | Byte(s) | Type | Description |
|-------|---------|------|-------------|
| **Module Address** | 0 | uint8_t | I²C address (0x36) |
| **Module Type** | 1 | uint8_t | Sensor type (0x01 = poldermill) |
| **Flags** | 2 | uint8_t | Operational status (spinning, pumping) |
| **Revolutions** | 3-6 | uint32_t | Revolution count for this period (big-endian) |

**Flags Byte**:
- Bit 0: `1` = Spinning, `0` = Idle
- Bit 1: `1` = Pumping, `0` = Not pumping
- Bits 2-7: Reserved (set to 0)

**Example Payload**: `36 01 03 00 00 00 32`

Decoded:
- Module Address: `0x36` (poldermill sensor)
- Module Type: `0x01` (poldermill)
- Flags: `0x03` (0b00000011 = spinning + pumping)
- Revolutions: `0x00000032` (50 revolutions this period)

### FPort 2: Version Information

Device version information sent after OTAA join or device reset.

**Properties**:
- **FPort**: 2
- **Size**: 5 bytes (fixed)
- **Sent**: After join, or on reset

**Message Format**:

```
┌────────┬─────────┬─────────┬─────────┬─────────┐
│ Byte 0 │ Byte 1  │ Byte 2  │ Byte 3  │ Byte 4  │
├────────┼─────────┼─────────┼─────────┼─────────┤
│ 0x10   │ FW_MSB  │ FW_LSB  │ HW_MSB  │ HW_LSB  │
└────────┴─────────┴─────────┴─────────┴─────────┘
```

| Field | Byte(s) | Type | Endianness | Description |
|-------|---------|------|------------|-------------|
| **Command** | 0 | uint8_t | N/A | Version indicator (always `0x10`) |
| **FW_VERSION** | 1-2 | uint16_t | Big-endian | Firmware version (encoded) |
| **HW_VERSION** | 3-4 | uint16_t | Big-endian | Hardware version (encoded) |

**Example Payload**: `10 8E 00 84 40`

Decoded:
- Command: `0x10`
- Firmware: `0x8E00` = v3.7.0 (release)
- Hardware: `0x8440` = v1.2.0 (release)

### FPort 1 (New): Distance and Temperature

:::note[New Format]
This is a new payload format for distance and temperature sensors. This format is separate from the poldermill sensor format documented above.
:::

**Properties**:
- **FPort**: 1
- **Size**: 6 bytes (fixed)
- **Frequency**: Based on measurement interval

**Message Format**:

```
┌────────────┬────────────────────────────────┐
│ Bytes 0-1  │ Bytes 2-5                      │
├────────────┼────────────────────────────────┤
│ Distance   │ Temperature                    │
│ (uint16 LE)│ (float32 LE)                   │
└────────────┴────────────────────────────────┘
```

| Field | Byte(s) | Type | Endianness | Description |
|-------|---------|------|------------|-------------|
| **Distance** | 0-1 | uint16_t | Little-endian | Distance in millimeters |
| **Temperature** | 2-5 | float32 | Little-endian | Temperature in Celsius (IEEE 754) |

**Example Payload**: `DC 05 00 00 A0 41`

Decoded:

- Distance: `0x05DC` = 1500 mm (1.5 meters)
- Temperature: `0x41A00000` = 20.0°C (IEEE 754 float)

### FPort 3: Status with Cumulative Rotation Counters

:::note[Simulator Format]
This format is currently used by the device simulator and represents an enhanced status format with cumulative rotation counters.
:::

**Properties**:
- **FPort**: 3
- **Size**: 9 bytes (fixed)
- **Frequency**: Based on measurement interval

**Message Format**:

```
┌────────┬──────────────────────────┬──────────────────────────┐
│ Byte 0 │ Bytes 1-4                │ Bytes 5-8                │
├────────┼──────────────────────────┼──────────────────────────┤
│ Status │ Total Rotations Pumping  │ Total Rotations Spinning │
│ Flags  │ (uint32 LE)              │ (uint32 LE)              │
└────────┴──────────────────────────┴──────────────────────────┘
```

| Field | Byte(s) | Type | Endianness | Description |
|-------|---------|------|------------|-------------|
| **Status Flags** | 0 | uint8_t | N/A | Operational status (bit 0=spinning, bit 1=pumping) |
| **Total Rotations Pumping** | 1-4 | uint32_t | Little-endian | Cumulative rotation count while pumping |
| **Total Rotations Spinning** | 5-8 | uint32_t | Little-endian | Cumulative rotation count while spinning |

**Status Flags Byte**:

- Bit 0: `1` = Spinning, `0` = Idle
- Bit 1: `1` = Pumping, `0` = Not pumping
- Bits 2-7: Reserved (set to 0)

**Example Payload**: `03 E8 03 00 00 2C 01 00 00`

Decoded:

- Status: `0x03` (0b00000011 = spinning + pumping)
- Total Rotations Pumping: `0x000003E8` = 1000 rotations
- Total Rotations Spinning: `0x0000012C` = 300 rotations

## LoRaWAN Downlink Commands

All downlink commands can be sent on any FPort. The first byte determines the command type.

### Command 0x10: Change Measurement Interval

Update the device measurement interval.

**Format**:

```
┌────────┬──────────┬──────────┐
│ Byte 0 │ Byte 1   │ Byte 2   │
├────────┼──────────┼──────────┤
│ 0x10   │ Interval │ Interval │
│        │ MSB      │ LSB      │
└────────┴──────────┴──────────┘
```

| Field | Byte(s) | Type | Endianness | Range | Description |
|-------|---------|------|------------|-------|-------------|
| **Command** | 0 | uint8_t | N/A | 0x10 | Command identifier |
| **Interval** | 1-2 | uint16_t | Big-endian | 20-4270 | New interval in seconds |

**Behavior**:
- Interval is clamped to valid range (20-4270 seconds)
- New value is saved to EEPROM
- Next measurement is rescheduled immediately

**Example**: Set interval to 1800 seconds (30 minutes)

```
Downlink: 10 07 08
```

### Command 0x11: Module Command

Forward a command to the sensor module via SMBus.

**Format**:

```
┌────────┬────────────┬────────────┬────────────────┐
│ Byte 0 │ Byte 1     │ Byte 2     │ Bytes 3-N      │
├────────┼────────────┼────────────┼────────────────┤
│ 0x11   │ Module     │ Module     │ Command        │
│        │ Address    │ Command    │ Arguments      │
└────────┴────────────┴────────────┴────────────────┘
```

| Field | Byte(s) | Type | Description |
|-------|---------|------|-------------|
| **Command** | 0 | uint8_t | Command identifier (`0x11`) |
| **Module Address** | 1 | uint8_t | I2C/SMBus address (7-bit) |
| **Module Command** | 2 | uint8_t | Command byte for sensor |
| **Arguments** | 3-N | uint8_t[] | Optional parameters (0-29 bytes) |

**SMBus Transaction**:

```
[START][ADDR+W][CMD][LENGTH][DATA...][STOP]
```

**Example**: Send command `0x20` with arguments `[0x01, 0xFF]` to module at `0x36`

```
Downlink: 11 36 20 01 FF
```

Results in SMBus transaction:

```
[START][0x36+W][0x20][0x02][0x01][0xFF][STOP]
```

### Command 0xDEAD: Force Device Reset

Force the device to reset and rejoin the LoRaWAN network.

**Format**:

```
┌────────┬────────┐
│ Byte 0 │ Byte 1 │
├────────┼────────┤
│ 0xDE   │ 0xAD   │
└────────┴────────┘
```

| Field | Byte | Value | Description |
|-------|------|-------|-------------|
| **Command** | 0 | 0xDE | First magic byte |
| **Validation** | 1 | 0xAD | Second magic byte (required) |

**Behavior**:
1. Validates second byte is exactly `0xAD`
2. Schedules reset after 5 seconds
3. Watchdog timer triggers MCU reset
4. Device reboots and performs OTAA rejoin

:::caution[Device Downtime]
The device will be offline for approximately 10-30 seconds during reset and rejoin.
:::

**Example**:

```
Downlink: DE AD
```

## Sensor Communication Protocol

The device communicates with sensor modules using SMBus (I2C) protocol.

### Bus Configuration

| Parameter | Value |
|-----------|-------|
| **Protocol** | SMBus/I2C (TWI) |
| **Clock Speed** | 80 kHz |
| **Pull-ups** | External 4.7kΩ required on SDA/SCL |
| **Default Address** | 0x36 (7-bit) |

### Sensor Commands

| Command | Value | Protocol | Description |
|---------|-------|----------|-------------|
| **CMD_PERFORM** | 0x10 | SMBus Send Byte | Trigger sensor measurement |
| **CMD_READ** | 0x11 | SMBus Block Read | Read measurement results |

### CMD_PERFORM (0x10): Trigger Measurement

**SMBus Transaction**:

```
[START][0x36+W][0x10][STOP]
```

**Timing**: Wait 10 seconds before reading results

### CMD_READ (0x11): Read Measurement

**SMBus Transaction**:

```
[START][0x36+W][0x11][RESTART][0x36+R][LENGTH][DATA...][STOP]
```

**Response Format**:
1. First byte: Data length (N, max 32)
2. Next N bytes: Measurement data
3. Data format depends on sensor module implementation

## Measurement Timing

### Interval Configuration

| Parameter | Value | Unit | Description |
|-----------|-------|------|-------------|
| **MIN_INTERVAL** | 20 | seconds | Minimum measurement interval |
| **MAX_INTERVAL** | 4270 | seconds | Maximum measurement interval (71 minutes) |
| **PERFORM_DELAY** | 10 | seconds | Wait time after triggering measurement |
| **PING_DELAY** | 45 | seconds | Delay after version ping before first measurement |

### TTN Fair Use Policy

When enabled, the device enforces The Things Network fair use policy (maximum 30 seconds airtime per day).

**Calculation**:

```cpp
uint32_t airtime_ms = calculateAirtime(spreading_factor, payload_size);
uint32_t tx_per_day = 30000 / airtime_ms;
uint16_t min_interval = 86400 / (tx_per_day + 1);
```

**Typical Minimum Intervals**:
- **SF7** (fastest): approximately 173 seconds (3 minutes)
- **SF12** (slowest): approximately 5760 seconds (96 minutes)

If the configured interval is less than the calculated minimum, the minimum is enforced.

## Data Ranges and Limits

### Buffer Sizes

| Buffer | Size | Description |
|--------|------|-------------|
| **dataBuf** | 32 bytes | Main data buffer for sensor readings |
| **LMIC Payload** | 32 bytes | Maximum LoRaWAN payload size |
| **SMBus Block** | 32 bytes | Maximum SMBus block read size |

### Version Number Ranges

| Field | Bits | Range | Description |
|-------|------|-------|-------------|
| **Proto** | 1 | 0-1 | 0=development, 1=release |
| **Major** | 5 | 0-31 | Major version number |
| **Minor** | 5 | 0-31 | Minor version number |
| **Patch** | 5 | 0-31 | Patch version number |

### Airtime Assumptions

For fair use policy calculations:

| Parameter | Value | Description |
|-----------|-------|-------------|
| **Average Payload** | 12 bytes | Assumed sensor data size |
| **MAC Overhead** | 12 bytes | LoRaWAN frame overhead |
| **Total Frame** | 24 bytes | Used for airtime calculation |

## Error Codes

The firmware uses the following error codes for SMBus operations:

```cpp
typedef enum {
    ERR_NONE,                  // 0: Success
    ERR_SMBUS_SLAVE_NACK,      // 1: Slave did not acknowledge
    ERR_SMBUS_ARB_LOST,        // 2: Arbitration lost
    ERR_SMBUS_NO_ALERT,        // 3: No alert pending
    ERR_SMBUS_ERR,             // 4: General communication error
} error_t;
```

## Migration Path: 3.7.0 to 3.8.0

### Current Architecture (3.7.0)

The firmware operates as a sensor passthrough:
- No data interpretation or validation
- Direct transmission of sensor module responses
- Flexible but requires application-level decoding

### Planned Architecture (3.8.0)

The firmware will implement structured data handling:
- Defined `tx_pkt_t` structure for standardized data
- Firmware-level validation and encoding
- Standardized payload format across all devices
- Support for poldermill status monitoring (spinning, pumping, revolutions)

:::note[Development Status]
The `tx_pkt_t` structure is defined in the 3.7.0 codebase but not currently used. Implementation is planned for version 3.8.0.
:::

## Next Steps

- [Communication Protocol](/firmware/protocol/) - Higher-level protocol documentation
- [API Reference](/firmware/api-reference/) - Firmware API functions
- [Deployment Configuration](/deployment/configuration/) - Setting up device credentials
