---
title: Pin Mappings
description: Complete pin assignments for Multiflexmeter V3
---

# Pin Mappings

Complete pin assignments and GPIO configuration for Multiflexmeter V3.

## RFM95 LoRa Module Pins

| ATmega Pin | RFM95 Pin | Function | Direction |
|-----------|-----------|----------|-----------|
| See board_config | NSS | SPI Chip Select | Output |
| See board_config | MOSI | SPI Data Out | Output |
| See board_config | MISO | SPI Data In | Input |
| See board_config | SCK | SPI Clock | Output |
| See board_config | DIO0 | Interrupt 0 | Input |
| See board_config | DIO1 | Interrupt 1 | Input |
| See board_config | DIO2 | Interrupt 2 | Input |
| See board_config | RST | Radio Reset | Output |

## I²C/SMBus Sensor Interface

| ATmega Pin | Function | Notes |
|-----------|----------|-------|
| See board_config | SDA | I²C Data, 4.7kΩ pull-up |
| See board_config | SCL | I²C Clock, 4.7kΩ pull-up |

Default sensor address: `0x36`

## Power Control

| ATmega Pin | Function | Description |
|-----------|----------|-------------|
| See board_config | PIN_PERIF_PWR | Peripheral power control |

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

:::note[Board-Specific Pins]
Exact pin numbers are defined in `include/board_config/mfm_v3_m1284p.h`. 
Check the source code for your specific board variant.
:::

## Next Steps

- [Hardware Specifications](/hardware/specifications/) - Technical details
- [Schematics](/hardware/schematics/) - Full schematic diagrams
- [Development Guide](/development/development-guide/) - Working with hardware
