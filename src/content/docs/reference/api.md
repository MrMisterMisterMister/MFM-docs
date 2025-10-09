---
title: API Reference
description: Firmware API documentation covering key functions, modules, and data structures.
---

This reference documents the key functions, modules, and data structures in the Multiflexmeter V3.7.0 firmware.

## Core Modules

### Main Controller (`src/main.cpp`)

The main controller orchestrates the entire system operation.

#### `void setup()`

**Description:** Arduino setup function, called once at startup

**Responsibilities:**
- Board-specific initialization
- Serial debug initialization
- Sensor initialization
- LMIC initialization and LoRaWAN stack reset
- EEPROM configuration loading
- Join procedure initiation

**Returns:** None

**Example:**
```cpp
void setup(void) {
  board_setup();
  Serial.begin(115200);
  sensors_init();
  os_init();
  LMIC_reset();
  if (!conf_load()) {
    os_setCallback(&main_job, FUNC_ADDR(job_error));
    return;
  }
  LMIC_startJoining();
}
```

---

#### `void loop()`

**Description:** Arduino main loop, runs continuously

**Responsibilities:**
- Executes one iteration of the LMIC event loop
- Processes scheduled jobs
- Handles LoRaWAN events

**Returns:** None

**Example:**
```cpp
void loop(void) { 
  os_runloop_once(); 
}
```

---

#### `void onEvent(ev_t ev)`

**Description:** LMIC event handler callback

**Parameters:**
- `ev` (ev_t): LMIC event type

**Handles Events:**
- `EV_JOINING`: Join procedure started
- `EV_JOINED`: Successfully joined network
- `EV_TXCOMPLETE`: Transmission complete (with optional downlink)
- `EV_JOIN_TXCOMPLETE`: Join attempt finished
- `EV_LINK_DEAD`: Network link lost

**Returns:** None

**Example:**
```cpp
void onEvent(ev_t ev) {
  switch (ev) {
    case EV_JOINED:
      LMIC_setLinkCheckMode(0);
      LMIC_setAdrMode(1);
      os_setCallback(&main_job, FUNC_ADDR(job_pingVersion));
      break;
    case EV_TXCOMPLETE:
      if (LMIC.dataLen > 0) {
        processDownlink(LMIC.frame[LMIC.dataBeg], 
                       &LMIC.frame[LMIC.dataBeg + 1],
                       LMIC.dataLen - 1);
      }
      break;
  }
}
```

---

#### `ostime_t getTransmissionTime(ostime_t req_time)`

**Description:** Calculates the earliest available transmission time

**Parameters:**
- `req_time` (ostime_t): Requested transmission time

**Returns:** 
- (ostime_t): Actual transmission time (requested or earliest available)

**Logic:**
- Checks duty cycle availability
- Returns requested time if available
- Returns earliest available time if duty cycle limiting

**Example:**
```cpp
ostime_t next_tx = getTransmissionTime(os_getTime() + sec2osticks(900));
```

---

#### `void scheduleNextMeasurement()`

**Description:** Schedules the next measurement cycle

**Responsibilities:**
- Retrieves measurement interval from configuration
- Applies TTN Fair Use Policy if enabled
- Calculates duty cycle compliance
- Schedules `job_performMeasurements`

**Returns:** None

**Example:**
```cpp
void scheduleNextMeasurement() {
  uint16_t interval = os_getMeasurementInterval(LMIC.datarate);
  
  if (conf_getUseTTNFairUsePolicy()) {
    uint32_t airtime_ms = osticks2ms(calcAirTime(LMIC.rps, 24));
    uint32_t tx_per_day = 30000 / airtime_ms;
    uint16_t interval_sec = 86400 / (tx_per_day + 1);
    
    if (interval < interval_sec) {
      interval = interval_sec;
    }
  }
  
  ostime_t next_send = getTransmissionTime(os_getTime() + sec2osticks(interval));
  os_setTimedCallback(&main_job, next_send, FUNC_ADDR(job_performMeasurements));
}
```

---

#### `void processDownlink(uint8_t cmd, uint8_t *args, uint8_t len)`

**Description:** Processes downlink commands from the network

**Parameters:**
- `cmd` (uint8_t): Command byte
- `args` (uint8_t*): Argument buffer
- `len` (uint8_t): Argument length

**Supported Commands:**
- `0xDE`: Reset device (requires `0xAD` as arg[0])
- `0x10`: Change measurement interval
- `0x11`: Forward command to sensor module

**Returns:** None

**Example:**
```cpp
// Process downlink received in EV_TXCOMPLETE
processDownlink(LMIC.frame[LMIC.dataBeg], 
               &LMIC.frame[LMIC.dataBeg + 1],
               LMIC.dataLen - 1);
```

---

### Job Functions

#### `void job_pingVersion(osjob_t *job)`

**Description:** Sends firmware and hardware version information

**Parameters:**
- `job` (osjob_t*): Job structure

**Actions:**
- Constructs version message (FPort 2)
- Transmits via LoRaWAN
- Schedules first measurement after delay

**Returns:** None

---

#### `void job_performMeasurements(osjob_t *job)`

**Description:** Triggers sensor measurement

**Parameters:**
- `job` (osjob_t*): Job structure

**Actions:**
- Calls `sensors_performMeasurement()`
- Schedules `job_fetchAndSend` after 10-second delay

**Returns:** None

---

#### `void job_fetchAndSend(osjob_t *job)`

**Description:** Reads sensor data and transmits

**Parameters:**
- `job` (osjob_t*): Job structure

**Actions:**
- Checks if LMIC is busy
- Reads measurement data from sensor
- Queues data for transmission (FPort 1)
- Schedules next measurement

**Returns:** None

---

#### `void job_reset(osjob_t *job)`

**Description:** Performs device reset

**Parameters:**
- `job` (osjob_t*): Job structure

**Actions:**
- Logs reset message
- Calls `mcu_reset()`

**Returns:** None (device resets)

---

#### `void job_error(osjob_t *job)`

**Description:** Error handler, puts device into infinite sleep

**Parameters:**
- `job` (osjob_t*): Job structure

**Actions:**
- Logs error message
- Reschedules itself (infinite loop)

**Returns:** None

---

## Configuration Module (`src/rom_conf.cpp`)

### `bool conf_load()`

**Description:** Loads configuration from EEPROM

**Returns:**
- `true`: Configuration loaded successfully
- `false`: Invalid EEPROM (magic number mismatch)

**Validates:**
- Magic number ("MFM\0")
- Measurement interval bounds

**Example:**
```cpp
if (!conf_load()) {
  Serial.println("Invalid EEPROM!");
  return;
}
```

---

### `void conf_save()`

**Description:** Saves current configuration to EEPROM

**Returns:** None

**Use Case:** Save updated measurement interval after downlink

---

### `void conf_getAppEui(uint8_t *buf)`

**Description:** Retrieves Application EUI from EEPROM

**Parameters:**
- `buf` (uint8_t*): Buffer to store 8-byte APP_EUI

**Returns:** None (via buffer)

---

### `void conf_getDevEui(uint8_t *buf)`

**Description:** Retrieves Device EUI from EEPROM

**Parameters:**
- `buf` (uint8_t*): Buffer to store 8-byte DEV_EUI

**Returns:** None (via buffer)

---

### `void conf_getAppKey(uint8_t *buf)`

**Description:** Retrieves Application Key from EEPROM

**Parameters:**
- `buf` (uint8_t*): Buffer to store 16-byte APP_KEY

**Returns:** None (via buffer)

---

### `uint16_t conf_getMeasurementInterval()`

**Description:** Retrieves measurement interval

**Returns:**
- (uint16_t): Measurement interval in seconds

---

### `void conf_setMeasurementInterval(uint16_t interval)`

**Description:** Sets measurement interval (in RAM, not saved)

**Parameters:**
- `interval` (uint16_t): New interval in seconds

**Returns:** None

**Note:** Call `conf_save()` to persist to EEPROM

---

### `version conf_getHardwareVersion()`

**Description:** Retrieves hardware version

**Returns:**
- (version): Hardware version structure

---

### `version conf_getFirmwareVersion()`

**Description:** Retrieves firmware version

**Returns:**
- (version): Firmware version structure

---

### `uint16_t versionToUint16(version v)`

**Description:** Converts version structure to 16-bit integer

**Parameters:**
- `v` (version): Version structure

**Returns:**
- (uint16_t): Packed version number

**Format:**
```
| Bit 15 | Bits 14-10 | Bits 9-4 | Bits 3-0 |
|--------|------------|----------|----------|
| Proto  | Major      | Minor    | Patch    |
```

---

## Sensor Module (`src/sensors.cpp`)

### `error_t sensors_init()`

**Description:** Initializes sensor interface (I2C/SMBus)

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

---

### `error_t sensors_performMeasurement()`

**Description:** Commands sensor module to start measurement

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

**Implementation:**
```cpp
error_t sensors_performMeasurement(void) {
  return smbus_sendByte(0x36, CMD_PERFORM);
}
```

---

### `error_t sensors_readMeasurement(uint8_t *buf, uint8_t *length)`

**Description:** Reads measurement result from sensor module

**Parameters:**
- `buf` (uint8_t*): Buffer to store measurement data
- `length` (uint8_t*): Returns number of bytes read

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

**Implementation:**
```cpp
error_t sensors_readMeasurement(uint8_t *buf, uint8_t *length) {
  return smbus_blockRead(0x36, CMD_READ, buf, length);
}
```

---

## SMBus/I2C Module (`src/smbus.cpp`)

### `error_t smbus_init()`

**Description:** Initializes I2C/SMBus interface

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

---

### `error_t smbus_sendByte(uint8_t addr, uint8_t cmd)`

**Description:** Sends a single-byte command to I2C device

**Parameters:**
- `addr` (uint8_t): I2C device address (7-bit)
- `cmd` (uint8_t): Command byte

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

---

### `error_t smbus_blockRead(uint8_t addr, uint8_t cmd, uint8_t *buf, uint8_t *length)`

**Description:** Reads a block of data from I2C device

**Parameters:**
- `addr` (uint8_t): I2C device address (7-bit)
- `cmd` (uint8_t): Command byte
- `buf` (uint8_t*): Buffer to store data
- `length` (uint8_t*): Returns number of bytes read

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

---

### `error_t smbus_blockWrite(uint8_t addr, uint8_t cmd, uint8_t *data, uint8_t length)`

**Description:** Writes a block of data to I2C device

**Parameters:**
- `addr` (uint8_t): I2C device address (7-bit)
- `cmd` (uint8_t): Command byte
- `data` (uint8_t*): Data to write
- `length` (uint8_t): Number of bytes to write

**Returns:**
- `ERR_NONE`: Success
- Other: Error code

---

## Board Support (`src/boards/mfm_v3_m1284p.cpp`)

### `void board_setup()`

**Description:** Performs board-specific initialization

**Responsibilities:**
- Pin mode configuration
- Peripheral power control
- Hardware initialization

**Returns:** None

---

## Watchdog Timer (`src/wdt.cpp`)

### `void wdt_enable()`

**Description:** Enables watchdog timer

**Returns:** None

---

### `void mcu_reset()`

**Description:** Performs MCU reset via watchdog

**Returns:** None (device resets)

---

## Data Structures

### `struct tx_pkt_t`

**Description:** Transmission packet structure (example)

```cpp
struct tx_pkt_t {
  uint16_t distance_to_water;
  float air_temperature;
};
```

---

### `struct rom_conf_t`

**Description:** EEPROM configuration structure

```cpp
struct __attribute__((packed)) rom_conf_t {
  uint8_t MAGIC[4];
  struct {
    uint8_t MSB;
    uint8_t LSB;
  } HW_VERSION;
  uint8_t APP_EUI[8];
  uint8_t DEV_EUI[8];
  uint8_t APP_KEY[16];
  uint16_t MEASUREMENT_INTERVAL;
  uint8_t USE_TTN_FAIR_USE_POLICY;
};
```

---

### `struct version`

**Description:** Version number structure

```cpp
typedef struct {
  uint8_t proto : 1;  // 0 = dev, 1 = release
  uint8_t major : 5;  // Major version (0-31)
  uint8_t minor : 5;  // Minor version (0-63)
  uint8_t patch : 5;  // Patch version (0-31)
} version;
```

---

## Constants and Macros

### Configuration Limits

```cpp
#define MIN_INTERVAL 20    // Minimum interval (seconds)
#define MAX_INTERVAL 4270  // Maximum interval (seconds)
```

### Sensor Commands

```cpp
#define CMD_PERFORM 0x10  // Perform measurement
#define CMD_READ 0x11     // Read measurement
```

### Downlink Commands

```cpp
#define DL_CMD_REJOIN 0xDE    // Reset device
#define DL_CMD_INTERVAL 0x10  // Change interval
#define DL_CMD_MODULE 0x11    // Module command
```

### Timing

```cpp
#define MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S 10  // Wait after measurement
#define MEASUREMENT_DELAY_AFTER_PING_S 45          // Wait after version ping
```

---

## Error Codes

### `error_t` Enum

```cpp
typedef enum {
  ERR_NONE = 0,           // Success
  ERR_TIMEOUT,            // Operation timeout
  ERR_NACK,               // I2C NACK received
  ERR_INVALID_PARAM,      // Invalid parameter
  ERR_BUSY,               // Resource busy
  // Add others as defined
} error_t;
```

---

## LMIC Integration

### OS Callback Functions

Required by LMIC library:

#### `void os_getArtEui(uint8_t *buf)`

**Description:** LMIC callback to retrieve APP_EUI

**Parameters:**
- `buf` (uint8_t*): Buffer to store APP_EUI

**Returns:** None (via buffer)

---

#### `void os_getDevEui(uint8_t *buf)`

**Description:** LMIC callback to retrieve DEV_EUI

**Parameters:**
- `buf` (uint8_t*): Buffer to store DEV_EUI

**Returns:** None (via buffer)

---

#### `void os_getDevKey(uint8_t *buf)`

**Description:** LMIC callback to retrieve APP_KEY

**Parameters:**
- `buf` (uint8_t*): Buffer to store APP_KEY

**Returns:** None (via buffer)

---

#### `uint16_t os_getMeasurementInterval(uint8_t dr)`

**Description:** Custom callback to retrieve measurement interval

**Parameters:**
- `dr` (uint8_t): Current data rate (unused)

**Returns:**
- (uint16_t): Measurement interval in seconds

---

## Usage Examples

### Complete Measurement Cycle

```cpp
// In main loop
void loop() {
  os_runloop_once();  // Process LMIC events
}

// Scheduled job: perform measurement
void job_performMeasurements(osjob_t *job) {
  sensors_performMeasurement();
  os_setTimedCallback(job, os_getTime() + sec2osticks(10),
                      FUNC_ADDR(job_fetchAndSend));
}

// Scheduled job: fetch and send
void job_fetchAndSend(osjob_t *job) {
  uint8_t dataBuf[32];
  uint8_t count = 0;
  
  sensors_readMeasurement(dataBuf, &count);
  LMIC_setTxData2(1, dataBuf, count, 0);
  
  scheduleNextMeasurement();
}
```

### Processing Downlink

```cpp
void onEvent(ev_t ev) {
  if (ev == EV_TXCOMPLETE && LMIC.dataLen > 0) {
    uint8_t cmd = LMIC.frame[LMIC.dataBeg];
    uint8_t *args = &LMIC.frame[LMIC.dataBeg + 1];
    uint8_t len = LMIC.dataLen - 1;
    
    if (cmd == 0x10 && len >= 2) {
      uint16_t interval = (args[0] << 8) | args[1];
      conf_setMeasurementInterval(interval);
      conf_save();
    }
  }
}
```

---

## Next Steps

- **[Getting Started](/guides/getting-started/)** - Build and deploy firmware
- **[Architecture Overview](/guides/architecture/)** - Understand system design
- **[Protocol Reference](/reference/protocol/)** - Message formats
- **[Hardware Reference](/reference/hardware/)** - Pin mappings and specifications
