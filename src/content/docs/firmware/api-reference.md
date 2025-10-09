---
title: API Reference
description: Complete API reference for Multiflexmeter firmware functions
---

# API Reference

Complete API reference for Multiflexmeter V3.7.0 firmware functions and interfaces.

## Configuration API

### `rom_conf.cpp`

#### `rom_conf_init()`
```cpp
void rom_conf_init();
```
Initializes EEPROM configuration subsystem and loads configuration into memory.

**Returns:** None

**Side Effects:**
- Reads from EEPROM
- Populates global configuration structure
- Validates magic bytes

---

#### `rom_conf_is_valid()`
```cpp
bool rom_conf_is_valid();
```
Checks if EEPROM contains valid configuration.

**Returns:** 
- `true` - Configuration is valid
- `false` - Configuration is invalid or corrupted

**Validation:**
- Checks magic bytes: `"MFM\0"`

---

#### `rom_conf_get_version()`
```cpp
uint16_t rom_conf_get_version();
```
Retrieves firmware version from EEPROM hardware version field.

**Returns:** 16-bit encoded version number

**Format:** `proto[1]:major[5]:minor[5]:patch[5]`

**Example:**
```cpp
uint16_t version = rom_conf_get_version();
// version = 0x08A5 = v1.2.5
```

---

## Sensor API

### `sensors.cpp`

#### `sensorPerform()`
```cpp
uint8_t sensorPerform(uint8_t sensor_address);
```
Triggers sensor measurement by sending CMD_PERFORM (0x10).

**Parameters:**
- `sensor_address` - I²C address of sensor (typically 0x36)

**Returns:**
- `0` - Success
- `1` - Communication error

**Example:**
```cpp
if (sensorPerform(SENSOR_ADDRESS) == 0) {
    delay(100);  // Wait for sensor processing
}
```

---

#### `sensorRead()`
```cpp
uint8_t sensorRead(uint8_t sensor_address, int16_t* data);
```
Reads measurement data from sensor (CMD_READ = 0x11).

**Parameters:**
- `sensor_address` - I²C address of sensor
- `data` - Pointer to array of 8 × int16_t values

**Returns:**
- `0` - Success
- `1` - Communication error

**Data Format:**
- Array of 8 signed 16-bit integers
- Sensor-specific interpretation

**Example:**
```cpp
int16_t measurements[8];
if (sensorRead(SENSOR_ADDRESS, measurements) == 0) {
    // Process measurements
    int16_t value1 = measurements[0];
    int16_t value2 = measurements[1];
    // ...
}
```

---

## SMBus/I²C API

### `smbus.cpp`

#### `smBusInit()`
```cpp
void smBusInit();
```
Initializes SMBus (I²C) communication.

**Returns:** None

**Configuration:**
- Clock speed: 100kHz (standard I²C)
- Internal pull-ups: disabled (external 4.7kΩ recommended)

---

#### `smBusWriteByte()`
```cpp
uint8_t smBusWriteByte(uint8_t address, uint8_t command);
```
Writes single command byte to SMBus device.

**Parameters:**
- `address` - 7-bit I²C address
- `command` - Command byte to send

**Returns:**
- `0` - Success
- `1` - NAK or error

---

#### `smBusReadWord()`
```cpp
uint16_t smBusReadWord(uint8_t address, uint8_t command);
```
Reads 16-bit word from SMBus device.

**Parameters:**
- `address` - 7-bit I²C address
- `command` - Command byte

**Returns:** 16-bit value (little-endian)

---

## Board API

### `boards/mfm_v3_m1284p.cpp`

#### `board_init()`
```cpp
void board_init();
```
Initializes board-specific hardware.

**Side Effects:**
- Configures GPIO pins
- Initializes peripherals
- Sets up power control

---

#### `board_sleep()`
```cpp
void board_sleep();
```
Enters low-power sleep mode.

**Power Consumption:**
- Active: ~10mA
- Sleep: <1mA

---

#### `board_sensor_power(bool enable)`
```cpp
void board_sensor_power(bool enable);
```
Controls power to external sensor.

**Parameters:**
- `enable` - `true` to power on, `false` to power off

---

## Watchdog API

### `wdt.cpp`

#### `wdt_enable()`
```cpp
void wdt_enable(uint16_t timeout_ms);
```
Enables watchdog timer.

**Parameters:**
- `timeout_ms` - Timeout in milliseconds (typically 8000ms)

---

#### `wdt_reset()`
```cpp
void wdt_reset();
```
Resets watchdog timer (prevents reboot).

**Usage:** Call periodically in main loop.

---

## LoRaWAN Integration

### LMIC Job Functions

#### `do_measure()`
```cpp
static void do_measure(osjob_t* j);
```
Job function for triggering sensor measurements.

**Flow:**
1. Power on sensor
2. Send CMD_PERFORM
3. Wait for processing
4. Send CMD_READ
5. Power off sensor
6. Call `do_send()`

---

#### `do_send()`
```cpp
static void do_send(osjob_t* j);
```
Job function for sending LoRaWAN uplink.

**Flow:**
1. Check if TX is ready
2. Prepare payload (16 bytes)
3. Queue transmission
4. LMIC handles radio

---

#### `onEvent()`
```cpp
void onEvent(ev_t ev);
```
LMIC event handler for LoRaWAN events.

**Events:**
- `EV_JOINING` - OTAA join in progress
- `EV_JOINED` - Successfully joined network
- `EV_TXCOMPLETE` - Transmission complete
- `EV_RXCOMPLETE` - Downlink received

**Downlink Handling:**
```cpp
case EV_TXCOMPLETE:
    if (LMIC.dataLen) {
        // Process downlink on FPort 1
        uint8_t* payload = LMIC.frame + LMIC.dataBeg;
        uint16_t cmd = (payload[0] << 8) | payload[1];
        // Handle command
    }
```

---

## Data Structures

### `rom_conf_t`

EEPROM configuration structure:

```cpp
typedef struct {
    uint8_t magic[4];          // "MFM\0"
    uint8_t hw_version[2];     // Hardware/firmware version
    uint8_t appeui[8];         // LoRaWAN Application EUI
    uint8_t deveui[8];         // LoRaWAN Device EUI
    uint8_t appkey[16];        // LoRaWAN Application Key
    uint8_t interval[2];       // Measurement interval (seconds, big-endian)
    uint8_t fair_use;          // Fair Use Policy (0=disabled, 1=enabled)
} rom_conf_t;
```

**Total Size:** 41 bytes

---

## Constants

### Command Codes

```cpp
#define CMD_PERFORM 0x10    // Trigger measurement
#define CMD_READ    0x11    // Read measurement data
```

### Downlink Commands

```cpp
#define CMD_SET_INTERVAL 0x10    // Update measurement interval
#define CMD_SET_MODULE   0x11    // Update module configuration
#define CMD_RESET        0xDEAD  // Reset device
```

### Limits

```cpp
#define MIN_INTERVAL  20      // Minimum interval (seconds)
#define MAX_INTERVAL  4270    // Maximum interval (seconds)
#define SENSOR_ADDRESS 0x36   // Default I²C address
```

---

## Usage Examples

### Complete Measurement Cycle

```cpp
// Power on sensor
board_sensor_power(true);
delay(50);  // Stabilization time

// Trigger measurement
if (sensorPerform(SENSOR_ADDRESS) == 0) {
    delay(100);  // Sensor processing time
    
    // Read data
    int16_t data[8];
    if (sensorRead(SENSOR_ADDRESS, data) == 0) {
        // Build LoRaWAN payload
        uint8_t payload[16];
        for (int i = 0; i < 8; i++) {
            payload[i * 2] = (data[i] >> 8) & 0xFF;
            payload[i * 2 + 1] = data[i] & 0xFF;
        }
        
        // Send via LoRaWAN
        LMIC_setTxData2(1, payload, sizeof(payload), 0);
    }
}

// Power off sensor
board_sensor_power(false);
```

### Processing Downlink

```cpp
// In onEvent(), case EV_TXCOMPLETE:
if (LMIC.dataLen == 4 && LMIC.txrxFlags & TXRX_PORT) {
    uint8_t port = LMIC.frame[LMIC.dataBeg - 1];
    
    if (port == 1) {  // Command port
        uint8_t* data = LMIC.frame + LMIC.dataBeg;
        uint16_t cmd = (data[0] << 8) | data[1];
        uint16_t value = (data[2] << 8) | data[3];
        
        if (cmd == 0x10) {  // Set interval
            if (value >= MIN_INTERVAL && value <= MAX_INTERVAL) {
                // Update configuration
                config.interval = value;
                // Save to EEPROM
                // ...
            }
        }
    }
}
```

---

## Next Steps

- [Firmware Architecture](/firmware/architecture/) - System design
- [Build System](/firmware/build-system/) - Compilation details
- [Development Guide](/development/development-guide/) - Practical examples
