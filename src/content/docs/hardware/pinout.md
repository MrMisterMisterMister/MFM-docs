---
title: Pin Mappings
description: Complete pin assignments for Multiflexmeter 3.7.0
---

Complete pin assignments and GPIO configuration for Multiflexmeter 3.7.0.

## Board Variants

The Multiflexmeter supports two board variants with different pin assignments:

### MFM V3 (ATmega328P) - `mfm_v3.h`

| Function | Pin | Description |
|----------|-----|-------------|
| `PIN_PERIF_PWR` | 2 | Peripheral power control |
| `PIN_JSN_RX` | 3 | JSN-SR04T ultrasonic sensor RX |
| `PIN_JSN_TX` | 4 | JSN-SR04T ultrasonic sensor TX |
| `PIN_ONE_WIRE` | 5 | OneWire bus (temperature sensors) |
| `PIN_DIO_2` | 6 | LoRa radio DIO2 interrupt |
| `PIN_DIO_1` | 7 | LoRa radio DIO1 interrupt |
| `PIN_DIO_0` | 8 | LoRa radio DIO0 interrupt |
| `PIN_RST` | 9 | LoRa radio reset |
| `PIN_NSS` | 10 | LoRa radio SPI chip select |
| `PIN_BUZZER` | 17 | Buzzer output (Analog pin 3) |

### MFM V3 M1284P (ATmega1284P) - `mfm_v3_m1284p.h`

| Function | Pin | Description |
|----------|-----|-------------|
| `PIN_DIO_4` | 1 | LoRa radio DIO4 interrupt |
| `PIN_DIO_0` | 2 | LoRa radio DIO0 interrupt |
| `PIN_DIO_1` | 3 | LoRa radio DIO1 interrupt |
| `PIN_DIO_2` | 4 | LoRa radio DIO2 interrupt |
| `PIN_JSN_TX` | 10 | JSN-SR04T ultrasonic sensor TX |
| `PIN_JSN_RX` | 11 | JSN-SR04T ultrasonic sensor RX |
| `PIN_ONE_WIRE` | 12 | OneWire bus (temperature sensors) |
| `PIN_BUZZER` | 17 | Buzzer output (Analog pin 3) |
| `PIN_PERIF_PWR` | 20 | Peripheral power control |
| `PIN_NSS` | 24 | LoRa radio SPI chip select |
| `PIN_RST` | 25 | LoRa radio reset |
| `PIN_DIO_5` | 26 | LoRa radio DIO5 interrupt |
| `PIN_DIO_3` | 0 | LoRa radio DIO3 interrupt |

## RFM95 LoRa Module Interface

The LoRa radio module uses SPI communication with the following pin assignments:

| Function | mfm_v3 | mfm_v3_m1284p | Description |
|----------|--------|---------------|-------------|
| NSS (CS) | 10 | 24 | SPI Chip Select |
| MOSI | 11 (PB3) | 5 (PB5) | SPI Master Out Slave In |
| MISO | 12 (PB4) | 6 (PB6) | SPI Master In Slave Out |
| SCK | 13 (PB5) | 7 (PB7) | SPI Serial Clock |
| RST | 9 | 25 | Radio Reset (active low) |
| DIO0 | 8 | 2 | RX/TX Done interrupt |
| DIO1 | 7 | 3 | RX Timeout / FHSS interrupt |
| DIO2 | 6 | 4 | FHSS Change Channel |
| DIO3 | - | 0 | CAD Detection / PLL Lock |
| DIO4 | - | 1 | PLL Lock / Temperature |
| DIO5 | - | 26 | Mode Ready / CLK Output |

## I²C/SMBus Sensor Interface

Standard I²C pins for sensor communication:

| ATmega Pin | ATmega328P | ATmega1284P | Function | Notes |
|-----------|------------|-------------|----------|-------|
| SDA | PC4 (Pin 27) | PC1 (Pin 23) | I²C Data | 4.7kΩ pull-up resistor |
| SCL | PC5 (Pin 28) | PC0 (Pin 22) | I²C Clock | 4.7kΩ pull-up resistor |

**Bus Speed:** 80 kHz (configured in firmware)
**Default sensor address:** `0x36`

## Sensor Interfaces

### JSN-SR04T Ultrasonic Sensor

| Function | mfm_v3 | mfm_v3_m1284p | Description |
|----------|--------|---------------|-------------|
| TX | 4 | 10 | Trigger signal to sensor |
| RX | 3 | 11 | Echo signal from sensor |

### OneWire Temperature Sensors

| Function | mfm_v3 | mfm_v3_m1284p | Description |
|----------|--------|---------------|-------------|
| OneWire Bus | 5 | 12 | Dallas DS18B20 temperature sensors |

## Board Connectors

### J5 - ICSP/ISP Programming Header (2x3 pin header)

Standard AVR ISP programming connector for flashing firmware with Atmel-ICE or compatible programmer.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | MISO | Master In Slave Out (ISP_MISO) |
| 2 | VCC | +3.3V Power |
| 3 | SCK | Serial Clock (ISP_SCK) |
| 4 | GND | Ground |
| 5 | RESET | Reset (NRST, active low) |
| 6 | MOSI | Master Out Slave In (ISP_MOSI) |

**Footprint:** `PinHeader_2x03_P2.54mm_Vertical`

:::caution[Programming Voltage Warning]
This board operates at **3.3V**. Ensure your programmer is configured for 3.3V operation.
:::

### J4 - FTDI Debug Connector (1x6 pin header)

FTDI-compatible serial debugging interface for monitoring firmware output.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | GND | Ground |
| 2 | CTS | Not used (optional flow control) |
| 3 | VCC | +3.3V or +5V output (power from board) |
| 4 | TXD | AVR TX (UART transmit from MCU) |
| 5 | RXD | AVR RX (UART receive to MCU) |
| 6 | RTS | Not used (optional flow control) |

**Baud Rate:** 115200
**Settings:** 8N1 (8 data bits, No parity, 1 stop bit)
**Footprint:** `PinSocket_1x06_P2.54mm_Vertical`

:::tip[FTDI Connection Guide]
Connect an FTDI USB-to-Serial adapter (standard FTDI pinout):
- FTDI TX → J4 Pin 5 (RXD)
- FTDI RX → J4 Pin 4 (TXD)
- FTDI GND → J4 Pin 1 (GND)
- Leave CTS/RTS disconnected (or connect if using flow control)

**Warning:** Pin 3 provides power output from the board - do NOT connect to FTDI VCC if your programmer also supplies power.
:::

### J3 - SMBUS Connector (2x3 pin header)

I²C/SMBus interface for external sensor modules or accessories.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | SCL | I²C Clock |
| 2 | VCC | +3.3V Power |
| 3 | SDA | I²C Data |
| 4 | VCC | +3.3V Power |
| 5 | ALERT | SMBus Alert (optional) |
| 6 | SCL | I²C Clock (duplicate) |

**I²C Speed:** 80kHz (configured in firmware)  
**Footprint:** `PinHeader_2x03_P2.54mm_Vertical`

### J1 - MFM Module-Left (1x3 pin socket)

Left sensor module connector slot.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | SCL | I²C Clock |
| 2 | SDA | I²C Data |
| 3 | ALERT | SMBus Alert |

**Footprint:** `MFM_Module_Board_P123` (custom footprint)

### J2 - MFM Module-Right (1x3 pin socket)

Right sensor module connector slot.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | VCC | +3.3V Power |
| 2 | SDA | I²C Data |
| 3 | SCL | I²C Clock |

**Footprint:** `PinSocket_1x03_P2.54mm_Vertical`

:::note[Sensor Module Connectivity]
J1 and J2 allow connecting external I²C sensor modules. Default sensor address is `0x36`.
Both connectors share the same I²C bus with J3.
:::

## Power Control

The peripheral power control pin allows enabling/disabling external sensors:

| Function | mfm_v3 | mfm_v3_m1284p | Description |
|----------|--------|---------------|-------------|
| PERIF_PWR | 2 | 20 | Controls power to external sensors |

:::tip[Correct Board Selection]
Use the correct pin definitions for your board variant:
- Include `mfm_v3.h` for ATmega328P boards
- Include `mfm_v3_m1284p.h` for ATmega1284P boards
:::

## Next Steps

- [Programming & Connectors](/hardware/programming/) - Detailed connector pinouts and programming guide
- [Hardware Specifications](/hardware/specifications/) - Technical details
- [Schematics](/hardware/schematics/) - Full schematic diagrams
- [Quick Start](/deployment/quick-start/) - Setup and first steps
