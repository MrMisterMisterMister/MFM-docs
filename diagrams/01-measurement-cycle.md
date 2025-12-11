# Measurement Cycle Process Flow

**Audience**: Quick Start (Beginner-Friendly)
**Version**: 3.7.0
**Last Updated**: 2025-10-30

This diagram shows how the Multiflexmeter collects and sends sensor data through a complete measurement cycle.

```mermaid
flowchart TD
    Start([Device Powers On]) --> Init[Initialize Hardware & Sensors]
    Init --> JoinNetwork[Join LoRaWAN Network]
    JoinNetwork --> WaitJoin{Network Joined?}
    WaitJoin -->|No| WaitJoin
    WaitJoin -->|Yes| Schedule[Schedule Next Measurement]
    
    Schedule --> Sleep[Sleep Until Scheduled Time]
    Sleep --> Trigger[Trigger Sensor Measurement]
    Trigger --> WaitSensor[Wait for Sensor]
    WaitSensor --> Read[Read Sensor Data]
    
    Read --> ValidData{Data Valid?}
    ValidData -->|No| Error[Log Error]
    Error --> Schedule
    ValidData -->|Yes| Transmit[Send Data via LoRaWAN]
    
    Transmit --> CheckDownlink{Downlink Received?}
    CheckDownlink -->|Yes| ProcessCmd[Process Command]
    CheckDownlink -->|No| Schedule
    
    ProcessCmd --> IsReset{Reset Command?}
    IsReset -->|Yes| Reset([Device Resets])
    IsReset -->|No| IsInterval{Interval Change?}
    IsInterval -->|Yes| UpdateInterval[Update Measurement Interval]
    IsInterval -->|No| ForwardCmd[Forward Command to Sensor]
    
    UpdateInterval --> Schedule
    ForwardCmd --> Schedule
```

## Key Points

- **Measurement interval**: Configurable 20-4270 seconds (see [00-reference.md](00-reference.md#timing-constants))
- **Power management**: Device sleeps between measurements to save battery
- **Downlink commands**: See [00-reference.md](00-reference.md#lorawan-downlink-network--device) for complete list

## Related Diagrams

- **Next**: [Device States](02-device-states.md) - Understand device lifecycle
- **Technical**: [Communication Sequence](03-communication-sequence.md) - Detailed timing and protocols
- **Reference**: [Technical Reference](00-reference.md) - All specifications and constants
