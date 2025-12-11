---
title: FAQ
description: Frequently Asked Questions about Multiflexmeter 3.7.0
---

# Frequently Asked Questions

Answers to common questions about Multiflexmeter 3.7.0.

## General Questions

### What is Multiflexmeter?

Multiflexmeter 3.7.0 is an open-source IoT sensor platform based on ATmega1284P microcontroller and RFM95 LoRa radio. It's designed for low-power, long-range sensor data collection using LoRaWAN networks.

### What sensors are supported?

The device supports SMBus/I²C sensors at address 0x36. It can read 8 channels of 16-bit signed integer data per measurement cycle. The specific sensor type depends on your application.

### Is it compatible with The Things Network?

Yes! The device is fully compatible with TTN (The Things Network) using LoRaWAN 1.0.x OTAA activation.

### What programming language is it written in?

The firmware is written in **C++ with Arduino framework**, built using PlatformIO. It is NOT a Python project.

### Is it open source?

Yes, both hardware and firmware are open source under MIT License.

---

## Hardware Questions

### What microcontroller does it use?

ATmega1284P:
- 128KB Flash
- 16KB SRAM
- 4KB EEPROM
- 16MHz clock

### What is the range?

Typical LoRaWAN range:
- **Urban:** 2-5 km
- **Suburban:** 5-10 km
- **Rural:** Up to 15 km
- **Line-of-sight:** Up to 20 km

Actual range depends on spreading factor, antenna, obstacles, and gateway sensitivity.

### What is the power consumption?

Typical power consumption:
- **Sleep:** <1 mA
- **Active:** ~10 mA
- **TX (max power):** ~120 mA
- **Average (5 min interval):** ~0.5-1 mA

Battery life with 10Ah battery: 1-2 years

### Can I use solar power?

Yes! A 5-10W solar panel with 10Ah battery is sufficient for most deployments.

### What antenna should I use?

Recommended:
- **Type:** RP-SMA omnidirectional
- **Gain:** 3dBi (standard) or 5dBi (longer range)
- **Frequency:** 868MHz (EU) or 915MHz (US)
- **Mounting:** Vertical orientation

---

## Software Questions

### What is PlatformIO?

PlatformIO is a professional build system for embedded development. It manages dependencies, compiles code, and uploads firmware.

### Do I need Arduino IDE?

No! PlatformIO works with VS Code, CLion, or command line. Arduino IDE is not required.

### Can I use Arduino libraries?

Yes, PlatformIO uses Arduino framework. Most Arduino libraries are compatible.

### What LoRaWAN library is used?

MCCI Arduino LoRaWAN Library (LMIC) version 0.9.2 or compatible.

### How do I update the firmware?

```bash
# Build new firmware
pio run

# Upload via ISP
pio run --target upload
```

---

## Configuration Questions

### How do I configure LoRaWAN credentials?

Write credentials to EEPROM:
1. Register device on TTN
2. Copy AppEUI, DevEUI, AppKey
3. Generate EEPROM binary with Python script
4. Upload with avrdude

See: [Configuration Guide](/deployment/configuration/)

### What is the measurement interval?

Configurable from 20 seconds to 4270 seconds (~71 minutes).

**Note:** Interval is in **SECONDS**, not hours!

### Can I change interval remotely?

Yes, via LoRaWAN downlink on FPort 1:
```
Command: 0x0010
Value: 0x012C (300 seconds)
Payload: 00 10 01 2C
```

### What are the fuse settings?

```
Low fuse:  0xFF
High fuse: 0xD1
Ext fuse:  0xFF
```

Set with: `pio run --target fuses`

---

## LoRaWAN Questions

### What is OTAA?

Over-The-Air Activation. The device joins the network dynamically using AppEUI, DevEUI, and AppKey. More secure than ABP.

### What is spreading factor?

SF determines data rate vs range trade-off:
- **SF7:** Fast, short range (~2km)
- **SF9:** Medium speed, medium range (~5km)
- **SF12:** Slow, long range (~15km)

Device uses ADR (Adaptive Data Rate) by default.

### What is Fair Use Policy?

TTN free tier limits:
- 30 seconds uplink airtime per day
- 10 downlinks per device per day

Enable in EEPROM to enforce compliance.

### How many messages can I send per day?

Depends on spreading factor:

| SF | Airtime/msg | Max messages/day (30s limit) |
|----|-------------|------------------------------|
| SF7 | ~60ms | ~500 |
| SF9 | ~200ms | ~150 |
| SF12 | ~1.3s | ~23 |

### What are FPorts used for?

- **FPort 1:** Sensor measurements (16 bytes)
- **FPort 2:** Firmware version (2 bytes)

---

## Deployment Questions

### What enclosure rating do I need?

Minimum **IP65** (dust-tight, water jet resistant). IP67 or IP68 recommended for outdoor use.

### How high should I mount the device?

Recommended: 2-5 meters
- High enough for good signal
- Low enough for maintenance access
- Out of reach of tampering

### How do I check gateway coverage?

1. Use TTN Mapper: https://ttnmapper.org/
2. Check TTN Console for nearby gateways
3. Perform site survey with test device

### What temperature range is supported?

**Operating:** -20°C to +60°C

For extreme temperatures:
- Use insulation
- Avoid direct sunlight
- Consider temperature-compensated components

---

## Troubleshooting Questions

### Device won't join TTN, what do I check?

1. Verify credentials match TTN Console exactly
2. Check byte order (MSB first)
3. Verify frequency plan (CFG_eu868)
4. Check gateway coverage
5. Enable serial debug output

See: [Common Issues](/troubleshooting/common-issues/)

### How do I enable debug output?

Add to `platformio.ini`:
```ini
build_flags = 
    -DDEBUG=1
    -DSERIAL_BAUD=115200
```

Connect serial console at 115200 baud.

### Sensor returns all zeros?

1. Check sensor power
2. Verify I²C address (0x36)
3. Check pullup resistors (4.7kΩ)
4. Test with I²C scanner
5. Verify cable connections

### Upload fails with avrdude error?

1. Check ISP connections
2. Slow down SCK clock (`-B100`)
3. Verify power supply (5V)
4. Try different programmer
5. Check fuse settings

---

## Development Questions

### How do I add a new sensor?

1. Define sensor commands in `sensors.h`
2. Implement driver in `sensors.cpp`
3. Update measurement loop in `main.cpp`
4. Modify payload format if needed

See: [Development Guide](/development/development-guide/)

### Can I add more measurement channels?

Yes, but limited by:
- LoRaWAN payload size (max 51 bytes)
- Fair Use Policy (airtime increases)
- Memory constraints (SRAM)

### How do I add downlink commands?

1. Define command code
2. Add handler in `onEvent()` → `EV_TXCOMPLETE`
3. Update payload decoder in TTN
4. Document in protocol specification

### Can I use a different microcontroller?

Yes, with porting effort:
1. Create new board config in `include/board_config/`
2. Implement board functions in `src/boards/`
3. Update `platformio.ini`
4. Test thoroughly

---

## Performance Questions

### What is the maximum message rate?

Limited by:
- **Fair Use:** ~500 messages/day (SF7)
- **Duty Cycle:** 1% (EU868) = ~36s/hour
- **Minimum Interval:** 20 seconds

**Recommended:** 2-5 minute intervals for SF7

### Can I reduce power consumption?

Yes:
1. Enable sleep mode
2. Reduce TX power (if close to gateway)
3. Increase measurement interval
4. Power off peripherals between readings
5. Use lower spreading factor

### How accurate is the timing?

Timing is based on:
- 16MHz crystal oscillator
- LoRaWAN network time
- Job scheduler precision

**Accuracy:** ±50 ppm (crystal tolerance)

---

## Support Questions

### Where can I get help?

1. Read this documentation
2. Check [Common Issues](/troubleshooting/common-issues/)
3. Enable debug output and analyze logs
4. Open GitHub issue with details
5. Contact maintainers

### How do I report a bug?

1. Check if already reported (GitHub issues)
2. Provide firmware version
3. Include serial debug output
4. Describe steps to reproduce
5. Mention expected vs actual behavior

### Can I contribute?

Yes! Contributions welcome:
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

Contact the project maintainers via GitHub issues for contribution opportunities.

### Where is the source code?

GitHub: https://github.com/MrMisterMisterMister/MFM-docs

---

## Next Steps

- [Quick Start](/deployment/quick-start/) - Get started quickly
- [Common Issues](/troubleshooting/common-issues/) - Solve problems
- [Development Guide](/development/development-guide/) - Develop firmware
