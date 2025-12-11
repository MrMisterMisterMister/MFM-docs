---
title: Deployment Flows
description: Data flow comparison between Test and MVP environments
---

This diagram compares the complete data flow from physical rotation detection to data visualization in both Test and MVP (Production) environments.

## Test Environment Flow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px', 'sequence': {'actorMargin': 50}}}}%%
sequenceDiagram
    autonumber
    participant WHEEL as Windmill<br/>Wheel
    participant IR as IR Break<br/>Beam Sensor
    participant MOD as Sensor<br/>Module<br/>(0x36)
    participant MFM as Multiflexmeter<br/>(ATmega1284P)
    participant TTN as The Things<br/>Network<br/>(EU868)
    participant TEST as Test Server<br/>(Vercel)
    participant DASH as Test<br/>Dashboard

    rect rgb(255, 250, 230)
        Note over WHEEL,IR: Physical Detection
        WHEEL->>IR: Spoke passes through beam
        IR->>IR: Beam interrupted
        IR->>MOD: Digital LOW signal
        MOD->>MOD: Increment rotation counter
    end

    rect rgb(230, 245, 255)
        Note over MFM,MOD: I2C Communication (80kHz)
        MFM->>MOD: CMD_PERFORM (0x10)
        MOD-->>MFM: ACK
        Note over MOD: Process measurements (10s)
        MFM->>MOD: CMD_READ (0x11)
        MOD-->>MFM: Sensor data payload
    end

    rect rgb(230, 255, 230)
        Note over MFM,TTN: LoRaWAN Uplink
        MFM->>MFM: Encode payload<br/>FPort 1/2/3
        MFM->>TTN: RF TX @ 868MHz<br/>(SF7-SF12)
        TTN->>TTN: Decode payload<br/>(JavaScript decoder)
    end

    rect rgb(245, 230, 255)
        Note over TTN,TEST: HTTP Integration
        TTN->>TEST: POST /api/uplink<br/>JSON webhook
        TEST->>TEST: Store in Vercel KV<br/>(Redis)
        TEST->>TEST: Reverse geocode<br/>GPS coordinates
    end

    rect rgb(255, 240, 245)
        Note over TEST,DASH: Real-time Updates
        TEST->>DASH: Server-Sent Events<br/>(SSE stream)
        DASH->>DASH: Update charts & tables
        Note over DASH: Display:<br/>- Rotation counts<br/>- Status (spinning/pumping)<br/>- Temperature<br/>- Location
    end
```

## MVP Environment Flow

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px', 'sequence': {'actorMargin': 50}}}}%%
sequenceDiagram
    autonumber
    participant WHEEL as Windmill<br/>Wheel
    participant IR as IR Break<br/>Beam Sensor
    participant MOD as Sensor<br/>Module<br/>(0x36)
    participant MFM as Multiflexmeter<br/>(ATmega1284P)
    participant LNS as LoRaWAN<br/>Server<br/>(Public/Private)
    participant MFMS as Multiflexmeter<br/>Server<br/>(Production)
    participant RIJN as Rijnland<br/>Server<br/>(Client API)

    rect rgb(255, 250, 230)
        Note over WHEEL,IR: Physical Detection
        WHEEL->>IR: Spoke passes through beam
        IR->>IR: Beam interrupted
        IR->>MOD: Digital LOW signal
        MOD->>MOD: Increment rotation counter<br/>Store timestamps
    end

    rect rgb(230, 245, 255)
        Note over MFM,MOD: I2C Communication (80kHz)
        MFM->>MOD: CMD_PERFORM (0x10)
        MOD-->>MFM: ACK
        Note over MOD: Process measurements (10s)
        MFM->>MOD: CMD_READ (0x11)
        MOD-->>MFM: Comprehensive sensor data:<br/>- Rotation counts<br/>- Status flags<br/>- Temperature<br/>- Distance
    end

    rect rgb(230, 255, 230)
        Note over MFM,LNS: LoRaWAN Uplink
        MFM->>MFM: Encode payload<br/>FPort 1: Distance/Temp<br/>FPort 2: Version<br/>FPort 3: Rotation data
        MFM->>LNS: RF TX @ 868MHz<br/>(Adaptive Data Rate)
        LNS->>LNS: Decode & decrypt<br/>Application payload
    end

    rect rgb(245, 230, 255)
        Note over LNS,MFMS: Production Integration
        LNS->>MFMS: HTTP POST<br/>Authenticated webhook
        MFMS->>MFMS: Validate & store:<br/>- PostgreSQL/TimescaleDB<br/>- Device metadata<br/>- Time-series data
        MFMS->>MFMS: Business logic:<br/>- Anomaly detection<br/>- Alerts & thresholds<br/>- Data aggregation
    end

    rect rgb(230, 255, 255)
        Note over MFMS,RIJN: Client API Integration
        RIJN->>MFMS: REST API request<br/>GET /devices/{id}/data
        MFMS-->>RIJN: JSON response:<br/>- Historical data<br/>- Current status<br/>- Statistics
        Note over RIJN: Water Authority<br/>Dashboard:<br/>- Pump monitoring<br/>- Maintenance logs<br/>- Operational reports
    end

    rect rgb(255, 245, 230)
        Note over LNS,MFM: Downlink (Optional)
        alt Configuration Update Needed
            RIJN->>MFMS: Update interval/config
            MFMS->>LNS: Queue downlink command
            LNS->>MFM: Downlink @ RX1/RX2<br/>(0x10: interval)<br/>(0x11: forward to module)
            MFM->>MFM: Apply configuration<br/>Save to EEPROM
        end
    end
```

## Key Differences

### Test Environment
- **Purpose**: Development, testing, and demonstrations
- **Network**: The Things Network (Community/Free)
- **Backend**: Vercel serverless (Astro + Vercel KV)
- **Database**: Vercel KV (Redis) - ephemeral data
- **Features**:
  - Real-time SSE dashboard
  - Device simulator support
  - Rapid iteration
  - No authentication required
  - Geographic visualization (Nominatim)

### MVP Environment
- **Purpose**: Production deployment for water authorities
- **Network**: Dedicated LoRaWAN server (Public/Private)
- **Backend**: Production Multiflexmeter Server
- **Database**: PostgreSQL/TimescaleDB - persistent time-series data
- **Features**:
  - Enterprise authentication & authorization
  - SLA guarantees
  - Data retention policies
  - Advanced analytics & reporting
  - Integration with existing client systems (Rijnland)
  - Maintenance scheduling
  - Alert & notification system

## Payload Details

### FPort 1: Distance & Temperature
- **Bytes 0-1**: Distance (uint16 LE, mm)
- **Bytes 2-5**: Temperature (float32 LE, °C)
- **Use Case**: Water level monitoring

### FPort 2: Version Info
- **Bytes 0-1**: FW version (proto/major/minor/patch)
- **Bytes 2-3**: HW version (proto/major/minor/patch)
- **Use Case**: Device inventory, compatibility checks

### FPort 3: Rotation Data
- **Byte 0**: Status flags (spinning, pumping)
- **Bytes 1-4**: Total pumping rotations (uint32 LE)
- **Bytes 5-8**: Total spinning rotations (uint32 LE)
- **Use Case**: Primary operational monitoring

## Timing Characteristics

| Stage | Test Environment | MVP Environment |
|-------|-----------------|-----------------|
| **Measurement Interval** | 30s (configurable 20-4270s) | 300s typical (5 min) |
| **I2C Transaction** | ~1ms @ 80kHz | ~1ms @ 80kHz |
| **Sensor Processing** | 10 seconds | 10 seconds |
| **LoRaWAN TX** | 200-500ms (SF7-SF12) | ~200ms (ADR optimized) |
| **Backend Processing** | <100ms (serverless) | <50ms (dedicated) |
| **Dashboard Update** | Real-time (SSE) | Polling/WebSocket |

## Network Specifications

### LoRaWAN Configuration
- **Frequency**: EU868 (868.1 - 868.5 MHz)
- **Modulation**: LoRa CSS
- **Activation**: OTAA (Over-The-Air Activation)
- **Class**: Class A (lowest power)
- **Adaptive Data Rate**: Enabled in MVP, configurable in Test
- **Confirmed Uplinks**: Disabled (optimize battery life)
- **Duty Cycle**: <1% (EU regulations)

### Data Rate & Range Trade-off
- **SF7**: ~2 km range, 5.5 kbps, 200ms airtime
- **SF12**: ~15 km range, 250 bps, 1-2s airtime
- **Battery Life**: 2-5 years (depending on interval & SF)
