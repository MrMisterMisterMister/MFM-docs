---
title: Software & Backend
description: Backend services, data processing, and web applications for the Multiflexmeter system
---

The Multiflexmeter software ecosystem consists of backend services for receiving LoRaWAN data, storing measurements, and providing real-time monitoring capabilities through a web dashboard.

:::note[Version Information]
This documentation covers the software architecture for **Multiflexmeter 3.7.0**. The current version operates as a sensor passthrough system, with structured data handling planned for version 3.8.0.
:::

## System Architecture Overview

The complete Multiflexmeter system consists of three main layers:

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌─────────────────┐       ┌─────────────────┐            │
│  │   Dashboard     │       │   Devices       │            │
│  │   (Browser)     │       │   Overview      │            │
│  └────────┬────────┘       └────────┬────────┘            │
└───────────┼─────────────────────────┼──────────────────────┘
            │                         │
            │ SSE Stream              │ HTTP GET
            │                         │
┌───────────┼─────────────────────────┼──────────────────────┐
│           v                         v   APPLICATION LAYER  │
│  ┌──────────────────────────────────────────────┐          │
│  │           Astro Web Application              │          │
│  │  ┌──────────────┐  ┌──────────────────────┐ │          │
│  │  │ /api/stream  │  │   /api/uplink        │ │          │
│  │  │ (SSE)        │  │   (POST endpoint)    │ │          │
│  │  └──────┬───────┘  └──────────┬───────────┘ │          │
│  └─────────┼─────────────────────┼──────────────┘          │
└────────────┼─────────────────────┼─────────────────────────┘
             │                     │
             │                     │ Store reading
             │                     v
┌────────────┼─────────────────────────────────────────────┐
│            │            DATA LAYER                       │
│            │    ┌──────────────────────────┐             │
│            │    │   Data Store             │             │
│            │    │   ├─ SQLite (dev)        │             │
│            └───>│   └─ Redis (production)  │             │
│                 └──────────────────────────┘             │
└──────────────────────────────────────────────────────────┘
                         ^
                         │ Webhook POST
                         │
┌────────────────────────┼─────────────────────────────────┐
│                        │      NETWORK LAYER              │
│  ┌─────────────────────┴──────────────┐                 │
│  │   The Things Network (TTN)         │                 │
│  │   - LoRaWAN Network Server         │                 │
│  │   - HTTP Integration               │                 │
│  │   - Webhook Delivery               │                 │
│  └─────────────────┬──────────────────┘                 │
└────────────────────┼────────────────────────────────────┘
                     ^
                     │ LoRaWAN Uplinks
                     │
┌────────────────────┼────────────────────────────────────┐
│                    │         DEVICE LAYER               │
│  ┌─────────────────┴──────────────┐                     │
│  │   Multiflexmeter Device        │                     │
│  │   - ATmega1284P Firmware       │                     │
│  │   - RFM95 LoRa Radio           │                     │
│  │   - Sensor Module (I2C 0x36)   │                     │
│  └────────────────────────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

## AS IS: Version 3.7.0 Architecture

The current firmware and software operate as a **sensor passthrough system**.

### Firmware Behavior (3.7.0)

The device firmware acts as a transparent bridge between the sensor module and LoRaWAN network:

1. **Measurement Trigger**: Sends `CMD_PERFORM (0x10)` to sensor module at I2C address `0x36`
2. **Wait Period**: Delays 10 seconds for measurement completion
3. **Data Retrieval**: Reads raw sensor data via SMBus Block Read (`CMD_READ 0x11`)
4. **Passthrough Transmission**: Sends unmodified sensor bytes via LoRaWAN FPort 1

**Key Characteristics**:
- **No data interpretation** at firmware level
- **No validation** of sensor data format
- **No structure** imposed on payload
- **Maximum 32 bytes** per transmission (SMBus Block Read limit)

### Data Flow (3.7.0)

```
Sensor Module (0x36)
  │
  │ SMBus Block Read
  │ (raw bytes, format unknown to firmware)
  v
Multiflexmeter Firmware
  │
  │ LoRaWAN FPort 1
  │ (raw passthrough, base64 encoded)
  v
The Things Network
  │
  │ HTTP Webhook
  │ (TTN format with base64 payload)
  v
/api/uplink Endpoint
  │
  │ Store raw + decoded (if available)
  v
Data Store (SQLite/Redis)
  │
  │ SSE Stream
  v
Dashboard
  │
  │ Application-level decoding
  v
User Interface
```

### Implications for Software (3.7.0)

**Backend Responsibilities**:
- Receive raw base64 encoded payloads from TTN
- Store payloads without interpretation
- Forward raw data to dashboard via SSE
- Optionally apply TTN payload formatters for decoding

**Dashboard Responsibilities**:
- Implement application-level decoding based on sensor module
- Handle variable data formats
- Provide visualization for sensor-specific data
- No standardized data structure guaranteed

**Data Format Dependencies**:
- Data structure depends entirely on sensor module at address `0x36`
- Different sensor modules = different data formats
- No firmware-enforced schema
- Application must know which sensor is connected

### Limitations (3.7.0)

1. **No Firmware Validation**: Invalid sensor data is transmitted as-is
2. **No Type Safety**: Data format changes require application updates
3. **Debugging Complexity**: Raw bytes require manual decoding
4. **No Self-Description**: Payload doesn't identify sensor type or format
5. **Application Coupling**: Dashboard tightly coupled to specific sensor implementation

## TO BE: Version 3.8.0 Architecture

The planned firmware will implement **structured data handling** with standardized formats.

### Firmware Changes (3.8.0)

The firmware will decode sensor data into a defined structure:

```cpp
struct tx_pkt_t {
    uint8_t flags;           // Bit 0: spinning, Bit 1: pumping
    uint32_t revolutions;    // Total revolution counter
};
```

**New Behavior**:
1. **Measurement Trigger**: Same as 3.7.0
2. **Data Retrieval**: Same as 3.7.0
3. **Firmware Decoding**: Parse sensor bytes into `tx_pkt_t` structure
4. **Validation**: Check ranges and data integrity
5. **Structured Transmission**: Send validated `tx_pkt_t` via LoRaWAN FPort 1

### Data Flow (3.8.0)

```
Sensor Module (0x36)
  │
  │ SMBus Block Read
  │ (raw bytes)
  v
Multiflexmeter Firmware
  │
  │ Decode into tx_pkt_t
  │ Validate fields
  v
Structured Payload
  │
  │ LoRaWAN FPort 1
  │ (standardized format)
  v
The Things Network
  │
  │ HTTP Webhook
  │ (structured JSON via payload formatter)
  v
/api/uplink Endpoint
  │
  │ Store with known schema
  v
Data Store (SQLite/Redis)
  │
  │ SSE Stream
  │ (typed data)
  v
Dashboard
  │
  │ Direct visualization (no decoding needed)
  v
User Interface
```

### Benefits (3.8.0)

1. **Firmware Validation**: Invalid data caught before transmission
2. **Type Safety**: Consistent data structure across all devices
3. **Simplified Debugging**: Human-readable structured data
4. **Self-Describing**: Format known from FPort and version
5. **Decoupled Application**: Dashboard works with any 3.8.0 device

### Migration Path

**Backward Compatibility**:
- 3.7.0 and 3.8.0 devices can coexist on same network
- Backend identifies version from FPort 2 version message
- Dashboard handles both raw (3.7.0) and structured (3.8.0) data

**Upgrade Process**:
1. Deploy backend changes to support both formats
2. Update dashboard with dual-mode rendering
3. Flash 3.8.0 firmware to devices
4. Verify structured data reception
5. Gradually phase out 3.7.0 support

## Backend Components

### Web Application (Astro)

**Technology**: Astro 5.x with SSR (Vercel adapter)

**Key Features**:
- Server-side rendering for API endpoints
- Static generation for documentation pages
- Hybrid routing (static + dynamic)

**Endpoints**:
- `POST /api/uplink` - Receives data from TTN webhook or simulator
- `GET /api/uplink` - Status endpoint for debugging
- `GET /api/stream` - Server-Sent Events stream for real-time updates
- `/dashboard` - Real-time monitoring dashboard
- `/devices` - Device overview page

### Data Storage

**Development Environment**:
- **SQLite** database at `data/multiflexmeter.db`
- Automatic creation on first run
- Persistent across server restarts
- No configuration required

**Production Environment**:
- **Redis** via `ioredis` library
- Serverless-friendly persistence
- Compatible with Vercel Redis, Upstash, Railway Redis
- Environment variable: `REDIS_URL`

**Hybrid Caching**:
- In-memory cache for last 200 readings
- Fast SSE delivery
- Automatic cache trimming

### Real-time Streaming

**Protocol**: Server-Sent Events (SSE)

**Event Types**:
1. `connected` - Initial connection confirmation
2. `history` - Last 100 readings sent on connect
3. `reading` - New reading broadcast to all clients

**Characteristics**:
- Automatic reconnection
- One-way server-to-client push
- Lower overhead than WebSockets
- Works through firewalls

## Frontend Components

### Dashboard

Interactive web interface for real-time monitoring:

- **Chart.js Visualizations**: Time-series graphs
- **Live Updates**: SSE-powered real-time data
- **Device Filtering**: View specific device or all devices
- **Activity Log**: Event stream with timestamps
- **Glassmorphism Design**: Modern dark theme UI
- **WCAG 2.1 Level AA**: Accessible design

[Learn more about the dashboard →](/software/dashboard/)

### Devices Overview

Device management interface:

- List all registered devices
- Hardware and firmware versions
- Last update timestamps
- Online/offline status
- Quick links to individual dashboards

## Development Tools

### Device Simulator

Testing tool for dashboard development without hardware:

**Modes**:
- **LOCAL**: Direct connection to Astro dev server
- **TTN**: Simulates via TTN HTTP Integration API

**Features**:
- Multiple device simulation
- Configurable intervals
- Realistic signal quality (RSSI/SNR)
- Real Dutch poldermill locations

[Learn more about the simulator →](/development/simulator/)

### Local Development

**Start Dashboard**:
```bash
npm run dev
```

**Start Simulator**:
```bash
npm run simulator
```

**Combined Start**:
```bash
npm run dev:dashboard
```

## Deployment

### Production Requirements

**Environment Variables**:
```bash
REDIS_URL=redis://default:password@host:6379
WEBHOOK_USERNAME=multiflexmeter
WEBHOOK_PASSWORD=your-secure-random-password
SITE_URL=https://your-domain.com
```

**Platform**: Vercel (recommended)
- Automatic deployments from Git
- Integrated Redis database
- SSR support
- Edge functions

**Alternative Platforms**:
- Netlify (requires adapter change)
- Railway (with Redis addon)
- Render (with Redis service)

### TTN Webhook Configuration

Configure The Things Network to send data to backend:

1. Navigate to TTN Console → Integrations → Webhooks
2. Create webhook:
   - **Webhook ID**: `multiflexmeter-dashboard`
   - **Webhook format**: JSON
   - **Base URL**: `https://your-domain.com/api/uplink`
   - **Enabled messages**: Uplink message
3. Add authentication header:
   - **Authorization**: `Basic <base64(username:password)>`

[Detailed TTN setup →](/deployment/ttn-setup/)

## Security Considerations

### Production Security

**Webhook Authentication**:
- Basic Authentication required for `/api/uplink` in production
- Credentials validated on every request
- Simulator data rejected in production builds

**Environment Checks**:
```javascript
if (import.meta.env.DEV) {
  // Accept simulator data
} else {
  // Require TTN authentication
}
```

**Redis Security**:
- Use TLS-enabled connections (`rediss://`)
- Rotate credentials regularly
- Restrict network access to backend only

### Data Privacy

**No PII Storage**:
- Device EUIs are technical identifiers
- Location data is deployment metadata
- No user-identifiable information

**Data Retention**:
- Recent readings cache (200 entries)
- Configurable retention policies
- Manual cleanup scripts available

## API Reference

### POST /api/uplink

Receives uplink messages from TTN or simulator.

**Authentication**: Basic Auth (production only)

**TTN Request Format**:
```json
{
  "end_device_ids": {
    "dev_eui": "0000000000000001"
  },
  "uplink_message": {
    "f_port": 1,
    "frm_payload": "base64_encoded_data",
    "rx_metadata": [{"rssi": -85, "snr": 8.5}]
  }
}
```

**Response**:
```json
{
  "success": true,
  "message": "Uplink processed"
}
```

### GET /api/uplink

Returns system status and recent readings.

**Response**:
```json
{
  "status": "running",
  "devices": [...],
  "recentReadings": [...],
  "totalReadings": 245
}
```

### GET /api/stream

Server-Sent Events stream for real-time updates.

**Client Connection**:
```javascript
const eventSource = new EventSource('/api/stream');

eventSource.addEventListener('reading', (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data.reading);
});
```

## Performance Considerations

### Scalability

**Current Limits**:
- Up to 100 concurrent SSE connections
- 200 readings in-memory cache
- 10,000+ readings in persistent storage

**Optimization Strategies**:
- Use Redis for horizontal scaling
- Implement pagination for historical data
- Cache frequently accessed data
- Use CDN for static assets

### Monitoring

**Metrics to Track**:
- Uplink processing time
- SSE connection count
- Database query performance
- Memory usage

**Recommended Tools**:
- Vercel Analytics (production metrics)
- Browser DevTools (client-side debugging)
- Redis monitoring tools

## Future Enhancements

### Planned Features

**Version 3.8.0**:
- Structured data handling (`tx_pkt_t`)
- Firmware-level validation
- Standardized payload formats

**Beyond 3.8.0**:
- Historical data export (CSV, JSON)
- Advanced charting (zoom, pan, annotations)
- Alert system for threshold violations
- Multi-user access control
- Mobile-responsive improvements
- GraphQL API layer

## Related Documentation

- [Dashboard Documentation](/software/dashboard/) - Detailed dashboard guide
- [Device Simulator](/development/simulator/) - Testing with simulated devices
- [Data Formats](/firmware/data-formats/) - Payload specifications
- [Deployment Guide](/deployment/configuration/) - Production setup
- [TTN Setup](/deployment/ttn-setup/) - The Things Network configuration

---

**Current Status**: Version 3.7.0 (Passthrough Architecture)
**Next Release**: Version 3.8.0 (Structured Data)
**Platform**: Astro 5.x + Vercel + Redis
**License**: MIT
