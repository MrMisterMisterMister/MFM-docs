---
title: Common Issues
description: Frequently encountered problems and their solutions
---

# Common Issues

Solutions to frequently encountered problems with Multiflexmeter V3.7.0.

## Device Won't Join TTN

### Symptoms
- Device powers on
- LED blinks showing valid configuration
- No join success on TTN Console
- Serial shows "EV_JOINING" repeatedly

### Solutions

**1. Verify Credentials**
```cpp
// Check EEPROM values match TTN Console exactly
- AppEUI (8 bytes)
- DevEUI (8 bytes)
- AppKey (16 bytes)
```

**2. Check Byte Order**
- All values are MSB-first (big-endian)
- Copy directly from TTN Console (no byte swapping needed)

**3. Verify Frequency Plan**
```cpp
// In platformio.ini
-DCFG_eu868=1  // Must match your region
```

**4. Check Gateway Coverage**
- Use TTN Mapper to verify coverage
- RSSI should be better than -120 dBm
- Try closer to known gateway

**5. Reset Device**
```bash
# Trigger device reset
avrdude -c usbasp -p m1284p -U flash:w:firmware.hex:i
```

---

## No Sensor Data

### Symptoms
- Device joins TTN successfully
- Uplinks are received
- All sensor channels show zero or invalid values

### Solutions

**1. Check Sensor Power**
```cpp
// Verify sensor power pin is configured
board_sensor_power(true);
delay(50);  // Wait for stabilization
```

**2. Verify I²C Connection**
```cpp
// Check sensor address
#define SENSOR_ADDRESS 0x36  // Default

// Test I²C communication
Wire.beginTransmission(SENSOR_ADDRESS);
if (Wire.endTransmission() != 0) {
    // Sensor not responding
}
```

**3. Check Pullup Resistors**
- SDA and SCL need 4.7kΩ pullups
- Measure resistance to VCC
- Add external resistors if missing

**4. Test Sensor Commands**
```cpp
// Send perform command
sensorPerform(SENSOR_ADDRESS);
delay(100);  // Wait for measurement

// Read data
int16_t data[8];
if (sensorRead(SENSOR_ADDRESS, data) == 0) {
    // Success
}
```

**5. Verify Cable Length**
- I²C maximum recommended: 2 meters
- Use shielded cable for longer runs
- Check for cable damage

---

## Upload Fails

### Symptoms
```
avrdude: error: program enable: target doesn't answer
avrdude: initialization failed, rc=-1
```

### Solutions

**1. Check Connections**
- Verify all 6 ISP pins connected
- Check for loose wires
- Ensure correct pin orientation

**2. Slow Down SCK Clock**
```ini
# In platformio.ini
upload_flags = 
    -Pusb
    -B100  # Very slow, more reliable
```

**3. Check Power Supply**
- Device needs 5V during programming
- Verify voltage at VCC pin
- Try external power supply

**4. Verify Programmer**
```bash
# Test USBasp connection
avrdude -c usbasp -p m1284p
```

**5. Check Fuses**
```bash
# Read current fuses
avrdude -c usbasp -p m1284p -U lfuse:r:-:h -U hfuse:r:-:h

# Should show: lfuse=0xFF, hfuse=0xD1
```

---

## Incorrect Message Interval

### Symptoms
- Device sends too frequently or too slowly
- Interval doesn't match configuration

### Solutions

**1. Check EEPROM Interval**
```python
# Interval is in SECONDS, not hours!
interval = 300  # 300 seconds = 5 minutes
eeprom_bytes = struct.pack('>H', interval)  # Big-endian
```

**2. Verify Interval Range**
```cpp
// Valid range
#define MIN_INTERVAL 20      // 20 seconds
#define MAX_INTERVAL 4270    // 71 minutes
```

**3. Check Fair Use Policy**
```cpp
// If enabled, minimum interval may be enforced
uint8_t fair_use = EEPROM.read(40);
// 0x00 = disabled, 0x01 = enabled
```

**4. Update via Downlink**
```
Port: 1
Payload: 0x00 0x10 0x01 0x2C  // Set to 300 seconds
         |    |    |    |
         |    |    +----+--- Interval (big-endian)
         |    +------------- Command code
         +------------------ Reserved
```

---

## Poor Signal Quality

### Symptoms
- RSSI < -120 dBm
- SNR < -10 dB
- Messages not received by TTN
- High packet loss

### Solutions

**1. Improve Antenna**
- Use higher gain antenna (5dBi vs 3dBi)
- Ensure antenna is vertical
- Move antenna outside enclosure
- Check antenna connection (RP-SMA)

**2. Relocate Device**
- Higher mounting position
- Clear line-of-sight to gateway
- Away from metal obstacles
- Test different locations

**3. Adjust Spreading Factor**
```cpp
// In LMIC configuration
// Higher SF = longer range, longer airtime
LMIC_setDrTxpow(DR_SF7, 14);  // SF7, 14dBm
// Change to DR_SF9 or DR_SF10 for longer range
```

**4. Check Gateway**
- Verify gateway is online (TTN Console)
- Check gateway location (TTN Mapper)
- Consider adding gateway if no coverage

---

## High Power Consumption

### Symptoms
- Battery drains faster than expected
- Device runs hot
- Short battery life

### Solutions

**1. Enable Sleep Mode**
```cpp
// In main loop
void loop() {
    os_runloop_once();
    
    // Add sleep
    Watchdog.sleep();  // ~8s sleep cycles
}
```

**2. Reduce TX Power**
```cpp
// Lower transmission power
LMIC_setDrTxpow(DR_SF7, 2);  // 2dBm instead of 14dBm
// Use if close to gateway
```

**3. Increase Interval**
```cpp
// Longer interval = less frequent TX
uint16_t interval = 900;  // 15 minutes instead of 5
```

**4. Power Off Peripherals**
```cpp
// Turn off sensor between readings
board_sensor_power(false);

// Disable unnecessary peripherals
// Check board-specific power management
```

**5. Check for Software Loops**
```cpp
// Avoid busy-wait loops
while (condition) {
    delay(10);  // Better than tight loop
}
```

---

## EEPROM Configuration Invalid

### Symptoms
- LED blinks error code on startup
- Device doesn't join network
- Serial shows "Invalid configuration"

### Solutions

**1. Verify Magic Bytes**
```python
# Must be exactly: 'M', 'F', 'M', '\0'
MAGIC = b'MFM\x00'
```

**2. Check EEPROM Write**
```bash
# Read back EEPROM
avrdude -c usbasp -p m1284p -U eeprom:r:eeprom_check.bin:r

# Verify with hex dump
xxd eeprom_check.bin | head -n 3
```

**3. Reprogram EEPROM**
```bash
# Write fresh configuration
python3 generate_eeprom.py
avrdude -c usbasp -p m1284p -U eeprom:w:eeprom.bin:r
```

**4. Verify Structure**
```
Offset | Field      | Size | Value
-------|------------|------|-------
0x00   | Magic      | 4    | MFM\0
0x04   | Version    | 2    | 0x0845
0x06   | AppEUI     | 8    | From TTN
0x0E   | DevEUI     | 8    | From TTN
0x16   | AppKey     | 16   | From TTN
0x26   | Interval   | 2    | 20-4270
0x28   | Fair Use   | 1    | 0 or 1
```

---

## Downlinks Not Working

### Symptoms
- Device receives uplinks successfully
- Downlinks sent from TTN Console
- Device doesn't respond to commands

### Solutions

**1. Check FPort**
```cpp
// Downlinks must be on FPort 1
if (LMIC.txrxFlags & TXRX_PORT) {
    uint8_t port = LMIC.frame[LMIC.dataBeg - 1];
    if (port == 1) {
        // Process command
    }
}
```

**2. Verify Timing**
- Class A: Downlinks only after uplink
- Wait for next measurement cycle
- Check "Schedule downlink" is confirmed

**3. Check Payload Format**
```
Command: Update interval to 300s
Bytes: [0x00, 0x10, 0x01, 0x2C]
       |     |     |     |
       |     |     +-----+-- Value (big-endian)
       |     +-------------- Command code
       +--------------------- Reserved
```

**4. Enable Confirmed Uplinks**
```cpp
// Request downlink confirmation
LMIC_setTxData2(1, payload, sizeof(payload), 1);
//                                            ^ confirmed
```

---

## Build Errors

### Symptoms
```
fatal error: lmic.h: No such file or directory
```

### Solutions

**1. Install Dependencies**
```bash
pio lib install
```

**2. Clean Build**
```bash
pio run --target clean
pio run
```

**3. Update Platform**
```bash
pio pkg update
pio platform update atmelavr
```

**4. Check platformio.ini**
```ini
lib_deps = 
    mcci-catena/MCCI Arduino LoRaWAN Library @ ^0.9.2
    adafruit/Adafruit SleepyDog Library @ ^1.6.4
```

---

## Decoder Issues

### Symptoms
- Uplinks received but not decoded
- Empty decoded_payload in TTN
- JavaScript errors in console

### Solutions

**1. Check FPort**
```javascript
// Decoder must handle correct FPort
if (input.fPort === 1) {
    // Measurements (16 bytes)
}
```

**2. Verify Payload Length**
```javascript
if (input.bytes.length !== 16) {
    return { errors: ["Invalid length"] };
}
```

**3. Test Decoder**
- Use TTN Console "Test" tab
- Input known payload
- Check output matches expected

**4. Check Byte Order**
```javascript
// Big-endian (MSB first)
var value = (input.bytes[i*2] << 8) | input.bytes[i*2 + 1];
```

---

## Next Steps

- [Debugging Guide](/troubleshooting/debugging/) - Advanced debugging
- [FAQ](/troubleshooting/faq/) - Frequently asked questions
- [Development Guide](/development/development-guide/) - Code-level debugging
