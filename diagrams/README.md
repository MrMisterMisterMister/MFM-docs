# Multiflexmeter System Diagrams

**Version**: 3.7.0 | **Format**: Mermaid diagrams | **Last Updated**: 2025-10-30

This folder contains interactive Mermaid diagrams that explain how the Multiflexmeter IoT sensor platform works. The diagrams are organized by audience and use case.

---

## Documentation Structure

### Quick Start (Beginner-Friendly)
**Audience**: New users, product managers, non-technical stakeholders

1. **[Measurement Cycle](01-measurement-cycle.md)** - How the device collects and sends data
2. **[Device States](02-device-states.md)** - Different states the device goes through

**Start here** if you want to understand what the device does and how it operates in the field.

---

### Technical Reference (Developer-Focused)
**Audience**: Firmware developers, hardware engineers, system integrators

3. **[Communication Sequence](03-communication-sequence.md)** - Component interactions and timing
4. **[System Architecture](04-system-architecture.md)** - Overall system structure and components

**Use these** when building integrations, debugging, or understanding the technical design.

---

### Advanced Topics (Deep Dives)
**Audience**: Advanced developers, troubleshooting, system optimization

5. **[Data Flow](05-data-flow.md)** - End-to-end data journey through the system
6. **[Error Handling](06-error-handling.md)** - Error detection and recovery mechanisms

**Refer to these** for advanced debugging, system optimization, or deep technical understanding.

---

### Reference Material
**Audience**: All users

0. **[Technical Reference](00-reference.md)** - Constants, protocols, specifications, and color coding

**Consult this** for protocol details, timing values, error codes, and technical specifications referenced throughout the diagrams.

---

## Quick Reference

For detailed specifications, see **[Technical Reference](00-reference.md)**

### System Overview
- **Device**: Multiflexmeter 3.7.0 (ATmega1284P + RFM95 LoRa)
- **Purpose**: Environmental monitoring for Mallemolen polder mill (Gouda, NL)
- **Network**: LoRaWAN via The Things Network (TTN)
- **Sensor**: I2C external sensor at address 0x36

### Key Specifications
- **Microcontroller**: ATmega1284P @ 8MHz
- **Radio**: RFM95 (868MHz LoRa)
- **Memory**: 128KB Flash, 16KB SRAM, 4KB EEPROM
- **Measurement Interval**: 20-4270 seconds (configurable)
- **Power**: Battery-powered with sleep modes

### Communication Protocols
- **I2C/SMBus**: Device ↔ Sensor (80kHz)
- **LoRaWAN**: Device ↔ Gateway (EU868, Class A, OTAA)
- See [00-reference.md](00-reference.md) for complete protocol details

---

## How to Use These Diagrams

### Viewing
- **GitHub**: Diagrams render automatically in `.md` files
- **Local**: Use VS Code with Mermaid extension or any Markdown viewer
- **Online**: Upload to [Mermaid Live Editor](https://mermaid.live)

### Learning Path
1. **New to Multiflexmeter?** → Start with [01-measurement-cycle.md](01-measurement-cycle.md)
2. **Need technical details?** → Jump to [Technical Reference](00-reference.md)
3. **Debugging issues?** → Check [06-error-handling.md](06-error-handling.md)
4. **Integrating systems?** → Review [03-communication-sequence.md](03-communication-sequence.md)

### Diagram Types Used
- **Flowchart**: Process flows and decision logic
- **State Diagram**: Device lifecycle and transitions
- **Sequence Diagram**: Component interactions over time
- **Graph**: System architecture and relationships
- **Mindmap**: Categorization and hierarchy

### Exporting Diagrams
```bash
# Using Mermaid CLI
npm install -g @mermaid-js/mermaid-cli
mmdc -i 01-measurement-cycle.md -o measurement-cycle.png
```

Or use: [Mermaid Live Editor](https://mermaid.live) → Export as PNG/SVG

---

## Related Documentation

- **C4 Architecture Model**: `../src/likec4/model.c4` - Interactive C4 diagrams
- **Firmware Documentation**: `../src/content/docs/firmware/` - Code-level documentation
- **Protocol Reference**: `../src/content/docs/firmware/protocol.md` - Detailed protocols
- **Hardware Specs**: `../src/content/docs/hardware/` - Schematics and pinouts
- **Source Code**: `../Multiflexmeter-3.7.0/src/` - Firmware implementation

---

## Contributing

When adding or modifying diagrams:

1. **Maintain consistency**: Use the color scheme from [00-reference.md](00-reference.md)
2. **Update cross-references**: Link to related diagrams using `See also: [...]`
3. **Add metadata**: Include version, audience level, and last updated date
4. **Keep it focused**: One main concept per diagram
5. **Test rendering**: Verify on GitHub and Mermaid Live Editor
6. **Update README**: Add new diagrams to the appropriate audience section
7. **Check for hardcoded values**: Reference [00-reference.md](00-reference.md) instead

### Diagram Naming Convention
- `00-reference.md` - Technical reference (always 00)
- `01-09` - Quick Start diagrams
- `10-19` - Technical Reference diagrams (if needed)
- `20-29` - Advanced Topics diagrams (if needed)

---

## Questions or Issues?

- **Documentation accuracy**: See `../DOCUMENTATION_REVIEW.md` for known issues
- **Firmware questions**: Check `../src/content/docs/troubleshooting/`
- **Diagram errors**: File an issue or submit a pull request

**Version**: 3.7.0 | **Last Updated**: 2025-10-30
