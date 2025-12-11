#!/usr/bin/env node

/**
 * FPort 1 Simulator - Distance and Temperature
 *
 * Simulates Multiflexmeter devices sending distance and temperature data (FPort 1)
 * This is a separate simulator for testing the distance/temperature payload format.
 *
 * Modes:
 *  - TTN: Sends data via TTN HTTP Integration API
 *  - LOCAL: Sends data directly to local Astro endpoint (bypasses TTN)
 *
 * Data Format:
 *  - FPort 1: Distance (uint16 LE) + Temperature (float32 LE)
 *    - Bytes 0-1: distance in mm (uint16 LE)
 *    - Bytes 2-5: temperature in Celsius (float32 LE)
 *
 * Environment Variables:
 *  - NUM_DEVICES: Number of devices to simulate (default: 1)
 *  - INTERVAL: Milliseconds between measurements per device (default: 30000)
 */

// Configuration
const CONFIG = {
  mode: process.env.MODE || 'LOCAL', // 'TTN' or 'LOCAL'

  // Local mode settings
  local: {
  endpoint: process.env.LOCAL_ENDPOINT || 'http://localhost:4321/api/uplink',
  },

  // TTN mode settings (requires TTN Application setup)
  ttn: {
  appId: process.env.TTN_APP_ID || 'your-app-id',
  apiKey: process.env.TTN_API_KEY || 'your-api-key',
  region: process.env.TTN_REGION || 'eu1', // eu1, nam1, au1, etc.
  },

  // Multi-device settings
  numDevices: parseInt(process.env.NUM_DEVICES || '1'),

  // Simulation settings
  simulation: {
  interval: parseInt(process.env.INTERVAL || '30000'), // ms between measurements
  }
};

// Device locations for simulation (real Dutch poldermills with GPS coordinates)
const DEVICE_LOCATIONS = [
  { name: 'Mallemolen', city: 'Gouda', latitude: 52.0116, longitude: 4.7104, altitude: 5 },
  { name: 'De Roos', city: 'Delft', latitude: 52.0116, longitude: 4.3571, altitude: 3 },
  { name: 'Molen de Valk', city: 'Leiden', latitude: 52.1595, longitude: 4.4869, altitude: 2 },
  { name: 'De Zwaan', city: 'Rotterdam', latitude: 51.9225, longitude: 4.4792, altitude: 4 },
  { name: 'Windlust', city: 'Amsterdam', latitude: 52.3676, longitude: 4.9041, altitude: 1 },
];

// Distance and Temperature sensor simulator
class SensorSimulator {
  constructor() {
  this.baseDistance = 1500; // Base water level distance in mm
  this.baseTemperature = 15; // Base temperature in Celsius
  }

  /**
   * Generate distance sensor reading (in mm)
   * Simulates water level changes over time
   */
  generateDistance() {
  // Simulate water level variations (500mm to 3000mm)
  // Use sine wave for realistic water level changes
  const variation = Math.sin(Date.now() / 100000) * 500;
  const noise = (Math.random() - 0.5) * 100;
  return Math.floor(this.baseDistance + variation + noise);
  }

  /**
   * Generate temperature reading (in Celsius)
   * Simulates temperature variations over time
   */
  generateTemperature() {
  // Simulate temperature variations (5°C to 25°C)
  // Use sine wave for daily temperature cycle
  const dailyCycle = Math.sin(Date.now() / 200000) * 5;
  const noise = (Math.random() - 0.5) * 2;
  return this.baseTemperature + dailyCycle + noise;
  }

  /**
   * Convert float to 4-byte array (LSB first, IEEE 754)
   */
  floatToBytes(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeFloatLE(value, 0);
  return buffer;
  }

  /**
   * Generate FPort 1 packet: distance + temperature
   * Format: 6 bytes total
   *   - Bytes 0-1: distance (uint16 LE)
   *   - Bytes 2-5: temperature (float32 LE)
   */
  generateDistanceTemperature() {
  const distance = this.generateDistance();
  const temperature = this.generateTemperature();

  const buffer = Buffer.alloc(6);
  buffer.writeUInt16LE(distance, 0);

  const tempBytes = this.floatToBytes(temperature);
  tempBytes.copy(buffer, 2);

  return {
      buffer,
      decoded: {
    distance,
    temperature: parseFloat(temperature.toFixed(2))
      }
  };
  }
}

// TTN Message formatter
class TTNMessage {
  static create(devEui, devAddr, fPort, payload, locationInfo = null, decoded = null) {
  const now = new Date();

  const message = {
      end_device_ids: {
    device_id: `mfm-${devEui.slice(-8)}`,
    application_ids: {
          application_id: CONFIG.ttn.appId
    },
    dev_eui: devEui,
    dev_addr: devAddr
      },
      received_at: now.toISOString(),
      uplink_message: {
    f_port: fPort,
    f_cnt: Math.floor(Math.random() * 65536),
    frm_payload: payload.toString('base64'),
    decoded_payload: decoded,  // Include decoded payload from simulator
    rx_metadata: [{
          gateway_ids: {
      gateway_id: 'simulator-gateway'
          },
          rssi: -80 + Math.random() * 20,
          snr: 5 + Math.random() * 5,
          timestamp: Date.now()
    }],
    settings: {
          data_rate: {
      lora: {
              bandwidth: 125000,
              spreading_factor: 7
      }
          },
          frequency: '868100000'
    },
    received_at: now.toISOString()
      }
  };

  // Add GPS location if provided (matches TTN webhook format)
  if (locationInfo && locationInfo.latitude !== undefined && locationInfo.longitude !== undefined) {
      message.locations = {
    user: {
          latitude: locationInfo.latitude,
          longitude: locationInfo.longitude,
          altitude: locationInfo.altitude || 0,
          source: 'SOURCE_REGISTRY'
    }
      };
  }

  return message;
  }
}

// Sender implementations
class LocalSender {
  constructor(deviceInfo) {
  this.deviceInfo = deviceInfo;
  }

  async send(fPort, payload, decoded = null) {
  // Use TTN webhook format for consistency with production
  const message = TTNMessage.create(
      this.deviceInfo.devEui,
      this.deviceInfo.devAddr,
      fPort,
      payload,
      this.deviceInfo.location,
      decoded
  );

  try {
      const response = await fetch(CONFIG.local.endpoint, {
    method: 'POST',
    headers: {
          'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
      });

      if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      console.log(`[${this.deviceInfo.name}] Sent TTN format to ${CONFIG.local.endpoint} - FPort ${fPort}, ${payload.length} bytes`);
      console.log(`        Device: ${message.end_device_ids.dev_eui}`);
      if (decoded) {
    console.log(`        Decoded: distance=${decoded.distance}mm, temperature=${decoded.temperature}°C`);
      }
  } catch (error) {
      console.error(`[${this.deviceInfo.name} ERROR] ${error.message}`);
  }
  }
}

class TTNSender {
  constructor(deviceInfo) {
  this.deviceInfo = deviceInfo;
  }

  async send(fPort, payload, decoded = null) {
  const message = TTNMessage.create(
      this.deviceInfo.devEui,
      this.deviceInfo.devAddr,
      fPort,
      payload,
      this.deviceInfo.location,
      decoded
  );

  // TTN uses HTTP Integration or MQTT
  // For simulation, we'll send to the webhook URL that you would configure in TTN
  const webhookUrl = `https://${CONFIG.ttn.region}.cloud.thethings.network/api/v3/as/applications/${CONFIG.ttn.appId}/webhooks/astro-dashboard/devices/${message.end_device_ids.device_id}/up`;

  try {
      const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.ttn.apiKey}`,
    },
    body: JSON.stringify(message)
      });

      if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
      }

      console.log(`[TTN] Sent to ${CONFIG.ttn.region} - FPort ${fPort}, ${payload.length} bytes`);
  } catch (error) {
      console.error(`[TTN ERROR] ${error.message}`);
      console.log('Tip: Make sure TTN_APP_ID, TTN_API_KEY, and webhook are configured');
  }
  }
}

// Main simulator
class DeviceSimulator {
  constructor(deviceInfo) {
  this.deviceInfo = deviceInfo;
  this.sensors = new SensorSimulator();
  this.sender = CONFIG.mode === 'TTN' ? new TTNSender(deviceInfo) : new LocalSender(deviceInfo);
  this.frameCounter = 0;
  }

  async sendDistanceTemperature() {
  const { buffer, decoded } = this.sensors.generateDistanceTemperature();
  await this.sender.send(1, buffer, decoded); // FPort 1 for distance + temperature
  this.frameCounter++;
  }

  async start() {
  console.log(`\n[${this.deviceInfo.name}] Starting FPort 1 simulation...`);
  console.log(`  Device EUI: ${this.deviceInfo.devEui}`);
  console.log(`  Location: ${this.deviceInfo.location.name} - ${this.deviceInfo.location.city}`);
  console.log(`  GPS: (${this.deviceInfo.location.latitude}, ${this.deviceInfo.location.longitude}) @ ${this.deviceInfo.location.altitude}m`);

  // Send measurements periodically with slight offset per device
  const offset = Math.random() * 2000; // Random offset up to 2 seconds
  setTimeout(() => {
      setInterval(async () => {
    await this.sendDistanceTemperature();
      }, CONFIG.simulation.interval);
  }, offset);
  }

  getStats() {
  return {
      name: this.deviceInfo.name,
      devEui: this.deviceInfo.devEui,
      framesSent: this.frameCounter
  };
  }
}

// Create and start multiple device simulators
const startSimulators = async () => {
  console.log('=== Multiflexmeter FPort 1 Simulator (Distance + Temperature) ===');
  console.log(`Mode: ${CONFIG.mode}`);
  console.log(`Number of Devices: ${CONFIG.numDevices}`);
  console.log(`Interval: ${CONFIG.simulation.interval}ms`);

  if (CONFIG.mode === 'LOCAL') {
  console.log(`Endpoint: ${CONFIG.local.endpoint}`);
  } else {
  console.log(`TTN Region: ${CONFIG.ttn.region}`);
  console.log(`TTN App: ${CONFIG.ttn.appId}`);
  }

  // Create device configurations
  const devices = [];
  for (let i = 0; i < CONFIG.numDevices; i++) {
  const locationInfo = DEVICE_LOCATIONS[i % DEVICE_LOCATIONS.length];
  const deviceInfo = {
      name: locationInfo.name,
      location: {
    name: locationInfo.name,
    city: locationInfo.city,
    latitude: locationInfo.latitude,
    longitude: locationInfo.longitude,
    altitude: locationInfo.altitude
      },
      devEui: `000000000000F00${i + 1}`.slice(-16), // Different EUI prefix (F00) for FPort 1 devices
      devAddr: `0000F00${i + 1}`.slice(-8),
      appEui: '0000000000000000',
  };
  console.log(`\n[Config] Device ${i + 1}: ${deviceInfo.name} (${deviceInfo.devEui})`)
  console.log(`         Location: ${deviceInfo.location.name}, ${deviceInfo.location.city}`);
  console.log(`         GPS: (${deviceInfo.location.latitude}, ${deviceInfo.location.longitude}) @ ${deviceInfo.location.altitude}m`);
  const simulator = new DeviceSimulator(deviceInfo);
  devices.push(simulator);
  await simulator.start();
  }

  // Keep process alive and show stats
  process.on('SIGINT', () => {
  console.log('\n\n=== FPort 1 Simulator Stopped ===');
  devices.forEach(device => {
      const stats = device.getStats();
      console.log(`${stats.name} (${stats.devEui}): ${stats.framesSent} frames sent`);
  });
  process.exit(0);
  });
}

// Start simulators
startSimulators();
