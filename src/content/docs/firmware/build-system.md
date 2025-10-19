---
title: Build System
description: PlatformIO build system configuration and compilation details
---

Comprehensive guide to the PlatformIO build system configuration for Multiflexmeter 3.7.0.

## PlatformIO Configuration

The project uses PlatformIO as the build system, configured via `platformio.ini`.

### Complete Configuration

```ini
[platformio]
boards_dir = boards

[env]
platform = atmelavr
framework = arduino

# LMIC library configuration
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

upload_protocol = atmelice_isp
upload_port = usb
upload_flags = 
    -e
    -B0.25 
board_upload.require_upload_port = no
monitor_port = /dev/ttyUSB0
monitor_speed = 115200

lib_deps = 
    adafruit/Adafruit SleepyDog Library@^1.4.0
    https://github.com/mcci-catena/arduino-lmic.git

[env:mfm_v3_m1284p]
board = mfm_v3_m1284p
board_fuses.lfuse = 0xFF
board_fuses.hfuse = 0xD1
board_fuses.efuse = 0xFF
```

## Build Targets

### Available Environments

| Environment | MCU | Flash | SRAM | EEPROM |
|------------|-----|-------|------|--------|
| `mfm_v3_m1284p` | ATmega1284P | 128KB | 16KB | 4KB |

### Build Commands

```bash
# Build firmware (default environment)
pio run

# Build specific environment
pio run -e mfm_v3_m1284p

# Clean build files
pio run --target clean

# Upload to device
pio run --target upload

# Upload with fuses
pio run --target fuses

# Build verbose output
pio run -v
```

## Build Flags

### Optimization

```ini
-Os                     # Optimize for size
-ffunction-sections     # Place functions in separate sections
-fdata-sections         # Place data in separate sections
-flto                   # Link-time optimization
-Wl,--gc-sections       # Remove unused sections
```

**Result:** Typical firmware size ~50-60KB (out of 128KB available)

### LoRaWAN Configuration

```ini
-DCFG_eu868=1                           # EU868 frequency plan
-DCFG_sx1276_radio=1                    # RFM95 uses SX1276
-DARDUINO_LMIC_PROJECT_CONFIG_H_SUPPRESS # Use board config
```

**Frequency Plan Options:**
- `CFG_eu868` - Europe 868MHz
- `CFG_us915` - USA 915MHz
- `CFG_au915` - Australia 915MHz
- `CFG_as923` - Asia 923MHz

### Debug Configuration

```ini
# Add for debugging
-DDEBUG=1
-DDEBUG_SERIAL=1
-DSERIAL_BAUD=115200
```

## Dependencies

### Library Management

Libraries are managed via `lib_deps` in `platformio.ini`:

```ini
lib_deps = 
    adafruit/Adafruit SleepyDog Library@^1.4.0
    https://github.com/mcci-catena/arduino-lmic.git
```

**Installed Libraries:**
- **MCCI Arduino LoRaWAN (arduino-lmic)**
  - Source: Git URL (MCCI Catena repository)
  - Purpose: LoRaWAN protocol stack

- **Adafruit SleepyDog**
  - Version spec: ^1.4.0
  - Purpose: Declared dependency. The firmware currently implements watchdog behavior in `wdt.cpp`.

### Local Libraries

Custom libraries in `lib/` directory:

```
lib/
└── MedianFilter/          # Median filter for sensor data (not referenced by current firmware)
```

**MedianFilter:**
- Purpose: Statistical filtering of sensor readings
- Files: `MedianFilter.cpp`, `MedianFilter.h`

## Upload Configuration

### Default: Atmel-ICE (ISP)

Default configuration uses Atmel-ICE in ISP mode (matches `platformio.ini`):

```ini
upload_protocol = atmelice_isp
upload_port = usb
upload_flags = 
    -e
    -B0.25
board_upload.require_upload_port = no
```

**Connection:**
- Programmer: Atmel-ICE (ISP)
- Interface: 6-pin ISP header
- Notes: `-B0.25` sets a fast SCK; increase if stability issues occur

### Alternative Programmers

#### Arduino as ISP

```ini
upload_protocol = stk500v1
upload_flags = 
    -P/dev/ttyUSB0    # Serial port
    -b19200           # Baud rate
```

#### AVRISP mkII

```ini
upload_protocol = avrispmkii
```

#### USBasp

```ini
upload_protocol = usbasp
upload_flags = 
    -Pusb
    -B10
```

## Fuse Settings

### Fuse Configuration

```ini
board_fuses.lfuse = 0xFF    # Low fuse
board_fuses.hfuse = 0xD1    # High fuse
board_fuses.efuse = 0xFF    # Extended fuse
```

### Fuse Breakdown

**Low Fuse (0xFF):**
- `CKSEL[3:0]` = 1111 - Full swing crystal oscillator
- `SUT[1:0]` = 11 - Slow rising power
- `CKOUT` = 1 - No clock output
- `CKDIV8` = 1 - No clock division (16MHz)

**High Fuse (0xD1):**
- `BOOTRST` = 1 - Boot to application
- `BOOTSZ[1:0]` = 10 - 512 words boot size
- `EESAVE` = 1 - EEPROM preserved on chip erase
- `WDTON` = 0 - Watchdog timer not always on
- `SPIEN` = 0 - SPI programming enabled
- `JTAGEN` = 1 - JTAG disabled
- `OCDEN` = 1 - On-chip debug disabled

**Extended Fuse (0xFF):**
- `BODLEVEL[2:0]` = 111 - BOD disabled

### Setting Fuses

```bash
# Upload fuses via PlatformIO
pio run --target fuses

# Manual with avrdude
avrdude -c usbasp -p m1284p -U lfuse:w:0xFF:m -U hfuse:w:0xD1:m -U efuse:w:0xFF:m
```

:::caution[Fuse Warning]
Incorrect fuse settings can brick the device! Always verify fuse values before programming.
:::

## Memory Sections

### Flash Layout

```
0x0000 - 0x01FF     Bootloader (512 bytes)
0x0200 - 0x1FFFF    Application (127.5KB)
```

### Build Size Analysis

```bash
# Show memory usage
pio run --target size

# Detailed section information
avr-size -C --mcu=atmega1284p .pio/build/mfm_v3_m1284p/firmware.elf
```

**Typical Output:**
```
AVR Memory Usage
----------------
Device: atmega1284p

Program:   58234 bytes (44.3% Full)
(.text + .data + .bootloader)

Data:       4326 bytes (26.3% Full)
(.data + .bss + .noinit)

EEPROM:       41 bytes (1.0% Full)
(.eeprom)
```

## Custom Board Definition

### Board JSON

Custom board defined in `boards/mfm_v3_m1284p.json`:

```json
{
  "build": {
    "core": "MightyCore",
    "extra_flags": [
      "-DARDUINO_AVR_ATmega1284",
      "-DBOARD_MFM_V3_M1284P",
      "-DCFG_eu868=1",
      "-DCFG_sx1276_radio=1"
    ],
    "f_cpu": "8000000L",
    "mcu": "atmega1284p",
    "variant": "standard"
  },
  "debug": {
    "simavr_target": "atmega1284p"
  },
  "frameworks": ["arduino"],
  "name": "ATmega1284P",
  "upload": {
    "maximum_ram_size": 16384,
    "maximum_size": 131072,
    "protocol": "stk500",
    "require_upload_port": true,
    "speed": 115200
  },
  "url": "https://www.microchip.com/wwwproducts/en/ATmega1284p",
  "vendor": "Microchip"
}
```

**Installation:**
- File location: `boards/mfm_v3_m1284p.json`
- Automatically discovered by PlatformIO
- No manual installation needed

## Compilation Process

### Build Workflow

```mermaid
graph LR
    A[Source Files] --> B[Preprocessor]
    B --> C[Compiler]
    C --> D[Object Files]
    D --> E[Linker]
    E --> F[ELF Binary]
    F --> G[HEX File]
    G --> H[Upload]
```

### Compilation Steps

1. **Preprocessing**
   - Expand macros
   - Handle `#include` directives
   - Process conditional compilation

2. **Compilation**
   - Compile C/C++ to object files
   - Apply optimization flags
   - Generate assembly

3. **Linking**
   - Combine object files
   - Link libraries (LMIC, Arduino core)
   - Generate ELF binary

4. **Binary Conversion**
   - Convert ELF to HEX format
   - Intel HEX format for AVR
   - Ready for upload

### Generated Files

```
.pio/build/mfm_v3_m1284p/
├── firmware.elf       # ELF binary with debug symbols
├── firmware.hex       # Intel HEX for upload
├── firmware.map       # Linker map file
└── src/               # Compiled object files
```

## Troubleshooting

### Common Build Issues

**Problem:** `avr-g++: error: unrecognized command line option`

**Solution:** Update PlatformIO platform:
```bash
pio pkg update
```

---

**Problem:** `Library not found: MCCI_LoRaWAN_LMIC_library`

**Solution:** Install dependencies:
```bash
pio lib install
```

---

**Problem:** `Multiple definition of 'os_init'`

**Solution:** Clean and rebuild:
```bash
pio run --target clean
pio run
```

---

**Problem:** Upload fails with USBasp

**Solution:** Check connections, try slower clock:
```ini
upload_flags = 
    -Pusb
    -B100    # Much slower, more reliable
```

## Advanced Configuration

### Custom Build Flags

Add project-specific flags in `platformio.ini`:

```ini
build_flags = 
    ${env.build_flags}          # Inherit existing flags
    -DCUSTOM_FEATURE=1          # Enable custom feature
    -DMAX_SENSORS=4             # Define constant
    -Wall                       # All warnings
    -Wextra                     # Extra warnings
```

### Debug Build

Create separate debug environment:

```ini
[env:mfm_v3_m1284p_debug]
extends = env:mfm_v3_m1284p
build_flags = 
    ${env:mfm_v3_m1284p.build_flags}
    -DDEBUG=1
    -O0                         # No optimization
    -g                          # Debug symbols
```

### Conditional Compilation

Use build flags for compile-time features:

```cpp
#ifdef DEBUG
    Serial.println("Debug build");
#endif

#if MAX_SENSORS > 2
    // Support for more sensors
#endif
```

## Next Steps

- [Development Guide](/development/development-guide/) - Build and flash firmware
- [Firmware Architecture](/firmware/architecture/) - Code structure
- [API Reference](/firmware/api-reference/) - Function documentation
