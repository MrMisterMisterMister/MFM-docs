---
title: Schematics & Design Files
description: Hardware schematics and design files for Multiflexmeter 3.7.0
---

# Schematics & Design Files

Hardware design files and schematics for the Multiflexmeter 3.7.0.

## KiCad Project Files

The complete hardware design is available in the `hardware/` directory of the repository:

```
hardware/
├── mfm-v3-smd.kicad_pro     # KiCad project
├── mfm-v3-smd.kicad_sch     # Schematic file
├── mfm-v3-smd.kicad_pcb     # PCB layout
├── fp-lib-table              # Footprint library table
├── sym-lib-table             # Symbol library table
└── lib/                      # Custom libraries
```

## Opening the Design

### Requirements
- KiCad 6.0 or later
- Internet connection (for downloading standard libraries)

### Steps
1. Clone the repository
2. Open `hardware/mfm-v3-smd.kicad_pro` in KiCad
3. View schematic: Schematic Editor
4. View PCB: PCB Editor

## Schematic Overview

### Main Functional Blocks

1. **Power Supply**
   - Input: 3.3V - 5V DC
   - Voltage regulation
   - Power filtering

2. **Microcontroller**
   - ATmega1284P-AU (TQFP-44)
   - 16MHz crystal oscillator
   - Reset circuitry
   - ISP programming header

3. **LoRa Radio**
   - RFM95W module
   - SPI interface
   - Antenna matching network
   - DIO interrupt connections

4. **Sensor Interface**
   - I²C/SMBus pins
   - Pull-up resistors
   - Power control

5. **Programming & Debug**
   - ISP header (6-pin)
   - UART header (FTDI-compatible 6-pin)

## Manufacturing Files

### Gerber Files

Generate Gerber files from KiCad:
1. Open PCB Editor
2. File → Fabrication Outputs → Gerbers
3. Select output directory
4. Plot all layers

Required layers:
- F.Cu, B.Cu (copper)
- F.Mask, B.Mask (soldermask)
- F.Silk, B.Silk (silkscreen)
- Edge.Cuts (board outline)
- F.Paste, B.Paste (solderpaste)

### Drill Files

1. File → Fabrication Outputs → Drill Files
2. Generate in same directory as Gerbers

### BOM (Bill of Materials)

Generate BOM:
1. Open Schematic Editor
2. Tools → Generate BOM
3. Use KiBoM plugin or export to CSV

## PCB Specifications

| Parameter | Value |
|-----------|-------|
| **Layers** | 2-layer |
| **Dimensions** | TBD × TBD mm |
| **Thickness** | 1.6mm standard |
| **Copper Weight** | 1 oz (35µm) |
| **Min Track/Space** | 0.15mm / 0.15mm |
| **Min Drill** | 0.3mm |
| **Surface Finish** | HASL or ENIG |

## Assembly Notes

### SMD Components
- Most components are SMD (0603 or 0805 resistors/capacitors)
- RFM95W module is through-hole
- ATmega1284P is TQFP-44 package

### Soldering
- Reflow soldering recommended for SMD
- Hand soldering possible with fine-tip iron
- Hot air station useful for TQFP

### Testing Points
- Voltage test points for debugging
- SPI signal test points
- I²C signal test points

## License

Hardware design files are released under:
- **License**: MIT License (or CERN OHL)
- **Commercial Use**: Allowed
- **Modifications**: Allowed
- **Attribution**: Required

## Design Changes

### Contributing Hardware Changes

1. Fork the repository
2. Make changes in KiCad
3. Test thoroughly
4. Submit pull request with:
   - Description of changes
   - Reason for changes
   - Test results
   - Photos (if assembled)

### Version History

| Version | Changes |
|---------|---------|
| V3.0 | Initial production version |
| V3.1 | (Future) Improvements TBD |

## Manufacturing Services

Recommended PCB manufacturers:
- JLCPCB (China, economical)
- PCBWay (China, good quality)
- Eurocircuits (Europe, high quality)
- OSH Park (USA, good for prototypes)

## Next Steps

- [Hardware Specifications](/hardware/specifications/) - Technical specs
- [Pin Mappings](/hardware/pinout/) - Pin assignments
- [Development Guide](/development/development-guide/) - Build firmware for your board
