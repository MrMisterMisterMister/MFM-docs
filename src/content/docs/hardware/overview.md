---
title: Hardware Overview
description: Introduction to Multiflexmeter V3.7.0 hardware
---

# Hardware Overview

Introduction to the Multiflexmeter V3.7.0 hardware platform and its components.

## Board Overview

The Multiflexmeter V3.7.0 is built around the ATmega1284P microcontroller and RFM95 LoRa radio module, providing a complete IoT sensor platform in a compact form factor.

## Key Components

### 1. ATmega1284P Microcontroller
- 8-bit AVR processor @ 16MHz
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
- 6-pin ISP header for firmware upload
- FTDI-compatible UART for debugging
- Serial output at 115200 baud

## Block Diagram

```
┌─────────────────────────────────────────┐
│           Multiflexmeter V3.7.0             │
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

- [Specifications](/hardware/specifications/) - Detailed technical specs
- [Pin Mappings](/hardware/pinout/) - Complete pin reference
- [Schematics](/hardware/schematics/) - Hardware design files
