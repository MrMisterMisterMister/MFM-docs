# Data Flow Diagram

**Audience**: Advanced Topics (Deep Dives)
**Version**: 3.7.0
**Last Updated**: 2025-10-30

This diagram shows the complete end-to-end journey of data through the Multiflexmeter system, from physical sensing to backend storage.

```mermaid
flowchart LR
    subgraph Physical["Physical World"]
        Mill[Mallemolen<br/>Polder Mill]
    end
    
    subgraph Sensing["Sensing Layer"]
        ExtSensor[External Sensor<br/>I2C 0x36]
    end
    
    subgraph Device["Multiflexmeter Device"]
        subgraph Firmware["Firmware Layer"]
            SensorIF[Sensor Interface]
            MainCtrl[Main Controller]
            Config[Settings]
        end
        
        subgraph Hardware["Hardware Layer"]
            I2C[I2C Driver]
            Radio[LoRa Radio]
            EEPROM[EEPROM]
        end
    end
    
    subgraph Network["Network Layer"]
        Gateway[LoRaWAN Gateway]
        TTN[The Things Network]
    end
    
    subgraph Backend["Backend Layer"]
        Server[Backend Server]
        Storage[(Database)]
        UI[User Interface]
    end
    
    Mill -.affects.-> ExtSensor
    ExtSensor -->|Raw Data| I2C
    I2C -->|Bytes| SensorIF
    SensorIF -->|Measurements| MainCtrl
    
    Config <-->|Settings| EEPROM
    MainCtrl -->|LoRaWAN Packet| Radio
    Radio -->|868MHz RF| Gateway
    Gateway -->|Internet| TTN
    TTN -->|Internet| Server
    Server -->|Store| Storage
    Storage -->|Query| UI
    
    TTN -.Downlink Commands.-> Gateway
    Gateway -.Downlink.-> Radio
    Radio -.Commands.-> MainCtrl
    MainCtrl -.Update.-> Config
    MainCtrl -.Forward.-> SensorIF
    SensorIF -.Commands.-> I2C
    I2C -.Commands.-> ExtSensor
    
    style Physical fill:#e1ffe1
    style Sensing fill:#ffe1e1
    style Device fill:#e1f5ff
    style Network fill:#fff4e1
    style Backend fill:#f4e1ff
```

## Data Format at Each Stage

For complete protocol specifications, see [00-reference.md](00-reference.md).

### 1. Sensor → Device (I2C)
- **Trigger**: `0x10` → ACK only
- **Read**: `0x11` → Data bytes

### 2. Device → Network (LoRaWAN)
- **Port 1**: Sensor measurement data
- **Port 2**: Version information (on boot)

### 3. Network → Backend (IP)
TTN forwards LoRaWAN packets as JSON with metadata (RSSI, SNR, timestamp, etc.)

### 4. Backend Commands → Device
- **Reset**: `0xDEAD`
- **Set Interval**: `0x10 [MSB] [LSB]`
- **Sensor Command**: `0x11 [data...]`

## Configuration Flow

```mermaid
flowchart TD
    Start([Device Boot]) --> Load[Load Settings from EEPROM]
    Load --> Check{Valid Config?}
    Check -->|No| Default[Use Default Settings]
    Check -->|Yes| Use[Use Loaded Settings]
    
    Default --> Run[Device Running]
    Use --> Run
    
    Run --> Receive{Downlink<br/>Received?}
    Receive -->|No| Run
    Receive -->|Yes| Update[Update Setting]
    Update --> Save[Save to EEPROM]
    Save --> Apply[Apply New Setting]
    Apply --> Run
    
    style Load fill:#e1f5ff
    style Save fill:#ffe1e1
    style Apply fill:#e1ffe1
```

## EEPROM Configuration

For complete EEPROM structure details, see [00-reference.md](00-reference.md#eeprom-configuration-structure).

**Storage**: 41 bytes starting at address 0x00
**Key Fields**:
- LoRaWAN credentials (APP_EUI, DEV_EUI, APP_KEY)
- Measurement interval (20-4270 seconds)
- Hardware/firmware version
- TTN fair use policy flag

**Persistence**: All settings survive resets and power cycles.

## Related Diagrams

- **Architecture**: [System Architecture](04-system-architecture.md) - Component overview
- **Technical**: [Communication Sequence](03-communication-sequence.md) - Detailed interactions
- **Reference**: [Technical Reference](00-reference.md) - Complete data format specifications
