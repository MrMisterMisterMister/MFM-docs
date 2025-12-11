---
title: Device Simulator
description: Test the dashboard with simulated Multiflexmeter devices sending realistic LoRaWAN data in LOCAL or TTN mode.
---

The Multiflexmeter project includes a device simulator for testing the dashboard without requiring physical hardware. The simulator generates generic test data for development purposes.

:::note[Firmware Version]
This simulator is designed for **Multiflexmeter 3.7.0**, which operates as a **sensor passthrough** (transmits raw sensor data without firmware-level interpretation). The simulator sends generic test data that mimics this passthrough behavior.
:::

## Overview

The device simulator can operate in two modes:

- **LOCAL Mode** (default): Sends data directly to the Astro `/api/uplink` endpoint
- **TTN Mode**: Sends data via The Things Network HTTP Integration API

The simulator generates data for multiple devices with:
- Generic sensor data payloads
- LoRaWAN signal quality (RSSI, SNR)
- GPS coordinates from real Dutch poldermill locations

:::caution[Test Data Only]
The simulator generates **generic test data** for development. The actual data format from real devices depends on the sensor module connected at I2C address 0x36.
:::

## Quick Start

### Basic Usage

Start the simulator with default settings:

```bash
npm run simulator
```

This will:
1. Simulate 3 devices (configurable)
2. Send measurements every 10 seconds
3. Send data to `http://localhost:4321/api/uplink`
4. Generate generic test sensor data

### Custom Configuration

Customize behavior with environment variables:

```bash
# Custom number of devices
NUM_DEVICES=5 npm run simulator

# Custom interval (milliseconds)
INTERVAL=5000 npm run simulator

# Custom endpoint
LOCAL_ENDPOINT=http://192.168.1.100:4321/api/uplink npm run simulator

# Combine multiple options
NUM_DEVICES=2 INTERVAL=15000 npm run simulator
```

## Operating Modes

### LOCAL Mode (Default)

Sends data directly to your local Astro development server.

**Usage**:

```bash
npm run simulator
```

**Or with explicit mode**:

```bash
MODE=LOCAL npm run simulator
```

**Configuration**:

```bash
# .env or command line
MODE=LOCAL
LOCAL_ENDPOINT=http://localhost:4321/api/uplink
NUM_DEVICES=3
INTERVAL=10000
```

**Data Flow**:

```
┌────────────────┐
│   Simulator    │
│  (Node.js)     │
└────────┬───────┘
         │ HTTP POST
         │ (simplified format)
         v
┌────────────────┐
│  /api/uplink   │
│  (Astro)       │
└────────┬───────┘
         │
         v
┌────────────────┐
│  Data Store    │
│ (SQLite/Redis) │
└────────┬───────┘
         │ SSE
         v
┌────────────────┐
│   Dashboard    │
│   (Browser)    │
└────────────────┘
```

:::tip[Development Only]
LOCAL mode only works in development (`npm run dev`). Production builds reject simulator data for security.

**Authentication Behavior**:
- **Development**: The `/api/uplink` endpoint automatically skips authentication when `import.meta.env.DEV === true`, allowing the simulator to send data without credentials
- **Production**: Simulator format is explicitly rejected (returns 403 Forbidden). Only authenticated TTN webhook payloads are accepted

This security measure ensures that only legitimate TTN webhooks can send data in production environments.
:::

### TTN Mode

Sends data via The Things Network HTTP Integration API, simulating real TTN webhook delivery.

**Usage**:

```bash
npm run simulator:ttn
```

**Or with explicit configuration**:

```bash
MODE=TTN TTN_APP_ID=your-app-id TTN_API_KEY=your-api-key npm run simulator
```

**Configuration**:

```bash
# .env or command line
MODE=TTN
TTN_APP_ID=multiflexmeter-test
TTN_API_KEY=NNSXS.YOUR.API.KEY
TTN_REGION=eu1
NUM_DEVICES=3
INTERVAL=10000
```

**Data Flow**:

```
┌────────────────┐
│   Simulator    │
│  (Node.js)     │
└────────┬───────┘
         │ HTTP POST
         │ (TTN format)
         v
┌────────────────┐
│      TTN       │
│   HTTP API     │
└────────┬───────┘
         │ Webhook
         v
┌────────────────┐
│  /api/uplink   │
│  (Astro)       │
└────────────────┘
```

:::caution[TTN Setup Required]
TTN mode requires a configured TTN application with webhook integration pointing to your Astro endpoint.
:::

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| **MODE** | LOCAL | Operating mode: `LOCAL` or `TTN` |
| **NUM_DEVICES** | 3 | Number of devices to simulate |
| **INTERVAL** | 10000 | Milliseconds between measurements |
| **LOCAL_ENDPOINT** | http://localhost:4321/api/uplink | Endpoint for LOCAL mode |
| **TTN_APP_ID** | - | TTN application ID (required for TTN mode) |
| **TTN_API_KEY** | - | TTN API key (required for TTN mode) |
| **TTN_REGION** | eu1 | TTN region (eu1, nam1, au1, etc.) |

### Device Locations

The simulator uses real Dutch poldermill locations:

| Device | Name | City | Coordinates | Altitude |
|--------|------|------|-------------|----------|
| 1 | Mallemolen | Gouda | 52.0116°N, 4.7104°E | 5m |
| 2 | De Roos | Delft | 52.0116°N, 4.3571°E | 3m |
| 3 | Molen de Valk | Leiden | 52.1595°N, 4.4869°E | 2m |
| 4 | De Zwaan | Rotterdam | 51.9225°N, 4.4792°E | 4m |
| 5 | Windlust | Amsterdam | 52.3676°N, 4.9041°E | 1m |

Devices cycle through these locations if `NUM_DEVICES` exceeds 5.

## Simulated Data

### AS IS (Version 3.7.0) - Generic Test Data

The simulator generates **generic test data** for development purposes. This mimics the passthrough behavior of the actual firmware.

**Key Points**:
- The simulator sends test payload data via FPort 1
- Data format is arbitrary and for testing only
- Real devices send raw sensor module data (format depends on sensor at 0x36)
- Application-level decoding is required for both simulated and real data

**Binary Format** (test data example):

```
┌────────────────────────────────────────┐
│ Generic test payload (variable bytes)  │
│ Used for development/testing only      │
└────────────────────────────────────────┘
```

:::note[Not Representative of Real Data]
The simulator's test data format does not necessarily match the format of actual sensor modules. It is designed to test dashboard functionality, not to replicate specific sensor output.
:::

### TO BE (Version 3.8.0)

Future versions will implement structured data with standardized formats:
- Defined `tx_pkt_t` structure
- Consistent data format across all devices
- Firmware-level validation

### Version Data (FPort 2)

Sent once on simulator startup, matching firmware behavior.

**Binary Format**:

```
┌────────┬─────────┬─────────┬─────────┬─────────┐
│ Byte 0 │ Byte 1  │ Byte 2  │ Byte 3  │ Byte 4  │
├────────┼─────────┼─────────┼─────────┼─────────┤
│ 0x10   │ FW_MSB  │ FW_LSB  │ HW_MSB  │ HW_LSB  │
└────────┴─────────┴─────────┴─────────┴─────────┘
```

**Example**: `10 03 07 03 07`
- Command: `0x10`
- Firmware: v3.7
- Hardware: v3.7

### Test Data Generation

The simulator generates randomized test data to simulate device activity:

```javascript
// Generate test payload (format varies by implementation)
const testPayload = generateTestData();
```

**Characteristics**:
- Random payload generation for testing
- Simulates device uplink behavior
- Tests dashboard data processing pipeline
- Not intended to match specific sensor formats

### Signal Quality

Realistic LoRaWAN signal metrics:

```javascript
rssi = -80 + (Math.random() * 20);   // -80 to -60 dBm
snr = 5 + (Math.random() * 5);       // 5 to 10 dB
```

**Typical Values**:
- **RSSI**: -70 dBm (good signal)
- **SNR**: 7.5 dB (moderate quality)

## Message Formats

### LOCAL Mode Format

Simplified format sent directly to `/api/uplink`:

```json
{
  "devEui": "0000000000000001",
  "devAddr": "00000001",
  "fPort": 1,
  "payload": "base64_encoded_test_data",
  "receivedAt": "2025-11-02T10:30:00Z",
  "rssi": -72.3,
  "snr": 7.8,
  "latitude": 52.0116,
  "longitude": 4.7104,
  "altitude": 5
}
```

:::note[Test Data]
The `payload` field contains generic test data for development. Actual devices send raw sensor module data in base64 format.
:::

### TTN Mode Format

Complete TTN webhook format:

```json
{
  "end_device_ids": {
    "device_id": "mfm-00000001",
    "application_ids": {
      "application_id": "multiflexmeter-test"
    },
    "dev_eui": "0000000000000001",
    "dev_addr": "00000001"
  },
  "uplink_message": {
    "f_port": 1,
    "f_cnt": 42,
    "frm_payload": "base64_encoded_test_data",
    "rx_metadata": [{
      "gateway_ids": {
        "gateway_id": "simulator-gateway"
      },
      "rssi": -72.3,
      "snr": 7.8,
      "timestamp": 1730548200000
    }],
    "settings": {
      "data_rate": {
        "lora": {
          "bandwidth": 125000,
          "spreading_factor": 7
        }
      },
      "frequency": "868100000"
    },
    "received_at": "2025-11-02T10:30:00Z"
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

## Multi-Device Simulation

### Running Multiple Devices

Simulate multiple devices simultaneously:

```bash
# Simulate 5 devices
NUM_DEVICES=5 npm run simulator
```

Each device:
- Has a unique Device EUI (`0000000000000001`, `0000000000000002`, etc.)
- Has a unique location from the poldermill list
- Operates independently with randomized states
- Sends measurements with slight time offsets (0-2 second stagger)

### Viewing Multi-Device Data

**Devices Overview**:
```
http://localhost:4321/devices
```

Shows all simulated devices with status indicators.

**Filter by Device**:
```
http://localhost:4321/dashboard?device=0000000000000001
```

Shows data for a specific device only.

**All Devices**:
```
http://localhost:4321/dashboard
```

Shows combined data from all devices.

## Development Workflow

### Typical Development Session

1. **Start Astro Dev Server**:
   ```bash
   npm run dev
   ```

2. **Open Dashboard** in browser:
   ```
   http://localhost:4321/devices
   ```

3. **Start Simulator** in new terminal:
   ```bash
   npm run simulator
   ```

4. **Watch Live Updates** as data appears in dashboard

5. **Stop Simulator** with `Ctrl+C` to see statistics:
   ```
   === Simulator Stopped ===
   Mallemolen (0000000000000001): 127 frames sent
   De Roos (0000000000000002): 125 frames sent
   Molen de Valk (0000000000000003): 128 frames sent
   ```

### Combined Start (Convenience)

Start both Astro and simulator together:

```bash
npm run dev:dashboard
```

This runs `npm run dev` and `npm run simulator` concurrently.

### Testing Different Scenarios

**High-Frequency Updates**:
```bash
INTERVAL=3000 npm run simulator  # Every 3 seconds
```

**Single Device Testing**:
```bash
NUM_DEVICES=1 npm run simulator
```

**Many Devices (Stress Test)**:
```bash
NUM_DEVICES=10 INTERVAL=5000 npm run simulator
```

**Custom Endpoint** (testing deployed site):
```bash
LOCAL_ENDPOINT=https://your-site.vercel.app/api/uplink npm run simulator
```

## Troubleshooting

### Simulator Won't Connect

**Problem**: `Error: ECONNREFUSED`

**Solution**:
1. Ensure Astro dev server is running (`npm run dev`)
2. Check endpoint URL matches server address
3. Verify firewall allows local connections

### No Data in Dashboard

**Problem**: Simulator runs but dashboard shows no data

**Solution**:
1. Check browser console for errors
2. Verify SSE connection at `/api/stream`
3. Check Astro console for uplink processing messages
4. Ensure database is initialized (SQLite file created)

### TTN Mode Failures

**Problem**: `[TTN ERROR] HTTP 401` or `HTTP 404`

**Solution**:
1. Verify `TTN_APP_ID` matches your TTN application
2. Check `TTN_API_KEY` is valid and has correct permissions
3. Ensure webhook is configured in TTN console
4. Verify `TTN_REGION` matches your application region

### Simulator Blocks Production

**Problem**: Simulator data rejected in production

**Expected Behavior**: This is intentional for security.

**Solution**:
- Use simulator only in development (`npm run dev`)
- Use real devices or TTN webhook in production

## Advanced Usage

### Custom Device Configuration

Edit `simulator/device-simulator.mjs` to customize:

**Add New Location**:

```javascript
const DEVICE_LOCATIONS = [
  // ... existing locations ...
  {
    name: 'My Poldermill',
    city: 'Utrecht',
    latitude: 52.0907,
    longitude: 5.1214,
    altitude: 8
  },
];
```

**Change Firmware Version**:

```javascript
const deviceInfo = {
  // ... existing fields ...
  hwVersion: { major: 3, minor: 7 },
  fwVersion: { major: 3, minor: 7 },
};
```

**Customize Test Data**:

```javascript
function generateTestData() {
  // Create your own test payload format
  return Buffer.from([0x01, 0x02, 0x03, ...]);
}
```

### Programmatic Usage

Import and use programmatically in your own scripts:

```javascript
import { DeviceSimulator } from './simulator/device-simulator.mjs';

const simulator = new DeviceSimulator({
  name: 'Test Device',
  devEui: '0000000000000099',
  location: { latitude: 52.0, longitude: 4.7, altitude: 5 },
  hwVersion: { major: 3, minor: 7 },
  fwVersion: { major: 3, minor: 7 },
});

await simulator.start();
```

## Next Steps

- [Real-time Dashboard](/software/dashboard/) - Understanding the dashboard architecture
- [Data Formats](/firmware/data-formats/) - Complete data format specifications
- [TTN Setup](/deployment/ttn-setup/) - Configuring The Things Network
