---
title: Measurement Cycle
description: How the Multiflexmeter collects and sends sensor data
---

This diagram shows how the Multiflexmeter collects and sends sensor data.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px'}}}%%
flowchart TD
    Start([Device Powers On]) --> Init["Initialize Hardware<br/><b>Setup I2C, SPI, GPIO</b>"]
    Init --> LoadCfg["Load Configuration<br/><b>Read EEPROM (41 bytes)</b><br/>DevEUI, AppKey, Interval"]
    LoadCfg --> JoinNetwork["Join LoRaWAN<br/><b>OTAA Activation</b><br/>5-10 seconds"]
    JoinNetwork --> WaitJoin{"Network<br/>Joined?"}
    WaitJoin -->|Failed| Retry["Wait 60s<br/><b>Backoff Retry</b>"]
    Retry --> JoinNetwork
    WaitJoin -->|Success| FirstDelay["Initial Delay<br/><b>45 seconds</b><br/>Version Ping"]

    FirstDelay --> Schedule["Schedule Next<br/><b>Interval: 20-4270s</b>"]
    Schedule --> Sleep["Sleep Mode<br/><b>Low Power</b><br/>Conserve Battery"]
    Sleep --> WakeUp["Timer Expires<br/><b>Wake Up</b>"]
    WakeUp --> PowerSensor["Power On Sensor<br/><b>GPIO Control</b>"]
    PowerSensor --> Trigger["Trigger Measurement<br/><b>I2C CMD 0x10</b><br/>to address 0x36"]
    Trigger --> Wait10["Wait 10 Seconds<br/><b>Sensor Processing</b>"]
    Wait10 --> Read["Read Sensor Data<br/><b>I2C CMD 0x11</b><br/>Get measurement bytes"]

    Read --> ValidData{"Data<br/>Valid?"}
    ValidData -->|Error| LogError["Log Sensor Error<br/><b>NACK or Timeout</b>"]
    LogError --> PowerOff1["Power Off Sensor<br/><b>Save Power</b>"]
    PowerOff1 --> Schedule
    ValidData -->|Valid| Transmit["Send via LoRaWAN<br/><b>Port 1: Sensor Data</b><br/>868MHz, SF7-SF12"]

    Transmit --> RX["Open RX Windows<br/><b>RX1 @ 1s, RX2 @ 2s</b>"]
    RX --> CheckDownlink{"Downlink<br/>Received?"}
    CheckDownlink -->|No| PowerOff2["Power Off Sensor"]
    PowerOff2 --> Schedule
    CheckDownlink -->|Yes| ProcessCmd["Decode Command<br/><b>Parse Payload</b>"]

    ProcessCmd --> CmdType{"Command<br/>Type?"}
    CmdType -->|"0xDEAD"| ResetCmd["Reset Command<br/><b>Enable Watchdog</b><br/>15ms timeout"]
    ResetCmd --> Reset([ Device Resets])
    CmdType -->|"0x10 [MSB][LSB]"| IntervalCmd["Update Interval<br/><b>Bounds: 20-4270s</b><br/>Save to EEPROM"]
    IntervalCmd --> PowerOff3["Power Off Sensor"]
    PowerOff3 --> Schedule
    CmdType -->|"0x11 [data...]"| ForwardCmd["Forward to Sensor<br/><b>I2C Write to 0x36</b><br/>Custom command"]
    ForwardCmd --> PowerOff4["Power Off Sensor"]
    PowerOff4 --> Schedule

    %% Styling
    style Start fill:#e8f5e9,stroke:#2e7d32,stroke-width:3px
    style Reset fill:#ffcdd2,stroke:#c62828,stroke-width:3px
    style Sleep fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style Transmit fill:#fff3e0,stroke:#e65100,stroke-width:2px
    style Schedule fill:#f3e5f5,stroke:#6a1b9a,stroke-width:2px

    style Init fill:#b2dfdb,stroke:#00695c,stroke-width:2px
    style LoadCfg fill:#b2dfdb,stroke:#00695c,stroke-width:2px
    style JoinNetwork fill:#b2dfdb,stroke:#00695c,stroke-width:2px
    style FirstDelay fill:#b2dfdb,stroke:#00695c,stroke-width:2px

    style PowerSensor fill:#ffe082,stroke:#f57f17,stroke-width:2px
    style Trigger fill:#ffe082,stroke:#f57f17,stroke-width:2px
    style Read fill:#ffe082,stroke:#f57f17,stroke-width:2px
    style Wait10 fill:#ffe082,stroke:#f57f17,stroke-width:2px

    style ResetCmd fill:#ef9a9a,stroke:#c62828,stroke-width:2px
    style IntervalCmd fill:#ce93d8,stroke:#6a1b9a,stroke-width:2px
    style ForwardCmd fill:#90caf9,stroke:#1565c0,stroke-width:2px

    style LogError fill:#ffccbc,stroke:#d84315,stroke-width:2px
    style WaitJoin fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style ValidData fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style CheckDownlink fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    style CmdType fill:#fff9c4,stroke:#f57f17,stroke-width:2px
```

## Key Points

- **Measurement interval**: Configurable between 20 seconds and 4270 seconds (~71 minutes)
- **Power management**: Device sleeps between measurements to save battery
- **Downlink commands**:
  - `0xDEAD`: Reset device
  - `0x10`: Change measurement interval
  - `0x11`: Forward command to sensor module
