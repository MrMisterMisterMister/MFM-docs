---
title: Configuration
description: Detailed EEPROM configuration and device setup for Multiflexmeter V3
---

# Configuration

Complete guide to configuring the Multiflexmeter V3 device via EEPROM settings.

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
typedef struct {
    uint8_t magic[4];          // "MFM\0" (0x4D, 0x46, 0x4D, 0x00)
    uint8_t hw_version[2];     // Version: proto:major:minor:patch
    uint8_t appeui[8];         // Application EUI (MSB first)
    uint8_t deveui[8];         // Device EUI (MSB first)
    uint8_t appkey[16];        // Application Key (MSB first)
    uint8_t interval[2];       // Interval in seconds (big-endian)
    uint8_t fair_use;          // 0=disabled, 1=enabled
} rom_conf_t;
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

**Format:** 8 bytes, MSB first (big-endian)

**Example:**
```
TTN Console: 70B3D57ED005A8F2
EEPROM:      [0x70, 0xB3, 0xD5, 0x7E, 0xD0, 0x05, 0xA8, 0xF2]
```

:::note[Byte Order]
TTN displays EUIs in hexadecimal MSB-first format, which matches the EEPROM storage order directly.
:::

---

### Device EUI

**Purpose:** Unique device identifier (from TTN)

**Format:** 8 bytes, MSB first (big-endian)

**Example:**
```
TTN Console: 0004A30B00F8AC2D
EEPROM:      [0x00, 0x04, 0xA3, 0x0B, 0x00, 0xF8, 0xAC, 0x2D]
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

**Format:** 2 bytes, big-endian, **in seconds**

**Range:**
- Minimum: 20 seconds
- Maximum: 4270 seconds (~71 minutes)

**Encoding:**
```
Interval: 300 seconds (5 minutes)
Hex: 0x012C
EEPROM: [0x01, 0x2C]

Interval: 900 seconds (15 minutes)
Hex: 0x0384
EEPROM: [0x03, 0x84]
```

**Decoder:**
```cpp
uint16_t interval = (eeprom[38] << 8) | eeprom[39];
// interval is in seconds
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
INTERVAL = struct.pack('>H', 300)  # 300 seconds (big-endian)
FAIR_USE = bytes([0x01])

# Build EEPROM data
eeprom = (MAGIC + HW_VERSION + APP_EUI + DEV_EUI + 
          APP_KEY + INTERVAL + FAIR_USE)

# Save to file
with open('eeprom.bin', 'wb') as f:
    f.write(eeprom)

print(f"Generated {len(eeprom)} bytes")
print(f"Interval: {struct.unpack('>H', INTERVAL)[0]} seconds")
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
    
    // Interval (300 seconds)
    uint16_t interval = 300;
    EEPROM.write(addr++, (interval >> 8) & 0xFF);
    EEPROM.write(addr++, interval & 0xFF);
    
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

# Write interval (300 seconds = 0x012C)
avrdude -c usbasp -p m1284p -U eeprom:w:0x26:0x01:0x2C:m
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
INTERVAL = struct.pack('>H', 300)  # 300 seconds
```

### Example 2: 15-Minute Interval

```python
INTERVAL = struct.pack('>H', 900)  # 900 seconds
```

### Example 3: Maximum Interval (TTN Fair Use)

```python
INTERVAL = struct.pack('>H', 4270)  # 71 minutes
FAIR_USE = bytes([0x01])  # Enable Fair Use
```

---

## Remote Configuration

Configuration can be updated over LoRaWAN using downlinks:

### Update Interval

**Command:** `0x10`

**Payload:**
```
[0x00, 0x10, 0x01, 0x2C]
         ^     ^     ^
         |     |     +-- Interval LSB
         |     +-------- Interval MSB (300 seconds)
         +-------------- Command code
```

**Example (TTN Console):**
```
Port: 1
Payload (hex): 00100 12C
```

**Effect:** Updates interval to 300 seconds and saves to EEPROM

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
3. Check byte order (big-endian)
4. Enable Fair Use Policy if on TTN

---

## Next Steps

- [Quick Start Guide](/deployment/quick-start/) - Complete setup walkthrough
- [TTN Setup](/deployment/ttn-setup/) - Detailed TTN configuration
- [Field Deployment](/deployment/field-deployment/) - Installation best practices
