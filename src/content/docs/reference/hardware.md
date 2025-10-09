---
title: Hardware Reference
description: Pin mappings, board variants, electrical specifications, and hardware design for MultiFlexMeter V3.
---

This document provides detailed hardware specifications, pin assignments, and electrical characteristics of the MultiFlexMeter V3 platform.

## Board Variants

MultiFlexMeter V3 supports multiple board variants with the ATmega1284P microcontroller.

### MFM V3 M1284P (Standard)

- **Board ID:** `mfm_v3_m1284p`
- **Microcontroller:** ATmega1284P
- **Flash Memory:** 128 KB
- **SRAM:** 16 KB
- **EEPROM:** 4 KB
- **Clock:** External crystal (configurable via fuses)
- **Operating Voltage:** 3.3V / 5V (design dependent)

**Configuration File:** `include/board_config/mfm_v3_m1284p.h`

### Board Selection

Choose the board variant in `platformio.ini`:

```ini
[env:mfm_v3_m1284p]
board = mfm_v3_m1284p
```

## Pin Assignments

### ATmega1284P Pin Mapping

#### Power and Peripheral Control

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PC4 | 20 | `PIN_PERIF_PWR` | Peripheral power control (sensor module) |

#### Sensor Communication (UART/Serial)

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PD0 | 10 | `PIN_JSN_TX` | JSN sensor TX (ATmega RX) |
| PD1 | 11 | `PIN_JSN_RX` | JSN sensor RX (ATmega TX) |

#### Sensor Communication (I2C/SMBus)

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PC0 | 16 | SDA | I2C data line |
| PC1 | 17 | SCL | I2C clock line |

**Default Sensor Address:** `0x36`

#### One-Wire Interface

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PD4 | 12 | `PIN_ONE_WIRE` | One-wire bus (Dallas/Maxim protocol) |

#### Buzzer/Indicator

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PA3 | 17 | `PIN_BUZZER` | Buzzer or LED indicator (analog pin 3) |

#### LoRa Radio (RFM95) - SPI Interface

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PB4 | 4 (MISO) | MISO | SPI Master In, Slave Out |
| PB5 | 5 (MOSI) | MOSI | SPI Master Out, Slave In |
| PB7 | 7 (SCK) | SCK | SPI clock |
| PD0 | 24 | `PIN_NSS` | SPI chip select (slave select) |
| PD1 | 25 | `PIN_RST` | RFM95 reset line |

#### LoRa Radio DIO Pins

| Pin | Arduino Pin | Function | Description |
|-----|-------------|----------|-------------|
| PD2 | 2 | `PIN_DIO_0` | RFM95 DIO0 (RX/TX done interrupt) |
| PD3 | 3 | `PIN_DIO_1` | RFM95 DIO1 (RX timeout, FHSS change) |
| PD4 | 4 | `PIN_DIO_2` | RFM95 DIO2 (FHSS change channel) |
| PB0 | 0 | `PIN_DIO_3` | RFM95 DIO3 (optional) |
| PB1 | 1 | `PIN_DIO_4` | RFM95 DIO4 (optional) |
| PC2 | 26 | `PIN_DIO_5` | RFM95 DIO5 (optional) |

:::note
Only DIO0, DIO1, and DIO2 are actively used by the LMIC library.
:::

### Complete Pin Configuration

```cpp
// From: include/board_config/mfm_v3_m1284p.h

#define PIN_PERIF_PWR   20  // Peripheral power control
#define PIN_JSN_TX      10  // JSN sensor TX
#define PIN_JSN_RX      11  // JSN sensor RX
#define PIN_ONE_WIRE    12  // One-wire bus
#define PIN_BUZZER      17  // Buzzer (Analog pin 3)

// SPI and LoRa
#define PIN_NSS         24  // SPI chip select
#define PIN_RST         25  // RFM95 reset
#define PIN_DIO_0       2   // RFM95 DIO0
#define PIN_DIO_1       3   // RFM95 DIO1
#define PIN_DIO_2       4   // RFM95 DIO2
#define PIN_DIO_3       0   // RFM95 DIO3
#define PIN_DIO_4       1   // RFM95 DIO4
#define PIN_DIO_5       26  // RFM95 DIO5
```

## Hardware Interfaces

### RFM95 LoRa Module

**Module:** HopeRF RFM95W or compatible

**Frequency:** 868 MHz (EU) / 915 MHz (US) - region dependent

**Interface:** SPI

**Specifications:**
- Sensitivity: -148 dBm
- Output power: +20 dBm (100mW)
- Link budget: 168 dB
- Range: Up to 10 km (line-of-sight)

**SPI Configuration:**
```cpp
const lmic_pinmap lmic_pins = {
    .nss = PIN_NSS,           // Chip select
    .rxtx = LMIC_UNUSED_PIN,  // Not used
    .rst = PIN_RST,           // Reset
    .dio = {PIN_DIO_0, PIN_DIO_1, PIN_DIO_2},
};
```

### Sensor Module Interface

**Protocol:** SMBus/I2C

**Default Address:** `0x36`

**Commands:**
- `0x10`: Perform measurement
- `0x11`: Read measurement result

**Example I2C Transaction:**

```
Start → Address(0x36) + Write → Command(0x10) → Stop
[Wait for measurement]
Start → Address(0x36) + Write → Command(0x11) → 
Repeated Start → Address(0x36) + Read → [Length Byte] → [Data...] → Stop
```

### Programming Interface

#### ISP (In-System Programming)

**Connector:** 6-pin AVRISP header

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | MISO | Master In, Slave Out |
| 2 | VCC | Target voltage reference |
| 3 | SCK | SPI clock |
| 4 | MOSI | Master Out, Slave In |
| 5 | RESET | Reset line (active low) |
| 6 | GND | Ground |

**Compatible Programmers:**
- Atmel-ICE
- USBasp
- AVR Dragon
- Arduino as ISP

#### FTDI Debug Header

**Connector:** 6-pin FTDI-compatible header

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | GND | Ground |
| 2 | CTS | Clear to send (optional) |
| 3 | VCC | 3.3V or 5V |
| 4 | TX | Device TX (to computer RX) |
| 5 | RX | Device RX (from computer TX) |
| 6 | DTR | Data terminal ready (optional) |

**Serial Settings:**
- Baud rate: 115200
- Data bits: 8
- Stop bits: 1
- Parity: None
- Flow control: None

## Electrical Specifications

### Power Supply

**Operating Voltage:** 3.3V or 5V (verify board design)

**Current Consumption:**

| Mode | Current (typ.) | Description |
|------|----------------|-------------|
| Active (TX) | 120 mA | Transmitting at +20 dBm |
| Active (RX) | 12 mA | Receiving |
| Active (MCU) | 8 mA | MCU running, radio idle |
| Sleep | < 1 mA | Deep sleep with watchdog |

:::tip
For battery-powered deployments, implement sleep modes between measurements to extend battery life.
:::

### Power Budget Calculation

Example for 1 measurement every 15 minutes:

```
Measurement cycle:
- Active (sensor + prep): 15s @ 10mA = 0.042 mAh
- TX: 2s @ 120mA = 0.067 mAh
- Sleep: 885s @ 0.5mA = 0.123 mAh

Per cycle: 0.232 mAh
Per day: 0.232 × 96 = 22.3 mAh
Per month: 22.3 × 30 = 669 mAh

Battery capacity needed (6 months): ~4000 mAh
```

## Fuse Settings

### Recommended Fuse Configuration

```
Low Fuse:      0xFF
High Fuse:     0xD1
Extended Fuse: 0xFF
```

### Fuse Bit Breakdown

#### Low Fuse (LFUSE = 0xFF)

| Bit | Value | Setting | Description |
|-----|-------|---------|-------------|
| 7 | 1 | CKDIV8 disabled | No clock division |
| 6 | 1 | CKOUT disabled | No clock output |
| 5-4 | 11 | SUT1:0 | Startup time |
| 3-0 | 1111 | CKSEL3:0 | Full-swing crystal oscillator |

**Result:** External crystal, full-swing mode, no division

#### High Fuse (HFUSE = 0xD1)

| Bit | Value | Setting | Description |
|-----|-------|---------|-------------|
| 7 | 1 | OCDEN disabled | OCD disabled |
| 6 | 1 | JTAGEN disabled | JTAG disabled |
| 5 | 0 | SPIEN enabled | SPI programming enabled |
| 4 | 1 | WDTON disabled | Watchdog not always on |
| 3 | 0 | EESAVE enabled | EEPROM preserved on chip erase |
| 2-0 | 001 | BOOTSZ1:0 | Boot flash size |
| 0 | 1 | BOOTRST disabled | Reset vector at 0x0000 |

**Result:** SPI enabled, EEPROM preserved, normal boot vector

#### Extended Fuse (EFUSE = 0xFF)

| Bit | Value | Setting | Description |
|-----|-------|---------|-------------|
| 2-0 | 111 | BODLEVEL2:0 | Brown-out detection disabled |

**Result:** BOD disabled (can be enabled for reliability)

:::caution
**Fuse Programming Warning:** Incorrect fuse settings can brick your device. Always double-check before writing fuses!
:::

### Programming Fuses

```bash
avrdude -p m1284p -c atmelice_isp -P usb \
  -U lfuse:w:0xFF:m \
  -U hfuse:w:0xD1:m \
  -U efuse:w:0xFF:m
```

## Hardware Design Files

### KiCad Project

The complete hardware design is available in the `hardware/` directory:

- **Schematic:** `mfm-v3-smd.kicad_sch`
- **PCB Layout:** `mfm-v3-smd.kicad_pcb`
- **Project File:** `mfm-v3-smd.kicad_pro`
- **Footprint Library:** `lib/project.pretty/`
- **Symbol Library:** `lib/project.dcm`

### Key Components

| Component | Part Number | Description |
|-----------|-------------|-------------|
| MCU | ATmega1284P | Main microcontroller |
| Radio | RFM95W-868S2 | LoRa transceiver module |
| Battery Holder | BAT_2462 | CR2032 or similar |
| Connector | JSN-SR04T | Ultrasonic sensor connector |

### Opening Hardware Files

1. Install [KiCad](https://www.kicad.org/) version 6.0 or later
2. Open `hardware/mfm-v3-smd.kicad_pro`
3. View schematic or PCB layout

## Mechanical Specifications

**PCB Dimensions:** Check KiCad files for exact measurements

**Mounting Holes:** Verify in PCB design

**Enclosure:** Design dependent

## Environmental Specifications

**Operating Temperature:** -20°C to +60°C (typical)

**Storage Temperature:** -40°C to +85°C

**Humidity:** Non-condensing

:::note
Actual specifications depend on component ratings. Verify for your specific deployment environment.
:::

## Troubleshooting

### Hardware Issues

**Problem:** Device doesn't respond to programmer

**Solutions:**
- ✅ Check ISP cable connection
- ✅ Verify target power (VCC present)
- ✅ Try slower programming speed (`-B 10`)
- ✅ Check fuse settings haven't disabled ISP

---

**Problem:** LoRa transmission fails

**Solutions:**
- ✅ Verify antenna connection
- ✅ Check SPI connections (MOSI, MISO, SCK, NSS)
- ✅ Verify RFM95 DIO0, DIO1, DIO2 connected
- ✅ Check power supply to RFM95 module

---

**Problem:** Sensor not responding

**Solutions:**
- ✅ Check I2C pullup resistors (4.7kΩ typical)
- ✅ Verify sensor address (use I2C scanner)
- ✅ Check peripheral power (`PIN_PERIF_PWR`)
- ✅ Verify SDA/SCL not swapped

---

**Problem:** High current consumption

**Solutions:**
- ✅ Ensure sleep modes are implemented
- ✅ Disable debug output in production (`#undef DEBUG`)
- ✅ Power down peripherals when not in use
- ✅ Check for shorts or damaged components

## Next Steps

- **[Getting Started](/guides/getting-started/)** - Build and flash firmware
- **[Configuration Guide](/guides/configuration/)** - EEPROM and LoRaWAN setup
- **[API Reference](/reference/api/)** - Software functions and modules
