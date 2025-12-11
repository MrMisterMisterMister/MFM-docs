# Communication Sequence

**Audience**: Technical Reference (Developer-Focused)
**Version**: 3.7.0
**Last Updated**: 2025-10-30

This diagram shows the detailed timing and interactions between components during a typical measurement cycle.

```mermaid
sequenceDiagram
    participant Main as Main Controller
    participant Sensor as Sensor Interface
    participant I2C as I2C Driver
    participant Hardware as Sensor (0x36)
    participant Network as LoRaWAN Stack
    participant Gateway as LoRa Gateway
    participant Server as Backend Server

    Note over Main: Timer expires

    Main->>Sensor: Trigger measurement
    Sensor->>I2C: Send command 0x10 to 0x36
    I2C->>Hardware: I2C: CMD_PERFORM (0x10)
    Hardware-->>I2C: ACK
    I2C-->>Sensor: Success
    Sensor-->>Main: Triggered
    
    Note over Hardware: Sensor measuring...

    Main->>Main: Wait 10 seconds

    Main->>Sensor: Read data
    Sensor->>I2C: Send command 0x11 to 0x36
    I2C->>Hardware: I2C: CMD_READ (0x11)
    Hardware-->>I2C: Data bytes
    I2C-->>Sensor: Data payload
    Sensor-->>Main: Measurement data
    
    Main->>Network: Send LoRaWAN packet
    Network->>Gateway: Transmit (868MHz)
    Gateway->>Server: Forward packet
    
    alt Downlink Available
        Server-->>Gateway: Downlink command
        Gateway-->>Network: Receive downlink
        Network-->>Main: Downlink data
        
        Main->>Main: Process command
        
        alt Reset Command (0xDEAD)
            Main->>Main: Trigger watchdog reset
        else Interval Command (0x10)
            Main->>Main: Update interval & save
        else Forward Command (0x11)
            Main->>Sensor: Forward to sensor
            Sensor->>I2C: Send to 0x36
            I2C->>Hardware: Forward command
            Hardware-->>I2C: Response
        end
    end
    
    Note over Main: Schedule next measurement
    Main->>Main: Enter sleep mode
```

## Timing Details

For complete timing specifications, see [00-reference.md](00-reference.md#timing-constants).

Key timings in this sequence:
- **I2C Transaction**: ~1ms per command/response
- **Sensor Measurement Wait**: 10 seconds between trigger and read
- **LoRaWAN TX**: 200-500ms (spreading factor dependent)
- **RX Windows**: RX1 at +1s, RX2 at +2s after transmission

## Protocol Details

For complete protocol specifications, see:
- **I2C Commands**: [00-reference.md](00-reference.md#i2c-commands-to-sensor-at-0x36)
- **LoRaWAN Uplinks**: [00-reference.md](00-reference.md#lorawan-uplink-device--network)
- **LoRaWAN Downlinks**: [00-reference.md](00-reference.md#lorawan-downlink-network--device)

## Related Diagrams

- **Overview**: [Measurement Cycle](01-measurement-cycle.md) - High-level process flow
- **Architecture**: [System Architecture](04-system-architecture.md) - Component relationships
- **Advanced**: [Data Flow](05-data-flow.md) - End-to-end data journey
- **Reference**: [Technical Reference](00-reference.md) - Complete protocol reference
