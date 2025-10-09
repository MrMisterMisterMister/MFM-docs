---
title: Debugging Guide
description: Advanced debugging techniques for MultiFlexMeter V3
---

# Debugging Guide

Advanced debugging techniques and tools for troubleshooting MultiFlexMeter V3.

## Serial Debug Output

### Enable Debug Mode

Add debug flags to `platformio.ini`:

```ini
build_flags = 
    ${env.build_flags}
    -DDEBUG=1
    -DSERIAL_BAUD=115200
```

### Connect Serial Console

**Hardware:**
- Connect FTDI adapter to UART header
- Pin connections:
  - FTDI TX → MFM RX
  - FTDI RX → MFM TX
  - FTDI GND → MFM GND
  
**Software:**
```bash
# Linux/Mac
screen /dev/ttyUSB0 115200

# Windows (PowerShell)
$port = New-Object System.IO.Ports.SerialPort COM3,115200,None,8,One
$port.Open()
```

### Debug Output Format

```
[BOOT] MultiFlexMeter V3
[BOOT] Version: 1.2.5
[BOOT] Reading EEPROM...
[BOOT] Config valid: YES
[BOOT] Interval: 300s
[LMIC] Starting
[LMIC] EV_JOINING
[LMIC] EV_TXSTART
[LMIC] EV_JOINED
[SENSOR] Power ON
[SENSOR] Perform: OK
[SENSOR] Read: 8 values
[SENSOR] Power OFF
[LMIC] EV_TXSTART
[LMIC] EV_TXCOMPLETE
[LMIC] RSSI: -87 dBm, SNR: 8.5 dB
```

## LMIC Debugging

### Enable LMIC Debug

Modify `lib/arduino-lmic/src/lmic/config.h`:

```cpp
// Enable debug output
#define LMIC_DEBUG_LEVEL 2

// Debug flags
#define LMIC_PRINTF_TO Serial
```

### Debug Levels

| Level | Output |
|-------|--------|
| 0 | None |
| 1 | Errors only |
| 2 | Warnings + Errors |
| 3 | All debug info |

### LMIC Events

```cpp
void onEvent(ev_t ev) {
    Serial.print(os_getTime());
    Serial.print(": ");
    switch(ev) {
        case EV_SCAN_TIMEOUT:
            Serial.println(F("EV_SCAN_TIMEOUT"));
            break;
        case EV_BEACON_FOUND:
            Serial.println(F("EV_BEACON_FOUND"));
            break;
        case EV_BEACON_MISSED:
            Serial.println(F("EV_BEACON_MISSED"));
            break;
        case EV_BEACON_TRACKED:
            Serial.println(F("EV_BEACON_TRACKED"));
            break;
        case EV_JOINING:
            Serial.println(F("EV_JOINING"));
            break;
        case EV_JOINED:
            Serial.println(F("EV_JOINED"));
            {
                u4_t netid = 0;
                devaddr_t devaddr = 0;
                u1_t nwkKey[16];
                u1_t artKey[16];
                LMIC_getSessionKeys(&netid, &devaddr, nwkKey, artKey);
                Serial.print("netid: ");
                Serial.println(netid, DEC);
                Serial.print("devaddr: ");
                Serial.println(devaddr, HEX);
            }
            break;
        case EV_JOIN_FAILED:
            Serial.println(F("EV_JOIN_FAILED"));
            break;
        case EV_REJOIN_FAILED:
            Serial.println(F("EV_REJOIN_FAILED"));
            break;
        case EV_TXCOMPLETE:
            Serial.println(F("EV_TXCOMPLETE"));
            if (LMIC.txrxFlags & TXRX_ACK)
                Serial.println(F("Received ack"));
            if (LMIC.dataLen) {
                Serial.print(F("Received "));
                Serial.print(LMIC.dataLen);
                Serial.println(F(" bytes"));
            }
            break;
        default:
            Serial.print(F("Unknown event: "));
            Serial.println((unsigned) ev);
            break;
    }
}
```

## Sensor Debugging

### I²C Scanner

```cpp
void scanI2C() {
    Serial.println("Scanning I2C bus...");
    
    for (uint8_t addr = 1; addr < 127; addr++) {
        Wire.beginTransmission(addr);
        uint8_t error = Wire.endTransmission();
        
        if (error == 0) {
            Serial.print("Device found at 0x");
            Serial.println(addr, HEX);
        }
    }
    
    Serial.println("Scan complete");
}
```

### Sensor Communication Test

```cpp
void testSensor() {
    Serial.println("Testing sensor...");
    
    // Power on
    board_sensor_power(true);
    delay(50);
    
    // Check presence
    Wire.beginTransmission(SENSOR_ADDRESS);
    if (Wire.endTransmission() != 0) {
        Serial.println("ERROR: Sensor not responding");
        return;
    }
    Serial.println("Sensor detected");
    
    // Perform measurement
    uint8_t result = sensorPerform(SENSOR_ADDRESS);
    Serial.print("Perform result: ");
    Serial.println(result);
    
    delay(100);
    
    // Read data
    int16_t data[8];
    result = sensorRead(SENSOR_ADDRESS, data);
    Serial.print("Read result: ");
    Serial.println(result);
    
    if (result == 0) {
        for (int i = 0; i < 8; i++) {
            Serial.print("Channel ");
            Serial.print(i);
            Serial.print(": ");
            Serial.println(data[i]);
        }
    }
    
    // Power off
    board_sensor_power(false);
}
```

## Memory Debugging

### Stack Usage

```cpp
extern uint8_t _end;
extern uint8_t __stack;

void printStackUsage() {
    uint8_t* stack_ptr = (uint8_t*)SP;
    uint16_t free_stack = stack_ptr - &_end;
    
    Serial.print("Free stack: ");
    Serial.print(free_stack);
    Serial.println(" bytes");
}
```

### Heap Usage

```cpp
void printHeapUsage() {
    extern int __heap_start, *__brkval;
    int free_memory;
    
    if (__brkval == 0)
        free_memory = ((int) &free_memory) - ((int) &__heap_start);
    else
        free_memory = ((int) &free_memory) - ((int) __brkval);
    
    Serial.print("Free heap: ");
    Serial.print(free_memory);
    Serial.println(" bytes");
}
```

### EEPROM Dump

```cpp
void dumpEEPROM() {
    Serial.println("EEPROM Dump:");
    
    for (int addr = 0; addr < 64; addr++) {
        if (addr % 16 == 0) {
            Serial.println();
            Serial.print("0x");
            if (addr < 16) Serial.print("0");
            Serial.print(addr, HEX);
            Serial.print(": ");
        }
        
        uint8_t value = EEPROM.read(addr);
        if (value < 16) Serial.print("0");
        Serial.print(value, HEX);
        Serial.print(" ");
    }
    Serial.println();
}
```

## Logic Analyzer

### Capture I²C

**Hardware:**
- Use Saleae Logic, DSLogic, or similar
- Connect to SDA, SCL, and GND

**Settings:**
- Sample rate: 1 MS/s minimum
- Duration: 1 second
- Trigger: SDA falling edge

**Analysis:**
- Verify start/stop conditions
- Check ACK/NAK bits
- Decode read/write transactions
- Measure timing (clock frequency)

### Capture SPI (LoRa Radio)

**Hardware:**
- Connect to NSS, MOSI, MISO, SCK

**Settings:**
- Sample rate: 10 MS/s
- SPI mode: Mode 0 (CPOL=0, CPHA=0)
- Bit order: MSB first

**Analysis:**
- Verify chip select timing
- Check command bytes
- Decode register read/write

## USB Protocol Analyzer

### Sniff ISP Communication

```bash
# Capture USBasp communication
avrdude -c usbasp -p m1284p -v -v -v

# Shows detailed protocol exchange
```

## Radio Debugging

### LoRaWAN Packet Sniffer

**Tools:**
- LoRa Packet Forwarder with packet capture
- GNU Radio with LoRa demodulator
- Commercial spectrum analyzer

**What to check:**
- Transmission frequency (868.1 / 868.3 / 868.5 MHz)
- Bandwidth (125 kHz)
- Spreading factor (SF7-SF12)
- Coding rate (4/5)
- Preamble length

### RSSI/SNR Monitoring

```cpp
void printRadioStats() {
    Serial.print("RSSI: ");
    Serial.print(LMIC.rssi);
    Serial.println(" dBm");
    
    Serial.print("SNR: ");
    Serial.print(LMIC.snr / 4.0);
    Serial.println(" dB");
    
    Serial.print("Datarate: SF");
    Serial.println(getSf(LMIC.datarate));
}

uint8_t getSf(uint8_t dr) {
    return 12 - (dr & 0x0F);
}
```

## Common Debug Scenarios

### Scenario 1: Join Failure

**Debug steps:**
1. Enable LMIC debug level 3
2. Check for "EV_JOINING" → "EV_JOIN_FAILED"
3. Verify AppEUI, DevEUI, AppKey in serial output
4. Check frequency plan configuration
5. Monitor RSSI during join attempt

### Scenario 2: Sensor No Data

**Debug steps:**
1. Run I²C scanner - verify sensor address
2. Check sensor power with multimeter
3. Enable sensor debug output
4. Verify SMBus timing with logic analyzer
5. Test with known-good sensor

### Scenario 3: Random Resets

**Debug steps:**
1. Enable watchdog debug
2. Add stack usage monitoring
3. Check power supply stability
4. Look for buffer overflows
5. Review interrupt handling

### Scenario 4: High Power Draw

**Debug steps:**
1. Measure current in each state (sleep/active/TX)
2. Verify sleep mode is entered
3. Check for busy-wait loops
4. Disable peripherals one by one
5. Use oscilloscope to see power profile

## Assertion Framework

### Add Assertions

```cpp
#ifdef DEBUG
    #define ASSERT(condition) \
        if (!(condition)) { \
            Serial.print("ASSERT FAILED: "); \
            Serial.println(__LINE__); \
            while(1); \
        }
#else
    #define ASSERT(condition)
#endif

// Usage
ASSERT(interval >= MIN_INTERVAL && interval <= MAX_INTERVAL);
```

## Remote Debugging

### Over LoRaWAN

Send debug info via downlink request:

```cpp
// Request debug info
if (cmd == 0xFF) {
    // Build debug payload
    uint8_t debug[16];
    debug[0] = (freeMemory() >> 8) & 0xFF;
    debug[1] = freeMemory() & 0xFF;
    debug[2] = LMIC.rssi & 0xFF;
    // ... more debug data
    
    // Send on next uplink
    LMIC_setTxData2(2, debug, sizeof(debug), 0);
}
```

## Performance Profiling

### Timing Measurements

```cpp
unsigned long start = micros();
// Code to measure
unsigned long elapsed = micros() - start;

Serial.print("Elapsed: ");
Serial.print(elapsed);
Serial.println(" us");
```

### Function Profiling

```cpp
#define PROFILE_START(name) \
    unsigned long _profile_##name = micros();

#define PROFILE_END(name) \
    Serial.print(#name); \
    Serial.print(": "); \
    Serial.print(micros() - _profile_##name); \
    Serial.println(" us");

// Usage
PROFILE_START(sensor_read);
sensorRead(SENSOR_ADDRESS, data);
PROFILE_END(sensor_read);
```

## Next Steps

- [Common Issues](/troubleshooting/common-issues/) - Quick solutions
- [FAQ](/troubleshooting/faq/) - Frequently asked questions
- [API Reference](/firmware/api-reference/) - Function documentation
