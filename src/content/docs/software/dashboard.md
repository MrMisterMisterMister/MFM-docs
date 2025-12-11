---
title: Real-time Dashboard
description: Real-time monitoring dashboard for Multiflexmeter devices with live data visualization, Chart.js graphs, and Server-Sent Events.
---

The Multiflexmeter includes a real-time web dashboard for monitoring sensor data from one or more devices. The dashboard uses Server-Sent Events (SSE) for live updates and Chart.js for interactive data visualization.

:::note[Firmware Version]
This documentation covers the dashboard for **Multiflexmeter 3.7.0**, which operates as a **sensor passthrough** (transmits raw sensor data without firmware-level interpretation). The data format depends on the sensor module connected at I²C address 0x36.
:::

## Overview

The dashboard provides real-time monitoring with:

- **Live Updates**: Server-Sent Events stream data as it arrives
- **Interactive Charts**: Sensor data visualization with Chart.js
- **Device Status**: Online/offline indicators and activity monitoring
- **Activity Log**: Real-time event stream with timestamps
- **Multi-Device Support**: Filter by device or view all devices

## Accessing the Dashboard

### Devices Overview

Navigate to `/devices` to see all registered devices:

```
http://your-domain/devices
```

Features:
- List of all devices with status indicators
- Hardware and firmware version information
- Last update timestamps
- Quick links to individual device dashboards

### Individual Device Dashboard

Navigate to `/dashboard` with optional device filter:

```
http://your-domain/dashboard
http://your-domain/dashboard?device=0000000000000001
```

Features:
- Real-time sensor data visualization
- Generic sensor data charts (format depends on sensor module)
- Device information panel
- Activity log with recent events

## Dashboard Components

### AS IS (Version 3.7.0)

The current dashboard displays data from the **sensor passthrough** firmware. The firmware transmits sensor module responses directly via LoRaWAN FPort 1 without firmware-level interpretation.

**Key Characteristics**:
- **Passthrough architecture**: Firmware does not decode sensor data
- Data format depends on the sensor module at I²C address 0x36
- Dashboard receives raw bytes encoded in base64
- Application-level decoding required for meaningful visualization
- No standardized data structure at firmware level

### TO BE (Version 3.8.0)

Future versions will implement structured data handling with standardized formats:
- Defined `tx_pkt_t` structure (distance_to_water, air_temperature)
- Firmware-level data validation
- Standardized visualization across all devices

### Sensor Chart

Interactive time-series chart for sensor data visualization:

- **Generic Data Display**: Visualizes sensor readings based on connected module
- **Time Axis**: Automatically scales based on data range
- **Zoom/Pan**: Interactive chart controls
- **Auto-Update**: New data points added in real-time

**Chart Configuration** (generic example):

```javascript
{
  type: 'line',
  data: {
    datasets: [
      {
        label: 'Sensor Reading',
        data: sensorData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
      }
    ]
  },
  options: {
    scales: {
      x: {
        type: 'time',
        time: { unit: 'minute' }
      }
    }
  }
}
```

:::caution[Data Interpretation]
In version 3.7.0, the dashboard must implement application-level decoding based on the specific sensor module in use. The data format is not standardized at the firmware level.
:::

### Device Information Panel

Shows device metadata:

- **Device EUI**: LoRaWAN device identifier
- **Hardware Version**: Current hardware revision
- **Firmware Version**: Current firmware version
- **Last Update**: Timestamp of most recent reading
- **Signal Quality**: RSSI and SNR values

### Activity Log

Real-time stream of device events:

- **Timestamp**: Precise event time
- **Event Type**: Measurement, join, status change
- **Event Details**: Decoded sensor values
- **Auto-Scroll**: Newest events appear at the top

## Data Flow Architecture

### Client-Server Communication

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Device     │         │   TTN        │         │   Server     │
│  (Hardware)  │────────>│  (LoRaWAN)   │────────>│  /api/uplink │
└──────────────┘         └──────────────┘         └──────┬───────┘
                                                          │
                                                          v
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│  Dashboard   │<────────│   SSE Stream │<────────│  Data Store  │
│  (Browser)   │         │ /api/stream  │         │ (Redis/SQLite)│
└──────────────┘         └──────────────┘         └──────────────┘
```

### Data Processing Pipeline

1. **Device Transmission**: Multiflexmeter sends LoRaWAN uplink
2. **TTN Processing**: The Things Network receives and forwards to webhook
3. **Uplink Endpoint**: `/api/uplink` receives and validates data
4. **Data Storage**: Reading stored in database (Redis in production, SQLite in dev)
5. **SSE Broadcast**: New reading broadcast to all connected dashboard clients
6. **Dashboard Update**: Browser receives event and updates UI in real-time

## API Endpoints

### POST /api/uplink

Receives uplink messages from TTN webhook or device simulator.

**Authentication**:
- **Production**: Basic Authentication required (validates `WEBHOOK_USERNAME` and `WEBHOOK_PASSWORD`)
- **Development**: Authentication automatically skipped when `import.meta.env.DEV === true` to allow local simulator testing

:::note[Development vs Production]
The endpoint automatically detects the environment:
- In **development** (`npm run dev`): Accepts both authenticated TTN webhooks AND unauthenticated local simulator messages
- In **production** (deployed builds): Only accepts authenticated TTN webhook payloads, rejects simulator format for security

This allows you to test locally with the simulator without configuring authentication, while ensuring production security.
:::

**Request Format (TTN Webhook)**:

```json
{
  "end_device_ids": {
    "dev_eui": "0000000000000001",
    "dev_addr": "00000001"
  },
  "uplink_message": {
    "f_port": 1,
    "frm_payload": "NjEBAAEwP2Y=",
    "received_at": "2025-11-02T10:30:00Z",
    "rx_metadata": [{
      "rssi": -85,
      "snr": 8.5
    }],
    "decoded_payload": {
      "raw_data": "raw sensor bytes",
      "module_address": "0x36",
      "note": "Actual format depends on sensor module"
    }
  },
  "locations": {
    "user": {
      "latitude": 52.0107,
      "longitude": 4.7093,
      "altitude": 5
    }
  }
}
```

**Request Format (Local Simulator)**:

```json
{
  "devEui": "0000000000000001",
  "devAddr": "00000001",
  "fPort": 1,
  "payload": "NjEBAAEwP2Y=",
  "receivedAt": "2025-11-02T10:30:00Z",
  "decoded": {
    "raw_data": "generic test data",
    "note": "Simulator sends test data for development"
  },
  "rssi": -85,
  "snr": 8.5,
  "latitude": 52.0107,
  "longitude": 4.7093,
  "altitude": 5
}
```

**Response**:

```json
{
  "success": true,
  "message": "Uplink processed"
}
```

:::note[Raw Data Handling]
The `/api/uplink` endpoint receives raw sensor data from FPort 1. In version 3.7.0, this is unstructured data that depends on the sensor module. The endpoint stores the raw payload and any decoded fields provided by TTN payload formatters.
:::

:::caution[Production Security]
In production, the simulator format is rejected. Only authenticated TTN webhook payloads are accepted.
:::

### GET /api/uplink

Returns current system status and recent readings.

**Response**:

```json
{
  "status": "running",
  "devices": [
    {
      "devEui": "0000000000000001",
      "devAddr": "00000001",
      "hwVersion": "1.2.0",
      "fwVersion": "3.7.0",
      "lastSeen": "2025-11-02T10:30:00Z"
    }
  ],
  "recentReadings": [...],
  "totalReadings": 245
}
```

### GET /api/stream

Server-Sent Events stream for real-time updates.

**Event Types**:

**1. Connected Event**:

```
event: connected
data: {"message":"Connected to Multiflexmeter stream"}
```

**2. History Event** (sent immediately after connection):

```
event: history
data: {"readings":[...last 100 readings...]}
```

**3. Reading Event** (sent when new data arrives):

```
event: reading
data: {
  "type": "reading",
  "reading": {
    "devEui": "0000000000000001",
    "timestamp": "2025-11-02T10:30:00Z",
    "fPort": 1,
    "payload": "base64_encoded_raw_data",
    "decoded": {
      "note": "Format depends on sensor module at 0x36"
    },
    "rssi": -85,
    "snr": 8.5
  }
}
```

**Client-Side Connection**:

```javascript
const eventSource = new EventSource('/api/stream');

eventSource.addEventListener('connected', (event) => {
  console.log('Connected to stream');
});

eventSource.addEventListener('history', (event) => {
  const data = JSON.parse(event.data);
  populateInitialData(data.readings);
});

eventSource.addEventListener('reading', (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data.reading);
});

eventSource.onerror = (error) => {
  console.error('SSE connection error:', error);
};
```

## Data Storage

### Development Environment

**SQLite Database**:
- Location: `data/multiflexmeter.db`
- Automatic creation on first run
- Persistent across server restarts
- No configuration required

**Tables**:

```sql
CREATE TABLE devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devEui TEXT UNIQUE NOT NULL,
  devAddr TEXT,
  hwVersion TEXT,
  fwVersion TEXT,
  lastSeen TEXT,
  locationName TEXT,
  locationCity TEXT,
  latitude REAL,
  longitude REAL,
  altitude REAL
);

CREATE TABLE readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  devEui TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  fPort INTEGER,
  payload TEXT,
  decoded TEXT,
  rssi REAL,
  snr REAL,
  FOREIGN KEY (devEui) REFERENCES devices(devEui)
);
```

### Production Environment

**Redis Storage**:
- Native Redis via `ioredis` library
- Serverless-friendly persistence
- Environment variable: `REDIS_URL`

**Data Structures**:

```
devices:{devEui}        Hash of device metadata
readings:recent         Sorted set of recent readings (last 200)
reading:{id}            Hash of individual reading data
```

**Example**:

```bash
# Store device
HSET devices:0000000000000001 devEui "0000000000000001" \
  hwVersion "1.2.0" fwVersion "3.7.0" lastSeen "2025-11-02T10:30:00Z"

# Store reading
ZADD readings:recent 1730548200 "reading:12345"
HSET reading:12345 devEui "0000000000000001" payload "base64data" \
  decoded "{...}" timestamp "2025-11-02T10:30:00Z"
```

### Hybrid Caching

Both environments use an in-memory cache for optimal performance:

```javascript
{
  recentReadings: [],     // Last 200 readings in memory
  maxCacheSize: 200,      // Automatic trimming
  updateInterval: 1000    // 1 second debounce for SSE
}
```

## Deployment

### Environment Variables

Required for production deployment:

```bash
# Redis connection (production only)
REDIS_URL=redis://default:password@host:6379

# Webhook authentication (production only)
WEBHOOK_USERNAME=multiflexmeter
WEBHOOK_PASSWORD=your-secure-random-password

# Site URL
SITE_URL=https://your-domain.com
```

Generate secure webhook password:

```bash
openssl rand -base64 32
```

### TTN Webhook Configuration

Configure The Things Network to send data to your dashboard:

1. Navigate to your application in TTN Console
2. Go to **Integrations** → **Webhooks**
3. Create new webhook with:
   - **Webhook ID**: `multiflexmeter-dashboard`
   - **Webhook format**: JSON
   - **Base URL**: `https://your-domain.com/api/uplink`
   - **Enabled messages**: Check "Uplink message"

4. Add custom header for authentication:
   - **Authorization**: `Basic <base64 encoded credentials>`

5. Test webhook connection

**Generate Authorization Header**:

```bash
echo -n "username:password" | base64
# Returns: dXNlcm5hbWU6cGFzc3dvcmQ=
```

Use in webhook:
```
Authorization: Basic dXNlcm5hbWU6cGFzc3dvcmQ=
```

### Vercel Deployment

The dashboard is optimized for Vercel deployment:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables** in Vercel dashboard:
   - `REDIS_URL`
   - `WEBHOOK_USERNAME`
   - `WEBHOOK_PASSWORD`
   - `SITE_URL`

4. **Create Redis Database**:
   - Vercel: Project → Storage → Create Redis Database
   - Or use external provider (Upstash, Redis Cloud, etc.)

5. **Redeploy** to apply environment variables

## Development Workflow

### Running Locally

Start the development server:

```bash
npm run dev
```

The dashboard is available at:
- Main dashboard: `http://localhost:4321/dashboard`
- Devices overview: `http://localhost:4321/devices`

### Using the Simulator

Start the device simulator to generate test data:

```bash
npm run simulator
```

The simulator will:
1. Generate generic test sensor data
2. Send uplink messages to `/api/uplink`
3. Simulate multiple devices with different patterns
4. Update every 10 seconds (configurable via `INTERVAL` env var)

:::note[Test Data Format]
The simulator generates test data for development purposes. In version 3.7.0, the actual data format depends on the sensor module connected to the device.
:::

**Custom Interval**:

```bash
INTERVAL=5000 npm run simulator  # Update every 5 seconds
```

**Multiple Devices**:

Run multiple simulators with different device IDs:

```bash
# Terminal 1
DEV_EUI=0000000000000001 npm run simulator

# Terminal 2
DEV_EUI=0000000000000002 npm run simulator
```

### Debugging

Enable debug logging in the browser console:

```javascript
// Enable SSE debug logging
localStorage.setItem('debug:sse', 'true');

// View cached readings
console.log(window.dashboardData.recentReadings);

// View Chart.js instance
console.log(window.sensorChart);
```

Server-side logging is automatic in development mode.

## Next Steps

- [Device Simulator](/development/simulator/) - Testing with simulated devices
- [Data Formats](/firmware/data-formats/) - Understanding payload structures
- [Deployment Configuration](/deployment/configuration/) - Production setup
