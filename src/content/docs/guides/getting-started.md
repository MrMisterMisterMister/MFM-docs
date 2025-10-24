---
title: Getting Started
description: Set up your development environment and build your first Multiflexmeter firmware.
---

This guide will help you set up your development environment, build the firmware, and flash it to your Multiflexmeter 3.7.0 device.

## Prerequisites

### Hardware Requirements

- **Multiflexmeter 3.7.0 board** (with ATmega1284P)
- **Atmel-ICE programmer** (or compatible AVR ISP programmer)
  - Must support 3.3V target voltage
  - 6-pin ISP cable for connection to J5 header
- **USB-to-FTDI adapter** (optional, for serial debugging at 115200 baud)
- **Sensor module** compatible with SMBus/I2C interface (optional)

### Software Requirements

- **[PlatformIO](https://platformio.org/)** - Build system and IDE extension
  - VS Code with PlatformIO IDE extension (recommended)
  - Or PlatformIO Core CLI
- **Git** - For cloning the repository and submodules
- **KiCad** (optional) - For viewing/editing hardware design files

## Installation

### 1. Get the Source Code

1. Download 3.7.0 from the [GitHub Releases page](https://github.com/MrMisterMisterMister/MFM-docs/releases).
2. Extract the archive to a working directory.

### 2. Initialize Submodules

The project uses the Arduino-LMIC library as a submodule:

```bash
git submodule update --init --recursive
```

This will download the LMIC library into `lib/arduino-lmic/`.

### 3. Open Project in PlatformIO

**Option A: Using VS Code**

1. Open VS Code
2. Install the PlatformIO IDE extension
3. Open the `Multiflexmeter-3.7.0` folder
4. PlatformIO will automatically detect the `platformio.ini` file

**Option B: Using PlatformIO CLI**

```bash
cd Multiflexmeter-3.7.0
pio project init --ide vscode
```

## Building the Firmware

### Build Configuration

The project supports multiple board variants configured in `platformio.ini`:

- `mfm_v3_m1284p` - Standard ATmega1284P board variant

### Build Commands

**Build the firmware:**

```bash
pio run
```

Or for a specific environment:

```bash
pio run -e mfm_v3_m1284p
```

**Clean build artifacts:**

```bash
pio run --target clean
```

### Build Output

Successful build will produce:
- `.pio/build/mfm_v3_m1284p/firmware.hex` - Main firmware
- `.pio/build/mfm_v3_m1284p/firmware.elf` - Debug symbols

## Configuring EEPROM

Before the device can operate, you **must** program the EEPROM with device credentials and configuration.

### EEPROM Structure

The EEPROM contains:

```c
struct __attribute__((packed)) rom_conf_t {
  uint8_t MAGIC[4];              // "MFM\0"
  struct {
    uint8_t MSB;
    uint8_t LSB;
  } HW_VERSION;                  // Hardware version (e.g., 3.0)
  uint8_t APP_EUI[8];            // LoRaWAN Application EUI
  uint8_t DEV_EUI[8];            // LoRaWAN Device EUI
  uint8_t APP_KEY[16];           // LoRaWAN Application Key
  uint16_t MEASUREMENT_INTERVAL; // Interval in seconds
  uint8_t USE_TTN_FAIR_USE_POLICY; // 0 or 1
};
```

### Creating EEPROM Binary

1. Create a binary file with your configuration data
2. Use AVRDude to write it to EEPROM

Example AVRDude command:

```bash
avrdude -p m1284p -c atmelice_isp -P usb -U eeprom:w:eeprom_config.bin:r
```

:::tip
Get your LoRaWAN credentials from [The Things Network Console](https://console.thethingsnetwork.org/).
Register your device and copy the APP_EUI, DEV_EUI, and APP_KEY values.
:::

## Hardware Connections

### Connecting the Programmer

The Multiflexmeter 3.7.0 uses the **J5 ICSP header** for programming. Connect your Atmel-ICE (or compatible) programmer using a 6-pin ISP cable.

**J5 Pinout (2x3 header):**

```
    1 (MISO)    2 (+3.3V)
    3 (SCK)     4 (GND)
    5 (RESET)   6 (MOSI)
```

**Connection Steps:**

1. Ensure the board is **powered off** before connecting the programmer
2. Connect the 6-pin ISP cable from your Atmel-ICE to the **J5 header** on the board
3. Orient the cable correctly - Pin 1 is typically marked on both the cable and header
4. Connect the Atmel-ICE to your computer via USB
5. Power the board (if external power is required)

:::caution[Voltage Level]
The board operates at **3.3V**. Configure your programmer for 3.3V target voltage to avoid damaging the ATmega1284P.
:::

### Connecting Debug Serial (Optional)

For serial debugging output, connect an FTDI USB-to-Serial adapter to **J4**:

**J4 FTDI Header:**

| Pin | Signal | Connect To |
|-----|--------|------------|
| 1 | NC | Leave unconnected |
| 2 | TXD | FTDI RX |
| 3 | RXD | FTDI TX |
| 4-5 | NC | Leave unconnected |
| 6 | GND | FTDI GND |

Set your serial terminal to **115200 baud, 8N1**.

:::tip[Detailed Connection Guide]
For detailed pinout diagrams and troubleshooting, see the [Programming & Connectors](/hardware/programming/) guide.
:::

## Flashing the Firmware

### Using PlatformIO

**Flash via AVRISP:**

```bash
pio run -t upload
```

This uses the upload configuration from `platformio.ini`:
- Protocol: `atmelice_isp`
- Port: `usb`
- Baud: `0.25` (slow for reliability)

### Using AVRDude Manually

```bash
avrdude -p m1284p -c atmelice_isp -P usb -B 0.25 \
  -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i
```

### Programming Fuses

The board requires specific fuse settings:

```bash
avrdude -p m1284p -c atmelice_isp -P usb \
  -U lfuse:w:0xFF:m \
  -U hfuse:w:0xD1:m \
  -U efuse:w:0xFF:m
```

These fuse settings configure:
- **LFUSE (0xFF):** External crystal, full-swing oscillator
- **HFUSE (0xD1):** EEPROM preserved, boot vector enabled
- **EFUSE (0xFF):** Brown-out detection level

:::caution
Be careful when programming fuses. Incorrect fuse settings can brick your device!
Always verify the fuse values for your specific board variant.
:::

## Verification

### Serial Debug Output

Connect an FTDI adapter to the debug header and monitor the serial output:

```bash
pio device monitor
```

Or use your preferred serial terminal at **115200 baud**.

### Expected Boot Sequence

```
Build at: Oct 9 2025 12:00:00
job_joining
EV_JOINING
EV_JOINED
job_pingVersion
job_performMeasurements
job_fetchAndSend
Measurement scheduled: 900
EV_TXCOMPLETE
```

### Troubleshooting

**Problem:** `Invalid EEPROM, did you flash the EEPROM?`

**Solution:** The EEPROM is not programmed or contains invalid data. Follow the [EEPROM Configuration](#configuring-eeprom) steps.

---

**Problem:** Device doesn't join the network

**Solution:** 
- Verify your LoRaWAN credentials are correct
- Check antenna connection
- Ensure you're within range of a LoRaWAN gateway
- Check network coverage on [TTN Mapper](https://ttnmapper.org/)

---

**Problem:** `TXRX Pending...` appears frequently

**Solution:** You're trying to transmit too frequently. Increase the measurement interval or enable the TTN Fair Use Policy in EEPROM.

## Next Steps

- **[Configuration Guide](/guides/configuration/)** - Configure measurement intervals and settings
- **[Architecture Overview](/guides/architecture/)** - Understand the system design
- **[Protocol Reference](/reference/protocol/)** - Learn about uplink/downlink messages

