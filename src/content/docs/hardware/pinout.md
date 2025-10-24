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
| MOSI | 11 | 11 | SPI Master Out Slave In |
| MISO | 12 | 12 | SPI Master In Slave Out |
| SCK | 13 | 13 | SPI Serial Clock |
| RST | 9 | 25 | Radio Reset (active low) |
| DIO0 | 8 | 2 | RX/TX Done interrupt |
| DIO1 | 7 | 3 | RX Timeout / FHSS interrupt |
| DIO2 | 6 | 4 | FHSS Change Channel |
| DIO3 | - | 0 | CAD Detection / PLL Lock |
| DIO4 | - | 1 | PLL Lock / Temperature |
| DIO5 | - | 26 | Mode Ready / CLK Output |

## I²C/SMBus Sensor Interface

Standard I²C pins for sensor communication:

| ATmega Pin | Function | Notes |
|-----------|----------|-------|
| SDA | I²C Data | 4.7kΩ pull-up resistor |
| SCL | I²C Clock | 4.7kΩ pull-up resistor |

Default sensor address: `0x36`

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

:::caution[Programming Voltage]
This board operates at **3.3V**. Ensure your programmer is configured for 3.3V operation.
:::

### J4 - FTDI Debug Connector (1x6 pin header)

FTDI-compatible serial debugging interface for monitoring firmware output.

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | - | No connect |
| 2 | TXD | AVR_TX0 (UART transmit from MCU) |
| 3 | RXD | AVR_RX0 (UART receive to MCU) |
| 4 | - | No connect |
| 5 | - | No connect |
| 6 | GND | Ground |

**Baud Rate:** 115200  
**Footprint:** `PinSocket_1x06_P2.54mm_Vertical`

:::tip[FTDI Connection]
Connect an FTDI USB-to-Serial adapter with:
- FTDI TX → J4 Pin 3 (RXD)
- FTDI RX → J4 Pin 2 (TXD)
- FTDI GND → J4 Pin 6 (GND)
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

:::note[Sensor Modules]
J1 and J2 allow connecting external I²C sensor modules. Default sensor address is `0x36`.
Both connectors share the same I²C bus with J3.
:::

## Power Control

The peripheral power control pin allows enabling/disabling external sensors:

| Function | mfm_v3 | mfm_v3_m1284p | Description |
|----------|--------|---------------|-------------|
| PERIF_PWR | 2 | 20 | Controls power to external sensors |

:::tip[Board Selection]
Use the correct pin definitions for your board variant:
- Include `mfm_v3.h` for ATmega328P boards
- Include `mfm_v3_m1284p.h` for ATmega1284P boards
:::

## Next Steps

- [Programming & Connectors](/hardware/programming/) - Detailed connector pinouts and programming guide
- [Hardware Specifications](/hardware/specifications/) - Technical details
- [Schematics](/hardware/schematics/) - Full schematic diagrams
- [Getting Started](/guides/getting-started/) - Setup and first steps
