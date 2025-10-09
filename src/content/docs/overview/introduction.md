---
title: Introduction
description: Overview of the Multiflexmeter V3 IoT sensor platform
---

# Multiflexmeter V3 Introduction

The Multiflexmeter V3 (MFM) is an open-source IoT sensor platform designed for **flexible, low-cost, and frequent environmental measurements** in remote locations using LoRaWAN technology.

## Purpose

Multiflexmeter provides a robust, battery-powered solution for environmental monitoring applications such as:

- Soil moisture and temperature monitoring
- Water level measurement
- Agricultural field monitoring
- Remote sensor deployments
- Environmental research projects

## Key Capabilities

### LoRaWAN Connectivity
- **Long-range wireless**: Up to several kilometers in open terrain
- **Low power consumption**: Optimized for battery operation
- **LoRaWAN 1.0.x**: OTAA (Over-the-Air Activation) support
- **RFM95 radio**: 868MHz LoRa transceiver module

### Flexible Sensor Integration
- **SMBus/I²C interface**: Standard protocol for sensor communication
- **Multiple sensor support**: Connect various environmental sensors
- **Configurable measurement intervals**: Adjust based on application needs
- **Sensor auto-detection**: Automatic identification of connected sensors

### Open Source
- **Hardware**: Complete KiCad schematics and PCB designs
- **Firmware**: C++ source code built with PlatformIO
- **MIT License**: Free to use, modify, and distribute
- **Community-driven**: Active development and support

## Technical Overview

| Component | Specification |
|-----------|--------------|
| Microcontroller | ATmega1284P (8-bit AVR) |
| Flash Memory | 128KB |
| SRAM | 16KB |
| EEPROM | 4KB (for configuration storage) |
| Radio | RFM95 LoRa transceiver (868MHz) |
| Sensor Interface | SMBus/I²C |
| Programming | ISP (In-System Programming) |
| Debug Interface | UART (FTDI-compatible) |
| Power Supply | 3.3V - 5V DC |

## Firmware Technology Stack

The Multiflexmeter V3 firmware is built using:

- **Language**: C++ (Arduino framework)
- **Build System**: PlatformIO
- **IDE Support**: VS Code, PlatformIO IDE, Arduino IDE (with modifications)
- **LoRaWAN Stack**: MCCI Arduino-LMIC library
- **Development Platform**: AVR-GCC toolchain

## Use Cases

### Agricultural Monitoring
Deploy Multiflexmeter devices across fields to monitor soil conditions, enabling precision agriculture and optimized irrigation.

### Water Level Monitoring
Track water levels in reservoirs, rivers, or irrigation channels using ultrasonic or pressure sensors.

### Environmental Research
Collect long-term environmental data in remote locations where traditional power sources are unavailable.

### Smart City Applications
Monitor urban green spaces, parks, or infrastructure with minimal maintenance requirements.

## Getting Started

Ready to start using Multiflexmeter V3? Check out:

- [Quick Start Guide](/deployment/quick-start/) - Get your first device running
- [Hardware Specifications](/hardware/specifications/) - Detailed hardware information
- [Firmware Architecture](/firmware/architecture/) - Understand the firmware structure
- [Development Setup](/development/environment-setup/) - Set up your development environment

## Project Status

**Current Version**: V3.7.0

The Multiflexmeter V3 is a mature, production-ready platform with ongoing development and community support. The hardware and firmware have been tested in real-world deployments.

## Community & Support

- **Repository**: [GitHub Organization](https://github.com/your-org/multiflexmeter)
- **Issue Tracking**: Report bugs and request features
- **Documentation**: Comprehensive guides and reference materials
- **Contributions**: Community contributions welcome

## Next Steps

Continue to:
- [Features & Capabilities](/overview/features/) - Deep dive into features
- [System Architecture](/overview/architecture/) - Understand the system design
- [Hardware Overview](/hardware/overview/) - Explore the hardware platform
