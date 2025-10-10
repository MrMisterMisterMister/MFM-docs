---
title: Configuration Guide
description: Configure EEPROM settings, LoRaWAN credentials, and device parameters for Multiflexmeter V3.7.0.
---

This guide covers all configuration aspects of the Multiflexmeter V3.7.0, including EEPROM programming, LoRaWAN setup, and runtime configuration.

## EEPROM Configuration

The Multiflexmeter stores persistent configuration in the ATmega1284P's EEPROM memory. This configuration **must** be programmed before the device can operate.

### EEPROM Structure

The configuration is stored at EEPROM address `0x00` with the following structure:

```c
struct __attribute__((packed)) rom_conf_t {
  uint8_t MAGIC[4];               // Magic identifier: "MFM\0"
  struct {
    uint8_t MSB;                  // Hardware version MSB
    uint8_t LSB;                  // Hardware version LSB
  } HW_VERSION;                   // 2 bytes total
  uint8_t APP_EUI[8];             // LoRaWAN Application EUI (LSB first)
  uint8_t DEV_EUI[8];             // LoRaWAN Device EUI (LSB first)
  uint8_t APP_KEY[16];            // LoRaWAN Application Key (MSB first)
  uint16_t MEASUREMENT_INTERVAL;  // Measurement interval in seconds (little-endian)
  uint8_t USE_TTN_FAIR_USE_POLICY; // Enable TTN Fair Use: 0 = disabled, 1 = enabled
};
```

**Total size:** 42 bytes

### Field Descriptions

#### MAGIC (4 bytes)
- **Value:** `"MFM\0"` (0x4D, 0x46, 0x4D, 0x00)
- **Purpose:** Validates EEPROM has been programmed
- **Required:** Yes

#### HW_VERSION (2 bytes)
- **Format:** 16-bit version number (MSB, LSB)
- **Example:** Version 3.0 = `0x03, 0x00`
- **Purpose:** Identifies hardware revision
- **Required:** Yes

#### APP_EUI (8 bytes)
- **Format:** 8-byte array, **LSB first** (little-endian)
- **Purpose:** LoRaWAN Application identifier
- **Source:** The Things Network Console
- **Required:** Yes

:::caution
The APP_EUI is stored in **reverse byte order** (LSB first). If your TTN console shows:
```
70B3D57ED0000000
```
Store it as:
```
0x00, 0x00, 0x00, 0xD0, 0x7E, 0xD5, 0xB3, 0x70
```
:::

#### DEV_EUI (8 bytes)
- **Format:** 8-byte array, **LSB first** (little-endian)
- **Purpose:** Unique device identifier
- **Source:** The Things Network Console
- **Required:** Yes

#### APP_KEY (16 bytes)
- **Format:** 16-byte array, **MSB first** (big-endian)
- **Purpose:** Encryption key for OTAA join
- **Source:** The Things Network Console
- **Security:** Keep this secret!
- **Required:** Yes

:::tip
The APP_KEY uses **normal byte order** (MSB first). Copy it directly from TTN console:
```
5A6967426565416C6C69616E636532
```
Becomes:
```
0x5A, 0x69, 0x67, 0x42, 0x65, 0x65, 0x41, 0x6C,
0x6C, 0x69, 0x61, 0x6E, 0x63, 0x65, 0x32, 0x00
```
:::

#### MEASUREMENT_INTERVAL (2 bytes)
- **Format:** 16-bit unsigned integer (big-endian)
- **Unit:** Seconds
- **Range:** 20 - 4270 seconds (enforced by firmware)
- **Default:** 900 seconds (15 minutes)
- **Purpose:** Time between measurements

#### USE_TTN_FAIR_USE_POLICY (1 byte)
- **Values:** 
  - `0` = Disabled (use configured interval)
  - `1` = Enabled (enforce 30s/day airtime limit)
- **Purpose:** Automatically adjust interval to comply with TTN Fair Use Policy
- **Recommendation:** Enable for TTN deployments

### Creating EEPROM Configuration

#### Method 1: Manual Binary File

Create a binary file with your configuration:

```python
# eeprom_config.py
import struct

# Configuration values
MAGIC = b'MFM\0'
HW_VERSION_MSB = 0x03
HW_VERSION_LSB = 0x00

# LoRaWAN credentials (example - use your own!)
APP_EUI = bytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])  # LSB first
DEV_EUI = bytes([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])  # LSB first
APP_KEY = bytes([0x00] * 16)  # MSB first

MEASUREMENT_INTERVAL = 900  # 15 minutes
USE_TTN_FAIR_USE = 1

# Pack configuration
config = MAGIC
config += struct.pack('BB', HW_VERSION_MSB, HW_VERSION_LSB)
config += APP_EUI
config += DEV_EUI
config += APP_KEY
config += struct.pack('>H', MEASUREMENT_INTERVAL)  # Big-endian
config += struct.pack('B', USE_TTN_FAIR_USE)

# Write to file
with open('eeprom_config.bin', 'wb') as f:
    f.write(config)

print(f"EEPROM config written: {len(config)} bytes")
```

Run and flash:

```bash
python eeprom_config.py
avrdude -p m1284p -c atmelice_isp -P usb -U eeprom:w:eeprom_config.bin:r
```

#### Method 2: AVRDude Direct Write

For quick testing, write directly with AVRDude:

```bash
avrdude -p m1284p -c atmelice_isp -P usb \
  -U eeprom:w:0x4D,0x46,0x4D,0x00:m  # MAGIC
```

:::note
This method is tedious for all 42 bytes. Use the binary file method for production.
:::

### Verifying EEPROM Contents

Read back EEPROM to verify:

```bash
avrdude -p m1284p -c atmelice_isp -P usb -U eeprom:r:eeprom_read.bin:r
```

View contents:

```bash
hexdump -C eeprom_read.bin | head -n 3
```

Expected output:

```
00000000  4d 46 4d 00 03 00 [APP_EUI] [DEV_EUI]
00000010  [APP_KEY................]
00000020  [APP_KEY...] 03 84 01
```

## LoRaWAN Configuration

### The Things Network Setup

#### 1. Create Application

1. Log into [The Things Network Console](https://console.thethingsnetwork.org/)
2. Go to **Applications** → **+ Add application**
3. Fill in application details
4. Click **Create application**

#### 2. Register Device

1. In your application, go to **Devices** → **+ Add device**
2. Choose **Over the air activation (OTAA)**
3. Set **LoRaWAN version:** MAC V1.0.2 (or compatible)
4. **Device EUI:** Enter or generate
5. **App Key:** Generate
6. Click **Register device**

#### 3. Copy Credentials

The console will display:
- **Device EUI** (reverse for EEPROM)
- **Application EUI** (reverse for EEPROM)
- **App Key** (use as-is)

#### 4. Configure Payload Formatters (Optional)

For automatic decoding, add a payload formatter in TTN Console:

```javascript
function decodeUplink(input) {
  var data = {};
  var bytes = input.bytes;
  
  // FPort 1: Measurement data
  if (input.fPort === 1) {
    var offset = 0;
    while (offset < bytes.length) {
      var moduleAddr = bytes[offset++];
      var moduleType = bytes[offset++];
      
      // Example: Parse your sensor data
      data['module_' + moduleAddr] = {
        type: moduleType,
        // Add sensor-specific parsing here
      };
    }
  }
  
  // FPort 2: Version info
  if (input.fPort === 2) {
    data.firmware_version = (bytes[1] << 8) | bytes[2];
    data.hardware_version = (bytes[3] << 8) | bytes[4];
  }
  
  return {
    data: data
  };
}
```

### Regional Parameters

The firmware is configured for **EU868** (868MHz) by default. To use other regions:

1. Edit `platformio.ini` build flags
2. Add appropriate LMIC configuration
3. Ensure hardware supports the frequency band

## Firmware Configuration

### Build-Time Configuration

Edit `include/config.h` to customize firmware behavior:

#### Debug Output

```cpp
#define DEBUG  // Enable serial debug output
#undef DEBUG   // Disable debug output (for production)
```

#### LoRaWAN Parameters

```cpp
#define MIN_LORA_DR 0  // Minimum data rate (DR0 = SF12)
```

Lower data rates (higher spreading factor) provide:
- ✅ Longer range
- ✅ Better penetration
- ❌ Slower transmission
- ❌ More airtime

#### Sensor Timeout

```cpp
#define SENSOR_JSN_TIMEOUT 200  // Milliseconds
```

#### Interval Limits

```cpp
#define MIN_INTERVAL 20    // 20 seconds minimum
#define MAX_INTERVAL 4270  // ~71 minutes maximum
```

### Board Variant Selection

Choose the appropriate board in `platformio.ini`:

```ini
[env:mfm_v3_m1284p]
board = mfm_v3_m1284p
# ... other settings
```

### Version Information

Set firmware version in `platformio.ini`:

```ini
build_flags = 
  -DFW_VERSION_MAJOR=3
  -DFW_VERSION_MINOR=7
  -DFW_VERSION_PATCH=0
  -DFW_VERSION_PROTO=1  # 0 = dev, 1 = release
```

## Runtime Configuration

### Changing Measurement Interval

#### Via Downlink

Send a downlink on any FPort:

```
0x10 0x03 0x84
```

- `0x10` = Change interval command
- `0x0384` = 900 seconds (15 minutes) in big-endian

#### Via EEPROM Update

1. Create new EEPROM binary with updated interval
2. Flash EEPROM only (preserves flash):

```bash
avrdude -p m1284p -c atmelice_isp -P usb -U eeprom:w:eeprom_config.bin:r
```

3. Reset device

### TTN Fair Use Policy

When enabled, the firmware calculates maximum allowed transmissions per day:

```
Max TX per day = 30,000 ms / airtime_per_message
Min interval = 86,400 seconds / max_tx_per_day
```

Example for SF12 (DR0):
- Airtime ≈ 2000ms per 24-byte message
- Max TX ≈ 15 per day
- Min interval ≈ 5760 seconds (96 minutes)

:::tip
For frequent measurements, use a higher data rate (lower SF) or deploy your own LoRaWAN network.
:::

## Configuration Best Practices

1. **Test Configuration:** Always verify EEPROM contents before deployment
2. **Backup Credentials:** Keep a secure record of device credentials
3. **Unique DEV_EUI:** Ensure each device has a unique DEV_EUI
4. **Appropriate Intervals:** Balance data frequency with battery life
5. **Enable Fair Use:** Always enable for public TTN deployments
6. **Version Tracking:** Update HW_VERSION when hardware changes

## Troubleshooting

### Device Won't Join

- ✅ Verify EEPROM is programmed correctly
- ✅ Check byte order of APP_EUI and DEV_EUI
- ✅ Confirm APP_KEY matches TTN console
- ✅ Ensure gateway coverage in your area
- ✅ Check antenna connection

### "Invalid EEPROM" Error

- ✅ EEPROM not programmed
- ✅ MAGIC bytes incorrect
- ✅ EEPROM corrupted

Solution: Re-flash EEPROM configuration

### Transmission Errors

- ✅ Interval too short (duty cycle violated)
- ✅ Enable TTN Fair Use Policy
- ✅ Increase measurement interval

## Next Steps

- **[Protocol Reference](/reference/protocol/)** - Uplink/downlink message formats
- **[Hardware Reference](/reference/hardware/)** - Pin assignments and connections
- **[API Reference](/reference/api/)** - Configuration functions
