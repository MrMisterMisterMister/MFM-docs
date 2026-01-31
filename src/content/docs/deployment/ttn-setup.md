---
title: TTN Setup
description: Complete guide to setting up The Things Network for Multiflexmeter 3.7.0
---

Step-by-step guide to register and configure Multiflexmeter 3.7.0 devices on The Things Network (TTN).

## Prerequisites

- TTN account (free): https://console.cloud.thethings.network/
- Multiflexmeter 3.7.0 hardware
- Internet connection

## Understanding LoRaWAN Communication

Before setting up TTN, it's important to understand how the Multiflexmeter communicates using LoRaWAN.

### Uplinks: Device → Cloud

**Uplinks** are messages sent **from the Multiflexmeter device to The Things Network** (and then to your backend/application).

**In this project, uplinks are used for:**

1. **Poldermill Sensor Data (FPort 1)**
   - Sent every 5-15 minutes (configurable measurement interval)
   - Contains: Module address, module type, operational status (spinning/pumping), and revolution count
   - Payload format: `36 01 [flags] [revolutions]` (7 bytes)
   - Example: `36 01 03 00 00 00 32` = Poldermill spinning + pumping, 50 revolutions this period

2. **Device Version Info (FPort 2)**
   - Sent automatically after the device joins the network (OTAA)
   - Contains: Firmware version and hardware version
   - Payload format: `10 [fw_version] [hw_version]` (5 bytes)
   - Example: `10 03 07 02 08` = Firmware v3.7, Hardware v2.8
   - Helps you identify which devices are running which firmware in the field

**Why uplinks matter:**
- This is how you **monitor your poldermills remotely** - seeing if they're spinning, pumping water, and how many revolutions they've made
- All historical data, charts, and alerts are based on uplink messages
- Uplinks consume airtime, so the measurement interval balances data freshness vs. battery life and TTN fair use limits

### Downlinks: Cloud → Device

**Downlinks** are messages sent **from The Things Network to the Multiflexmeter device**. These are commands that change device behavior.

**In this project, downlinks are used for:**

1. **Change Measurement Interval (Command 0x10)**
   - Dynamically adjust how often the device takes measurements
   - Payload format: `10 [interval_msb] [interval_lsb]` (3 bytes)
   - Example: `10 07 08` = Set interval to 1800 seconds (30 minutes)
   - Use case: Increase frequency during windy periods, decrease to save battery in calm weather

2. **Send Commands to Sensor Module (Command 0x11)**
   - Forward commands directly to the poldermill sensor module via I²C
   - Payload format: `11 [module_addr] [command] [args...]`
   - Example: `11 36 20 01` = Send command 0x20 with argument 0x01 to sensor at address 0x36
   - Use case: Configure sensor parameters, trigger calibration, or read diagnostic data

3. **Force Device Reset (Command 0xDEAD)**
   - Emergency command to reboot the device and rejoin the network
   - Payload format: `DE AD` (2 bytes)
   - Use case: Recover from stuck states or network issues without physical access

**Important LoRaWAN Class A Behavior:**
- The Multiflexmeter is a **Class A device** (battery-optimized)
- Downlinks can **only be sent after the device sends an uplink**
- The device opens two short receive windows (RX1 at ~1s, RX2 at ~2s) after each uplink
- If you schedule a downlink, it will be delivered on the **next uplink** from that device
- This means there's a delay between scheduling a downlink and the device receiving it (up to your measurement interval)

**Example workflow:**
1. You notice a poldermill stopped spinning (from uplink data)
2. You schedule a downlink to increase measurement frequency from 15 minutes to 5 minutes
3. The device sends its next uplink (in up to 15 minutes)
4. Immediately after that uplink, the device receives your downlink in the RX1/RX2 window
5. The device processes the command and starts measuring every 5 minutes
6. You now get updates 3× faster to monitor the situation

:::tip[Battery-Powered Design]
Class A is the most energy-efficient LoRaWAN mode. The device spends most of its time in deep sleep and only wakes up to:
1. Take a measurement
2. Send an uplink
3. Listen briefly for downlinks (RX1/RX2 windows)
4. Go back to sleep

This allows the Multiflexmeter to run for months or years on batteries.
:::

## Step 1: Create TTN Application

### 1.1 Log In to TTN Console

1. Navigate to https://console.cloud.thethings.network/
2. Log in with your account
3. Select your region (Europe: `eu1.cloud.thethings.network`)

### 1.2 Create Application

1. Click **"Create application"**
2. Fill in application details:
   - **Application ID:** `multiflexmeter` (must be unique)
   - **Application name:** `Multiflexmeter Deployment`
   - **Description:** ` IoT sensor network for environmental monitoring`
3. Click **"Create application"**

## Step 2: Register Device

### 2.1 Add End Device

1. Open your application
2. Click **"Register end device"**
3. Select **"Enter end device specifics manually"**

### 2.2 Device Configuration

**LoRaWAN Version:**
- Select: **LoRaWAN Specification 1.0.x**

**Regional Parameters:**
- Select: **PHY V1.0.2 REV B** (or latest for EU868)

**Frequency Plan:**
- Select: **Europe 863-870 MHz (SF9 for RX2 - recommended)**

**Activation Mode:**
- Select: **Over the air activation (OTAA)**

:::tip[Why OTAA?]
OTAA is more secure than ABP and handles session management automatically.
:::

### 2.3 Device Identifiers

**JoinEUI (AppEUI):**
- Leave as default `0000000000000000` OR
- Use custom: `70B3D57ED00B1E57` (example)
- Format: 8 bytes hex (16 characters)

**DevEUI:**
- Click **"Generate"** for automatic generation OR
- Enter manually: `0004A30B00F8AC2D` (example)
- Format: 8 bytes hex, globally unique
- **Note:** Must match device EEPROM exactly

**AppKey:**
- Click **"Generate"** for secure random key
- Format: 16 bytes hex (32 characters)
- **Important:** Copy this key! You'll need it for EEPROM configuration

**End Device ID:**
- Friendly name: `mfm-sensor-001`
- Must be unique within application

### 2.4 Configure Device Location (Optional)

Before registering, you can set the device's GPS location which will be included in webhook payloads:

1. Scroll down to **"Location"** section
2. Set location using one of these methods:
   - **Manual entry:** Enter latitude, longitude, and altitude
   - **Map picker:** Click on the map to set location visually
3. Example for Mallemolen, Gouda:
   - **Latitude:** `52.0116`
   - **Longitude:** `4.7104`
   - **Altitude:** `5` (meters above sea level)
4. Click **"Set location"** to confirm

:::note[Location Data in Webhooks]
TTN includes location data in webhook payloads at different paths depending on configuration:
- **Standard path**: `uplink_message.locations.user` (most common)
- **Root path**: `locations.user` (fallback/legacy)

The backend automatically checks both locations to ensure maximum compatibility with different TTN configurations.
:::

:::tip[Automatic Reverse Geocoding]
The backend automatically performs reverse geocoding on GPS coordinates to determine location names (e.g., "Mallemolen", "Gouda", "Netherlands"). This happens when:
- A device sends its first uplink with GPS coordinates
- GPS coordinates change by more than ~100 meters

This uses the free OpenStreetMap Nominatim API, so no additional configuration is needed!
:::

### 2.5 Complete Registration

Click **"Register end device"**

## Step 3: Configure Payload Decoder

### 3.1 Open Payload Formatters

1. In your device view, click **"Payload formatters"**
2. Select **"Uplink"**
3. Choose **"Custom JavaScript formatter"**

### 3.2 Add Decoder Function

Paste the following JavaScript decoder:

:::note[TTN Version]
This decoder uses the **The Things Stack (TTN v3) format** (`decodeUplink(input)`). This is the current standard for The Things Network. If you're using an older TTN v2 deployment, use the legacy `Decoder(bytes, port)` format instead.
:::

```javascript
/**
 * TTN Payload Formatter - Decode Multiflexmeter uplink messages
 *
 * This decoder converts raw binary payloads from the Multiflexmeter device
 * into human-readable JSON objects displayed in TTN Console.
 *
 * SUPPORTED FPORTS:
 * - FPort 1: Distance sensor payload (distance in mm, temperature as float)
 * - FPort 2: Device version information (firmware and hardware versions)
 * - FPort 3: RPM measurement payload (rotation speed)
 *
 * @param {Object} input - TTN uplink input object
 * @param {number} input.fPort - LoRaWAN FPort (1 = distance/temp, 2 = version, 3 = RPM)
 * @param {Array<number>} input.bytes - Raw payload bytes (0-255)
 * @returns {Object} Decoded data or errors
 */

function version(msb, lsb) {
  let v = (msb << 8) | lsb;
  return {
    proto: (v >> 15) & 0x01,
    major: (v >> 10) & 0x1F,
    minor: (v >> 5) & 0x1F,
    patch: (v >> 0) & 0x1F
  };
}

function bytesToFloat(bytes) {
  // JavaScript bitwise operators yield a 32 bits integer, not a float.
  // Assume LSB (least significant byte first).
  var bits = bytes[3]<<24 | bytes[2]<<16 | bytes[1]<<8 | bytes[0];
  var sign = (bits>>>31 === 0) ? 1.0 : -1.0;
  var e = bits>>>23 & 0xff;
  var m = (e === 0) ? (bits & 0x7fffff)<<1 : (bits & 0x7fffff) | 0x800000;
  var f = sign * m * Math.pow(2, e - 150);
  return f;
}

function decodeUplink(input) {
  let b = input.bytes;
  let data = {};

  switch(input.fPort) {
    case 1:
      // Distance sensor payload
      // Bytes 0-1: Distance in mm (uint16 little-endian)
      // Bytes 2-5: Temperature as IEEE 754 float (little-endian)
      data.distance = (b[1] << 8) | b[0];
      data.temperature = bytesToFloat([b[2], b[3], b[4], b[5]]);
      break;

    case 2:
      // Version information payload
      // Bytes 1-2: Firmware version (packed format)
      // Bytes 3-4: Hardware version (packed format)
      fw = version(b[1], b[2]);
      hw = version(b[3], b[4]);
      data.fw_version = fw.major + "." + fw.minor + "." + fw.patch + (fw.proto ? "-proto" : "");
      data.hw_version = hw.major + "." + hw.minor + "." + hw.patch + (hw.proto ? "-proto" : "");
      break;

    case 3:
      // RPM measurement payload (1 byte)
      // Byte 0: RPM as whole number (uint8, 0-255)
      data.rpm = (b.length >= 1) ? b[0] : 0;
      data.ind = (data.rpm > 0); // Derived: true if mill is rotating
      break;
  }

  return {
    data: data,
    warnings: [],
    errors: []
  };
}
```

Click **"Save changes"**

### 3.3 Test Decoder

Use **"Test"** tab to verify:

**Test Input (FPort 1 - Distance Sensor):**
```json
{
  "bytes": [232, 3, 0, 0, 200, 65], // Distance: 1000mm, Temperature: ~25°C
  "fPort": 1
}
```

**Expected Output:**
```json
{
  "data": {
    "distance": 1000,
    "temperature": 25.0
  },
  "warnings": [],
  "errors": []
}
```

**Test Input (FPort 2 - Version):**
```json
{
  "bytes": [16, 14, 224, 10, 64], // Firmware v3.7.0, Hardware v2.8.0
  "fPort": 2
}
```

**Expected Output:**
```json
{
  "data": {
    "fw_version": "3.7.0",
    "hw_version": "2.8.0"
  },
  "warnings": [],
  "errors": []
}
```

**Test Input (FPort 3 - RPM):**
```json
{
  "bytes": [12], // RPM: 12
  "fPort": 3
}
```

**Expected Output:**
```json
{
  "data": {
    "rpm": 12,
    "ind": true
  },
  "warnings": [],
  "errors": []
}
```

## Step 4: Copy Device Credentials

You'll need these values for EEPROM configuration:

### From TTN Console:

1. **Application EUI (AppEUI)**
   - Location: Device overview → "Activation information"
   - Format: `70B3D57ED00B1E57`
   - Copy: Click copy icon

2. **Device EUI (DevEUI)**
   - Location: Device overview → "Activation information"
   - Format: `0004A30B00F8AC2D`
   - Copy: Click copy icon

3. **Application Key (AppKey)**
   - Location: Device overview → "Activation information"
   - Click eye icon to reveal
   - Format: `5B7F1A2E3C9D8A6F4E0B2C5D8A3F1E9C`
   - Copy: Click copy icon

:::caution[Security]
Never share your AppKey publicly! Store it securely.
:::

## Step 5: Configure EEPROM

Use the copied credentials to configure your device EEPROM.

See: [Configuration Guide](/deployment/configuration/) for detailed instructions.

## Step 6: Set Up Integrations

### 6.1 MQTT Integration (Built-in)

TTN provides MQTT access by default:

**Connection Details:**
- **Server:** `eu1.cloud.thethings.network` (or your region)
- **Port:** 1883 (MQTT) or 8883 (MQTTS)
- **Username:** `multiflexmeter@ttn` (your app ID)
- **Password:** API key (generate in console)

**Topics:**
```
# Uplink messages
v3/multiflexmeter@ttn/devices/mfm-sensor-001/up

# Downlink messages
v3/multiflexmeter@ttn/devices/mfm-sensor-001/down/push
```

### 6.2 HTTP Integration

1. Go to **"Integrations"** → **"Webhooks"**
2. Click **"Add webhook"**
3. Select **"Custom webhook"**
4. Configure:
   - **Webhook ID:** `custom-backend`
   - **Webhook format:** JSON
   - **Base URL:** `https://your-server.com/api/uplink`
   - **Uplink message:** Enabled

### 6.3 Storage Integration

Enable **"Storage Integration"** (free tier: 24 hours retention):

1. Go to **"Integrations"** → **"Storage Integration"**
2. Click **"Activate Storage Integration"**
3. Access data via API or TTN Console

## Step 7: Send Downlink Commands

Downlink commands allow you to remotely control and configure your Multiflexmeter devices without physical access.

:::caution[Class A Timing]
Remember: The device will only receive the downlink **after its next uplink**. If your measurement interval is 15 minutes, it could take up to 15 minutes for the device to receive the command.
:::

### Example 1: Change Measurement Interval

**Scenario:** Windy weather approaching - increase measurement frequency from 15 minutes to 5 minutes to capture more data.

**Via TTN Console:**

1. Open your device in TTN Console
2. Go to **"Messaging"** → **"Downlink"**
3. Configure:
   - **FPort:** `1` (any port works, but 1 is conventional)
   - **Payload (hex):** `10012C`
  - **Confirmed:** (unchecked - no acknowledgment needed)
4. Click **"Schedule downlink"**

**Payload breakdown:**
```
10 01 2C
│  │  │
│  └──┴─ Interval: 0x012C = 300 seconds (5 minutes)
└────── Command: 0x10 (Change Interval)
```

**What happens:**
1. Downlink scheduled in TTN queue
2. Device sends next uplink (within 15 minutes)
3. Device receives downlink in RX1/RX2 window
4. Device updates measurement interval to 300 seconds
5. Device saves new interval to EEPROM (persistent across reboots)
6. Next measurement happens in 5 minutes instead of 15

**Via TTN API:**

```bash
# Set measurement interval to 5 minutes (300 seconds = 0x012C)
curl -X POST \
  https://eu1.cloud.thethings.network/api/v3/as/applications/multiflexmeter/devices/mfm-sensor-001/down/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "downlinks": [{
      "f_port": 1,
      "frm_payload": "EBIM",
      "priority": "NORMAL"
    }]
  }'
```

**Note:** `EBIM` is the base64 encoding of hex `10 01 2C`

**Common intervals:**
- 5 minutes: `10012C` (300 seconds)
- 10 minutes: `100258` (600 seconds)
- 15 minutes: `100384` (900 seconds)
- 30 minutes: `100708` (1800 seconds)
- 1 hour: `100E10` (3600 seconds)

### Example 2: Send Command to Poldermill Sensor Module

**Scenario:** Trigger a sensor recalibration remotely.

**Via TTN Console:**

1. Go to **"Messaging"** → **"Downlink"**
2. Configure:
   - **FPort:** `1`
   - **Payload (hex):** `11362001`
  - **Confirmed:** (check this to get acknowledgment)
3. Click **"Schedule downlink"**

**Payload breakdown:**
```
11 36 20 01
│  │  │  │
│  │  │  └─ Argument: 0x01 (command-specific parameter)
│  │  └──── Module Command: 0x20 (sensor-specific command)
│  └─────── Module Address: 0x36 (poldermill sensor I²C address)
└────────── Command: 0x11 (Forward to Module)
```

**What happens:**
1. Device receives downlink
2. Device executes: `smbus_blockWrite(0x36, 0x20, [0x01], 1)`
3. Sensor at address 0x36 receives command 0x20 with parameter 0x01
4. Sensor performs its specific action (e.g., calibration, parameter change)

**Via TTN API:**

```bash
# Send command 0x20 with argument 0x01 to sensor at address 0x36
curl -X POST \
  https://eu1.cloud.thethings.network/api/v3/as/applications/multiflexmeter/devices/mfm-sensor-001/down/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "downlinks": [{
      "f_port": 1,
      "frm_payload": "ETYgAQ==",
      "priority": "NORMAL",
      "confirmed": true
    }]
  }'
```

**Note:** `ETYgAQ==` is the base64 encoding of hex `11 36 20 01`

### Example 3: Force Device Reset

**Scenario:** Device appears stuck or not responding normally - force a reboot and rejoin.

**Via TTN Console:**

1. Go to **"Messaging"** → **"Downlink"**
2. Configure:
   - **FPort:** `1`
   - **Payload (hex):** `DEAD`
  - **Confirmed:** (recommended)
3. Click **"Schedule downlink"**

**Payload breakdown:**
```
DE AD
│  │
│  └─ Validation byte: 0xAD (must be exact)
└──── Command: 0xDE (Reset command)
```

**What happens:**
1. Device receives `DE AD` downlink
2. Device validates second byte is `0xAD`
3. Device schedules reset job with 5-second delay
4. After 5 seconds, watchdog timer triggers MCU reset
5. Device reboots, loads configuration from EEPROM
6. Device performs OTAA rejoin procedure
7. Device sends version info (FPort 2) after successful join
8. Device resumes normal operation with configured interval

**Via TTN API:**

```bash
# Force device reset
curl -X POST \
  https://eu1.cloud.thethings.network/api/v3/as/applications/multiflexmeter/devices/mfm-sensor-001/down/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "downlinks": [{
      "f_port": 1,
      "frm_payload": "3q0=",
      "priority": "HIGH",
      "confirmed": true
    }]
  }'
```

**Note:** `3q0=` is the base64 encoding of hex `DE AD`

:::caution[Device Downtime]
The device will be offline for approximately 10-30 seconds during reset and rejoin. Use this command only when necessary.
:::

### Monitoring Downlink Delivery

**Check downlink status:**

1. In TTN Console, go to **"Live data"** tab
2. Look for downlink events after the next uplink:
   - `downlink.scheduled` - Downlink queued
   - `downlink.sent` - Downlink transmitted in RX1/RX2
   - `downlink.ack` - Device acknowledged (if confirmed=true)
   - `downlink.failed` - Delivery failed (check logs)

**Successful delivery indicators:**
- Device behavior changes as expected (e.g., interval updates)
- If confirmed downlink: You see `downlink.ack` event
- Next uplink reflects the changes

**Troubleshooting failed downlinks:**
- **Not delivered:** Check if device sent an uplink after scheduling
- **Device didn't process:** Check payload format (hex vs base64)
- **No acknowledgment:** Device may not support confirmed downlinks for that command
- **Wrong timing:** Downlink may have arrived during device sleep/wake transition

## Monitoring

### Live Data

View incoming messages:
1. Open device in TTN Console
2. Go to **"Live data"** tab
3. Watch for uplink messages

**Typical Poldermill Uplink Message:**
```json
{
  "end_device_ids": {
    "device_id": "mfm-sensor-001",
    "application_ids": {
      "application_id": "multiflexmeter"
    },
    "dev_eui": "0004A30B00F8AC2D"
  },
  "uplink_message": {
    "f_port": 1,
    "frm_payload": "NgEDAAAAMg==",
    "decoded_payload": {
      "moduleAddress": 54,
      "moduleType": 1,
      "revolutions": 50,
      "spinning": true,
      "pumping": true
    },
    "rx_metadata": [
      {
        "gateway_ids": { "gateway_id": "mallemolen-gateway" },
        "rssi": -67,
        "snr": 8.5,
        "channel_rssi": -67,
        "uplink_token": "..."
      }
    ],
    "settings": {
      "data_rate": {
        "lora": {
          "bandwidth": 125000,
          "spreading_factor": 7
        }
      },
      "frequency": "868100000"
    },
    "received_at": "2025-03-15T14:23:45.678Z"
  },
  "locations": {
    "user": {
      "latitude": 52.0116,
      "longitude": 4.7104,
      "altitude": 5,
      "source": "SOURCE_REGISTRY"
    }
  }
}
```

**What this tells you:**
- **Device:** mfm-sensor-001 (DevEUI: 0004A30B00F8AC2D)
- **Status:** Poldermill is both spinning (wind-powered) and pumping water
- **Revolutions:** 50 revolutions during this measurement period (e.g., last 15 minutes)
- **Signal quality:** Good (RSSI -67 dBm, SNR 8.5 dB)
- **Location:** Mallemolen, Gouda (52.0116°N, 4.7104°E)
- **Gateway:** Received by mallemolen-gateway
- **Data rate:** SF7 (fastest spreading factor - short airtime)

### Device Status

Check device health:
- **Last seen:** Timestamp of last uplink
- **Uplink counter:** Total messages received
- **Downlink counter:** Total messages sent
- **RSSI:** Signal strength (-120 to -30 dBm)
- **SNR:** Signal-to-noise ratio (>0 dB is good)

## Fair Use Policy

### TTN Fair Use Limits

**Free Tier:**
- **Uplink:** 30 seconds airtime per device per day
- **Downlink:** 10 downlinks per device per day

### Compliance

**Typical SF7 message (16 bytes):**
- Airtime: ~60ms
- Maximum messages: ~500/day

**Recommended intervals:**
- **SF7:** 2-5 minutes
- **SF9:** 5-10 minutes
- **SF12:** 15+ minutes

Enable **Fair Use Policy** in device EEPROM:
```python
FAIR_USE = bytes([0x01])  # Enable
```

## Troubleshooting

### Device Not Joining

**Check:**
1. AppEUI, DevEUI, AppKey match exactly
2. Device is in range of gateway
3. Frequency plan matches region (EU868)
4. Check gateway is online in TTN Console

**Debug:**
- Enable serial debug on device
- Check for "EV_JOINING" messages
- Verify LoRaWAN parameters in code

---

### No Uplinks Received

**Check:**
1. Device joined successfully (check "Last seen")
2. Gateway is receiving packets
3. RSSI/SNR values are reasonable (-120 to -30 dBm)
4. Device interval is configured correctly

---

### Decoder Not Working

**Check:**
1. FPort matches (1 for measurements, 2 for version)
2. Payload length is correct (16 bytes for FPort 1)
3. Test decoder with known values
4. Check JavaScript console for errors

---

## Next Steps

- [Configuration](/deployment/configuration/) - Configure device EEPROM
- [Field Deployment](/deployment/field-deployment/) - Installation best practices
- [Quick Start](/deployment/quick-start/) - Complete setup walkthrough
