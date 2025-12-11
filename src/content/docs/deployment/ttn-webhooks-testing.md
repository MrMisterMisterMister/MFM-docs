---
title: TTN Webhooks & Uplink Testing
description: Configure TTN webhooks and simulate Multiflexmeter uplinks for testing
---

This guide will help you connect your TTN (The Things Network) application to your Multiflexmeter backend and test it without physical hardware.

## Quick Start Guide

**What you'll do:**
1. Set up a webhook in TTN to forward sensor data to your backend
2. Configure authentication to keep your data secure
3. Test everything by simulating sensor readings

**Time needed:** ~15-20 minutes

**Before you start:**
- Make sure you have a TTN application created ([TTN Setup Guide](/deployment/ttn-setup/))
- Have your backend deployed on Vercel or running locally
- Basic understanding of web URLs and passwords

:::tip[First Time?]
Don't worry if you're new to this! We'll walk through each step. If you get stuck, check the [Common Issues](#common-issues) section at the bottom.
:::

## Webhook Configuration

A webhook is like a doorbell for your backend - when your device sends data to TTN, TTN "rings the doorbell" by sending that data to your backend server.

### Step 1: Create Webhook in TTN Console

1. Go to [The Things Network Console](https://console.cloud.thethings.network/)
2. Click on your application name
3. In the left menu, click **Integrations** → **Webhooks**
4. Click the blue **"+ Add webhook"** button
5. Choose **"Custom webhook"** from the list

:::note[What's a Webhook?]
Think of it as a phone number for your backend. When your sensor sends data to TTN, TTN automatically forwards it to this "phone number" (your webhook URL).
:::

### Step 2: Fill in Basic Information

First, give your webhook a name:
- **Webhook ID:** Type `multiflexmeter-backend` (or any name you like)
- **Webhook format:** Select `JSON` (should be selected by default)

### Step 3: Tell TTN Where to Send Data

Now specify your backend URL:
- **Base URL:** This is where your backend is hosted
  - If using Vercel: `https://YOUR-PROJECT-NAME.vercel.app/api/uplink`
    - Replace `YOUR-PROJECT-NAME` with your actual Vercel project name
    - Example: `https://mfm-docs.vercel.app/api/uplink`
  - If testing locally: You'll need a tool like [ngrok](https://ngrok.com/) to create a public URL
- **HTTP Method:** Keep it as `POST`

:::caution[Double-Check Your URL!]
Make sure your URL ends with `/api/uplink` - this is the endpoint that receives sensor data. A wrong URL means data won't reach your backend!
:::

### Step 4: Set Up Security (Important!)

Protect your webhook with a username and password:

1. Under **Authorization mode**, select `Basic Authentication`
2. For **Username**, type: `multiflexmeter` (or choose your own)
3. For **Password**, use a strong random password
   - **Need a secure password?** Open a terminal and run:
     ```bash
     openssl rand -base64 32
     ```
   - Or use an online password generator (make it at least 20 characters)

**IMPORTANT:** Write down these credentials! You'll need to add them to Vercel in Step 4.

### Step 5: Choose What Data to Receive

Scroll down to **Message types** and check these boxes:
- **Uplink message** ← This is the important one! (sensor data)
- **Join accept** ← Optional (tells you when a device connects)
- Leave other types unchecked for now

### Step 6: Enable Additional Data (Optional but Recommended)

Under **Enabled paths**, make sure these are included:
- `/uplink_message/decoded_payload` - Get decoded sensor readings
- `/uplink_message/rx_metadata` - Get signal strength (RSSI/SNR)
- `/uplink_message/settings` - Get transmission settings

:::tip[What's This For?]
These settings tell TTN to include extra useful information like signal strength and transmission settings in each message.
:::

### Step 7: Save Your Webhook (But Don't Test Yet!)

Click the blue **"Add webhook"** button at the bottom. Your webhook is now created!

:::caution[Wait!]
Don't test the webhook yet - it will fail because we haven't configured the authentication on Vercel/your backend. Let's do that next.
:::

---

## Backend Configuration

Now you need to tell your backend server about the webhook credentials you just created.

### Step 8: Add Environment Variables to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your project name
3. Click **Settings** in the top menu
4. In the left sidebar, click **Environment Variables**
5. Add these two variables:

**First Variable:**
- **Name:** `WEBHOOK_USERNAME`
- **Value:** The username you chose in Step 4 (e.g., `multiflexmeter`)
- Click **Add**

**Second Variable:**
- **Name:** `WEBHOOK_PASSWORD`
- **Value:** The secure password you generated in Step 4
- Click **Add**

:::note[Why Do This?]
This tells your backend server "Only accept data from TTN if it provides this username and password." It keeps random people from sending fake data to your system!
:::

### Step 9: Redeploy Your Application

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Find your latest deployment
3. Click the **⋯** (three dots) → **Redeploy**
4. Wait for deployment to complete (~1-2 minutes)

:::tip[Why Redeploy?]
Vercel needs to restart your application to use the new environment variables. Think of it like restarting your computer after installing software.
:::

---

## Testing Your Webhook

Great! Now everything is set up. Let's test if it works.

### Step 10: Send Your First Test Message

Let's simulate a sensor reading to see if everything works!

1. In TTN Console, go to your **device** (not the application)
2. Click **Messaging** in the left menu
3. Scroll down to **Simulate uplink**
4. Fill in:
   - **FPort:** `1` (this means "sensor data")
   - **Payload (hex):** `3601010000000019`
   - Leave other fields as default
5. Click **Send uplink**

:::note[What Did You Just Send?]
That hex code (`3601010000000019`) simulates a poldermill sensor (module 0x36, type 0x01) that's spinning with 25 revolutions. Don't worry about the details yet - we just want to see if data flows through!
:::

### Step 11: Check if It Worked

**In TTN Console:**
1. Look for the message in the "Live data" section
2. You should see your simulated uplink appear
3. Click on the webhook in **Integrations** → **Webhooks** → your webhook name
4. Check the "Live data" tab - you should see a successful delivery (green checkmark)

**In Your Backend:**
1. Go to your dashboard: `https://YOUR-PROJECT.vercel.app/dashboard`
2. You should see the new reading appear!
   - Revolutions: 25
   - Spinning: Yes
   - Pumping: No

**In Vercel Logs:**
1. Go to Vercel Dashboard → Your Project → **Logs**
2. You should see messages like:
   ```
   Webhook authenticated
   Received uplink message
   Device 0000000000000001 | Revolutions: 25 | Spinning: true
   ```

:::tip[Success!]
If you see the data in your dashboard and the webhook shows a 200 OK response, congratulations! Your webhook is working perfectly!
:::

:::caution[Got an Error?]
- **401 Unauthorized:** Username/password mismatch between TTN and Vercel. Double-check they match exactly.
- **404 Not Found:** Check your webhook URL - it should end with `/api/uplink`
- **500 Internal Error:** Check Vercel logs for details. Might be a backend issue.

See the [Common Issues](#common-issues) section below for more help.
:::

### Step 12: Configure Device Location (Optional)

Want to see which poldermill sent each reading? Configure GPS location:

1. In TTN Console, open your **device**
2. Go to **General settings**
3. Scroll to **Location** section
4. Enter coordinates:
   - **Latitude:** `52.0116` (example: Mallemolen, Gouda)
   - **Longitude:** `4.7104`
   - **Altitude:** `5` (meters)
5. Click **Save changes**

The backend will automatically convert these GPS coordinates into a human-readable location name (like "Mallemolen - Gouda")!

:::caution[Simulated Uplinks and Location Data]
TTN Console's "Simulate uplink" feature may **not include the device's GPS location** in the webhook payload, even if you've configured it in the device settings. This is a limitation of the TTN simulation feature.

**To test with location data:**
- Use the local device simulator: `npm run simulator` (includes GPS coordinates)
- Wait for real device uplinks (will include location if configured)
- Test manually using curl with the complete payload structure (see test-webhook-with-location.json)

You can verify what data is being sent by checking your Vercel logs after simulating an uplink.
:::

## Multiflexmeter Uplink Messages

The Multiflexmeter hardware sends two types of uplink messages based on the LoRaWAN protocol specification.

### FPort 1: Measurement Data

#### Current Implementation (3.7.0 & 3.8.0)

**Firmware Behavior:** The firmware operates as a **sensor passthrough** - it does not decode or interpret sensor data. This approach is maintained in 3.8.0 to minimize firmware changes.

**Transmission Process:**
1. Device sends command `0x10` (PERFORM) to sensor module at I²C address `0x36`
2. Waits 10 seconds for measurement completion
3. Reads raw data with command `0x11` (READ) from sensor
4. Transmits **raw sensor response** directly via LoRaWAN FPort 1 (no firmware-level interpretation)

**Payload Format:**
```
Bytes 0-n:   Raw sensor module response (no firmware interpretation)
```

**Passthrough Architecture**: The firmware does NOT decode, validate, or structure this data. **The application layer (TTN decoder + backend) handles all data interpretation.**

:::note[Design Philosophy]
Both 3.7.0 and 3.8.0 use the passthrough approach to keep firmware changes minimal. The sensor module is responsible for encoding data, and the application layer is responsible for decoding it.
:::

---

#### Expected Sensor Module Format (Application Layer)

While the firmware passes through raw bytes, the **poldermill sensor module** is expected to encode data in this format:

**Sensor Module Output (what the sensor returns via I2C):**
```
Byte 0:      Module Address (0x36 - I²C address of the sensor module)
Byte 1:      Module Type (0x01 = Poldermill sensor)
Byte 2:      Flags (bit 0: spinning, bit 1: pumping)
Bytes 3-6:   Revolutions (uint32 big-endian, count for this measurement period)
```

**Application-Layer Structure (for backend interpretation):**
```cpp
struct sensor_payload_t {
    uint8_t module_address;  // I²C address (0x36)
    uint8_t module_type;     // Module type (0x01 for poldermill)
    uint8_t flags;           // Bit 0: spinning, Bit 1: pumping
    uint32_t revolutions;    // Revolution counter for this period
};
```

**Flags Byte (Byte 2):**
- Bit 0: `1` = Spinning, `0` = Idle
- Bit 1: `1` = Pumping, `0` = Not pumping
- Bits 2-7: Reserved (set to 0)

:::tip[Period-based Counter]
The revolutions field contains the **number of revolutions that occurred during the measurement period**. After transmitting, the sensor module resets the counter to 0 for the next period. For example (with 1-hour measurement interval):
- Reading 1 (09:00): 25 revolutions (counted from 08:00-09:00, then reset to 0)
- Reading 2 (10:00): 30 revolutions (counted from 09:00-10:00, then reset to 0)
- Reading 3 (11:00): 15 revolutions (counted from 10:00-11:00, then reset to 0)
- **Total revolutions**: 25 + 30 + 15 = 70 revolutions (sum all periods)

This design keeps counts per period independent and manageable.
:::

**Measurement Interval:**
- Default: Configured in EEPROM
- Typical: 5-15 minutes
- Minimum: 20 seconds (hard limit)
- Maximum: ~71 minutes (4270 seconds)

### FPort 2: Version Information

Sent automatically after successful OTAA join.

**Payload Format:**
```
Byte 0:      0x10 (Version response indicator)
Byte 1-2:    Firmware version (uint16 big-endian)
Byte 3-4:    Hardware version (uint16 big-endian)
```

**Version Encoding:**
```
Bit 15:      Proto (0 = development, 1 = release)
Bits 14-10:  Major version (0-31)
Bits 9-5:    Minor version (0-31)
Bits 4-0:    Patch version (0-31)
```

**Example - Firmware v3.7.0 (release):**
- Proto: 1 (release)
- Major: 3
- Minor: 7
- Patch: 0
- Binary: `1 00011 00111 00000`
- Hex: `0x8E00`

**When Sent:**
- After successful OTAA join
- On device power-on (after join)
- When explicitly requested via downlink

## Simulating Uplinks in TTN Console

### Method 1: Schedule Uplink via TTN Console

1. Open your device in TTN Console
2. Go to **Messaging** → **Uplink**
3. Click **"Simulate uplink"**
4. Configure the uplink:
    - **FPort:** Select `1` for sensor data or `2` for version info
    - **Payload:** Enter hex payload (see examples below)
    - **Confirmed:** Optional (leave unchecked for testing)
5. Click **"Send uplink"**

:::note[Firmware Passthrough Design]
- **For 3.7.0 & 3.8.0:** Firmware uses passthrough (minimal changes)
- **Sensor Module:** Encodes data in the expected format (flags + revolutions)
- **Application Layer:** TTN decoder and backend interpret the raw bytes

The examples below show the **expected sensor module output format** for testing application-layer decoding.
:::

:::tip[Testing Workflow]
When testing a new device, simulate uplinks in this order:
1. **FPort 2** - Send version info first (simulates device join)
2. **FPort 1** - Send sensor data (simulates regular operation)

This matches the actual device behavior where version is sent on join, then sensor data periodically.
:::

### Method 2: Use TTN API

For automated testing, you can use the TTN API to schedule uplinks programmatically. Refer to [TTN API Documentation](https://www.thethingsindustries.com/docs/reference/api/) for details.

## Test Payloads

### Poldermill Sensor Examples (FPort 1)

:::caution[Sensor Module Format]
These examples show the **expected sensor module output** that will be passed through by the firmware. The firmware in both 3.7.0 and 3.8.0 acts as a passthrough - the sensor module encodes this data, and the application layer (TTN decoder + backend) decodes it.
:::

#### Example 1: Light Wind Activity

**Scenario:** Mill spinning with light wind during measurement period

**Hex Payload:**
```
36 01 01 00 00 00 19
```

**Breakdown:**
- `36` = Module Address (0x36 - poldermill sensor I²C address)
- `01` = Module Type (0x01 = Poldermill sensor)
- `01` = Flags (0b00000001 = spinning, not pumping)
- `00000019` = Revolutions (25 revolutions this period, big-endian uint32)

**Expected Decoded Output:**
```json
{
    "moduleAddress": 54,
    "moduleType": 1,
    "revolutions": 25,
    "spinning": true,
    "pumping": false
}
```

---

#### Example 2: Mill Idle

**Scenario:** No wind, mill stopped during measurement period

**Hex Payload:**
```
36 01 00 00 00 00 00
```

**Breakdown:**
- `36` = Module Address (0x36 - poldermill sensor I²C address)
- `01` = Module Type (0x01 = Poldermill sensor)
- `00` = Flags (0b00000000 = not spinning, not pumping)
- `00000000` = Revolutions (0 revolutions this period)

**Expected Decoded Output:**
```json
{
    "moduleAddress": 54,
    "moduleType": 1,
    "revolutions": 0,
    "spinning": false,
    "pumping": false
}
```

---

#### Example 3: Electric Motor Pumping

**Scenario:** High water level, using electric motor to pump (no wind)

**Hex Payload:**
```
36 01 02 00 00 00 00
```

**Breakdown:**
- `36` = Module Address (0x36 - poldermill sensor I²C address)
- `01` = Module Type (0x01 = Poldermill sensor)
- `02` = Flags (0b00000010 = not spinning, pumping)
- `00000000` = Revolutions (0 revolutions - electric motor pumping, no wind power)

**Expected Decoded Output:**
```json
{
    "moduleAddress": 54,
    "moduleType": 1,
    "revolutions": 0,
    "spinning": false,
    "pumping": true
}
```

:::note[Electric Motor Operation]
When `spinning=false` and `pumping=true`, the poldermill is using an electric motor for pumping. In this mode, revolutions should be 0 because there's no wind-powered rotation. This is normal operation, not an error.
:::

---

#### Example 4: Optimal Conditions

**Scenario:** Good wind, mill spinning and pumping water

**Hex Payload:**
```
36 01 03 00 00 00 32
```

**Breakdown:**
- `36` = Module Address (0x36 - poldermill sensor I²C address)
- `01` = Module Type (0x01 = Poldermill sensor)
- `03` = Flags (0b00000011 = spinning + pumping)
- `00000032` = Revolutions (50 revolutions this period - strong wind, active pumping)

**Expected Decoded Output:**
```json
{
    "moduleAddress": 54,
    "moduleType": 1,
    "revolutions": 50,
    "spinning": true,
    "pumping": true
}
```

---

#### Example 5: High Wind Activity

**Scenario:** Strong sustained wind during measurement period

**Hex Payload:**
```
36 01 01 00 00 00 64
```

**Breakdown:**
- `36` = Module Address (0x36 - poldermill sensor I²C address)
- `01` = Module Type (0x01 = Poldermill sensor)
- `01` = Flags (0b00000001 = spinning, not pumping)
- `00000064` = Revolutions (100 revolutions this period - very strong wind)

**Expected Decoded Output:**
```json
{
    "moduleAddress": 54,
    "moduleType": 1,
    "revolutions": 100,
    "spinning": true,
    "pumping": false
}
```

### Version Information Examples (FPort 2)

Version messages are sent automatically when a device joins the network. You can simulate this to test device registration.

#### Example 1: Firmware v3.7, Hardware v2.8 (Release)

**Scenario:** Device just joined, sending version info

**TTN Console Settings:**
- **FPort:** `2`
- **Payload (hex):** `10 03 07 02 08` // 3.7.0 and 2.8.0

**Payload Breakdown:**
```
10 03 07 02 08
```
- `10` = Version response indicator
- `03` = Firmware version (big-endian uint16)
    - Major: `3` (0x03)
    - Minor: `7` (0x07)
    - Display: v3.7
- `02` = Hardware version (big-endian uint16)
    - Major: `2` (0x02)
    - Minor: `8` (0x08)
    - Display: v2.8

**Backend Effect:**
- Device appears in `/devices` page
- Firmware version: 3.7
- Hardware version: 2.8
- Last seen timestamp updated

---

#### Example 2: Custom Version - Firmware v1.5, Hardware v1.2

**Scenario:** Testing different version numbers

**TTN Console Settings:**
- **FPort:** `2`
- **Payload (hex):** `100105010C`

**Payload Breakdown:**
```
10 01 05 01 0C
```
- `10` = Version response indicator
- `0105` = Firmware version
    - Major: `1` (0x01)
    - Minor: `5` (0x05)
    - Display: v1.5
- `010C` = Hardware version
    - Major: `1` (0x01)
    - Minor: `12` (0x0C)
    - Display: v1.12

**Expected Decoded Output:**
```json
{
    "type": "version",
    "fwVersion": "1.5",
    "hwVersion": "1.12"
}
```

---

#### Example 3: Development Build - Firmware v0.9, Hardware v1.0

**Scenario:** Testing pre-release firmware

**TTN Console Settings:**
- **FPort:** `2`
- **Payload (hex):** `1000090100`

**Payload Breakdown:**
```
10 00 09 01 00
```
- `10` = Version response indicator
- `0009` = Firmware version
    - Major: `0` (0x00)
    - Minor: `9` (0x09)
    - Display: v0.9 (development)
- `0100` = Hardware version
    - Major: `1` (0x01)
    - Minor: `0` (0x00)
    - Display: v1.0

**Expected Decoded Output:**
```json
{
    "type": "version",
    "fwVersion": "0.9",
    "hwVersion": "1.0"
}
```

## Payload Decoder for TTN

### Decoder Function (Application Layer)

:::note[Decoder Purpose]
This decoder interprets the **raw sensor module output** that the firmware passes through. It works for both 3.7.0 and 3.8.0 since both use the passthrough approach.
:::

Install this decoder in TTN Console → Your Application → Payload Formatters → Uplink:

```javascript
/**
 * TTN Payload Formatter - Decode Multiflexmeter uplink messages
 *
 * This decoder converts raw binary payloads from the Multiflexmeter device
 * into human-readable JSON objects displayed in TTN Console.
 *
 * SUPPORTED FPORTS:
 * - FPort 1: Poldermill sensor measurement data (7 bytes)
 * - FPort 2: Device version information (5 bytes)
 *
 * The firmware acts as a passthrough - it transmits raw sensor module data
 * without interpretation. This decoder extracts structured data from the
 * sensor module's binary format.
 *
 * @param {Object} input - TTN uplink input object
 * @param {number} input.fPort - LoRaWAN FPort (1 = measurements, 2 = version)
 * @param {Array<number>} input.bytes - Raw payload bytes (0-255)
 * @returns {Object} Decoded data or errors
 */
function decodeUplink(input) {
    // FPort 1: Poldermill sensor measurement data (7 bytes)
    if (input.fPort === 1 && input.bytes.length >= 7) {
        // PAYLOAD FORMAT: <Module Addr> <Module Type> <Flags> <Revolutions (uint32 BE)>
        // Format specified in Multiflexmeter-3.7.0 firmware readme.md:64-66
        //
        // The firmware reads this data from the sensor module at I²C address 0x36
        // using SMBus Block Read, then transmits it unmodified via LoRaWAN.

        // Byte 0: Module Address (0x36 = I²C address of poldermill sensor)
        // Identifies which sensor sent this data (supports multi-sensor setups)
        const moduleAddress = input.bytes[0];

        // Byte 1: Module Type (0x01 = Poldermill sensor)
        // Allows backend to apply sensor-specific decoding logic
        const moduleType = input.bytes[1];

        // Byte 2: Flags byte (operational status)
        // Bit 0 (LSB): Spinning (1 = rotor rotating via wind power, 0 = idle)
        // Bit 1:       Pumping (1 = water pumping active, 0 = not pumping)
        // Bits 2-7:    Reserved (unused, set to 0)
        const flags = input.bytes[2];
        const spinning = (flags & 0x01) !== 0;  // Test bit 0 (LSB)
        const pumping = (flags & 0x02) !== 0;   // Test bit 1

        // Bytes 3-6: Revolution count (uint32 big-endian)
        // IMPORTANT: This is a PERIOD count, NOT a cumulative total!
        // The sensor counts revolutions during the measurement interval (e.g., 15 minutes),
        // transmits the count, then RESETS to 0 for the next period.
        // Example: Reading 1: 25 revs, Reading 2: 30 revs, Total: 25+30=55 revs
        const revolutions = (input.bytes[3] << 24) |  // MSB (most significant byte)
                          (input.bytes[4] << 16) |
                          (input.bytes[5] << 8) |
                          input.bytes[6];             // LSB (least significant byte)

        return {
            data: {
                moduleAddress: moduleAddress,
                moduleType: moduleType,
                revolutions: revolutions,
                spinning: spinning,
                pumping: pumping
            }
        };
    }

    // FPort 2: Device version information (5 bytes)
    // Sent automatically after device joins network (OTAA) or on explicit request
    //
    // PAYLOAD FORMAT: <CMD> <FW_MSB> <FW_LSB> <HW_MSB> <HW_LSB>
    // CMD = 0x10: Version response indicator
    if (input.fPort === 2 && input.bytes.length >= 5) {
        // Byte 0: Command byte (must be 0x10 for version info)
        const cmd = input.bytes[0];

        if (cmd === 0x10) {
            // Bytes 1-2: Firmware version (uint16 big-endian, format: major.minor)
            // Example: 0x0307 = v3.7
            const fwMajor = input.bytes[1];  // MSB = major version
            const fwMinor = input.bytes[2];  // LSB = minor version

            // Bytes 3-4: Hardware version (uint16 big-endian, format: major.minor)
            // Example: 0x0208 = v2.8
            const hwMajor = input.bytes[3];  // MSB = major version
            const hwMinor = input.bytes[4];  // LSB = minor version

            return {
                data: {
                    type: 'version',
                    fwVersion: fwMajor + '.' + fwMinor,
                    hwVersion: hwMajor + '.' + hwMinor
                }
            };
        }
    }

    // Unknown FPort or invalid payload
    return {
        errors: ['Unknown FPort or invalid payload length']
    };
}
```

## Testing Complete Uplink Flow

### Complete Device Lifecycle Test

Test the full device lifecycle from join to normal operation:

#### Step 1: Configure Webhook (One-time Setup)

1. Configure webhook URL to your backend
2. Add Basic Authentication credentials
3. Enable uplink messages
4. Configure device GPS location in TTN Console (optional)

#### Step 2: Configure Payload Decoder (One-time Setup)

1. Install decoder in TTN Console (see decoder section below)
2. Test decoder with sample payloads

#### Step 3: Simulate Device Join (FPort 2 - Version Info)

**Purpose:** Simulates device joining the network for the first time

1. Go to TTN Console → Your Device → **Messaging** → **Uplink**
2. Click **"Simulate uplink"**
3. Configure:
    - **FPort:** `2`
    - **Payload (hex):** `100105010C` (FW v1.5, HW v1.12)
4. Click **"Send uplink"**

**Expected Results:**
- TTN Webhook shows 200 OK response
- Device appears in `/devices` page
- Firmware version: 1.5
- Hardware version: 1.12
- Location auto-detected (if GPS configured)

#### Step 4: Simulate First Measurement (FPort 1 - Sensor Data)

**Purpose:** Simulates the first sensor reading after join

1. Go to TTN Console → Your Device → **Messaging** → **Uplink**
2. Click **"Simulate uplink"**
3. Configure:
    - **FPort:** `1`
    - **Payload (hex):** `3601010000000019` (25 revolutions, spinning)
4. Click **"Send uplink"**

**Expected Results:**
- Dashboard shows new reading
- Revolutions: 25
- Spinning: true
- Pumping: false
- Chart updates with first data point

#### Step 5: Simulate Continuous Operation (Multiple FPort 1 Messages)

**Purpose:** Simulates regular operation over time

Send multiple uplinks with different revolution counts:

| Time | Payload | Revolutions | Spinning | Pumping | Notes |
|------|---------|-------------|----------|---------|-------|
| +5 min | `360101000000001E` | 30 | Yes | No | Normal operation |
| +10 min | `3601000000000000` | 0 | No | No | Wind stopped |
| +15 min | `3601030000000032` | 50 | Yes | Yes | High wind, pumping water |
| +20 min | `3601010000000064` | 100 | Yes | No | Very high wind |

**Expected Results:**
- Dashboard shows 5 readings total
- Total revolutions: 25 + 30 + 0 + 50 + 100 = **205 revolutions**
- Chart shows bars for each reading period
- Activity log shows status changes (spinning/pumping)

#### Step 6: Verify Complete System

**Dashboard (`/dashboard`):**
- Revolutions counter shows total: 205
- Chart displays 5 data points
- Time filters work (Today/Month/Year)
- Real-time updates (if using SSE)
- Spinning/pumping status shown correctly

**Devices Page (`/devices`):**
- Device listed with correct EUI
- Firmware version: 1.5
- Hardware version: 1.12
- Location shown (if GPS configured)
- Last seen timestamp recent

**TTN Webhook Logs:**
- All 6 uplinks delivered (1× FPort 2, 5× FPort 1)
- All show 200 OK responses
- No authentication errors

**Vercel Logs (if deployed):**
```
Webhook authenticated
Received webhook payload structure:
  - end_device_ids: present
  - uplink_message: present
  - locations: present (if GPS configured)
Received GPS coordinates: (52.0116, 4.7104) @ 5m
GPS coordinates changed, performing reverse geocoding in background...
Device 0000000000000001 - HW: 1.12, FW: 1.5
   GPS: (52.0116, 4.7104)
   Location: Mallemolen - Gouda - Netherlands
[DevEui] | Revolutions: 25 | Spinning: true, Pumping: false | RSSI: -65, SNR: 8.5
```

### Expected Results

After successful uplink simulation:

**TTN Console:**
- Uplink appears in "Live data"
- Payload is decoded
- Webhook shows 200 OK

**Backend Logs (Vercel):**
- "Webhook authenticated"
- "Using pre-decoded payload from TTN formatter"
- Device info logged with revolutions and status

**Dashboard:**
- New reading appears in real-time
- Chart updates with new data point
- Activity log shows spinning/pumping status

## Realistic Test Scenarios

### Scenario 1: Device Joins Network

1. Device powers on
2. Performs OTAA join
3. Sends version info (FPort 2): `10 8E 00 84 40`
4. Backend stores device information

**Simulate:**
- FPort: 2
- Payload: `108E008440`

**Expected:**
- Device appears in `/devices`
- Version info displayed correctly

---

### Scenario 2: Daily Operation

1. Device wakes from sleep every 15 minutes
2. Reads sensor data
3. Sends measurement (FPort 1): `3601010000000005`
4. Returns to sleep

**Simulate:**
- FPort: 1
- Payload: `3601010000000005` (5 revolutions, spinning)
- Repeat every few seconds to simulate continuous operation

**Expected:**
- Dashboard updates in real-time
- Revolution counter increases by 5 each time
- Chart shows revolution trends
- Spinning status shows as active

---

### Scenario 3: Wind Activity Changes

1. Wind picks up throughout day
2. Mill spinning and pumping activity varies
3. Each period sends its count, then resets

**Simulate in sequence (15-minute intervals, period-based counting):**
1. `3601000000000014` (20 revolutions this period, not spinning - coasting down)
2. `3601010000000028` (40 revolutions this period, spinning starts - wind picks up)
3. `360101000000003C` (60 revolutions this period, still spinning - wind increases)
4. `3601030000000032` (50 revolutions this period, spinning + pumping - load slows it down slightly)

**Expected:**
- Chart shows revolution counts per period (20, 40, 60, 50)
- Spinning status changes visible in activity log
- Pumping activity starts in last reading
- Total shown sums all periods correctly (20 + 40 + 60 + 50 = 170 revolutions)

## Monitoring Webhook Delivery

### Check Webhook Status

1. Go to TTN Console → Integrations → Webhooks
2. Click on your webhook
3. View **"Live data"** tab to see:
    - Delivery attempts
    - Response codes
    - Failure reasons

### Common Issues

**401 Unauthorized:**
- Cause: Basic authentication failed
- Fix: Verify `WEBHOOK_USERNAME` and `WEBHOOK_PASSWORD` in Vercel
- Fix: Ensure webhook credentials match environment variables
- Fix: Redeploy after adding environment variables

**404 Not Found:**
- Cause: Webhook URL incorrect
- Fix: Verify `/api/uplink` endpoint exists
- Fix: Check domain is accessible

**500 Internal Server Error:**
- Cause: Backend error processing payload
- Fix: Check Vercel logs for errors
- Fix: Verify Redis connection (`REDIS_URL`)
- Fix: Validate payload format

**Timeout:**
- Cause: Backend slow to respond
- Fix: Check database connection latency
- Fix: Verify Redis is accessible
- Fix: Review backend processing logic

## Testing Checklist

Before deploying to production:

- [ ] Webhook created in TTN Console with correct URL
- [ ] Basic Authentication configured with strong password
- [ ] Environment variables set in Vercel (`WEBHOOK_USERNAME`, `WEBHOOK_PASSWORD`, `REDIS_URL`)
- [ ] Application redeployed after adding environment variables
- [ ] Payload decoder installed in TTN Console
- [ ] Decoder tested with sample payloads (all examples above)
- [ ] Uplink simulated successfully (200 OK response)
- [ ] Data appears in dashboard (`/dashboard`)
- [ ] Device appears in devices list (`/devices`)
- [ ] RSSI/SNR values reasonable (if using real gateway)
- [ ] Real device tested (if available)
- [ ] Webhook delivery monitored for errors

## Downlink Commands

For information about sending downlink commands to the Multiflexmeter:

- Change measurement interval
- Send commands to sensor modules
- Force device reset

See: [Communication Protocol - Downlink Commands](/firmware/protocol/#downlink-commands)

## Related Documentation

- [TTN Setup](/deployment/ttn-setup/) - Initial TTN configuration
- [Communication Protocol](/firmware/protocol/) - Complete protocol specification
- [Quick Start](/deployment/quick-start/) - Complete setup guide
- [Dashboard](/dashboard) - View live data

---

**Need help?** Check the [Troubleshooting Guide](/troubleshooting/common-issues/) or [FAQ](/troubleshooting/faq/).
