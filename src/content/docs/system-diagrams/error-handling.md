---
title: Error Handling
description: How the device handles errors and recovers from failures
---

This diagram shows how the device handles errors and recovers from failures.

```mermaid
flowchart TD
    Operation[Normal Operation] --> Error{Error<br/>Detected?}
    Error -->|No| Operation
    Error -->|Yes| Classify{Error Type?}

    Classify -->|Sensor Error| SensorFail[Log Sensor Failure]
    Classify -->|Network Error| NetworkFail[Log Network Failure]
    Classify -->|Config Error| ConfigFail[Log Config Failure]
    Classify -->|Critical Error| CriticalFail[Critical Failure]

    SensorFail --> SkipReading[Skip This Reading]
    SkipReading --> Schedule[Schedule Next Attempt]
    Schedule --> Operation

    NetworkFail --> RetryJoin{Join Retry<br/>Count?}
    RetryJoin -->|< Max| WaitRetry[Wait & Retry Join]
    RetryJoin -->|≥ Max| ContinueLocal[Continue Without Network]
    WaitRetry --> Operation
    ContinueLocal --> Operation

    ConfigFail --> UseDefault[Load Default Config]
    UseDefault --> Operation

    CriticalFail --> EnableWatchdog[Enable Watchdog]
    EnableWatchdog --> InfiniteLoop[Enter Infinite Loop]
    InfiniteLoop --> WatchdogReset([Watchdog Timeout<br/>Device Resets])
    WatchdogReset --> Boot([Boot Sequence])
    Boot --> Operation

    style Error fill:#fff4e1
    style CriticalFail fill:#ffe1e1
    style WatchdogReset fill:#ffe1e1
    style Operation fill:#e1ffe1
```

## Error Types

```mermaid
mindmap
  root((Errors))
    I2C Errors
      Slave NACK
      Arbitration Lost
      No Alert Response
      Bus Error
    Network Errors
      Join Failure
      TX Failure
      Link Dead
    Config Errors
      Invalid Magic
      Checksum Error
      Out of Range
    Critical Errors
      Hardware Fault
      Memory Corruption
```

## Error Recovery Strategies

| Error Type | Detection | Recovery | Impact |
|------------|-----------|----------|--------|
| **Sensor NACK** | I2C transaction fails | Skip measurement, retry next cycle | One data point lost |
| **Sensor Timeout** | No response after trigger | Skip measurement, retry next cycle | One data point lost |
| **Join Failure** | OTAA join times out | Retry with backoff, max 10 attempts | Delayed operation |
| **TX Failure** | Transmission fails | Retry on next cycle | One transmission lost |
| **Link Dead** | No response from network | Continue measuring, attempt rejoin | Data buffering needed |
| **Config Invalid** | Magic bytes wrong | Use default settings | Settings lost |
| **Memory Corrupt** | Read/write errors | Watchdog reset | Device restarts |
| **Critical Fault** | Unrecoverable error | Watchdog reset | Device restarts |

## Watchdog Timer

```mermaid
sequenceDiagram
    participant App as Application
    participant WDT as Watchdog Timer
    participant MCU as Microcontroller

    Note over App,MCU: Normal Operation
    App->>WDT: Pet watchdog (reset timer)
    WDT-->>App: OK

    Note over App: Continue working...

    App->>WDT: Pet watchdog (reset timer)
    WDT-->>App: OK

    Note over App,MCU: Critical Error Occurs

    App->>App: Detect critical error
    App->>WDT: Enable watchdog (15ms)
    App->>App: Enter infinite loop

    Note over WDT: 15ms passes...

    WDT->>MCU: Trigger reset
    MCU->>MCU: System reset

    Note over App,MCU: Device reboots

    MCU->>App: Start application
    App->>App: Initialize & resume
```

## Error Logging

The device maintains an error counter for debugging:

```
Error Code | Count | Last Occurrence
-----------|-------|----------------
ERR_NONE   |   0   | -
SLAVE_NACK |   3   | 2024-10-30 14:23:15
ARB_LOST   |   0   | -
NO_ALERT   |   1   | 2024-10-30 12:45:30
SMBUS_ERR  |   0   | -
```

Errors are logged to serial output when DEBUG mode is enabled:
```
[12345] ERROR: Sensor NACK on address 0x36
[12348] Retrying measurement in next cycle
```

## Recovery Time Estimates

- **Sensor Error**: Immediate (skip to next cycle)
- **Network Join Failure**: 10-60 seconds per retry
- **Config Error**: <1 second (load defaults)
- **Watchdog Reset**: 2-5 seconds (full reboot)

## Best Practices

1. **Always validate** sensor data before transmission
2. **Retry with backoff** for transient errors
3. **Use watchdog** as last resort for critical failures
4. **Log errors** for debugging and maintenance
5. **Fail gracefully** - continue operation when possible
