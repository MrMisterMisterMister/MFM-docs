---
title: Programming & Connectors
description: Complete guide to programming the Multiflexmeter and using board connectors
---

This guide provides detailed information about programming the Multiflexmeter 3.7.0 board and explains all external connectors.

## Programming Requirements

### Required Hardware

To program the Multiflexmeter 3.7.0, you need:

- **Atmel-ICE** (or compatible AVR ISP programmer)
  - USBasp
  - AVR Dragon
  - Arduino as ISP
- **6-pin ISP cable** (2x3 connector, 2.54mm pitch)
- **Power source** (battery or external 3.3V supply)

:::caution[Programmer Voltage]
The board operates at **3.3V**. Most programmers support voltage selection - ensure yours is set to 3.3V before connecting to avoid damaging the ATmega1284P.
:::

### Programming Connection

Connect your programmer to the **J5 - ICSP Header** on the board.

## J5 - ICSP/ISP Programming Header

**Location:** Main board  
**Type:** 2x3 pin header (male, 2.54mm pitch)  
**Purpose:** In-System Programming for firmware upload

### Pinout Diagram

```
  ┌─────────────┐
  │ 1  MISO  VCC  2 │
  │ 3  SCK   GND  4 │
  │ 5  RST   MOSI 6 │
  └─────────────┘
```

### Pin Assignments

| Pin | Signal | Direction | Description |
|-----|--------|-----------|-------------|
| 1 | MISO | ← | Master In Slave Out (data from MCU to programmer) |
| 2 | VCC | → | +3.3V power (can power board from programmer) |
| 3 | SCK | → | Serial Clock (programming clock signal) |
| 4 | GND | - | Ground reference |
| 5 | RESET | → | MCU Reset (active low, pulled high on board) |
| 6 | MOSI | → | Master Out Slave In (data from programmer to MCU) |

### Connection to Atmel-ICE

The Atmel-ICE uses a standard 6-pin AVR ISP cable. Connect as follows:

```
Atmel-ICE          J5 Header
=========          =========
Pin 1 (MISO) ───── Pin 1 (MISO)
Pin 2 (VCC)  ───── Pin 2 (VCC)
Pin 3 (SCK)  ───── Pin 3 (SCK)
Pin 4 (MOSI) ───── Pin 6 (MOSI)
Pin 5 (RST)  ───── Pin 5 (RST)
Pin 6 (GND)  ───── Pin 4 (GND)
```

:::tip[Cable Orientation]
The ISP cable typically has a key or notch indicating Pin 1. The J5 header may have Pin 1 marked with a square pad or silkscreen indicator. Always verify pinout before connecting.
:::

## J4 - FTDI Debug Connector

**Location:** Main board  
**Type:** 1x6 pin header (female socket, 2.54mm pitch)  
**Purpose:** Serial UART debugging and monitoring

### Pinout

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | NC | No connection |
| 2 | TXD | UART Transmit from MCU (AVR_TX0) |
| 3 | RXD | UART Receive to MCU (AVR_RX0) |
| 4 | NC | No connection |
| 5 | NC | No connection |
| 6 | GND | Ground |

### FTDI Adapter Connection

Connect a standard FTDI USB-to-Serial adapter:

```
FTDI Adapter       J4 Header
============       =========
GND ────────────── Pin 6 (GND)
TXD ────────────── Pin 3 (RXD)  ← Cross connection
RXD ────────────── Pin 2 (TXD)  ← Cross connection
VCC ────────────── Leave disconnected
```

**Serial Settings:**
- Baud Rate: **115200**
- Data Bits: 8
- Parity: None
- Stop Bits: 1
- Flow Control: None

:::note[Cross Connection]
Note that FTDI TX connects to MCU RX (Pin 3) and FTDI RX connects to MCU TX (Pin 2). This is standard for serial communication.
:::

## J3 - SMBus/I²C Connector

**Location:** Main board  
**Type:** 2x3 pin header (male, 2.54mm pitch)  
**Purpose:** External I²C/SMBus device connection

### Pinout

```
  ┌─────────────┐
  │ 1  SCL  VCC  2 │
  │ 3  SDA  VCC  4 │
  │ 5  ALERT SCL 6 │
  └─────────────┘
```

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | SCL | I²C Clock line |
| 2 | VCC | +3.3V Power output |
| 3 | SDA | I²C Data line |
| 4 | VCC | +3.3V Power output (duplicate) |
| 5 | SMBALERT | SMBus Alert signal (optional) |
| 6 | SCL | I²C Clock line (duplicate) |

**I²C Specifications:**
- Bus Speed: **80kHz** (configured in firmware)
- Pull-up Resistors: Onboard 4.7kΩ
- Default Sensor Address: `0x36`

:::tip[Multiple I²C Devices]
J3, J1, and J2 all share the same I²C bus. You can connect multiple I²C devices as long as they have unique addresses.
:::

## J1 & J2 - Module Connectors

**Location:** Main board  
**Purpose:** Sensor module expansion slots

### J1 - Module Left (1x3 socket)

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | SCL | I²C Clock |
| 2 | SDA | I²C Data |
| 3 | SMBALERT | SMBus Alert |

### J2 - Module Right (1x3 socket)

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | VCC | +3.3V Power |
| 2 | SDA | I²C Data |
| 3 | SCL | I²C Clock |

:::note[Module Compatibility]
These connectors are designed for custom MFM sensor modules. The pinout differs between J1 and J2, so ensure modules are plugged into the correct slot.
:::

## Programming Workflow

### Step 1: Hardware Setup

1. Connect Atmel-ICE to your computer via USB
2. Connect the 6-pin ISP cable from Atmel-ICE to **J5** on the board
3. Verify cable orientation (Pin 1 to Pin 1)
4. Power the board if not powering from programmer

### Step 2: Configure Programmer

Set your programmer to 3.3V target voltage:

```bash
# Atmel-ICE automatically detects voltage from target board
# Verify with:
pio run -t upload --verbose
```

### Step 3: Upload Firmware

Using PlatformIO:

```bash
# Build and upload
pio run -t upload

# Upload only (if already built)
pio run -t upload --target nobuild
```

Using AVRdude directly:

```bash
avrdude -p m1284p -c atmelice_isp -P usb -B 0.25 \
  -U flash:w:.pio/build/mfm_v3_m1284p/firmware.hex:i
```

### Step 4: Program Fuses (First Time Only)

```bash
avrdude -p m1284p -c atmelice_isp -P usb \
  -U lfuse:w:0xFF:m \
  -U hfuse:w:0xD1:m \
  -U efuse:w:0xFF:m
```

**Fuse Settings Explained:**
- **LFUSE (0xFF):** External crystal oscillator, no clock divide
- **HFUSE (0xD1):** EEPROM preserved on chip erase, 2.7V brownout
- **EFUSE (0xFF):** Brown-out detection enabled

:::danger[Fuse Warning]
Incorrect fuse settings can brick your device. Only change fuses if you understand what each bit does. Always verify values before writing.
:::

### Step 5: Verify Programming

Connect FTDI adapter to **J4** and open serial monitor:

```bash
pio device monitor
```

You should see:

```
Build at: Oct 25 2025 00:13:00
Initializing...
EV_JOINING
```

## Troubleshooting

### Programming Issues

**Problem:** `avrdude: initialization failed, rc=-1`

**Solution:**
- Check cable connections at J5
- Verify programmer voltage is set to 3.3V
- Ensure board is powered
- Try slower programming speed: `-B 2.0`

---

**Problem:** `avrdude: Expected signature for ATmega1284P is XX XX XX`

**Solution:**
- Wrong chip selected - verify `-p m1284p` in command
- Check if board uses ATmega1284P (not 328P)
- Verify oscillator is running (fuse settings)

---

**Problem:** Device not responding after fuse programming

**Solution:**
- Fuses may have disabled external oscillator
- Requires high-voltage parallel programmer to recover
- Contact board manufacturer for recovery service

### Serial Debug Issues

**Problem:** No output on serial monitor

**Solution:**
- Verify FTDI connections (TX ↔ RX are crossed)
- Check baud rate is set to 115200
- Confirm firmware was compiled with debug output enabled
- Verify GND connection between FTDI and board

---

**Problem:** Garbage characters on serial monitor

**Solution:**
- Wrong baud rate - set to 115200
- Check that board crystal is 16MHz as expected
- Verify FTDI adapter is 3.3V compatible

## Related Documentation

- [Pin Mappings](/hardware/pinout/) - Complete GPIO assignments
- [Hardware Specifications](/hardware/specifications/) - Board technical details
- [Getting Started](/guides/getting-started/) - Initial setup guide
- [Development Guide](/development/development-guide/) - Development workflow

