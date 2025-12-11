#!/usr/bin/env node

/**
 * Multiflexmeter Device Simulator
 *
 * Simulates multiple Multiflexmeter devices sending LoRaWAN data to TTN or directly to local endpoint.
 *
 * Modes:
 *  - TTN: Sends data via TTN HTTP Integration API
 *  - LOCAL: Sends data directly to local Astro endpoint (bypasses TTN)
 *
 * Data Format (matches firmware):
 *  - FPort 2: Version info (sent on startup)
 *  - FPort 3: Status with cumulative rotation counters
 * 
 * Environment Variables:
 *  - NUM_DEVICES: Number of devices to simulate (default: 3)
 *  - INTERVAL: Milliseconds between measurements per device (default: 10000)
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
  numDevices: parseInt(process.env.NUM_DEVICES || '3'),

  // Simulation settings
  simulation: {
  interval: parseInt(process.env.INTERVAL || '10000'), // ms between measurements
  sensorAddress: 0x36, // I2C address from firmware
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

// Sensor data generators
class SensorSimulator {
  constructor() {
  this.isSpinning = false;
  this.isPumping = false;
  this.revolutions = 0;
  this.time = 0;
  // Cumulative rotation counters (never reset)
  this.totalRotationsSpinning = 0;
  this.totalRotationsPumping = 0;
  }

  /**
   * Simulate poldermill spinning (based on "wind conditions")
   */
  generateSpinning() {
  // Change state randomly with some persistence
  if (Math.random() < 0.1) {
      this.isSpinning = Math.random() > 0.1; // 90% chance of spinning
  }

  return this.isSpinning;
  }

  /**
   * Count revolutions for current measurement period
   */
  countRevolutionsForPeriod() {
  // Simulate revolutions based on whether mill is spinning
  if (this.isSpinning) {
      // Simulate 10-50 revolutions per measurement interval
      return Math.floor(Math.random() * 41) + 10;
  } else {
      // Mill not spinning - might have coasted a bit
      return Math.floor(Math.random() * 3); // 0-2 revolutions
  }
  }

  /**
   * Simulate pumping (only happens when spinning)
   */
  generatePumping() {
  if (!this.isSpinning) {
      this.isPumping = false;
  } else if (Math.random() < 0.15) {
      this.isPumping = Math.random() > 0.1; // 90% chance when spinning
  }
  return this.isPumping;
  }

  /**
   * Generate complete measurement packet (FPort 3 format with cumulative counters)
   */
  generateMeasurement() {
  this.time += CONFIG.simulation.interval / 1000;

  const spinning = this.generateSpinning();
  const pumping = this.generatePumping();
  const revolutionsThisPeriod = this.countRevolutionsForPeriod();

  // Update cumulative counters
  if (spinning) {
      this.totalRotationsSpinning += revolutionsThisPeriod;
  }
  if (pumping) {
      this.totalRotationsPumping += revolutionsThisPeriod;
  }

  // FPort 3 format: 9 bytes
  // Byte 0: status flags (bit 0 = spinning, bit 1 = pumping)
  // Bytes 1-4: total_rotations_pumping (uint32 LE)
  // Bytes 5-8: total_rotations_spinning (uint32 LE)
  const buffer = Buffer.alloc(9);

  // Byte 0: status flags
  let status = 0;
  if (spinning) status |= 0x01;
  if (pumping) status |= 0x02;
  buffer.writeUInt8(status, 0);

  // Bytes 1-4: total_rotations_pumping (uint32 LE)
  buffer.writeUInt32LE(this.totalRotationsPumping, 1);

  // Bytes 5-8: total_rotations_spinning (uint32 LE)
  buffer.writeUInt32LE(this.totalRotationsSpinning, 5);

  return {
      buffer,
      decoded: {
    spinning,
    pumping,
    total_rotations_spinning: this.totalRotationsSpinning,
    total_rotations_pumping: this.totalRotationsPumping
      }
  };
  }

  /**
   * Generate version packet (sent on startup)
   */
  generateVersionPacket(deviceInfo) {
  const buffer = Buffer.alloc(5);
  buffer.writeUInt8(0x10, 0); // Version command
  buffer.writeUInt16BE(
      deviceInfo.fwVersion.major * 256 + deviceInfo.fwVersion.minor,
      1
  );
  buffer.writeUInt16BE(
      deviceInfo.hwVersion.major * 256 + deviceInfo.hwVersion.minor,
      3
  );
  return buffer;
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
    console.log(`        Decoded: spinning=${decoded.spinning}, pumping=${decoded.pumping}, spin_rot=${decoded.total_rotations_spinning}, pump_rot=${decoded.total_rotations_pumping}`);
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

  async sendVersion() {
  const versionPacket = this.sensors.generateVersionPacket(this.deviceInfo);
  const decoded = {
      fw_version: `${this.deviceInfo.fwVersion.major}.${this.deviceInfo.fwVersion.minor}`,
      hw_version: `${this.deviceInfo.hwVersion.major}.${this.deviceInfo.hwVersion.minor}`
  };
  await this.sender.send(2, versionPacket, decoded);
  }

  async sendMeasurement() {
  const { buffer, decoded } = this.sensors.generateMeasurement();
  await this.sender.send(3, buffer, decoded); // FPort 3 for status + rotation counters
  this.frameCounter++;
  }

  async start() {
  console.log(`\n[${this.deviceInfo.name}] Starting simulation...`);
  console.log(`  Device EUI: ${this.deviceInfo.devEui}`);
  console.log(`  Location: ${this.deviceInfo.location.name} - ${this.deviceInfo.location.city}`);
  console.log(`  GPS: (${this.deviceInfo.location.latitude}, ${this.deviceInfo.location.longitude}) @ ${this.deviceInfo.location.altitude}m`);
  console.log(`  HW Version: ${this.deviceInfo.hwVersion.major}.${this.deviceInfo.hwVersion.minor}`);
  console.log(`  FW Version: ${this.deviceInfo.fwVersion.major}.${this.deviceInfo.fwVersion.minor}`);

  // Send version on startup (mimics firmware behavior)
  await this.sendVersion();

  // Send measurements periodically with slight offset per device
  const offset = Math.random() * 2000; // Random offset up to 2 seconds
  setTimeout(() => {
      setInterval(async () => {
    await this.sendMeasurement();
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
  console.log('=== Multiflexmeter Multi-Device Simulator ===');
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
      devEui: `000000000000000${i + 1}`.slice(-16),
      devAddr: `0000000${i + 1}`.slice(-8),
      appEui: '0000000000000000',
      hwVersion: { major: 3, minor: 7 },
      fwVersion: { major: 3, minor: 7 },
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
  console.log('\n\n=== Simulator Stopped ===');
  devices.forEach(device => {
      const stats = device.getStats();
      console.log(`${stats.name} (${stats.devEui}): ${stats.framesSent} frames sent`);
  });
  process.exit(0);
  });
}

// Start simulators
startSimulators();

