---
title: API Reference
description: Complete API reference for Multiflexmeter firmware functions
---

# API Reference

Complete API reference for Multiflexmeter 3.7.0 firmware functions and interfaces.

## Configuration API

### `rom_conf.cpp` / `rom_conf.h`

#### `conf_load()`
```cpp
bool conf_load(void);
```
Loads configuration from EEPROM into RAM and validates magic bytes.

**Returns:** 
- `true` - Configuration loaded successfully
- `false` - Invalid magic bytes "MFM\0" or EEPROM corrupted

**Side Effects:**
- Reads 41 bytes from EEPROM address 0x00
- Populates static `rom_conf_t config` structure
- Validates MAGIC field

**Location:** `rom_conf.cpp:42-59`

---

#### `conf_save()`
```cpp
void conf_save(void);
```
Saves current configuration from RAM to EEPROM.

**Side Effects:**
- Writes 41 bytes to EEPROM address 0x00
- Updates MAGIC field to "MFM\0"

**Location:** `rom_conf.cpp:61-66`

---

#### `conf_getDevEui()`
```cpp
void conf_getDevEui(uint8_t *buf);
```
Copies Device EUI to provided buffer.

**Parameters:**
- `buf` - Pointer to 8-byte buffer

**Format:** LSB-first (little-endian) as required by LMIC

**Location:** `rom_conf.cpp:68-70`

---

#### `conf_getAppEui()`
```cpp
void conf_getAppEui(uint8_t *buf);
```
Copies Application EUI to provided buffer.

**Parameters:**
- `buf` - Pointer to 8-byte buffer

**Format:** LSB-first (little-endian) as required by LMIC

**Location:** `rom_conf.cpp:72-74`

---

#### `conf_getAppKey()`
```cpp
void conf_getAppKey(uint8_t *buf);
```
Copies Application Key to provided buffer.

**Parameters:**
- `buf` - Pointer to 16-byte buffer

**Format:** MSB-first (big-endian)

**Location:** `rom_conf.cpp:76-78`

---

#### `conf_getMeasurementInterval()`
```cpp
uint16_t conf_getMeasurementInterval(void);
```
Retrieves measurement interval with bounds checking.

**Returns:** Interval in seconds (20-4270)

**Bounds:**
- Minimum: 20 seconds (MIN_INTERVAL)
- Maximum: 4270 seconds (MAX_INTERVAL)

**Location:** `rom_conf.cpp:80-86`

---

#### `conf_setMeasurementInterval()`
```cpp
void conf_setMeasurementInterval(uint16_t interval);
```
Sets measurement interval with bounds checking.

**Parameters:**
- `interval` - Interval in seconds (clamped to 20-4270)

**Side Effects:**
- Updates RAM configuration
- Does NOT save to EEPROM (call `conf_save()` separately)

**Location:** `rom_conf.cpp:88-93`

---

#### `conf_getUseTTNFairUsePolicy()`
```cpp
uint8_t conf_getUseTTNFairUsePolicy(void);
```
Returns TTN Fair Use Policy flag.

**Returns:** 
- `1` - Fair use policy enabled (30s/day airtime limit)
- `0` - Fair use policy disabled

**Location:** `rom_conf.cpp:95-97`

---

#### `conf_getFirmwareVersion()`
```cpp
version conf_getFirmwareVersion(void);
```
Returns firmware version from build flags.

**Returns:** `version` struct with proto, major, minor, patch fields

**Source:** Compile-time defines (FW_VERSION_MAJOR, MINOR, PATCH)

**Location:** `rom_conf.cpp:99-106`

---

#### `conf_getHardwareVersion()`
```cpp
version conf_getHardwareVersion(void);
```
Returns hardware version from EEPROM.

**Returns:** `version` struct with proto, major, minor, patch fields

**Source:** EEPROM HW_VERSION field (2 bytes)

**Location:** `rom_conf.cpp:108-115`

---

#### `versionToUint16()`
```cpp
uint16_t versionToUint16(version v);
```
Encodes version struct to 16-bit integer.

**Parameters:**
- `v` - Version structure

**Returns:** 16-bit encoded version

**Format:** `[proto:1][major:5][minor:5][patch:5]`

**Example:**
```cpp
version fw = conf_getFirmwareVersion();
uint16_t encoded = versionToUint16(fw);
// v3.7.0 (release) → 0x8E00
```

**Location:** `rom_conf.cpp:117-121`

---

## Sensor API

### `sensors.cpp` / `sensors.h`

#### `sensors_init()`
```cpp
error_t sensors_init(void);
```
Initializes SMBus/I²C interface for sensor communication.

**Returns:** 
- `ERR_NONE` - Initialization successful
- Other error codes from `smbus_init()`

**Side Effects:**
- Configures I²C hardware at 80kHz
- Sets up TWI peripheral

**Location:** `sensors.cpp:45-47`

---

#### `sensors_performMeasurement()`
```cpp
error_t sensors_performMeasurement(void);
```
Triggers measurement on sensor board at address 0x36 by sending CMD_PERFORM (0x10).

**Returns:**
- `ERR_NONE` - Command sent successfully
- `ERR_SMBUS_SLAVE_NACK` - Sensor did not acknowledge
- `ERR_SMBUS_*` - Other SMBus errors

**Protocol:**
- Sends byte `0x10` to I²C address `0x36`

**Usage:**
```cpp
if (sensors_performMeasurement() == ERR_NONE) {
    // Wait 10 seconds before reading
    delay(10000);
}
```

**Location:** `sensors.cpp:59-61`

---

#### `sensors_readMeasurement()`
```cpp
error_t sensors_readMeasurement(uint8_t *buf, uint8_t *length);
```
Reads measurement data from sensor using CMD_READ (0x11) via SMBus block read.

**Parameters:**
- `buf` - Buffer to store measurement data (up to 32 bytes)
- `length` - Input: buffer size, Output: actual bytes read

**Returns:**
- `ERR_NONE` - Data read successfully
- `ERR_SMBUS_SLAVE_NACK` - Sensor did not respond
- `ERR_SMBUS_*` - Other SMBus errors

**Protocol:**
- Sends command `0x11` to address `0x36`
- Performs SMBus block read (variable length)
- First byte from sensor indicates data length

**Example:**
```cpp
uint8_t sensor_data[32];
uint8_t data_length = sizeof(sensor_data);

if (sensors_readMeasurement(sensor_data, &data_length) == ERR_NONE) {
    // Process sensor_data[0..data_length-1]
    // Format depends on connected sensor module
}
```

**Location:** `sensors.cpp:73-75`

---

## SMBus/I²C API

### `smbus.cpp` / `smbus.h`

#### `smbus_init()`
```cpp
error_t smbus_init(void);
```
Initializes TWI (I²C) hardware for SMBus communication.

**Returns:** `ERR_NONE`

**Configuration:**
- Clock speed: 80kHz (F_SMBUS = 80000L)
- Calculates TWBR register value
- External 4.7kΩ pull-ups required on SDA/SCL

**Location:** `smbus.cpp:108-111`

---

#### `smbus_sendByte()`
```cpp
error_t smbus_sendByte(uint8_t addr, uint8_t byte);
```
Performs SMBus Send Byte operation.

**Parameters:**
- `addr` - 7-bit I²C address (not shifted)
- `byte` - Command or data byte to send

**Returns:**
- `ERR_NONE` - Success
- `ERR_SMBUS_SLAVE_NACK` - Device did not acknowledge
- `ERR_SMBUS_ARB_LOST` - Arbitration lost
- `ERR_SMBUS_ERR` - General communication error

**Protocol:** [START][ADDR+W][BYTE][STOP]

**Location:** `smbus.cpp:113-127`

---

#### `smbus_blockRead()`
```cpp
error_t smbus_blockRead(uint8_t addr, uint8_t cmd, 
                        uint8_t *rx_buf, uint8_t *rx_length);
```
Performs SMBus Block Read operation.

**Parameters:**
- `addr` - 7-bit I²C address
- `cmd` - Command byte
- `rx_buf` - Buffer for received data
- `rx_length` - Input: buffer size, Output: bytes received

**Returns:**
- `ERR_NONE` - Success
- `ERR_SMBUS_*` - Various error codes

**Protocol:** 
- [START][ADDR+W][CMD][RESTART][ADDR+R][LENGTH][DATA...][STOP]
- First received byte is data length
- Master ACKs all bytes except last (NACKed)

**Location:** `smbus.cpp:129-163`

---

#### `smbus_blockWrite()`
```cpp
error_t smbus_blockWrite(uint8_t addr, uint8_t cmd,
                         uint8_t *tx_buf, uint8_t tx_length);
```
Performs SMBus Block Write operation.

**Parameters:**
- `addr` - 7-bit I²C address
- `cmd` - Command byte
- `tx_buf` - Data to transmit
- `tx_length` - Number of bytes to send

**Returns:**
- `ERR_NONE` - Success
- `ERR_SMBUS_*` - Various error codes

**Protocol:** [START][ADDR+W][CMD][LENGTH][DATA...][STOP]

**Used by:** Downlink command 0x11 to forward data to sensor modules

**Location:** `smbus.cpp:165-190`

---

#### `smbus_alertAddress()`
```cpp
error_t smbus_alertAddress(uint8_t *addr);
```
Handles SMBus Alert Response Address (ARA) protocol.

**Parameters:**
- `addr` - Output: Address of alerting device

**Returns:**
- `ERR_NONE` - Alert address received
- `ERR_SMBUS_NO_ALERT` - No device alerting
- `ERR_SMBUS_*` - Communication error

**Protocol:** 
- Reads from special address 0x0C (SMBUS_ADDR_ARA)
- Device responds with its address
- Used for interrupt-driven sensor polling

**Location:** `smbus.cpp:192-211`

---

### Low-Level TWI Functions

These functions are internal to `smbus.cpp` and not part of the public API:

- `twi_start()` - Generate START condition and address device
- `twi_tx()` - Transmit one byte
- `twi_rx()` - Receive one byte (with ACK/NACK)
- `twi_stop()` - Generate STOP condition
- `twi_error()` - Translate TWI status to error_t

**Location:** `smbus.cpp:41-105`

---

## Board Support API

### `boards/mfm_v3.cpp` and `boards/mfm_v3_m1284p.cpp`

#### `board_setup()`
```cpp
void board_setup(void);
```
Initializes board-specific hardware configuration.

**Variants:**

**MFM V3 (ATmega328P):**
- No special initialization required
- Default Arduino setup sufficient
- **Location:** `mfm_v3.cpp:41-44`

**MFM V3 M1284P (ATmega1284P):**
- Optional clock prescaler configuration (commented out)
- Can reduce clock from 8MHz to 4MHz for power savings
- Currently uses default 8MHz
- **Location:** `mfm_v3_m1284p.cpp:43-51`

**Example (enabling clock prescaler):**
```cpp
void board_setup(void) {
    CLKPR = 1 << CLKPCE;  // Enable prescaler change
    CLKPR = 0b0001;       // Set /2 prescaler
}
```

---

### Board Pin Definitions

#### `include/board_config/mfm_v3.h`

**ATmega328P Variant:**
```cpp
#define PIN_PERIF_PWR 2      // Peripheral power control
#define PIN_JSN_TX 4         // JSN sensor TX
#define PIN_JSN_RX 3         // JSN sensor RX
#define PIN_ONE_WIRE 5       // OneWire bus
#define PIN_BUZZER 17        // Buzzer (Analog 3)
#define PIN_NSS 10           // LoRa chip select
#define PIN_RST 9            // LoRa reset
#define PIN_DIO_0 8          // LoRa DIO0
#define PIN_DIO_1 7          // LoRa DIO1
#define PIN_DIO_2 6          // LoRa DIO2
```

#### `include/board_config/mfm_v3_m1284p.h`

**ATmega1284P Variant:**
```cpp
#define PIN_PERIF_PWR 20     // Peripheral power control
#define PIN_JSN_TX 10        // JSN sensor TX
#define PIN_JSN_RX 11        // JSN sensor RX
#define PIN_ONE_WIRE 12      // OneWire bus
#define PIN_BUZZER 17        // Buzzer (Analog 3)
#define PIN_NSS 24           // LoRa chip select
#define PIN_RST 25           // LoRa reset
#define PIN_DIO_0 2          // LoRa DIO0
#define PIN_DIO_1 3          // LoRa DIO1
#define PIN_DIO_2 4          // LoRa DIO2
#define PIN_DIO_3 0          // LoRa DIO3
#define PIN_DIO_4 1          // LoRa DIO4
#define PIN_DIO_5 26         // LoRa DIO5
```

---

## Watchdog & Reset API

### `wdt.cpp` / `wdt.h`

#### `mcu_reset()`
```cpp
void mcu_reset(void);
```
Forces MCU reset using watchdog timer.

**Behavior:**
1. Sets global flag `do_reset = 1`
2. Enables watchdog with 15ms timeout
3. Enters infinite loop
4. Watchdog fires and resets MCU

**Usage:** Called by downlink command 0xDEAD or error recovery

**Warning:** This function does not return!

**Location:** `wdt.cpp:47-53`

---

#### `ISR(WDT_vect)`
```cpp
ISR(WDT_vect);
```
Watchdog timer interrupt service routine.

**Behavior:**
- If `do_reset == 1`: Allows reset to proceed
- If `do_reset == 0`: Resets watchdog and disables it

**Purpose:** Distinguishes intentional reset from watchdog protection

**Location:** `wdt.cpp:38-45`

---

### Native AVR Watchdog Functions

The firmware also uses standard AVR watchdog functions:

```cpp
#include <avr/wdt.h>

wdt_reset();              // Reset watchdog counter
wdt_disable();            // Disable watchdog
wdt_enable(WDTO_15MS);    // Enable with 15ms timeout
```

**Timeouts:** WDTO_15MS, WDTO_30MS, WDTO_60MS, WDTO_120MS, WDTO_250MS, WDTO_500MS, WDTO_1S, WDTO_2S, WDTO_4S, WDTO_8S

---

## LoRaWAN Integration

### `main.cpp` - Application Jobs and Event Handlers

#### `job_performMeasurements()`
```cpp
void job_performMeasurements(osjob_t *job);
```
Job function that triggers sensor measurement.

**Actions:**
1. Calls `sensors_performMeasurement()` to send CMD_PERFORM (0x10)
2. Schedules `job_fetchAndSend()` after 10 seconds delay

**Scheduling:** Called by `scheduleNextMeasurement()` based on interval

**Location:** `main.cpp:101-112`

---

#### `job_fetchAndSend()`
```cpp
void job_fetchAndSend(osjob_t *job);
```
Job function that reads sensor data and transmits via LoRaWAN.

**Actions:**
1. Reads measurement data with `sensors_readMeasurement()`
2. Transmits data on FPort 1 using `LMIC_setTxData2()`
3. Handles TXRX_PENDING case (skips if radio busy)

**Location:** `main.cpp:114-147`

---

#### `job_pingVersion()`
```cpp
void job_pingVersion(osjob_t *job);
```
Job function that sends firmware/hardware version after join.

**Actions:**
1. Encodes firmware and hardware versions to uint16
2. Builds 5-byte payload: [0x10][FW_MSB][FW_LSB][HW_MSB][HW_LSB]
3. Transmits on FPort 2
4. Schedules first measurement after 45 seconds

**Trigger:** Automatically called on EV_JOINED

**Location:** `main.cpp:149-167`

---

#### `job_reset()`
```cpp
void job_reset(osjob_t *job);
```
Job function that performs MCU reset.

**Actions:**
1. Calls `mcu_reset()` to trigger watchdog reset
2. Function does not return

**Trigger:** Scheduled by downlink command 0xDEAD after 5 second delay

**Location:** `main.cpp:169-171`

---

#### `job_error()`
```cpp
void job_error(osjob_t *job);
```
Error state job - enters infinite sleep loop.

**Actions:**
1. Prints error message to debug output
2. Enters infinite loop calling `os_runloop_once()`
3. Device effectively halts

**Trigger:** Called when configuration load fails

**Location:** `main.cpp:173-175`

---

#### `onEvent()`
```cpp
void onEvent(ev_t ev);
```
LMIC event handler for LoRaWAN protocol events.

**Key Events Handled:**

- **`EV_JOINING`** - Debug output, join in progress
- **`EV_JOINED`** - Schedules `job_pingVersion()` after join success
- **`EV_TXCOMPLETE`** - Processes downlinks, schedules next measurement
- **`EV_JOIN_TXCOMPLETE`** - Debug output for join attempt
- **`EV_LINK_DEAD`** - Automatic rejoin on link failure

**Downlink Processing:**
```cpp
case EV_TXCOMPLETE:
    if (LMIC.dataLen > 0) {
        processDownlink(LMIC.frame[LMIC.dataBeg], 
                       &LMIC.frame[LMIC.dataBeg + 1],
                       LMIC.dataLen - 1);
    }
    scheduleNextMeasurement();
```

**Location:** `main.cpp:318-386`

---

#### `processDownlink()`
```cpp
void processDownlink(uint8_t cmd, uint8_t *args, uint8_t len);
```
Processes downlink commands received from network.

**Parameters:**
- `cmd` - Command byte (first byte of downlink)
- `args` - Remaining payload bytes
- `len` - Length of args

**Commands:**
- **0xDE (+ 0xAD)**: Schedule device reset in 5 seconds
- **0x10**: Set measurement interval (args = MSB, LSB)
- **0x11**: Forward to sensor module via SMBus

**Location:** `main.cpp:248-302`

---

#### `scheduleNextMeasurement()`
```cpp
void scheduleNextMeasurement(void);
```
Calculates and schedules next measurement job.

**Logic:**
1. Reads interval from configuration
2. If Fair Use Policy enabled, enforces airtime limits
3. Checks duty cycle availability
4. Schedules `job_performMeasurements()` at calculated time

**Location:** `main.cpp:124-198`

---

#### `getTransmissionTime()`
```cpp
ostime_t getTransmissionTime(ostime_t req_time);
```
Enforces duty cycle compliance for transmission scheduling.

**Parameters:**
- `req_time` - Requested transmission time

**Returns:** Adjusted time respecting duty cycle

**Location:** `main.cpp:200-246`

---

### LMIC Credential Callbacks

These functions are called by LMIC to retrieve OTAA credentials:

#### `os_getArtEui()`
```cpp
void os_getArtEui(u1_t *buf);
```
Provides Application EUI to LMIC.

**Location:** `main.cpp:391-393`

---

#### `os_getDevEui()`
```cpp
void os_getDevEui(u1_t *buf);
```
Provides Device EUI to LMIC.

**Location:** `main.cpp:395-397`

---

#### `os_getDevKey()`
```cpp
void os_getDevKey(u1_t *buf);
```
Provides Application Key to LMIC.

**Location:** `main.cpp:399-401`

---

## Data Structures

### `rom_conf_t`

EEPROM configuration structure:

```cpp
struct __attribute__((packed)) rom_conf_t {
    uint8_t MAGIC[4];               // "MFM\0"
    struct {
        uint8_t MSB;                // Hardware version MSB
        uint8_t LSB;                // Hardware version LSB
    } HW_VERSION;                   // Hardware/firmware version (2 bytes)
    uint8_t APP_EUI[8];             // LoRaWAN Application EUI
    uint8_t DEV_EUI[8];             // LoRaWAN Device EUI
    uint8_t APP_KEY[16];            // LoRaWAN Application Key
    uint16_t MEASUREMENT_INTERVAL;  // Measurement interval (seconds, little-endian)
    uint8_t USE_TTN_FAIR_USE_POLICY; // Fair Use Policy (0=disabled, 1=enabled)
};
```

**Total Size:** 41 bytes

---

## Constants

### Sensor Command Codes (`sensors.cpp`)

```cpp
#define CMD_PERFORM 0x10              // Trigger measurement on sensor
#define CMD_READ    0x11              // Read measurement data from sensor
#define SENSOR_BOARD_ADDR 0x36        // I²C address of sensor board
```

### Downlink Commands (`main.cpp`)

```cpp
#define DL_CMD_REJOIN   0xDE          // Reset device (requires 0xAD as second byte)
#define DL_CMD_INTERVAL 0x10          // Update measurement interval
#define DL_CMD_MODULE   0x11          // Forward command to sensor module
```

### Configuration Limits (`config.h`)

```cpp
#define MIN_INTERVAL  20              // Minimum interval (seconds)
#define MAX_INTERVAL  4270            // Maximum interval (seconds) 
#define SENSOR_JSN_TIMEOUT 200        // JSN sensor timeout (ms)
#define MIN_LORA_DR 0                 // Minimum LoRa data rate
```

### Timing Constants (`main.cpp`)

```cpp
#define MEASUREMENT_SEND_DELAY_AFTER_PERFORM_S 10    // Wait 10s between perform and read
#define MEASUREMENT_DELAY_AFTER_PING_S 45            // Wait 45s after version ping
#define RESET_DELAY_S 5                              // Wait 5s before reset
```

---

## Usage Examples

### Complete Measurement Cycle (Actual Implementation)

```cpp
// From main.cpp - job_performMeasurements()
void job_performMeasurements(osjob_t *job) {
    error_t err = sensors_performMeasurement();
    if (err != ERR_NONE) {
        _debug("Sensor error\n");
        scheduleNextMeasurement();
        return;
    }
    // Schedule read after 10 seconds
    os_setTimedCallback(&main_job, 
                       os_getTime() + sec2osticks(10),
                       FUNC_ADDR(job_fetchAndSend));
}

// job_fetchAndSend()
void job_fetchAndSend(osjob_t *job) {
    uint8_t tx_buf[32];
    uint8_t tx_len = sizeof(tx_buf);
    
    error_t err = sensors_readMeasurement(tx_buf, &tx_len);
    if (err != ERR_NONE) {
        _debug("Read error\n");
        scheduleNextMeasurement();
        return;
    }
    
    // Check if radio is busy
    if (LMIC.opmode & OP_TXRXPEND) {
        _debug("TXRX Pending...\n");
        scheduleNextMeasurement();
        return;
    }
    
    // Transmit on FPort 1
    LMIC_setTxData2(1, tx_buf, tx_len, 0);
}
```

### Processing Downlink (Actual Implementation)

```cpp
// From main.cpp - processDownlink()
void processDownlink(uint8_t cmd, uint8_t *args, uint8_t len) {
    if (cmd == DL_CMD_REJOIN && len >= 1 && args[0] == 0xAD) {
        // Reset command (0xDEAD)
        _debug("Reset command received\n");
        os_setTimedCallback(&main_job,
                           os_getTime() + sec2osticks(RESET_DELAY_S),
                           FUNC_ADDR(job_reset));
        return;
    }
    
    if (cmd == DL_CMD_INTERVAL && len >= 2) {
        // Set interval command (0x10)
        uint16_t new_interval = (args[0] << 8) | args[1];
        _debugf("Changing interval: %u\n", new_interval);
        conf_setMeasurementInterval(new_interval);
        conf_save();
        return;
    }
    
    if (cmd == DL_CMD_MODULE && len >= 2) {
        // Forward to module (0x11)
        uint8_t addr = args[0];
        uint8_t module_cmd = args[1];
        error_t err = smbus_blockWrite(addr, module_cmd, 
                                       &args[2], len - 2);
        if (err != ERR_NONE) {
            _debug("Module command failed\n");
        }
        return;
    }
}
```

### Reading Configuration

```cpp
// Load configuration at startup
if (!conf_load()) {
    // Invalid configuration
    os_setCallback(&main_job, FUNC_ADDR(job_error));
    return;
}

// Get credentials for LMIC
uint8_t appeui[8], deveui[8], appkey[16];
conf_getAppEui(appeui);
conf_getDevEui(deveui);
conf_getAppKey(appkey);

// Get measurement settings
uint16_t interval = conf_getMeasurementInterval();
uint8_t fair_use = conf_getUseTTNFairUsePolicy();
```

---

## Next Steps

- [Firmware Architecture](/firmware/architecture/) - System design
- [Build System](/firmware/build-system/) - Compilation details
- [Development Guide](/development/development-guide/) - Practical examples
