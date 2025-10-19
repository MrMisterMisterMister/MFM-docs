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

## Programming Interfaces

### ISP Header (6-pin)

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | MISO | Master In Slave Out |
| 2 | VCC | +5V/3.3V |
| 3 | SCK | Serial Clock |
| 4 | MOSI | Master Out Slave In |
| 5 | RESET | Reset (active low) |
| 6 | GND | Ground |

### UART Header (6-pin FTDI)

| Pin | Signal | Description |
|-----|--------|-------------|
| 1 | GND | Ground |
| 2 | CTS | Clear To Send (not used) |
| 3 | VCC | Power output |
| 4 | TXD | UART transmit |
| 5 | RXD | UART receive |
| 6 | RTS | Request To Send (not used) |

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

- [Hardware Specifications](/hardware/specifications/) - Technical details
- [Schematics](/hardware/schematics/) - Full schematic diagrams
- [Development Guide](/development/development-guide/) - Working with hardware
