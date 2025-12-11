---
title: Configuration
description: Detailed EEPROM configuration and device setup for Multiflexmeter 3.7.0
---

Complete guide to configuring the Multiflexmeter 3.7.0 device via EEPROM settings.

## EEPROM Structure

The Multiflexmeter stores all configuration in EEPROM (persistent memory).

### Memory Layout

```
Address  Size  Field           Description
----------------------------------------------
0x0000   4     MAGIC           Magic bytes "MFM\0"
0x0004   2     HW_VERSION      Hardware/firmware version
0x0006   8     APP_EUI         LoRaWAN Application EUI
0x000E   8     DEV_EUI         LoRaWAN Device EUI
0x0016   16    APP_KEY         LoRaWAN Application Key
0x0026   2     INTERVAL        Measurement interval (seconds)
0x0028   1     TTN_FAIR_USE    Fair Use Policy flag
----------------------------------------------
Total:   41 bytes
```

### Structure Definition

```cpp
struct __attribute__((packed)) rom_conf_t {
    uint8_t MAGIC[4];               // "MFM\0" (0x4D, 0x46, 0x4D, 0x00)
    struct {
        uint8_t MSB;                // Hardware version MSB
        uint8_t LSB;                // Hardware version LSB
    } HW_VERSION;                   // Version: proto:major:minor:patch (2 bytes)
    uint8_t APP_EUI[8];             // Application EUI (LSB first)
    uint8_t DEV_EUI[8];             // Device EUI (LSB first)
    uint8_t APP_KEY[16];            // Application Key (MSB first)
    uint16_t MEASUREMENT_INTERVAL;  // Interval in seconds (little-endian)
    uint8_t USE_TTN_FAIR_USE_POLICY; // 0=disabled, 1=enabled
};
```

## Field Details

### Magic Bytes

**Purpose:** Configuration validity marker

**Value:** `0x4D 0x46 0x4D 0x00` ("MFM\0")

**Validation:**
```cpp
if (eeprom[0] != 'M' || eeprom[1] != 'F' || 
    eeprom[2] != 'M' || eeprom[3] != '\0') {
    // Invalid configuration
}
```

---

### Hardware Version

**Purpose:** Firmware version identification

**Format:** 16-bit packed encoding
```
Bits:  [15] [14:10] [9:5]   [4:0]
Field: proto major  minor   patch
```

**Encoding Example:**
```
Version 1.2.5:
  proto = 0, major = 1, minor = 2, patch = 5
  Binary: 0 00001 00010 00101
  Hex: 0x0845
  Bytes: [0x08, 0x45]
```

**Decoder:**
```cpp
uint16_t version = (eeprom[4] << 8) | eeprom[5];
uint8_t proto = (version >> 15) & 0x01;
uint8_t major = (version >> 10) & 0x1F;
uint8_t minor = (version >> 5) & 0x1F;
uint8_t patch = version & 0x1F;
```

---

### Application EUI

**Purpose:** LoRaWAN Application identifier (from TTN)

**Format:** 8 bytes, LSB first (little-endian)

**Example:**
```
TTN Console: 70B3D57ED005A8F2
EEPROM:      [0xF2, 0xA8, 0x05, 0xD0, 0x7E, 0xD5, 0xB3, 0x70]
```

:::note[Byte Order]
LMIC expects EUIs in LSB-first order. TTN displays EUIs MSB-first, so reverse the byte order when writing to EEPROM.
:::

---

### Device EUI

**Purpose:** Unique device identifier (from TTN)

**Format:** 8 bytes, LSB first (little-endian)

**Example:**
```
TTN Console: 0004A30B00F8AC2D
EEPROM:      [0x2D, 0xAC, 0xF8, 0x00, 0x0B, 0xA3, 0x04, 0x00]
```

---

### Application Key

**Purpose:** Encryption key for OTAA join (from TTN)

**Format:** 16 bytes, MSB first (big-endian)

**Example:**
```
TTN Console: 5B7F1A2E3C9D8A6F4E0B2C5D8A3F1E9C
EEPROM:      [0x5B, 0x7F, 0x1A, 0x2E, 0x3C, 0x9D, 0x8A, 0x6F,
              0x4E, 0x0B, 0x2C, 0x5D, 0x8A, 0x3F, 0x1E, 0x9C]
```

:::caution[Security]
Never share your Application Key! It's like a password for your device.
:::

---

### Measurement Interval

**Purpose:** Time between measurements

**Format:** 2 bytes, little-endian, **in seconds**

**Range:**
- Minimum: 20 seconds
- Maximum: 4270 seconds (~71 minutes)

**Encoding:**
```
Interval: 300 seconds (5 minutes)
Hex: 0x012C
EEPROM: [0x2C, 0x01]

Interval: 900 seconds (15 minutes)
Hex: 0x0384
EEPROM: [0x84, 0x03]
```

**Decoder:**
```cpp
uint16_t interval = (uint16_t)eeprom[38] | ((uint16_t)eeprom[39] << 8);
// interval is in seconds (little-endian)
```

---

### Fair Use Policy

**Purpose:** Enable/disable TTN Fair Use Policy compliance

**Format:** 1 byte

**Values:**
- `0x00` - Disabled (no airtime limit)
- `0x01` - Enabled (30 seconds/day limit)

**Recommended:** Enable for production deployments

---

## Configuration Methods

### Method 1: Python Script

Use the provided Python script to generate EEPROM binary:

```python
#!/usr/bin/env python3
import struct

# Configuration values
MAGIC = b'MFM\x00'
HW_VERSION = bytes([0x08, 0x45])  # v1.2.5
APP_EUI = bytes.fromhex('70B3D57ED005A8F2')
DEV_EUI = bytes.fromhex('0004A30B00F8AC2D')
APP_KEY = bytes.fromhex('5B7F1A2E3C9D8A6F4E0B2C5D8A3F1E9C')
INTERVAL = struct.pack('<H', 300)  # 300 seconds (little-endian)
FAIR_USE = bytes([0x01])

# Build EEPROM data
eeprom = (MAGIC + HW_VERSION + APP_EUI + DEV_EUI + 
          APP_KEY + INTERVAL + FAIR_USE)

# Save to file
with open('eeprom.bin', 'wb') as f:
    f.write(eeprom)

print(f"Generated {len(eeprom)} bytes")
print(f"Interval: {struct.unpack('<H', INTERVAL)[0]} seconds")
```

**Usage:**
```bash
python3 generate_eeprom.py
avrdude -c usbasp -p m1284p -U eeprom:w:eeprom.bin:r
```

---

### Method 2: Arduino EEPROM Library

Write configuration programmatically:

```cpp
#include <EEPROM.h>

void writeConfig() {
    int addr = 0;
    
    // Magic
    EEPROM.write(addr++, 'M');
    EEPROM.write(addr++, 'F');
    EEPROM.write(addr++, 'M');
    EEPROM.write(addr++, '\0');
    
    // Version (1.2.5 = 0x0845)
    EEPROM.write(addr++, 0x08);
    EEPROM.write(addr++, 0x45);
    
    // App EUI
    uint8_t appeui[] = {0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x05, 0xA8, 0xF2};
    for (int i = 0; i < 8; i++) {
        EEPROM.write(addr++, appeui[i]);
    }
    
    // Dev EUI
    uint8_t deveui[] = {0x00, 0x04, 0xA3, 0x0B, 0x00, 0xF8, 0xAC, 0x2D};
    for (int i = 0; i < 8; i++) {
        EEPROM.write(addr++, deveui[i]);
    }
    
    // App Key
    uint8_t appkey[] = {0x5B, 0x7F, 0x1A, 0x2E, 0x3C, 0x9D, 0x8A, 0x6F,
                        0x4E, 0x0B, 0x2C, 0x5D, 0x8A, 0x3F, 0x1E, 0x9C};
    for (int i = 0; i < 16; i++) {
        EEPROM.write(addr++, appkey[i]);
    }
    
    // Interval (300 seconds, little-endian)
    uint16_t interval = 300;
    EEPROM.write(addr++, interval & 0xFF);          // LSB first
    EEPROM.write(addr++, (interval >> 8) & 0xFF);   // MSB second
    
    // Fair Use
    EEPROM.write(addr++, 0x01);
}
```

---

### Method 3: AVRDUDE Direct

Write individual fields using avrdude:

```bash
# Write magic bytes
echo -n "MFM" | xxd -p | avrdude -c usbasp -p m1284p -U eeprom:w:0x00:m

# Write interval (300 seconds = 0x012C), little-endian order
avrdude -c usbasp -p m1284p -U eeprom:w:0x26:0x2C:0x01:m
```

---

## Configuration Validation

### Reading Configuration

```cpp
void dumpConfig() {
    Serial.println("EEPROM Configuration:");
    
    // Magic
    char magic[4];
    for (int i = 0; i < 4; i++) {
        magic[i] = EEPROM.read(i);
    }
    Serial.print("Magic: ");
    Serial.println(magic);
    
    // Version
    uint16_t version = (EEPROM.read(4) << 8) | EEPROM.read(5);
    Serial.print("Version: ");
    Serial.println(version, HEX);
    
    // Interval
    uint16_t interval = (EEPROM.read(38) << 8) | EEPROM.read(39);
    Serial.print("Interval: ");
    Serial.print(interval);
    Serial.println(" seconds");
    
    // Fair Use
    uint8_t fair_use = EEPROM.read(40);
    Serial.print("Fair Use: ");
    Serial.println(fair_use ? "Enabled" : "Disabled");
}
```

### LED Error Codes

If configuration is invalid, device will blink LED:

| Blinks | Meaning | Solution |
|--------|---------|----------|
| 1 slow | Magic bytes invalid | Re-program EEPROM |
| 2 fast | Interval out of range | Check interval value |
| 3 fast | LoRaWAN keys missing | Check EUI/Key values |

---

## Configuration Examples

### Example 1: 5-Minute Interval

```python
INTERVAL = struct.pack('<H', 300)  # 300 seconds (little-endian)
```

### Example 2: 15-Minute Interval

```python
INTERVAL = struct.pack('<H', 900)  # 900 seconds (little-endian)
```

### Example 3: Maximum Interval (TTN Fair Use)

```python
INTERVAL = struct.pack('<H', 4270)  # 71 minutes (little-endian)
FAIR_USE = bytes([0x01])  # Enable Fair Use
```

---

## Remote Configuration

Configuration can be updated over LoRaWAN using downlinks:

:::note[Byte Order Difference]
**Important:** Downlink commands use **big-endian** (network byte order), but EEPROM storage uses **little-endian** (ATmega native byte order). The firmware automatically handles the conversion when processing downlink commands.

- **Downlink interval**: Big-endian (e.g., `0x012C` = 300 seconds sent as `01 2C`)
- **EEPROM storage**: Little-endian (stored as `2C 01` in EEPROM)
:::

### Update Interval

**Command:** `0x10`

**Payload (big-endian in downlink):**
```
10 01 2C
```

**Example (TTN Console):**
```
Port: 1
Payload (hex): 10 01 2C
```

**Effect:** Updates interval to 300 seconds and saves to EEPROM

---

## TTN Payload Decoder

The Multiflexmeter sends data using different FPorts for different message types. Configure this decoder in TTN Console under **Payload Formatters > Uplink**.

### Decoder Function

```javascript
function version(msb, lsb) {
  let v = (msb << 8) | lsb;
  return {
    proto: (v >> 15) & 0x01,
    major: (v >> 10) & 0x1F,
    minor: (v >> 5) & 0x1F,
    patch: (v >> 0) & 0x1F
  };
}

function bytesToFloat(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0];
  var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
  var e = bits>>>23 & 0xff;
  var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

function decodeUplink(input) {
  let b = input.bytes;
  let data = {};

  switch(input.fPort) {
    case 1:
      // Distance sensor data (legacy/alternative sensor)
      data.distance = (b[1] << 8) | b[0];
      data.temperature = bytesToFloat([b[2], b[3], b[4], b[5]]);
      break;

    case 2:
      // Version information (sent on startup)
      fw = version(b[1], b[2]);
      hw = version(b[3], b[4]);
      data.fw_version = fw.major + "." + fw.minor + "." + fw.patch + (fw.proto ? "-proto" : "");
      data.hw_version = hw.major + "." + hw.minor + "." + hw.patch + (hw.proto ? "-proto" : "");
      break;

    case 3:
      // Poldermill status and rotation counters (primary data)
      let status = b[0];
      data.spinning = (status & 0x01) ? true : false;
      data.pumping  = (status & 0x02) ? true : false;

      // Default values (in case some bytes are missing)
      data.total_rotations_spinning = 0;
      data.total_rotations_pumping = 0;

      // Spinning total rotations (uint32 LE)
      if (b.length >= 5) {
        data.total_rotations_spinning =
          (b[4] << 24) |
          (b[3] << 16) |
          (b[2] << 8)  |
          (b[1]);
      }

      // Pumping total rotations (uint32 LE)
      if (b.length >= 9) {
        data.total_rotations_pumping =
          (b[8] << 24) |
          (b[7] << 16) |
          (b[6] << 8)  |
          (b[5]);
      }
      break;
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}
```

### Payload Formats

#### FPort 1: Distance Sensor (Legacy)
**Format:** 6 bytes
```
Bytes 0-1: Distance (uint16 LE)
Bytes 2-5: Temperature (float32 LE)
```

**Example:**
```
Payload: 2C 01 00 00 48 42
Decoded: { distance: 300, temperature: 50.0 }
```

#### FPort 2: Version Information
**Format:** 5 bytes
```
Byte 0:   Command (0x10 = version)
Bytes 1-2: Firmware version (packed)
Bytes 3-4: Hardware version (packed)
```

**Example:**
```
Payload: 10 18 E5 18 E5
Decoded: { fw_version: "3.7.5", hw_version: "3.7.5" }
```

#### FPort 3: Poldermill Status (Primary)
**Format:** 9 bytes
```
Byte 0:    Status flags
           - Bit 0: Spinning (1 = yes, 0 = no)
           - Bit 1: Pumping (1 = yes, 0 = no)
           - Bits 2-7: Reserved
Bytes 1-4: Total spinning rotations (uint32 LE, cumulative counter)
Bytes 5-8: Total pumping rotations (uint32 LE, cumulative counter)
```

**Example:**
```
Payload: 03 B8 00 00 00 5C 00 00 00
Status: 0x03 = 0b00000011 (spinning=true, pumping=true)
Spinning rotations: 0x000000B8 = 184 rotations
Pumping rotations:  0x0000005C = 92 rotations

Decoded: {
  spinning: true,
  pumping: true,
  total_rotations_spinning: 184,
  total_rotations_pumping: 92
}
```

:::note[Cumulative Counters]
The rotation counters are **cumulative** - they never reset and continuously increment. The dashboard calculates period-based statistics (today, this month, etc.) by summing readings within the selected time range.
:::

### TTN Webhook Payload Format

When TTN sends data to your webhook endpoint, it uses this structure:

```json
{
  "end_device_ids": {
    "device_id": "mfm-00000003",
    "application_ids": {
      "application_id": "multiflexmeter-app"
    },
    "dev_eui": "0000000000000003",
    "dev_addr": "00000003"
  },
  "received_at": "2025-01-15T10:30:45.123Z",
  "uplink_message": {
    "f_port": 3,
    "f_cnt": 142,
    "frm_payload": "AwC4AAAA\\AAAA",
    "decoded_payload": {
      "spinning": true,
      "pumping": true,
      "total_rotations_spinning": 184,
      "total_rotations_pumping": 92
    },
    "rx_metadata": [{
      "gateway_ids": {
        "gateway_id": "my-gateway"
      },
      "rssi": -72,
      "snr": 8.5,
      "timestamp": 1705315845123456
    }],
    "settings": {
      "data_rate": {
        "lora": {
          "bandwidth": 125000,
          "spreading_factor": 7
        }
      },
      "frequency": "868100000"
    },
    "received_at": "2025-01-15T10:30:45.123Z"
  },
  "locations": {
    "user": {
      "latitude": 52.1595,
      "longitude": 4.4869,
      "altitude": 2,
      "source": "SOURCE_REGISTRY"
    }
  }
}
```

### API Processing

The Multiflexmeter dashboard API (`/api/uplink`) processes the webhook payload and extracts:

```javascript
// From TTN webhook
const message = {
  devEui: body.end_device_ids.dev_eui,
  devAddr: body.end_device_ids.dev_addr,
  fPort: body.uplink_message.f_port,
  payload: body.uplink_message.frm_payload,
  receivedAt: body.uplink_message.received_at,
  decoded: body.uplink_message.decoded_payload,
  rssi: body.uplink_message.rx_metadata?.[0]?.rssi,
  snr: body.uplink_message.rx_metadata?.[0]?.snr,
  latitude: body.locations?.user?.latitude,
  longitude: body.locations?.user?.longitude,
  altitude: body.locations?.user?.altitude
};
```

The dataStore then creates a reading:

```javascript
const reading = {
  devEui: "0000000000000003",
  timestamp: "2025-01-15T10:30:45.123Z",
  revolutions: 184,              // total_rotations_spinning
  pumpingRevolutions: 92,         // total_rotations_pumping
  spinning: true,
  pumping: true,
  rssi: -72,
  snr: 8.5
};
```

This reading is stored in the database and broadcast via Server-Sent Events (SSE) to all connected dashboard clients.

---

## Troubleshooting

### Configuration Not Loading

1. Check magic bytes are correct
2. Verify EEPROM was written successfully
3. Read back EEPROM with avrdude:
   ```bash
   avrdude -c usbasp -p m1284p -U eeprom:r:eeprom_backup.bin:r
   ```

### Device Not Joining TTN

1. Verify App EUI, Dev EUI, App Key are correct
2. Check byte order (MSB first)
3. Verify keys match TTN console exactly
4. Check LoRaWAN frequency plan (EU868)

### Interval Not Working

1. Check interval is in seconds (not hours!)
2. Verify range: 20-4270 seconds
3. Check byte order (little-endian in EEPROM, big-endian in downlink commands)
4. Enable Fair Use Policy if on TTN

---

## Next Steps

- [Quick Start Guide](/deployment/quick-start/) - Complete setup walkthrough
- [TTN Setup](/deployment/ttn-setup/) - Detailed TTN configuration
- [Field Deployment](/deployment/field-deployment/) - Installation best practices
