---
title: Communication Protocol
description: LoRaWAN message formats, FPorts, and command specifications for Multiflexmeter V3.7.0
---

# Communication Protocol

This document describes the LoRaWAN communication protocol used by Multiflexmeter V3.7.0, including uplink message formats, downlink commands, and TTN integration.

## LoRaWAN Configuration

### Network Parameters

- **LoRaWAN Version**: 1.0.x
- **Activation**: OTAA (Over-the-Air Activation)
- **Device Class**: Class A (battery-optimized, bi-directional)
- **Frequency Plan**: EU868 (868MHz)
- **Adaptive Data Rate (ADR)**: Enabled by default
- **Link Check**: Disabled after join

### Activation (OTAA)

The device requires three credentials stored in EEPROM:

| Credential | Size | Byte Order | Description |
|------------|------|------------|-------------|
| **DevEUI** | 8 bytes | Little-endian | Unique device identifier |
| **AppEUI** | 8 bytes | Little-endian | Application identifier |
| **AppKey** | 16 bytes | Big-endian | Application key for encryption |

**Join Procedure:**
1. Device powers on and loads credentials from EEPROM
2. Sends join request with DevEUI and AppEUI
3. Network server verifies and sends join accept
4. Session keys derived from AppKey
5. Device is now joined and can transmit

## FPort Usage

| FPort | Direction | Purpose |
|-------|-----------|---------|
| **1** | Uplink | Measurement data from sensors |
| **2** | Uplink | System version information (firmware + hardware) |
| **Any** | Downlink | Commands (interval change, module commands, reset) |

## Uplink Messages

### FPort 1: Measurement Data

Measurement messages contain data from one or more sensor modules.

#### Format

```
<Module Address> <Module Type> <Module Data Blob> [<Module Address> <Module Type> <Module Data>...]
```

**Structure:**
- **Module Address** (1 byte): I²C address of the sensor module (default: `0x36`)
- **Module Type** (1 byte): Identifier for the sensor type
- **Module Data Blob** (variable): Module-specific measurement data

#### Example

```
36 01 03 E8 00 64
```

Decoded:
- Module Address: `0x36` (54 decimal)
- Module Type: `0x01`
- Data Blob: `03 E8 00 64` (module-specific format)

#### Multiple Modules

If multiple sensors are connected:

```
36 01 <data1> 37 02 <data2> 38 01 <data3>
```

Three modules at addresses 0x36, 0x37, 0x38.

### FPort 2: Version Information

Sent automatically after successful OTAA join.

#### Format

```
0x10 <FW_MSB> <FW_LSB> <HW_MSB> <HW_LSB>
```

**Fields:**
- **0x10** (1 byte): Message type identifier
- **FW_MSB, FW_LSB** (2 bytes): Firmware version (big-endian uint16)
- **HW_MSB, HW_LSB** (2 bytes): Hardware version (big-endian uint16)

#### Version Encoding

Each version is a 16-bit value with bit-packed fields:

```
Bit 15:      Proto (0 = development, 1 = release)
Bits 14-10:  Major version (0-31)
Bits 9-5:    Minor version (0-31)
Bits 4-0:    Patch version (0-31)
```

**Example:**

Firmware Version 1.3.7 (release):
```
Binary: 1 00001 00011 00111
Hex: 0x8467
Bytes: 84 67
```

#### Decoding Version

JavaScript decoder:

```javascript
function decodeVersion(msb, lsb) {
  const version = (msb << 8) | lsb;
  return {
    proto: (version >> 15) & 0x01,  // 0=dev, 1=release
    major: (version >> 10) & 0x1F,  // 5 bits
    minor: (version >> 5) & 0x1F,   // 5 bits
    patch: version & 0x1F            // 5 bits
  };
}
```

#### Example Message

Complete version uplink:
```
10 84 43 00 C3
```

Decoded:
- Message type: `0x10`
- Firmware: `0x8467` → v1.3.7 (release)
- Hardware: `0x00C3` → v0.6.3 (development)

## Downlink Commands

Downlink commands can be sent on **any FPort**. The device processes commands based on the first byte.

### Command 0x10: Change Measurement Interval

Update the measurement interval dynamically.

#### Format

```
0x10 <Interval_MSB> <Interval_LSB>
```

**Fields:**
- **0x10** (1 byte): Command identifier
- **Interval** (2 bytes big-endian): New interval in **seconds**

**Constraints:**
- Minimum: 20 seconds (`MIN_INTERVAL`)
- Maximum: 4270 seconds (~71 minutes) (`MAX_INTERVAL`)
- Out-of-range values are clamped to limits

#### Example

Set interval to 30 minutes (1800 seconds):

```
Interval: 1800 decimal = 0x0708 hex
Downlink: 10 07 08
```

**Device Action:**
1. Validate interval (20 ≤ interval ≤ 4270)
2. Update EEPROM with new value
3. Cancel current scheduled measurement
4. Schedule next measurement with new interval

### Command 0x11: Forward Command to Module

Send a command directly to a sensor module via I²C/SMBus.

#### Format

```
0x11 <Module_Address> <Module_Command> [Arguments...]
```

**Fields:**
- **0x11** (1 byte): Command identifier
- **Module Address** (1 byte): I²C address of target module
- **Module Command** (1 byte): Command byte for the module
- **Arguments** (0-29 bytes): Optional command-specific parameters

**Maximum payload**: 32 bytes total (LoRaWAN Class A downlink limit)

#### Example

Send command `0x20` with argument `0x01` to module at address `0x36`:

```
Downlink: 11 36 20 01
```

**Device Action:**
1. Extract module address: `0x36`
2. Extract module command: `0x20`
3. Extract arguments: `[0x01]`
4. Execute: `smbus_blockWrite(0x36, 0x20, [0x01], 1)`
5. Return any error via debug output (if enabled)

#### Use Cases

- Configure sensor parameters
- Trigger special measurements
- Update sensor firmware
- Read sensor diagnostics

### Command 0xDEAD: Force Device Reset

Reboot the device after a delay.

#### Format

```
0xDE 0xAD
```

**Fields:**
- **0xDE 0xAD** (2 bytes): Magic reset command

**Device Action:**
1. Validate second byte is `0xAD`
2. Schedule reset job with 5-second delay
3. Device resets via watchdog or software reset
4. Device powers up, loads EEPROM, and rejoins network

:::caution[Reset Behavior]
Device will perform full OTAA rejoin after reset. Ensure good network coverage.
:::

#### Example

```
Downlink: DE AD
```

After 5 seconds, device resets and rejoins.

## TTN Integration

### Payload Decoder (JavaScript)

Complete TTN payload formatter:

```javascript
function decodeUplink(input) {
  const port = input.fPort;
  const bytes = input.bytes;
  
  if (port === 1) {
    // Measurement data
    const measurements = [];
    let i = 0;
    
    while (i < bytes.length) {
      if (i + 2 > bytes.length) break;  // Need at least address + type
      
      const measurement = {
        module_address: bytes[i],
        module_type: bytes[i + 1],
        raw_data: []
      };
      
      i += 2;
      
      // Collect remaining data for this module
      // (In practice, you'd parse based on module_type)
      while (i < bytes.length && bytes[i] < 0x30) {  // Heuristic: next module likely > 0x30
        measurement.raw_data.push(bytes[i]);
        i++;
      }
      
      measurements.push(measurement);
    }
    
    return {
      data: { measurements },
      warnings: [],
      errors: []
    };
    
  } else if (port === 2) {
    // Version information
    if (bytes.length !== 5 || bytes[0] !== 0x10) {
      return {
        data: {},
        errors: ["Invalid version message format"]
      };
    }
    
    const fw_raw = (bytes[1] << 8) | bytes[2];
    const hw_raw = (bytes[3] << 8) | bytes[4];
    
    const firmware = {
      proto: (fw_raw >> 15) & 0x01,
      major: (fw_raw >> 10) & 0x1F,
      minor: (fw_raw >> 5) & 0x1F,
      patch: fw_raw & 0x1F,
      string: function() {
        const prefix = this.proto ? "v" : "dev-";
        return `${prefix}${this.major}.${this.minor}.${this.patch}`;
      }
    };
    
    const hardware = {
      proto: (hw_raw >> 15) & 0x01,
      major: (hw_raw >> 10) & 0x1F,
      minor: (hw_raw >> 5) & 0x1F,
      patch: hw_raw & 0x1F,
      string: function() {
        const prefix = this.proto ? "v" : "dev-";
        return `${prefix}${this.major}.${this.minor}.${this.patch}`;
      }
    };
    
    return {
      data: {
        message_type: "version",
        firmware,
        hardware,
        firmware_string: firmware.string(),
        hardware_string: hardware.string()
      },
      warnings: [],
      errors: []
    };
  }
  
  return {
    data: {},
    warnings: [`Unknown FPort: ${port}`],
    errors: []
  };
}

function encodeDownlink(input) {
  // Helper for generating downlinks from TTN console
  const command = input.data.command;
  
  if (command === "set_interval") {
    const interval = input.data.interval;  // in seconds
    return {
      bytes: [0x10, (interval >> 8) & 0xFF, interval & 0xFF],
      fPort: 1,
      warnings: interval < 20 || interval > 4270 ? 
        ["Interval out of range (20-4270s)"] : [],
      errors: []
    };
  }
  
  if (command === "reset") {
    return {
      bytes: [0xDE, 0xAD],
      fPort: 1,
      warnings: ["Device will reset in 5 seconds"],
      errors: []
    };
  }
  
  if (command === "module_command") {
    const bytes = [
      0x11,
      input.data.module_address,
      input.data.module_command,
      ...(input.data.arguments || [])
    ];
    return {
      bytes,
      fPort: 1,
      warnings: [],
      errors: []
    };
  }
  
  return {
    bytes: [],
    errors: ["Unknown command"],
    warnings: []
  };
}
```

### Downlink Scheduling

From TTN Console:
1. Go to your application → Devices → Select device
2. Click "Messaging" tab
3. Choose "Downlink" → "Schedule downlink"
4. Select FPort (any port works)
5. Enter hex payload
6. Click "Schedule downlink"

Device will receive downlink after next uplink (Class A).

## Fair Use Policy

Multiflexmeter V3.7.0 implements optional TTN Fair Use Policy compliance.

### Configuration

Enable in EEPROM:
```
Offset 0x28: 1 = enabled, 0 = disabled
```

### Calculation

When enabled, device calculates minimum interval based on airtime:

```cpp
// Maximum 30 seconds of airtime per day (TTN policy)
uint32_t airtime_ms = calcAirTime(spreading_factor, 24);  // 24 byte payload
uint32_t tx_per_day = 30000 / airtime_ms;
uint16_t interval_sec = 86400 / (tx_per_day + 1);
```

**Example:**

At SF7 (fastest):
- Airtime: ~60ms per message
- Transmissions per day: 500
- Minimum interval: ~173 seconds (~3 minutes)

At SF12 (slowest):
- Airtime: ~2000ms per message
- Transmissions per day: 15
- Minimum interval: ~5760 seconds (~96 minutes)

:::tip[Recommendation]
Enable Fair Use Policy for public TTN deployments. Disable for private networks.
:::

## Error Handling

### Transmission Errors

If `LMIC.opmode & OP_TXRXPEND`:
- Message skipped
- Next measurement rescheduled
- Debug output: `"TXRX Pending..."`

### Join Failures

Event `EV_JOIN_TXCOMPLETE`:
- Automatic retry with exponential backoff
- Device continues trying to join
- Check EEPROM credentials if persistent failure

### Link Dead

Event `EV_LINK_DEAD`:
- No uplink confirmed for 48+ uplinks
- Device automatically rejoins
- Network session re-established

## Best Practices

### Uplink Frequency

- **Minimum**: 20 seconds (hard limit)
- **Recommended**: 15 minutes (900 seconds) for battery operation
- **Maximum**: ~71 minutes (4270 seconds)

### Downlink Usage

- **Minimize**: Each downlink adds airtime
- **Schedule wisely**: Device receives after next uplink
- **Validate**: Always validate downlink payloads
- **Retry**: Use confirmed uplinks if critical

### Payload Optimization

- Keep measurement payloads small (< 24 bytes ideal)
- Use binary encoding (not JSON/text)
- Compress data when possible
- Batch multiple readings if needed

## Debugging Protocol

### Serial Debug Output

With `DEBUG` enabled, device prints:

```
[timestamp] EV_JOINING
[timestamp] EV_JOINED
[timestamp] job_pingVersion
[timestamp] EV_TXCOMPLETE with 3 bytes RX
[timestamp] Changing interval: 1800
[timestamp] Measurement scheduled: 900000
```

### Common Issues

**No join accept:**
- Check DevEUI, AppEUI, AppKey byte order
- Verify gateway coverage
- Ensure keys match TTN registration

**Messages not received:**
- Check spreading factor (SF)
- Verify duty cycle compliance
- Check gateway status in TTN

**Wrong data format:**
- Validate module address and type
- Check sensor data blob format
- Verify payload decoder logic

## Next Steps

- [TTN Setup Guide](/deployment/ttn-setup/) - Configure The Things Network
- [API Reference](/firmware/api-reference/) - Function documentation
- [Development Guide](/development/development-guide/) - Build and modify firmware
- [Troubleshooting](/troubleshooting/debugging/) - Debug common issues
