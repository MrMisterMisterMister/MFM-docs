---
title: Data Flow
description: How data moves through the Multiflexmeter system
---

This diagram shows how data moves through the Multiflexmeter system.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}}}%%
flowchart TB
    subgraph PHYS["Physical Environment"]
        MILL["Mallemolen Mill<br/><b>Temperature, Humidity, etc.</b>"]
    end

    subgraph SENSE["Sensing Layer"]
        SENSOR["I2C Sensor (0x36)<br/><b>CMD: 0x10 (trigger)</b><br/><b>CMD: 0x11 (read)</b>"]
    end

    subgraph DEVICE["Multiflexmeter Device"]
        direction TB

        subgraph FW["Firmware Layer"]
            direction LR
            SINTF["Sensor Interface<br/><i>sensors.cpp</i>"]
            MAIN["Main Controller<br/><i>main.cpp</i>"]
            CONF["Config Manager<br/><i>rom_conf.cpp</i>"]
        end

        subgraph HW["Hardware Layer"]
            direction LR
            I2CDRV["I2C Driver @ 80kHz<br/><i>smbus.cpp</i>"]
            NETSTACK["LoRaWAN Stack<br/><i>LMIC Library</i>"]
            EEPROM["EEPROM<br/><b>41 bytes config</b>"]
        end
    end

    subgraph NET["Network Infrastructure"]
        GW["LoRaWAN Gateway<br/><b>EU868 Band</b>"]
        TTN["The Things Network<br/><b>OTAA Join / Downlink</b>"]
    end

    subgraph BACK["Backend Systems"]
        direction TB
        SERVER["Backend Server<br/><b>MQTT/HTTP Integration</b>"]
        DB[("Database<br/><b>Time Series Data</b>")]
        UI["Web Interface<br/><b>Visualization</b>"]
    end

    %% Uplink Data Flow (Solid Lines)
    MILL ==>|"Environmental<br/>Changes"| SENSOR
    SENSOR ==>|"I2C Raw Data<br/>[bytes]"| I2CDRV
    I2CDRV ==>|"Parsed Bytes"| SINTF
    SINTF ==>|"Sensor Values"| MAIN
    MAIN ==>|"LoRaWAN Payload<br/>Port 1: Data<br/>Port 2: Version"| NETSTACK
    CONF <-.->|"Read/Write<br/>DevEUI, AppKey<br/>Interval"| EEPROM
    NETSTACK ==>|"868MHz RF<br/>SF7-SF12"| GW
    GW ==>|"Internet<br/>Forwarding"| TTN
    TTN ==>|"JSON Payload<br/>+ Metadata"| SERVER
    SERVER ==>|"Store"| DB
    DB ==>|"Query"| UI

    %% Downlink Command Flow (Dashed Lines)
    UI -.->|"User Commands"| SERVER
    SERVER -.->|"Downlink Payload"| TTN
    TTN -.->|"Scheduled<br/>Downlink"| GW
    GW -.->|"RX1/RX2<br/>Window"| NETSTACK
    NETSTACK -.->|"Decode"| MAIN
    MAIN -.->|"0xDEAD: Reset<br/>0x10: Interval<br/>0x11: Sensor Cmd"| CONF
    MAIN -.->|"Forward<br/>Commands"| SINTF
    SINTF -.->|"I2C Write"| I2CDRV
    I2CDRV -.->|"Execute"| SENSOR

    %% Styling
    style PHYS fill:#d4edda,stroke:#28a745,stroke-width:3px
    style SENSE fill:#cfe2ff,stroke:#084298,stroke-width:3px
    style DEVICE fill:#fff3cd,stroke:#856404,stroke-width:3px
    style NET fill:#e7f1ff,stroke:#004085,stroke-width:3px
    style BACK fill:#f8d7da,stroke:#721c24,stroke-width:3px

    style MILL fill:#a3e4d7,stroke:#196f3d,stroke-width:2px
    style SENSOR fill:#aed6f1,stroke:#1f618d,stroke-width:2px
    style I2CDRV fill:#fad7a0,stroke:#b9770e,stroke-width:2px
    style SINTF fill:#fad7a0,stroke:#b9770e,stroke-width:2px
    style MAIN fill:#fad7a0,stroke:#b9770e,stroke-width:2px
    style CONF fill:#fad7a0,stroke:#b9770e,stroke-width:2px
    style NETSTACK fill:#fad7a0,stroke:#b9770e,stroke-width:2px
    style EEPROM fill:#d7bde2,stroke:#6c3483,stroke-width:2px
    style GW fill:#aed6f1,stroke:#1f618d,stroke-width:2px
    style TTN fill:#aed6f1,stroke:#1f618d,stroke-width:2px
    style SERVER fill:#f5b7b1,stroke:#943126,stroke-width:2px
    style DB fill:#f5b7b1,stroke:#943126,stroke-width:2px
    style UI fill:#f5b7b1,stroke:#943126,stroke-width:2px
```

## Data Format at Each Stage

### 1. Sensor → Device (I2C)
```
Command: 0x10 (trigger) → No response
Command: 0x11 (read) → [length][byte1][byte2]...[byteN]
```

### 2. Device → Network (LoRaWAN)
```
Port: 1 (sensor data)
Payload: [sensor_data_bytes]

Port: 2 (version ping)
Payload: [fw_version_msb][fw_version_lsb][hw_version_msb][hw_version_lsb]
```

### 3. Network → Backend (IP)
```json
{
  "device_id": "...",
  "timestamp": "...",
  "payload": "base64_encoded_data",
  "port": 1,
  "rssi": -120,
  "snr": 5.2
}
```

### 4. Backend Commands → Device
```
Reset: 0xDE 0xAD
Set Interval: 0x10 [interval_msb] [interval_lsb]
Sensor Command: 0x11 [command_bytes...]
```

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

## Settings Stored in EEPROM (41 bytes)

| Offset | Size | Field | Description |
|--------|------|-------|-------------|
| 0-3 | 4 | MAGIC | "MFM\0" identifier |
| 4-5 | 2 | HW_VERSION | Hardware version |
| 6-13 | 8 | APP_EUI | LoRaWAN Application EUI |
| 14-21 | 8 | DEV_EUI | LoRaWAN Device EUI |
| 22-37 | 16 | APP_KEY | LoRaWAN Application Key |
| 38-39 | 2 | INTERVAL | Measurement interval (seconds) |
| 40 | 1 | TTN_POLICY | Use TTN fair use policy |

All settings persist across resets and power cycles.
