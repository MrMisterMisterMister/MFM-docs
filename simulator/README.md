# Multiflexmeter Simulator & Real-time Dashboard

This directory contains a complete simulation and visualization system for the Multiflexmeter IoT device.

## IMPORTANT: Development Only

**The device simulator is intended for DEVELOPMENT ENVIRONMENTS ONLY.**

- **Development**: Simulator works and sends mock data for testing
- **Production**: Simulator is automatically blocked by the API
- **Security**: Production environment only accepts real TTN webhook data

The `/api/uplink` endpoint checks `import.meta.env.DEV` and returns a 403 error if simulator data is received in production builds.

## Overview

The system consists of:

1. **Device Simulator** (`device-simulator.mjs`) - Simulates the Multiflexmeter sending LoRaWAN data (FPort 2 & 3)
2. **FPort 1 Simulator** (`fport1-simulator.mjs`) - Simulates distance and temperature sensors (FPort 1)
3. **Astro Dashboard** - Real-time web dashboard with Tailwind CSS + Chart.js visualization
4. **API Endpoints** - Receive uplinks and stream data via Server-Sent Events (SSE)
5. **Redis Database** - Persistent storage for all sensor readings and device information

## Features

- Simulates poldermill-specific data (spinning, pumping status)
- Supports both LOCAL and TTN modes
- Real-time dashboard updates via SSE
- Beautiful dark theme with glassmorphism design (Tailwind CSS + SCSS)
- Chart.js visualizations with gradient fills
- **Persistent data storage** with SQLite (survives server restarts!)
- Device management and statistics
- Activity log with recent events
- Matches actual firmware data format (FPort 1, 2 & 3)
- **Multi-device support** with 5+ simulated Dutch poldermills
- **Separate simulators** for different sensor types (poldermill vs distance/temperature)
- **WCAG 2.1 Level AA compliant** dashboard

## Quick Start

### 1. Install Dependencies

From the `MFM-docs` directory:

```bash
npm install
```

### 2. Start the Astro Dev Server

```bash
npm run dev
```

The Astro server will start on `http://localhost:4321`

### 3. Start the Device Simulator

Choose one of the following simulators based on what you want to test:

#### Option A: Main Simulator (FPort 2 & 3 - Status/Rotations)

```bash
node simulator/device-simulator.mjs
```

#### Option B: FPort 1 Simulator (Distance & Temperature)

```bash
node simulator/fport1-simulator.mjs
```

#### Option C: Both Simulators (Full System Test)

```bash
# Terminal 1
node simulator/device-simulator.mjs

# Terminal 2
node simulator/fport1-simulator.mjs
```

**Note**: The simulators will only work in development mode. Production builds will reject simulator data.

### 4. Open the Dashboard

Navigate to: `http://localhost:4321/dashboard`

You should see real-time sensor data updating every 10 seconds!

## Configuration

### Local Mode (Default)

No configuration needed! The simulator sends data directly to the Astro endpoint in development.

### TTN Mode (Production)

To integrate with a real TTN application:

1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and configure:
   ```bash
   MODE=TTN
   TTN_APP_ID=your-application-id
   TTN_API_KEY=your-api-key
   TTN_REGION=eu1  # or nam1, au1, etc.
   ```

3. Configure TTN webhook:
   - In TTN Console, go to your application
   - Add a webhook integration
   - Set URL to: `http://your-server:4321/api/uplink`
   - Set format: JSON

4. Deploy to production - the simulator will be automatically blocked

## Architecture

### Data Flow

```
[Device Simulator] --> [TTN Network] --> [TTN Webhook] --> [Astro API /api/uplink]
  (DEV ONLY)       \                                          |
                    \--> [Local Mode] ---------------------->/
                         (DEV ONLY)                          |
                                                             v
                                                      [Production Check]
                                                             |
                                          DEV --> [Process Data]
                                          PROD --> [403 Forbidden]
                                                              |
                                                              v
                                                        [Data Store]
                                                        (in-memory cache)
                                                              |
                                                              v
                                                       [SQLite Database]
                                                       (persistent storage)
                                                              |
                                                              v
                                                        [SSE Stream]
                                                     /api/stream
                                                              |
                                                              v
                                                        [Dashboard]
                                                   /dashboard (Tailwind + Chart.js)
```

**Key Components:**
- **In-memory cache**: Last 200 readings for fast SSE streaming
- **Vercel KV (Redis)**: All historical data persisted to cloud storage
- **Hybrid approach**: Best of both worlds - speed + serverless-friendly persistence

### API Endpoints

#### POST /api/uplink
Receives uplink messages from either:
- Device simulator (local mode)
- TTN webhook (TTN mode)

**Local Format:**
```json
{
  "devEui": "0000000000000001",
  "devAddr": "00000001",
  "fPort": 1,
  "payload": "base64-encoded-payload",
  "receivedAt": "2025-10-30T12:34:56Z",
  "decoded": {
    "spinning": true,
    "pumping": false,
    "revolutions": 25
  },
  "rssi": -75,
  "snr": 9.5
}
```

**TTN Format:**
```json
{
  "end_device_ids": {
    "device_id": "mfm-00000001",
    "dev_eui": "0000000000000001",
    "dev_addr": "00000001"
  },
  "uplink_message": {
    "f_port": 1,
    "frm_payload": "base64-encoded-payload",
    "rx_metadata": [{ "rssi": -75, "snr": 9.5 }],
    "received_at": "2025-10-30T12:34:56Z"
  }
}
```

#### GET /api/uplink
Returns current status and recent readings (for debugging).

#### GET /api/stream
Server-Sent Events stream for real-time updates.

**Event Types:**
- `connected` - Initial connection established
- `history` - Historical readings on connect
- `reading` - New sensor reading

### Data Format

Matches the actual Multiflexmeter firmware format:

**FPort 1 (Distance & Temperature):**
```
6 bytes total:
Bytes 0-1: Distance (uint16 LE) in millimeters
Bytes 2-5: Temperature (float32 LE) in Celsius (IEEE 754)
```

**FPort 2 (Version Info):**
```
5 bytes total:
Byte 0: Command (0x10)
Bytes 1-2: Firmware Version (uint16 BE, encoded)
Bytes 3-4: Hardware Version (uint16 BE, encoded)
```

**FPort 3 (Status & Cumulative Counters):**
```
9 bytes total:
Byte 0: Status flags (bit 0 = spinning, bit 1 = pumping)
Bytes 1-4: Total rotations pumping (uint32 LE)
Bytes 5-8: Total rotations spinning (uint32 LE)
```

## Customization

### Change Simulation Interval

```bash
INTERVAL=5000 node simulator/device-simulator.mjs  # Every 5 seconds
```

### Dashboard Styling

Edit `src/pages/dashboard.astro` to customize:
- Colors and styling (in `<style>` section)
- Chart configuration (in `<script>` section)
- Layout and components (in HTML)

## Troubleshooting

### Dashboard shows "Disconnected"

1. Check that Astro dev server is running (`npm run dev`)
2. Check browser console for errors
3. Verify SSE endpoint: `http://localhost:4321/api/stream`

### Simulator shows connection errors

1. Ensure Astro dev server is running
2. Check endpoint URL matches: `http://localhost:4321/api/uplink`
3. For TTN mode, verify API key and webhook configuration

### No data on dashboard

1. Check that simulator is running
2. Check simulator console for "Sent" messages
3. Check Astro console for "New reading" messages
4. Visit `http://localhost:4321/api/uplink` to see recent data

### TypeScript errors

Astro may need the node types. Install if needed:

```bash
npm install -D @types/node
```

## Production Deployment

### Deploy to Vercel (Recommended)

The dashboard is pre-configured for **Vercel deployment** with Vercel KV (Redis) for data storage.

**Quick Start:**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from project directory
cd MFM-docs
vercel

# Or push to GitHub and import in Vercel dashboard
```

**Complete Deployment Guide:** See `VERCEL_DEPLOYMENT.md` for detailed instructions including:
- Creating a Vercel KV store
- Configuring environment variables
- Setting up TTN webhooks
- Monitoring and debugging

### Alternative Deployment Options

The dashboard can also be deployed to other platforms with SSR support:
- **Netlify**: Use `@astrojs/netlify` adapter
- **Railway**: Use `@astrojs/node` adapter
- **Render**: Use `@astrojs/node` adapter

Note: You'll need to replace Vercel KV with an alternative Redis provider or use a different database.

### TTN Webhook Configuration

Configure TTN webhook to point to your production URL:

```
https://your-project.vercel.app/api/uplink
```

## Examples

### Run simulator with custom device EUI

```bash
DEV_EUI=70B3D57ED005A4B2 node simulator/device-simulator.mjs
```

### Run multiple simulators (different devices)

```bash
# Terminal 1
DEV_EUI=0000000000000001 INTERVAL=10000 node simulator/device-simulator.mjs

# Terminal 2
DEV_EUI=0000000000000002 INTERVAL=15000 node simulator/device-simulator.mjs
```

### Test with curl

Send a test uplink:

```bash
curl -X POST http://localhost:4321/api/uplink \
  -H "Content-Type: application/json" \
  -d '{
    "devEui": "0000000000000001",
    "fPort": 1,
    "payload": "NgEBTgQBA",
    "receivedAt": "2025-10-30T12:00:00Z"
  }'
```

## License

Same as parent project (see repository root).

## Support

For issues or questions, see the main project documentation or create an issue in the GitHub repository.
