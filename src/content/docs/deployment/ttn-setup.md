---
title: TTN Setup
description: Complete guide to setting up The Things Network for Multiflexmeter 3.7.0
---

# The Things Network Setup

Step-by-step guide to register and configure Multiflexmeter 3.7.0 devices on The Things Network (TTN).

## Prerequisites

- TTN account (free): https://console.cloud.thethings.network/
- Multiflexmeter 3.7.0 hardware
- Internet connection

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

### 2.4 Complete Registration

Click **"Register end device"**

## Step 3: Configure Payload Decoder

### 3.1 Open Payload Formatters

1. In your device view, click **"Payload formatters"**
2. Select **"Uplink"**
3. Choose **"Custom JavaScript formatter"**

### 3.2 Add Decoder Function

Paste the following JavaScript decoder:

```javascript
function decodeUplink(input) {
  // FPort 1: Measurement data (16 bytes = 8 × int16)
  if (input.fPort === 1) {
    if (input.bytes.length !== 16) {
      return {
        errors: ["Invalid payload length"]
      };
    }
    
    var measurements = [];
    for (var i = 0; i < 8; i++) {
      var value = (input.bytes[i * 2] << 8) | input.bytes[i * 2 + 1];
      // Convert to signed int16
      if (value > 32767) value -= 65536;
      measurements.push(value);
    }
    
    return {
      data: {
        channel_0: measurements[0],
        channel_1: measurements[1],
        channel_2: measurements[2],
        channel_3: measurements[3],
        channel_4: measurements[4],
        channel_5: measurements[5],
        channel_6: measurements[6],
        channel_7: measurements[7]
      }
    };
  }
  
  // FPort 2: Firmware version (2 bytes)
  if (input.fPort === 2) {
    if (input.bytes.length !== 2) {
      return {
        errors: ["Invalid version payload"]
      };
    }
    
    var version = (input.bytes[0] << 8) | input.bytes[1];
    var proto = (version >> 15) & 0x01;
    var major = (version >> 10) & 0x1F;
    var minor = (version >> 5) & 0x1F;
    var patch = version & 0x1F;
    
    return {
      data: {
        version: proto + "." + major + "." + minor + "." + patch,
        version_raw: version
      }
    };
  }
  
  return {
    warnings: ["Unknown FPort: " + input.fPort]
  };
}
```

Click **"Save changes"**

### 3.3 Test Decoder

Use **"Test"** tab to verify:

**Test Input (FPort 1):**
```json
{
  "bytes": [0, 100, 0, 200, 1, 44, 255, 156, 0, 0, 0, 0, 0, 0, 0, 0],
  "fPort": 1
}
```

**Expected Output:**
```json
{
  "data": {
    "channel_0": 100,
    "channel_1": 200,
    "channel_2": 300,
    "channel_3": -100,
    "channel_4": 0,
    "channel_5": 0,
    "channel_6": 0,
    "channel_7": 0
  }
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
   - **Base URL:** `https://your-server.com/ttn/webhook`
   - **Uplink message:** ✓ Enabled

### 6.3 Storage Integration

Enable **"Storage Integration"** (free tier: 24 hours retention):

1. Go to **"Integrations"** → **"Storage Integration"**
2. Click **"Activate Storage Integration"**
3. Access data via API or TTN Console

## Step 7: Send Downlink Messages

### From TTN Console

1. Open device view
2. Go to **"Messaging"** → **"Downlink"**
3. Configure downlink:
   - **FPort:** `1`
   - **Payload (hex):** `0010012C` (set interval to 300 seconds)
   - **Confirmed:** ✓ (optional, for acknowledgment)
4. Click **"Schedule downlink"**

**Downlink will be sent on next uplink** (Class A behavior)

### Via API

```bash
curl -X POST \
  https://eu1.cloud.thethings.network/api/v3/as/applications/multiflexmeter/devices/mfm-sensor-001/down/push \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "downlinks": [{
      "f_port": 1,
      "frm_payload": "ABAAKg==",
      "priority": "NORMAL"
    }]
  }'
```

## Monitoring

### Live Data

View incoming messages:
1. Open device in TTN Console
2. Go to **"Live data"** tab
3. Watch for uplink messages

**Typical Message:**
```json
{
  "uplink_message": {
    "f_port": 1,
    "frm_payload": "AGQAyAAszpwAAAAAAAAAAAAA",
    "decoded_payload": {
      "channel_0": 100,
      "channel_1": 200,
      ...
    },
    "rx_metadata": [
      {
        "gateway_ids": { "gateway_id": "my-gateway" },
        "rssi": -45,
        "snr": 9.5
      }
    ]
  }
}
```

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
