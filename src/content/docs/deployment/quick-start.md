---
title: Quick Start Guide
description: Get your Multiflexmeter 3.7.0 up and running in minutes
---

Get your Multiflexmeter 3.7.0 device operational in just a few steps.

## Prerequisites

### Hardware
- Multiflexmeter 3.7.0 board
- AVRISP programmer (USBasp, Arduino as ISP, or similar)
- 6-pin ISP cable
- Power supply (3.3V - 5V)
- Sensor module (with I²C/SMBus interface)

### Software
- [PlatformIO](https://platformio.org/) installed
- [VS Code](https://code.visualstudio.com/) with PlatformIO extension (recommended)
- AVRDude (for programming)
- The Things Network account (free tier)

### Network
- LoRaWAN gateway within range
- The Things Network (TTN) coverage in your area

## Step 1: Download the Release

1. **Go to the repository**: [GitHub - multiflexmeter](https://github.com/MrMisterMisterMister/MFM-docs)
2. **Download 3.7.0**: Navigate to the Releases section and download version 3.7.0 since the documentation matches this version.
3. **Extract the archive**: Unzip the downloaded file to a working directory.


## Step 2: Register Device on The Things Network

1. **Create an Application**
   - Log in to [The Things Network Console](https://console.thethingsnetwork.org/)
   - Create a new application
   - Note your **Application EUI**

2. **Register Device**
   - Add a new device to your application
   - Select **OTAA** activation method
   - Generate or enter **DevEUI**, **AppEUI**, and **AppKey**
   - Note all three values (you'll need them next)

## Step 3: Configure Device Credentials

Create an EEPROM configuration file with your credentials:

### Generate EEPROM Binary

Create a file `eeprom_config.bin` with this structure:

```
Offset | Size | Description
-------|------|------------
0x00   | 4    | Magic: "MFM\0"
0x04   | 2    | Hardware Version (MSB, LSB)
0x06   | 8    | AppEUI (little-endian)
0x0E   | 8    | DevEUI (little-endian)
0x16   | 16   | AppKey (big-endian)
0x26   | 2    | Measurement Interval (seconds, uint16)
0x28   | 1    | TTN Fair Use Policy (0=disabled, 1=enabled)
```

:::tip[Configuration Helper Script]
You can create a simple script to generate the EEPROM file, or use a hex editor to create it manually following the structure above.

**Example Python helper script:**

```python
import struct
import sys

# Configuration
MAGIC = b"MFM\x00"
HW_VERSION = (0, 3)  # MSB, LSB (Version 0.3)
APP_EUI = bytes.fromhex("7766554433221100")  # Little-endian
DEV_EUI = bytes.fromhex("0011223344556677")  # Little-endian
APP_KEY = bytes.fromhex("0123456789ABCDEF0123456789ABCDEF")  # Big-endian
INTERVAL = 900  # 15 minutes in seconds
TTN_FAIR_USE = 1  # Enabled

# Pack into binary
eeprom_data = struct.pack(
    "<4s2B8s8s16sHB",  # Format: magic, hw_ver, appeui, deveui, appkey, interval, fair_use
    MAGIC,
    HW_VERSION[0], HW_VERSION[1],
    APP_EUI,
    DEV_EUI,
    APP_KEY,
    INTERVAL,
    TTN_FAIR_USE
)

with open("eeprom_config.bin", "wb") as f:
    f.write(eeprom_data)

print(f"EEPROM config written to eeprom_config.bin ({len(eeprom_data)} bytes)")
```

Run with:
```bash
python generate_eeprom.py
```
:::

## Step 4: Build Firmware

### Using PlatformIO CLI

```bash
# For M1284P variant (default)
pio run -e mfm_v3_m1284p
```

Build artifacts will be in `.pio/build/mfm_v3_m1284p/firmware.hex`

## Step 5: Program the Device

### Using PlatformIO (Recommended)

```bash
# Build and upload automatically using configured programmer
pio run -e mfm_v3_m1284p -t upload
```

This uses the upload protocol configured in `platformio.ini` (default: `atmelice_isp`).

### Using AVRDude Manually

If using a different programmer or manual flashing:

```bash
# For USBasp programmer
avrdude -c usbasp -p m1284p -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i

# For Atmel-ICE programmer  
avrdude -c atmelice_isp -p m1284p -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i
```

### Program EEPROM

```bash
avrdude -c usbasp -p m1284p -U eeprom:w:eeprom_config.bin:r
```

### Set Fuses (Important!)

```bash
# Low Fuse: 0xFF (External crystal, fast start-up)
# High Fuse: 0xD1 (SPI enabled, BOD 2.7V)
# Extended Fuse: 0xFF (BOD enabled)

avrdude -c usbasp -p m1284p -U lfuse:w:0xFF:m -U hfuse:w:0xD1:m -U efuse:w:0xFF:m
```

:::caution[Fuse Warning]
**Incorrect fuse settings can brick your device!** Double-check fuse values before programming.
:::

## Step 6: Connect Sensor

Connect your I²C/SMBus sensor to the MFM board:

| MFM Pin | Sensor Pin |
|---------|------------|
| SDA     | SDA        |
| SCL     | SCL        |
| 3.3V/5V | VCC        |
| GND     | GND        |

Default sensor address: `0x36`

## Step 7: Power On and Verify

### Power the Device

Apply power (3.3V - 5V) to the MFM board.

### Monitor Serial Output (Optional)

If DEBUG mode is enabled during compilation:

```bash
# Connect FTDI adapter to UART header
# 115200 baud, 8N1

screen /dev/ttyUSB0 115200
# or
minicom -D /dev/ttyUSB0 -b 115200
```

You should see:
```
Build at: Jan 15 2024 10:30:45
Starting OTAA join...
```

### Check The Things Network

1. Go to your TTN application
2. Open your device
3. Check **Live Data** tab
4. Within 1-2 minutes, you should see:
   - Join request
   - Join accept
   - First uplink message (firmware version on FPort 2)
   - Regular measurement data (FPort 1)

## Step 8: Verify Measurements

### Expected Behavior

- **First Message**: Firmware version on FPort 2 (within 1 minute of join)
- **Subsequent Messages**: Sensor data on FPort 1 every 15 minutes (900 seconds default)

### Decode Payload

Add this decoder to your TTN application:

```javascript
function Decoder(bytes, port) {
  if (port === 1) {
    // Measurement data format: <Module Address> <Module Type> <Module Data Blob>
    var decoded = {
      module_address: bytes[0],
      module_type: bytes[1],
      raw_data: []
    };
    
    // Remaining bytes are module-specific data
    for (var i = 2; i < bytes.length; i++) {
      decoded.raw_data.push(bytes[i]);
    }
    
    return decoded;
  } else if (port === 2) {
    // Version info: 0x10, FW_MSB, FW_LSB, HW_MSB, HW_LSB
    if (bytes[0] === 0x10 && bytes.length === 5) {
      var fw_version = (bytes[1] << 8) | bytes[2];
      var hw_version = (bytes[3] << 8) | bytes[4];
      
      return {
        message_type: "version",
        firmware: {
          proto: (fw_version >> 15) & 0x01,
          major: (fw_version >> 10) & 0x1F,
          minor: (fw_version >> 5) & 0x1F,
          patch: fw_version & 0x1F
        },
        hardware: {
          proto: (hw_version >> 15) & 0x01,
          major: (hw_version >> 10) & 0x1F,
          minor: (hw_version >> 5) & 0x1F,
          patch: hw_version & 0x1F
        }
      };
    }
  }
  return { error: "Unknown format" };
}
```

## Troubleshooting

### Device Won't Join

**Symptoms**: No join accept in TTN console

**Causes & Solutions**:
- **No gateway coverage**: Check TTN Mapper for coverage in your area
- **Invalid credentials**: Verify DevEUI, AppEUI, AppKey match TTN exactly
- **Byte order**: DevEUI and AppEUI must be little-endian in EEPROM
- **Antenna**: Ensure antenna is properly connected to RFM95

### No Sensor Data

**Symptoms**: Device joins but sends zero or invalid measurements

**Causes & Solutions**:
- **Sensor not connected**: Check I²C wiring
- **Wrong address**: Verify sensor address is `0x36` (default)
- **Sensor not responding**: Test sensor separately
- **Sensor power**: Verify sensor is powered (check `PIN_PERIF_PWR`)

### Messages Not Received

**Symptoms**: Device appears to transmit but TTN shows no data

**Causes & Solutions**:
- **Duty cycle**: Device respecting EU868 1% duty cycle limit
- **SF too high**: Check spreading factor (SF7-SF12)
- **Gateway issues**: Check gateway status in TTN
- **Link budget**: Device may be out of range

### High Power Consumption

**Symptoms**: Battery drains quickly

**Causes & Solutions**:
- **Too frequent measurements**: Increase interval
- **Debug mode enabled**: Disable DEBUG in code
- **Sensor always powered**: Check sensor power control
- **No sleep**: Verify watchdog and sleep modes work

## Next Steps

Now that your device is running:

- [Configure Advanced Settings](/deployment/configuration/) - Adjust measurement intervals and settings
- [Understand the Protocol](/firmware/protocol/) - Learn about message formats
- [Monitor and Debug](/troubleshooting/debugging/) - Debug issues and monitor performance
- [Deploy Multiple Devices](/deployment/field-deployment/) - Scale your deployment

## Quick Reference Commands

### Build
```bash
pio run -e mfm_v3_m1284p
```

### Upload Firmware
```bash
avrdude -c usbasp -p m1284p -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i
```

### Upload EEPROM
```bash
avrdude -c usbasp -p m1284p -U eeprom:w:eeprom_config.bin:r
```

### Read EEPROM (Verify)
```bash
avrdude -c usbasp -p m1284p -U eeprom:r:eeprom_dump.bin:r
hexdump -C eeprom_dump.bin | head -n 5
```

### Monitor Serial
```bash
screen /dev/ttyUSB0 115200
```

## Support

Need help? Check:
- [Troubleshooting Guide](/troubleshooting/common-issues/)
- [FAQ](/troubleshooting/faq/)
- [GitHub Issues](https://github.com/MrMisterMisterMister/MFM-docs/issues)
- [Community Forum](https://forum.example.com/)
