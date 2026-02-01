/**
 * Data Store for Multiflexmeter sensor data
 *
 * Uses environment-aware database adapter:
 * - SQLite for local development
 * - Vercel KV (Redis) for production on Vercel
 * Includes in-memory caching and SSE (Server-Sent Events) for real-time updates
 */

import { db, type SensorReading, type DeviceInfo } from './dbAdapter';
import { autoResetOnStartup } from './dbReset';
import { reverseGeocode, needsReverseGeocoding } from './geocoding';

export type { SensorReading, DeviceInfo };

export interface UplinkMessage {
  devEui: string;
  devAddr: string;
  fPort: number;
  payload: string; // base64
  receivedAt: string;
  decoded?: any;
  rssi?: number;
  snr?: number;
  latitude?: number;   // GPS coordinates from TTN
  longitude?: number;  // GPS coordinates from TTN
  altitude?: number;   // GPS coordinates from TTN
}

export type DataStoreEvent =
  | { type: 'reading'; data: SensorReading }
  | { type: 'device'; data: DeviceInfo };

class DataStore {
  private listeners: Set<(event: DataStoreEvent) => void> = new Set();
  private recentCache: SensorReading[] = []; // Keep last 200 in memory for fast SSE
  private maxCacheSize = 200;

  /**
	 * Process uplink message
	 * Expects pre-decoded payload from the LoRaWAN server (TTN)
	 */
  async processUplink(message: UplinkMessage) {
  const { devEui, devAddr, fPort, payload, receivedAt, rssi, snr, latitude, longitude, altitude } = message;

  // Payload decoding should be done by the LoRaWAN server (TTN)
  // We only accept pre-decoded payloads
  const decoded = message.decoded;

  if (!decoded) {
      console.warn(`Received message without decoded payload on FPort ${fPort}`);
      console.warn(`Payload decoding must be configured in the LoRaWAN server (TTN)`);
      console.warn(`Device: ${devEui}, Payload (base64): ${payload}`);
      return;
  }

  console.log(`Processing decoded payload from TTN for device ${devEui}`);

  // Get existing device info
  const existingDevice = await db.getDevice(devEui);

  // Start with existing location data
  let locationName = existingDevice?.locationName;
  let locationCity = existingDevice?.locationCity;
  let locationCountry = existingDevice?.locationCountry;

  // Perform reverse geocoding asynchronously (non-blocking)
  if (latitude !== undefined && longitude !== undefined) {
      if (needsReverseGeocoding(latitude, longitude, existingDevice?.latitude, existingDevice?.longitude)) {
	console.log(`GPS coordinates changed, performing reverse geocoding in background...`);
	// Clear old location names since coordinates changed
	locationName = undefined;
	locationCity = undefined;
	locationCountry = undefined;

	// Fire and forget - don't block the request
	reverseGeocode(latitude, longitude).then(geocodeResult => {
          if (geocodeResult) {
	  // Update device location asynchronously
	  const updatedDevice: DeviceInfo = {
              devEui,
              devAddr: existingDevice?.devAddr || devAddr,
              hwVersion: existingDevice?.hwVersion,
              fwVersion: existingDevice?.fwVersion,
              latitude,
              longitude,
              altitude,
              locationName: geocodeResult.locationName,
              locationCity: geocodeResult.locationCity,
              locationCountry: geocodeResult.locationCountry,
              lastSeen: receivedAt,
	  };

	  db.upsertDevice(updatedDevice)
              .then(() => {
		// Notify SSE listeners about device update
		this.notifyListeners({ type: 'device', data: updatedDevice });
		console.log(`Device location updated and notified: ${geocodeResult.locationCity || 'Unknown'}`);
              })
              .catch(err => console.error('Failed to update geocoded location:', err));

	  console.log(`Reverse geocoded (${latitude}, ${longitude}) → ${geocodeResult.locationCity || 'Unknown'}`);
          }
	}).catch(err => console.error('Reverse geocoding failed:', err));
      } else if (existingDevice?.locationName) {
	console.log(`Using cached location: ${existingDevice.locationName} - ${existingDevice.locationCity}`);
      }
  }

  // Handle version info (FPort 2)
  // TTN decoder format: { fw_version: '...', hw_version: '...' }
  if (decoded.fw_version !== undefined && decoded.hw_version !== undefined) {
      await db.upsertDevice({
	devEui,
	devAddr,
	hwVersion: decoded.hw_version,
	fwVersion: decoded.fw_version,
	latitude,
	longitude,
	altitude,
	locationName,
	locationCity,
	locationCountry,
	lastSeen: receivedAt,
      });
      console.log(`Device ${devEui} - HW: ${decoded.hw_version}, FW: ${decoded.fw_version}`);
      if (latitude && longitude) {
	console.log(`   GPS: (${latitude}, ${longitude})`);
      }
      if (locationName || locationCity) {
	console.log(`   Location: ${locationName || ''} - ${locationCity || ''} - ${locationCountry || ''}`);
      }
      return;
  }

  // Update device last seen and location
  await db.upsertDevice({
      devEui,
      devAddr,
      hwVersion: existingDevice?.hwVersion,
      fwVersion: existingDevice?.fwVersion,
      latitude,
      longitude,
      altitude,
      locationName,
      locationCity,
      locationCountry,
      lastSeen: receivedAt,
  });

  // Store measurement data
  // FPort 1: Distance and temperature
  // FPort 3: RPM and ind (in_bedrijf) status

  // Support both standard field names and TTN decoder field names
  const ind = decoded.ind ?? decoded['inb(in_bedrijf)'];
  const rpm = decoded.rpm ?? decoded['rpm(toeren_per_minuut)'];

  const hasDistanceTemp = decoded.distance !== undefined || decoded.temperature !== undefined;
  const hasRpmData = rpm !== undefined || ind !== undefined;

  if (hasDistanceTemp || hasRpmData) {
      const reading: SensorReading = {
	devEui,
	timestamp: receivedAt,
	ind: ind ?? false,
	rpm: rpm,
	distance: decoded.distance,
	temperature: decoded.temperature,
	rssi,
	snr,
      };

      // Insert into database
      await db.storeReading(reading);

      // Update cache
      this.recentCache.push(reading);
      if (this.recentCache.length > this.maxCacheSize) {
	this.recentCache.shift();
      }

      // Notify listeners (for SSE)
      this.notifyListeners({ type: 'reading', data: reading });

      // Log based on what data is available
      let logMessage = `${devEui} | `;

      if (hasDistanceTemp) {
	logMessage += `Distance: ${decoded.distance ?? 'N/A'}mm, Temperature: ${decoded.temperature?.toFixed(1) ?? 'N/A'}°C | `;
      }

      if (hasRpmData) {
	logMessage += `RPM: ${(rpm ?? 0)} | ` +
                         `In Bedrijf: ${reading.ind} | `;
      }

      logMessage += `RSSI: ${rssi || 'N/A'}, SNR: ${snr?.toFixed(1) || 'N/A'}`;

      console.log(logMessage);
  }
  }

  /**
   * Get recent readings from database (always fresh, no cache)
   */
  async getRecentReadings(limit: number = 100): Promise<SensorReading[]> {
  // Always query database for fresh data (DESC order: newest first)
  return await db.getRecentReadings(limit);
  }

  /**
   * Get readings for a specific device
   */
  async getDeviceReadings(devEui: string, limit: number = 100): Promise<SensorReading[]> {
  return await db.getDeviceReadings(devEui, limit);
  }

  /**
   * Get device statistics
   */
  async getDeviceStats(devEui: string) {
  return await db.getDeviceStats(devEui);
  }

  /**
   * Get all devices
   */
  async getDevices(): Promise<DeviceInfo[]> {
  return await db.getAllDevices();
  }

  /**
   * Get a specific device
   */
  async getDevice(devEui: string): Promise<DeviceInfo | null> {
  return await db.getDevice(devEui);
  }

  /**
   * Subscribe to new readings (for SSE)
   */
  subscribe(callback: (event: DataStoreEvent) => void): () => void {
  this.listeners.add(callback);
  return () => this.listeners.delete(callback);
  }

  /**
   * Notify all listeners of new reading
   */
  private notifyListeners(event: DataStoreEvent) {
  this.listeners.forEach(listener => {
      try {
	listener(event);
      } catch (error) {
	console.error('Error notifying listener:', error);
      }
  });
  }

  /**
   * Populate cache from KV on startup
   */
  async initCache() {
  const recent = await this.getRecentReadings(this.maxCacheSize);
  this.recentCache = recent;
  console.log(`Loaded ${recent.length} readings into cache`);
  }
}

// Export singleton instance
export const dataStore = new DataStore();

// Initialize on startup: reset database if configured, then load cache (async)
(async () => {
  try {
    console.log('Initializing dataStore...');

    // Auto-reset database if RESET_DB_ON_DEPLOY=true
    await autoResetOnStartup();

    // Load cache with timeout protection
    const cacheInitPromise = dataStore.initCache();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Cache initialization timeout')), 10000)
    );

    await Promise.race([cacheInitPromise, timeoutPromise]);

    console.log('DataStore initialized successfully');
  } catch (error) {
    console.error('Failed to initialize dataStore:', error);
    console.error('The application may have limited functionality');
  }
})();
