---
title: Hardware Overview
description: Introduction to Multiflexmeter 3.7.0 hardware
---

Introduction to the Multiflexmeter 3.7.0 hardware platform and its components.

## Board Overview

The Multiflexmeter 3.7.0 is built around the ATmega1284P microcontroller and RFM95 LoRa radio module, providing a complete IoT sensor platform in a compact form factor.

## Key Components

### 1. ATmega1284P Microcontroller
- 8-bit AVR processor @ 8MHz
- 128KB Flash for firmware
- 16KB SRAM for runtime
- 4KB EEPROM for configuration

### 2. RFM95W LoRa Module
- 868MHz transceiver
- Up to +20dBm output power
- -148dBm sensitivity
- Long-range capability (up to 10km)

### 3. Sensor Interface
- I²C/SMBus for sensor communication
- Standard pinout for easy integration
- 3.3V/5V compatible

### 4. Programming & Debug
- **J5:** 6-pin ICSP/ISP header for firmware upload (Atmel-ICE compatible)
- **J4:** FTDI-compatible UART for debugging (115200 baud)
- **J3:** SMBus/I²C expansion connector
- **J1/J2:** Sensor module slots

## Block Diagram

```
┌─────────────────────────────────────────┐
│           Multiflexmeter 3.7.0             │
│                                         │
│  ┌──────────┐          ┌────────────┐  │
│  │          │   SPI    │            │  │
│  │ ATmega   ├──────────┤   RFM95    │  │
│  │ 1284P    │          │  LoRa      │  │
│  │          │          │  Module    │  │
│  └────┬─────┘          └──────┬─────┘  │
│       │                       │         │
│       │ I²C              Antenna        │
│       │                       │         │
│  ┌────┴─────┐           ┌────┴─────┐   │
│  │  Sensor  │           │   ISP    │   │
│  │Interface │           │ & UART   │   │
│  └──────────┘           └──────────┘   │
└─────────────────────────────────────────┘
```

## Next Steps

- [Programming & Connectors](/hardware/programming/) - How to program the board and connector details
- [Pin Mappings](/hardware/pinout/) - Complete pin reference
- [Specifications](/hardware/specifications/) - Detailed technical specs
- [Schematics](/hardware/schematics/) - Hardware design files
