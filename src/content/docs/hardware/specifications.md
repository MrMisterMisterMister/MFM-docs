---
title: Hardware Specifications
description: Complete technical specifications for Multiflexmeter V3.7.0 hardware
---

# Hardware Specifications

Complete technical specifications for the Multiflexmeter V3.7.0 hardware platform.

## Microcontroller

### MFM V3 M1284P (Primary/Current)

| Specification | Value |
|--------------|-------|
| **Model** | ATmega1284P |
| **Architecture** | 8-bit AVR RISC |
| **Clock Speed** | 8 MHz (internal oscillator) |
| **Flash Memory** | 128 KB |
| **SRAM** | 16 KB |
| **EEPROM** | 4 KB |
| **I/O Pins** | 32 programmable |
| **Operating Voltage** | 1.8V - 5.5V |
| **Typical Operating** | 3.3V - 5V |
| **Arduino Core** | MightyCore |

### MFM V3 (Legacy)

| Specification | Value |
|--------------|-------|
| **Model** | ATmega328P |
| **Architecture** | 8-bit AVR RISC |
| **Clock Speed** | 8 MHz (internal oscillator) |
| **Flash Memory** | 32 KB |
| **SRAM** | 2 KB |
| **EEPROM** | 1 KB |
| **I/O Pins** | 23 programmable |
| **Operating Voltage** | 1.8V - 5.5V |
| **Typical Operating** | 3.3V - 5V |
| **Arduino Core** | MiniCore |

## LoRa Radio Module

| Specification | Value |
|--------------|-------|
| **Model** | HopeRF RFM95W |
| **Frequency** | 868 MHz (EU band) |
| **Modulation** | LoRa, FSK, GFSK, MSK, OOK |
| **TX Power** | +20 dBm (100mW) max |
| **RX Sensitivity** | -148 dBm (SF12, 125kHz) |
| **Interface** | SPI |
| **Range** | Up to 10 km line-of-sight |

## Power Specifications

| Parameter | Condition | Typical | Maximum | Unit |
|-----------|-----------|---------|---------|------|
| **Supply Voltage** | Operating | 3.3 - 5.0 | - | V |
| **Sleep Current** | Deep sleep | < 1 | 5 | mA |
| **Active Current** | Measuring | 20 | 30 | mA |
| **TX Current** | +20dBm, 868MHz | 120 | 150 | mA |
| **RX Current** | Receiving | 10 | 15 | mA |

## Sensor Interface

| Specification | Value |
|--------------|-------|
| **Protocol** | SMBus / I²C |
| **Bus Speed** | 100 kHz (standard mode) |
| **Voltage Level** | 3.3V or 5V (depending on supply) |
| **Pull-up Resistors** | 4.7kΩ on SDA and SCL |
| **Default Sensor Address** | 0x36 |

## Programming Interfaces

### ISP (In-System Programming)

| Pin | Function |
|-----|----------|
| 1 | MISO |
| 2 | VCC |
| 3 | SCK |
| 4 | MOSI |
| 5 | RESET |
| 6 | GND |

**Compatible Programmers:**
- USBasp
- AVRISP mkII
- Atmel-ICE
- Arduino as ISP

### UART Debug Header

| Pin | Function |
|-----|----------|
| 1 | GND |
| 2 | CTS (not used) |
| 3 | VCC (3.3V/5V output) |
| 4 | TX (MCU transmit) |
| 5 | RX (MCU receive) |
| 6 | RTS (not used) |

**Settings:**
- Baud Rate: 115200
- Data Bits: 8
- Parity: None
- Stop Bits: 1
- Flow Control: None

## Pin Assignments

See [Pin Mappings](/hardware/pinout/) for complete pin assignments.

## Fuse Settings

| Fuse | Value | Description |
|------|-------|-------------|
| **Low Fuse** | 0xFF | External crystal oscillator, fast start-up |
| **High Fuse** | 0xD1 | SPI enabled, BOD 2.7V, EESAVE enabled |
| **Extended Fuse** | 0xFF | BOD enabled |

**Critical Fuse Bits:**
- SPIEN: Enabled (allows ISP programming)
- BOOTRST: Application reset (not bootloader)
- EESAVE: EEPROM preserved during chip erase
- BODLEVEL: 2.7V (prevents brownout issues)

## Environmental Specifications

| Parameter | Minimum | Typical | Maximum | Unit |
|-----------|---------|---------|---------|------|
| **Operating Temperature** | -20 | 25 | +70 | °C |
| **Storage Temperature** | -40 | - | +85 | °C |
| **Humidity** | 0 | - | 95 | % RH (non-condensing) |

## Mechanical Specifications

| Parameter | Value |
|-----------|-------|
| **PCB Dimensions** | TBD × TBD mm |
| **Mounting** | 4× M3 holes |
| **Antenna Connector** | SMA or U.FL |
| **Enclosure** | Optional weatherproof case |

## Board Variants

### MFM V3 M1284P (Recommended)

- **Board ID**: `mfm_v3_m1284p`
- **MCU**: ATmega1284P
- **Memory**: 128KB Flash, 16KB RAM, 4KB EEPROM
- **Clock**: 8MHz internal oscillator
- **Arduino Core**: MightyCore
- **Features**: Full feature set, production-ready
- **Upload Protocol**: stk500 at 115200 baud
- **Status**: Current/active variant

### MFM V3 (Legacy)

- **Board ID**: `mfm_v3`
- **MCU**: ATmega328P
- **Memory**: 32KB Flash, 2KB RAM, 1KB EEPROM
- **Clock**: 8MHz internal oscillator
- **Arduino Core**: MiniCore
- **Features**: Reduced I/O pins, limited memory
- **Upload Protocol**: stk500v2 at 115200 baud
- **Status**: Legacy support only

:::tip[Board Selection]
Use **MFM V3 M1284P** for new projects. It provides more memory, additional I/O pins, and is the actively developed variant.
:::

## Compliance

| Standard | Status |
|----------|--------|
| **CE** | Design compliant (requires testing) |
| **LoRaWAN 1.0.x** | Certified via LMIC library |
| **ETSI EN 300 220** | EU 868MHz compliance |
| **RoHS** | Compliant components |

## Performance Characteristics

### Battery Life Estimates

Assuming 3× AA alkaline batteries (~3000 mAh @ 4.5V):

| Interval | Est. Battery Life |
|----------|------------------|
| 15 min (900s) | 9-12 months |
| 30 min (1800s) | 12-18 months |
| 1 hour (3600s) | 18-24 months |

**Factors affecting battery life:**
- Measurement interval
- Spreading factor (SF7 vs SF12)
- Sensor power consumption
- Temperature
- Number of join attempts

### LoRaWAN Performance

| Spreading Factor | Data Rate | Airtime (24 bytes) | Range | Battery Impact |
|-----------------|-----------|-------------------|-------|----------------|
| SF7 | 5470 bps | ~61 ms | 2 km | Lowest |
| SF8 | 3125 bps | ~113 ms | 3 km | Low |
| SF9 | 1760 bps | ~206 ms | 4 km | Medium |
| SF10 | 980 bps | ~371 ms | 6 km | Medium-High |
| SF11 | 440 bps | ~741 ms | 8 km | High |
| SF12 | 250 bps | ~1483 ms | 10+ km | Highest |

## Bill of Materials

Key components:

- ATmega1284P-AU (TQFP-44)
- RFM95W-868S2 (LoRa module)
- 16 MHz crystal
- Voltage regulator (3.3V or 5V)
- Passive components (resistors, capacitors)
- Headers (ISP, UART, sensor)
- Antenna (868MHz)

Full BOM available in KiCad project files.

## Design Files

- **Schematics**: Available in `hardware/` directory
- **PCB Layout**: KiCad PCB file
- **Gerber Files**: For manufacturing
- **3D Models**: STEP files for enclosure design

## Certifications & Testing

### Required Testing for Deployment

1. **RF Performance**: Range, sensitivity, interference
2. **Environmental**: Temperature, humidity cycling
3. **EMC**: Emissions and immunity
4. **Mechanical**: Vibration, shock (if applicable)
5. **Long-term**: Battery life validation

### Regional Variants

For operation outside EU868:
- US915: Requires firmware modification
- AS923: Requires firmware modification  
- AU915: Requires firmware modification

Contact maintainers for regional variants.

## Next Steps

- [Pin Mappings](/hardware/pinout/) - Detailed pin assignments
- [Schematics](/hardware/schematics/) - View hardware design
- [Hardware Overview](/hardware/overview/) - General hardware information

## Legacy Documentation

### MFM v2.0 Hardware Specification (Reference)

:::note
The document below is for the previous MFM v2.0 hardware version. While some concepts remain applicable, refer to the current V3.7.0 specifications above for accurate technical details.
:::

<iframe 
  src="/pdfs/Hardware-P22296-1-SPEC-MFM-v2.0.pdf" 
  width="100%" 
  height="100vh"
  style="min-height: 842px; border: none;"
  title="MFM v2.0 Hardware Specification">
  <p>Your browser doesn't support PDF viewing. 
     <a href="/pdfs/Hardware-P22296-1-SPEC-MFM-v2.0.pdf" download>Download Hardware Specification PDF</a>
  </p>
</iframe>

[📄 Download Hardware Specification (PDF)](/pdfs/Hardware-P22296-1-SPEC-MFM-v2.0.pdf)
