---
title: Communication Sequence
description: Component interactions during a measurement cycle
---

This diagram shows how components interact during a typical measurement cycle.

```mermaid
%%{init: {'theme':'base', 'themeVariables': { 'fontSize':'16px', 'sequence': {'actorMargin': 60}}}}%%
sequenceDiagram
    autonumber
    participant CTRL as Main<br/>Controller
    participant SINTF as Sensor<br/>Interface
    participant I2C as I2C Driver<br/>@ 80kHz
    participant SENS as Sensor<br/>0x36
    participant NET as LoRaWAN<br/>Stack
    participant GW as Gateway<br/>868MHz
    participant SRV as Backend<br/>Server

    rect rgb(230, 245, 255)
        Note over CTRL: Timer Expires (20-4270s interval)
        CTRL->>+SINTF: Trigger Measurement
        SINTF->>+I2C: Send CMD 0x10
        I2C->>+SENS: I2C Write: CMD_PERFORM (0x10)
        SENS-->>-I2C: ACK
        I2C-->>-SINTF: Success
        SINTF-->>-CTRL: Triggered
    end

    rect rgb(255, 250, 230)
        Note over SENS: Sensor processing data... (10 seconds)
        CTRL->>CTRL: Wait 10 seconds (MEASUREMENT_SEND_DELAY)
    end

    rect rgb(230, 245, 255)
        CTRL->>+SINTF: Read Data
        SINTF->>+I2C: Send CMD 0x11
        I2C->>+SENS: I2C Write: CMD_READ (0x11)
        SENS-->>I2C: [length][data bytes...]
        I2C-->>-SINTF: Data payload (N bytes)
        SINTF-->>-CTRL: Measurement values
    end

    rect rgb(230, 255, 230)
        Note over CTRL,NET: LoRaWAN Transmission
        CTRL->>+NET: Send(port=1, payload=data)
        NET->>NET: Encrypt & Frame
        NET->>+GW: RF TX @ 868MHz (SF7-SF12)<br/>Duration: 200-500ms
        GW->>+SRV: Forward via Internet<br/>MQTT/HTTP
        SRV-->>-GW: Received
    end

    rect rgb(255, 240, 245)
        Note over GW,SRV: Check for Downlink Commands

        alt Downlink Available
            SRV-->>GW: Downlink Command
            GW-->>NET: RX Window (RX1 @ +1s or RX2 @ +2s)
            NET-->>-CTRL: Downlink Payload

            CTRL->>CTRL: Decode Command

            alt Reset Command (0xDEAD)
                Note over CTRL: Enable Watchdog (15ms)<br/>Enter infinite loop
                CTRL->>CTRL: Watchdog triggers reset
            else Interval Command (0x10 [MSB][LSB])
                CTRL->>CTRL: Parse interval (20-4270s)
                CTRL->>CTRL: Save to EEPROM
                Note over CTRL: Interval updated
            else Forward Command (0x11 [data...])
                CTRL->>+SINTF: Forward to sensor
                SINTF->>+I2C: Custom command
                I2C->>+SENS: I2C Write: [data...]
                SENS-->>-I2C: Response (if any)
                I2C-->>-SINTF: Done
                SINTF-->>-CTRL: Forwarded
            end
        else No Downlink
            Note over GW: RX1 timeout @ +1s<br/>RX2 timeout @ +2s
            GW-->>-NET: No data
            NET-->>CTRL: No downlink
        end
    end

    rect rgb(240, 230, 255)
        Note over CTRL: Schedule next measurement
        CTRL->>CTRL: Enter sleep mode<br/>Wake at next interval
    end
```

## Timing Details

- **I2C Communication**: ~1ms per transaction (80kHz bus speed)
- **Sensor Measurement Wait**: 10 seconds (MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S)
- **LoRaWAN Transmission**: 200-500ms (depends on spreading factor)
- **LoRaWAN Receive Windows**: RX1 at 1s, RX2 at 2s after TX
- **Sleep Duration**: User-configurable (20s - 4270s)

## Protocol Details

### I2C Commands to Sensor (0x36)
- `0x10` (CMD_PERFORM): Trigger new measurement
- `0x11` (CMD_READ): Read measurement results

### LoRaWAN Downlink Commands
- `0xDEAD`: Reset device immediately
- `0x10 [MSB] [LSB]`: Set interval in seconds
- `0x11 [data...]`: Forward data to sensor module
