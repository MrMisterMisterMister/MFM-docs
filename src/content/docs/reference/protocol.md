---
title: Communication Protocol
description: Detailed specification of uplink and downlink messages, FPorts, and command formats.
---

This document specifies the LoRaWAN communication protocol used by Multiflexmeter V3, including uplink message formats, downlink commands, and payload structures.

## LoRaWAN Configuration

### Network Parameters

- **LoRaWAN Version:** 1.0.2
- **Activation:** OTAA (Over-The-Air Activation)
- **Class:** Class A
- **Region:** EU868 (configurable)
- **Adaptive Data Rate:** Enabled

### Join Procedure

The device uses OTAA with the following credentials:

- **APP_EUI:** Application identifier (8 bytes)
- **DEV_EUI:** Device identifier (8 bytes)
- **APP_KEY:** Application key (16 bytes)

All stored in EEPROM and loaded at startup.

## Uplink Messages

Uplinks are messages sent **from the device to the network**.

### FPort 1: Measurement Data

**Purpose:** General-purpose sensor measurements

**Format:** Multiple measurement packets concatenated together

```
<Module 1 Data> <Module 2 Data> ... <Module N Data>
```

#### Measurement Packet Structure

Each measurement packet follows this format:

```
| Byte 0 | Byte 1 | Bytes 2-N |
|--------|--------|-----------|
| Module | Module | Module    |
| Address| Type   | Data Blob |
```

**Fields:**

- **Module Address (1 byte):** I2C address of the sensor module (e.g., `0x36`)
- **Module Type (1 byte):** Type identifier for the sensor
- **Module Data Blob (variable):** Sensor-specific measurement data

#### Example Payload

```
36 01 05 A0 15 42
```

Decoding:
- Module Address: `0x36`
- Module Type: `0x01`
- Data: `0x05 0xA0 0x15 0x42` (interpretation depends on module type)

#### Measurement Trigger Flow

1. Device sends SMBus command `0x10` (perform measurement) to module
2. Waits 10 seconds for measurement completion
3. Sends SMBus command `0x11` (read data) to module
4. Receives measurement packet
5. Transmits via LoRaWAN on FPort 1

### FPort 2: Version Information

**Purpose:** Device identification and version reporting

**Sent:** 
- After successful OTAA join
- After device reset

**Format:** 5 bytes

```
| Byte 0 | Bytes 1-2      | Bytes 3-4      |
|--------|----------------|----------------|
| 0x10   | FW Version     | HW Version     |
```

**Fields:**

- **Identifier (1 byte):** Always `0x10`
- **Firmware Version (2 bytes):** Big-endian 16-bit version number
- **Hardware Version (2 bytes):** Big-endian 16-bit version number

#### Version Number Format

The 16-bit version number is encoded as:

```
| Bit 15  | Bits 14-10 | Bits 9-4   | Bits 3-0   |
|---------|------------|------------|------------|
| Proto   | Major      | Minor      | Patch      |
```

- **Proto (1 bit):** 0 = development, 1 = release
- **Major (5 bits):** Major version (0-31)
- **Minor (6 bits):** Minor version (0-63)
- **Patch (4 bits):** Patch version (0-15)

#### Example Version Packet

```
10 81 C0 06 00
```

Decoding:
- Identifier: `0x10`
- FW Version: `0x81C0` = 1.3.7.0 (release)
- HW Version: `0x0600` = 0.3.0.0 (development)

#### Decoding Function

```javascript
function decodeVersion(version16bit) {
  const proto = (version16bit >> 15) & 0x01;
  const major = (version16bit >> 10) & 0x1F;
  const minor = (version16bit >> 4) & 0x3F;
  const patch = version16bit & 0x0F;
  
  return `${major}.${minor}.${patch} (${proto ? 'release' : 'dev'})`;
}
```

## Downlink Messages

Downlinks are messages sent **from the network to the device**.

:::caution
Downlinks can only be received during RX windows after an uplink transmission (Class A behavior).
:::

### Downlink Commands

All downlink commands can be sent on **any FPort**.

### Command 0x10: Change Measurement Interval

**Purpose:** Update the measurement interval

**Format:** 3 bytes

```
| Byte 0 | Bytes 1-2      |
|--------|----------------|
| 0x10   | New Interval   |
```

**Fields:**

- **Command (1 byte):** `0x10`
- **Interval (2 bytes):** New interval in seconds (big-endian)

**Range:** 20 - 4270 seconds (enforced by firmware)

**Effect:**
1. Updates measurement interval in RAM
2. Saves new interval to EEPROM
3. Clears current schedule
4. Immediately reschedules next measurement

#### Example

Set interval to 900 seconds (15 minutes):

```
10 03 84
```

- Command: `0x10`
- Interval: `0x0384` = 900 seconds

### Command 0x11: Module Command

**Purpose:** Forward a command to a connected sensor module

**Format:** Variable length

```
| Byte 0 | Byte 1  | Byte 2  | Bytes 3-N    |
|--------|---------|---------|--------------|
| 0x11   | Module  | Module  | Command      |
|        | Address | Command | Arguments    |
```

**Fields:**

- **Command (1 byte):** `0x11`
- **Module Address (1 byte):** I2C address of target module
- **Module Command (1 byte):** Command to send to module
- **Arguments (variable):** Optional command arguments

**Effect:**
1. Extracts module address and command
2. Sends SMBus block write to module
3. Module processes command

#### Example

Send command `0x20` with argument `0xFF` to module at address `0x36`:

```
11 36 20 FF
```

- Command: `0x11`
- Module Address: `0x36`
- Module Command: `0x20`
- Arguments: `0xFF`

### Command 0xDEAD: Force Rejoin/Reset

**Purpose:** Force device to rejoin the network or reset

**Format:** 2 bytes

```
| Byte 0 | Byte 1 |
|--------|--------|
| 0xDE   | 0xAD   |
```

**Security:** Both bytes required (`0xDEAD`) to prevent accidental resets

**Effect:**
1. Validates second byte is `0xAD`
2. Schedules reset job for 5 seconds in the future
3. Device performs MCU reset
4. Device restarts and rejoins network

#### Example

```
DE AD
```

This will reset the device after 5 seconds.

## Payload Examples

### Complete Uplink Example

Device sends distance measurement:

**FPort 1 Payload:**
```
36 01 00 C8 15 42
```

**Interpretation:**
- Module Address: `0x36`
- Module Type: `0x01` (distance sensor)
- Distance: `0x00C8` = 200 (units depend on sensor)
- Temperature: `0x1542` = 5442 (scaled temperature)

### Complete Downlink Example

Server changes interval and sends module command:

**Downlink 1 - Change Interval to 30 minutes:**
```
FPort: Any
Payload: 10 07 08
```

**Downlink 2 - Configure Module:**
```
FPort: Any
Payload: 11 36 30 01 FF
```

## Message Scheduling

### Uplink Timing

The device schedules uplinks based on:

1. **Configured Interval:** From EEPROM
2. **TTN Fair Use Policy:** If enabled
3. **Duty Cycle Availability:** Regional regulations

#### TTN Fair Use Calculation

```c
uint32_t airtime_ms = osticks2ms(calcAirTime(LMIC.rps, 24));
uint32_t tx_per_day = 30000 / airtime_ms;  // 30s per day max
uint16_t fair_use_interval = 86400 / (tx_per_day + 1);

if (configured_interval < fair_use_interval) {
  actual_interval = fair_use_interval;  // Enforce fair use
} else {
  actual_interval = configured_interval;
}
```

#### Duty Cycle Compliance

The LMIC library enforces regional duty cycle limits (e.g., 1% for EU868 on most channels).

If the duty cycle is exceeded:
- `LMIC.opmode & OP_TXRXPEND` will be true
- Device skips transmission
- Reschedules next measurement

### Downlink Reception Windows

Class A devices have two receive windows after each uplink:

- **RX1:** 1 second after uplink ends
- **RX2:** 2 seconds after uplink ends (uses DR0/SF12)

Downlinks must be sent during these windows.

## Confirmed vs Unconfirmed Messages

The Multiflexmeter uses **unconfirmed uplinks** by default:

```c
LMIC_setTxData2(fport, data, length, 0);  // Last param: 0 = unconfirmed
```

**Benefits:**
- Lower airtime usage
- Better battery life
- More transmissions per day

**Drawbacks:**
- No guarantee of delivery
- No automatic retransmission

:::tip
For critical commands, use confirmed downlinks from your integration platform.
:::

## Error Handling

### Transmission Errors

If `LMIC_setTxData2()` returns non-zero:

| Error Code | Meaning | Action |
|------------|---------|--------|
| `LMIC_ERROR_TX_BUSY` | Previous TX not complete | Skip transmission, reschedule |
| `LMIC_ERROR_TX_TOO_LARGE` | Payload exceeds max size | Log error, drop message |
| `LMIC_ERROR_TX_NOT_FEASIBLE` | No available channel | Wait for duty cycle, retry |

### Link Quality

Monitor link quality via:

- **RSSI:** Signal strength indicator
- **SNR:** Signal-to-noise ratio
- **Link Check:** LMIC `LMIC_setLinkCheckMode(1)`

## Integration Examples

### The Things Network (TTN)

#### Payload Formatter

```javascript
function decodeUplink(input) {
  const result = { data: {} };
  
  if (input.fPort === 1) {
    // Parse measurement data
    let offset = 0;
    let moduleIndex = 0;
    
    while (offset < input.bytes.length - 1) {
      const addr = input.bytes[offset++];
      const type = input.bytes[offset++];
      
      // Example: Parse 4-byte data
      if (offset + 4 <= input.bytes.length) {
        const value1 = (input.bytes[offset] << 8) | input.bytes[offset + 1];
        const value2 = (input.bytes[offset + 2] << 8) | input.bytes[offset + 3];
        
        result.data[`module_${moduleIndex}`] = {
          address: addr,
          type: type,
          value1: value1,
          value2: value2
        };
        
        offset += 4;
      }
      moduleIndex++;
    }
  } else if (input.fPort === 2) {
    // Parse version info
    if (input.bytes.length >= 5 && input.bytes[0] === 0x10) {
      const fwVer = (input.bytes[1] << 8) | input.bytes[2];
      const hwVer = (input.bytes[3] << 8) | input.bytes[4];
      
      result.data.firmware_version = {
        proto: (fwVer >> 15) & 0x01,
        major: (fwVer >> 10) & 0x1F,
        minor: (fwVer >> 4) & 0x3F,
        patch: fwVer & 0x0F
      };
      
      result.data.hardware_version = {
        proto: (hwVer >> 15) & 0x01,
        major: (hwVer >> 10) & 0x1F,
        minor: (hwVer >> 4) & 0x3F,
        patch: hwVer & 0x0F
      };
    }
  }
  
  return result;
}
```

### Sending Downlinks via TTN API

```bash
# Change interval to 1800 seconds (30 minutes)
curl -X POST "https://eu1.cloud.thethings.network/api/v3/as/applications/YOUR_APP/devices/YOUR_DEVICE/down/push" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "downlinks": [{
      "f_port": 1,
      "frm_payload": "EAOYA=",  # Base64 of 10 03 84
      "priority": "NORMAL"
    }]
  }'
```

## Best Practices

1. **Minimize Payload Size:** Every byte increases airtime
2. **Use Appropriate Data Rates:** Higher DR = less airtime
3. **Batch Measurements:** Send multiple sensor readings in one message
4. **Avoid Frequent Downlinks:** Limited by uplink frequency
5. **Handle Missed Downlinks:** Device may not always receive them
6. **Version All Devices:** Use FPort 2 to track firmware versions

## Next Steps

- **[Hardware Reference](/reference/hardware/)** - Pin assignments and connections
- **[API Reference](/reference/api/)** - Function documentation
- **[Configuration Guide](/guides/configuration/)** - EEPROM and LoRaWAN setup
