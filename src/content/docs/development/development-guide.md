---
title: Development Guide
description: Complete guide to building, modifying, and debugging Multiflexmeter V3.7.0 firmware
---

# Firmware Development Guide

This guide covers everything you need to know to build, modify, and debug the Multiflexmeter V3.7.0 firmware.

## Development Environment

### Required Software

1. **PlatformIO Core or IDE**
   - [PlatformIO Core CLI](https://docs.platformio.org/en/latest/core/installation.html)
   - OR [VS Code + PlatformIO Extension](https://platformio.org/install/ide?install=vscode)

2. **AVR Programmer Software**
   - AVRDude (usually included with PlatformIO)
   - Drivers for your ISP programmer

3. **Git** (for version control and LMIC submodule)

4. **Serial Terminal** (for debugging)
   - `screen`, `minicom` (Linux/Mac)
   - PuTTY, TeraTerm (Windows)
   - OR VS Code Serial Monitor extension

### Required Hardware

- AVR ISP programmer (USBasp, AVRISP mkII, or Arduino as ISP)
- 6-pin ISP cable
- FTDI USB-to-Serial adapter (for debugging)
- Multiflexmeter V3.7.0 hardware

## Project Setup

### 1. Get the Source Code

1. Download V3.7.0 from the [GitHub Releases page](https://github.com/Multiflexmeter/Multiflexmeter/releases).4
2. Extract the archive to a working directory.

### 2. Initialize LMIC Submodule

The project uses MCCI Arduino-LMIC as a Git submodule:

```bash
git submodule update --init
```

This will clone the LMIC library into `lib/arduino-lmic/`.

### 3. Open in PlatformIO

#### VS Code Method:
1. Open VS Code
2. File → Open Folder → Select `Multiflexmeter-3.7.0`
3. PlatformIO will auto-detect the project
4. Select environment: `mfm_v3_m1284p`

#### CLI Method:
```bash
cd Multiflexmeter-3.7.0
pio project init
```

## Project Structure

```
Multiflexmeter-3.7.0/
├── platformio.ini          # Build configuration
├── boards/                 # Custom board definitions
│   └── mfm_v3_m1284p.json
├── include/                # Header files
│   ├── board.h            # Board abstraction
│   ├── config.h           # Compile-time configuration
│   ├── main.h             # Main application header
│   ├── rom_conf.h         # EEPROM configuration
│   ├── sensors.h          # Sensor interface
│   ├── smbus.h            # SMBus/I²C driver
│   ├── wdt.h              # Watchdog timer
│   ├── errors.h           # Error definitions
│   ├── debug.h            # Debug macros
│   └── board_config/      # Board-specific configs
│       └── mfm_v3_m1284p.h
├── src/                    # Source files
│   ├── main.cpp           # Main application logic
│   ├── rom_conf.cpp       # EEPROM management
│   ├── sensors.cpp        # Sensor drivers
│   ├── smbus.cpp          # SMBus implementation
│   ├── wdt.cpp            # Watchdog implementation
│   └── boards/            # Board-specific implementations
│       └── mfm_v3_m1284p.cpp
└── lib/                    # Libraries
    ├── arduino-lmic/      # LoRaWAN stack (submodule)
    └── MedianFilter/      # Median filtering library
```

## Building the Firmware

### Build Configuration

The `platformio.ini` file defines the build environment:

```ini
[platformio]
boards_dir = boards

[env]
platform = atmelavr
framework = arduino

build_flags = 
	-DARDUINO_LMIC_PROJECT_CONFIG_H_SUPPRESS
	-DDISABLE_BEACONS
	-DDISABLE_PING
	-DLMIC_PRINTF_TO=Serial
	-DLMIC_DEBUG_LEVEL=2
	-DFW_VERSION_MAJOR=0
	-DFW_VERSION_MINOR=0
	-DFW_VERSION_PATCH=0
	-DFW_VERSION_PROTO=1

[env:mfm_v3_m1284p]
board = mfm_v3_m1284p
board_fuses.lfuse = 0xFF
board_fuses.hfuse = 0xD1
board_fuses.efuse = 0xFF
```

### Build Commands

#### Standard Build
```bash
pio run -e mfm_v3_m1284p
```

#### Clean Build
```bash
pio run -e mfm_v3_m1284p -t clean
pio run -e mfm_v3_m1284p
```

#### Upload via ISP
```bash
pio run -e mfm_v3_m1284p -t upload
```

#### Set Fuses
```bash
pio run -e mfm_v3_m1284p -t fuses
```

### Build Output

Successful build will generate:
```
.pio/build/mfm_v3_m1284p/
├── firmware.elf      # ELF file with debug symbols
├── firmware.hex      # Flash image
└── firmware.eep      # EEPROM image (if any)
```

## Compile-Time Configuration

### Debug Mode

Enable debug output in `include/config.h`:

```cpp
// Whether to output debug information to the serial output
#define DEBUG

// Whether to print the firmware build date/time on power on
#define PRINT_BUILD_DATE_TIME
```

When enabled:
- Debug messages printed to UART at 115200 baud
- Build timestamp printed on startup
- Detailed LoRaWAN event logging

:::caution[Production Builds]
Disable `DEBUG` for production to:
- Reduce code size
- Lower power consumption
- Avoid unintended serial output
:::

### LoRa Configuration

Minimum Data Rate (SF) in `include/config.h`:

```cpp
// The lowest DR (thus highest SF) the device will join and TX at
#define MIN_LORA_DR 0  // DR0 = SF12 (slowest, longest range)
```

### Measurement Timing

Adjust timing in `src/main.cpp`:

```cpp
#define MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S 10  // Sensor measurement delay
#define MEASUREMENT_DELAY_AFTER_PING_S 45          // Delay after version ping
```

### Interval Limits

Hard limits in `include/config.h`:

```cpp
#define MIN_INTERVAL 20    // Minimum 20 seconds
#define MAX_INTERVAL 4270  // Maximum ~71 minutes
```

## Firmware Version Management

### Setting Version Numbers

Versions are set as build flags in `platformio.ini`:

```ini
build_flags = 
  -DFW_VERSION_MAJOR=0
  -DFW_VERSION_MINOR=0
  -DFW_VERSION_PATCH=0
  -DFW_VERSION_PROTO=1  # 0=dev, 1=release
```

### Version Encoding

Version format (16-bit):
```
Bit 15:      Proto (0=dev, 1=release)
Bits 14-10:  Major version (0-31)
Bits 9-5:    Minor version (0-31)
Bits 4-0:    Patch version (0-31)
```

Example: Version 1.2.3 (release) = `0b1_00001_00010_00011` = `0x8443`

## Flashing the Firmware

### Method 1: PlatformIO Upload

Configure your programmer in `platformio.ini`:

```ini
upload_protocol = usbasp  # or atmelice_isp, arduino, etc.
upload_port = usb
upload_flags = 
    -e              # Erase chip
    -B0.25          # Set SCK period
```

Then upload:
```bash
pio run -e mfm_v3_m1284p -t upload
```

### Method 2: AVRDude Directly

```bash
avrdude -c usbasp -p m1284p \
  -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i
```

### Method 3: Using Makefile

If you prefer traditional Makefile workflow:

```bash
make
make flash
```

## Programming EEPROM

### Generate Configuration

Create `eeprom_config.bin` with your credentials:

```python
import struct

MAGIC = b"MFM\x00"
HW_VERSION = (0, 3)  # MSB, LSB
APP_EUI = bytes.fromhex("7766554433221100")  # Little-endian
DEV_EUI = bytes.fromhex("0011223344556677")  # Little-endian
APP_KEY = bytes.fromhex("0123456789ABCDEF0123456789ABCDEF")  # Big-endian
INTERVAL = 900  # 15 minutes in seconds
TTN_FAIR_USE = 1

eeprom_data = struct.pack(
    "<4s2B8s8s16sHB",
    MAGIC, HW_VERSION[0], HW_VERSION[1],
    APP_EUI, DEV_EUI, APP_KEY,
    INTERVAL, TTN_FAIR_USE
)

with open("eeprom_config.bin", "wb") as f:
    f.write(eeprom_data)
```

### Flash EEPROM

```bash
avrdude -c usbasp -p m1284p -U eeprom:w:eeprom_config.bin:r
```

### Verify EEPROM

```bash
avrdude -c usbasp -p m1284p -U eeprom:r:eeprom_read.bin:r
hexdump -C eeprom_read.bin | head -n 3
```

Expected output:
```
00000000  4d 46 4d 00 00 03 00 11  22 33 44 55 66 77 77 66  |MFM.....  "3DUfwwf|
00000010  55 44 33 22 11 00 01 23  45 67 89 ab cd ef 01 23  |UD3"...#Eg.....#|
00000020  45 67 89 ab cd ef 84 03  01                       |Eg.......|
```

## Debugging

### Serial Debug Output

1. **Connect FTDI Adapter**
   - TX (FTDI) → RX (MFM)
   - RX (FTDI) → TX (MFM)
   - GND → GND
   - **Do NOT connect VCC** (device should be powered separately)

2. **Open Serial Monitor**
   ```bash
   screen /dev/ttyUSB0 115200
   # or
   pio device monitor -b 115200
   ```

3. **Debug Output Example**
   ```
   Build at: Oct 09 2025 14:30:00
   [00000000] EV_JOINING
   [00005234] EV_JOINED
   [00005250] job_pingVersion
   [00010500] EV_TXCOMPLETE
   [00055234] job_performMeasurements
   [00065234] job_fetchAndSend
   [00070123] EV_TXCOMPLETE
   Measurement scheduled: 900000
   ```

### Debug Macros

Use debug macros in your code:

```cpp
#include "debug.h"

void myFunction() {
  _debugTime();  // Print timestamp
  _debug(F("Hello World\n"));  // Print string
  _debug(variableValue);  // Print variable
  _debug(F("\n"));
  _debugFlush();  // Flush serial buffer
}
```

### Watchdog Debugging

If device resets unexpectedly:

1. Check if watchdog is triggering
2. Add watchdog resets in long loops:
   ```cpp
   #include "wdt.h"
   
   while (condition) {
     wdt_reset();  // Reset watchdog
     // ... long operation ...
   }
   ```

## Common Development Tasks

### Adding a New Sensor

See [Adding Sensors Guide](/development/adding-sensors/) for details.

Quick overview:
1. Define sensor commands in `include/sensors.h`
2. Implement I²C communication in `src/sensors.cpp`
3. Update measurement reading logic in `src/main.cpp`

### Modifying Measurement Interval

**Runtime** (via downlink):
```
Downlink: 0x10 <MSB> <LSB>
Example: 0x10 07 08  (1800 seconds = 30 minutes)
```

**Compile-time** (default):
Modify EEPROM configuration before flashing.

### Changing LoRaWAN Parameters

1. **Credentials**: Update EEPROM
2. **ADR Mode**: Modify `src/main.cpp`:
   ```cpp
   LMIC_setAdrMode(1);  // 1=enabled, 0=disabled
   ```
3. **Data Rate**: Set minimum DR in `include/config.h`

### Custom Downlink Commands

Add new commands in `src/main.cpp`:

```cpp
#define DL_CMD_MY_CUSTOM 0x12

void processDownlink(uint8_t cmd, uint8_t *args, uint8_t len) {
  switch (cmd) {
    case DL_CMD_MY_CUSTOM:
      // Handle custom command
      _debug(F("Custom command received\n"));
      break;
    // ... existing cases ...
  }
}
```

## Testing

### Unit Testing

PlatformIO supports unit testing:

```bash
pio test
```

Create tests in `test/` directory.

### Integration Testing

1. Flash firmware with DEBUG enabled
2. Monitor serial output
3. Verify join procedure
4. Send downlink commands
5. Check measurement transmission

### Field Testing

1. Deploy with DEBUG disabled
2. Monitor via TTN console
3. Check battery voltage over time
4. Verify measurement intervals
5. Test range and coverage

## Performance Optimization

### Code Size Reduction

- Disable DEBUG in production
- Use `F()` macro for strings (store in flash):
  ```cpp
  _debug(F("String in flash\n"));  // Good
  _debug("String in RAM\n");        // Wastes RAM
  ```
- Enable Link Time Optimization (LTO) in platformio.ini:
  ```ini
  build_flags = -flto
  ```

### RAM Optimization

- Use `const` and `PROGMEM` for constants
- Minimize global variables
- Use stack allocation when possible

### Power Optimization

- Reduce measurement frequency
- Use sleep modes (already implemented)
- Disable unnecessary peripherals
- Optimize sensor reading time

## Troubleshooting Build Issues

### LMIC Submodule Missing

```bash
fatal error: lmic.h: No such file or directory
```

**Solution:**
```bash
git submodule update --init
```

### Fuse Programming Fails

```bash
avrdude: verification error
```

**Solution:**
- Check programmer connection
- Try slower SCK speed: `-B10`
- Verify programmer works with simple blink sketch

### Upload Fails

```bash
avrdude: error: programm enable: target doesn't answer
```

**Solutions:**
- Check ISP cable orientation
- Ensure device is powered
- Try different programmer
- Check fuses aren't set incorrectly

### Out of Memory

```bash
region `text' overflowed by XXX bytes
```

**Solutions:**
- Disable DEBUG
- Remove unused code
- Enable LTO
- Optimize data structures

## Next Steps

- [Adding Custom Sensors](/development/adding-sensors/)
- [Contributing Guidelines](/development/contributing/)
- [API Reference](/firmware/api-reference/)
- [Protocol Specification](/firmware/protocol/)
