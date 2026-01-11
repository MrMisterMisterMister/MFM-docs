/**
 * Redis Data Store for Multiflexmeter
 *
 * Replaces SQLite with native Redis for serverless deployment
 * Uses Redis data structures for fast, scalable storage
 */

import Redis from 'ioredis';

// Create Redis client using REDIS_URL environment variable
const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('ERROR: REDIS_URL environment variable is not set!');
  console.error('Redis will not be available. Set REDIS_URL in your environment variables.');
}

const redis = new Redis(redisUrl || '', {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 10000, // 10 seconds
  retryStrategy(times) {
  if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null; // Stop retrying
  }
  const delay = Math.min(times * 50, 2000);
  return delay;
  },
});

// Handle Redis connection events
redis.on('connect', () => {
  console.log('Redis client connected');
});

redis.on('ready', () => {
  console.log('Redis client ready');
});

redis.on('error', (err) => {
  console.error('Redis client error:', err.message);
});

redis.on('close', () => {
  console.warn('Redis client connection closed');
});

redis.on('reconnecting', () => {
  console.log('Redis client reconnecting...');
});

export interface SensorReading {
  timestamp: string;
  ind: boolean;                  // in_bedrijf (in operation) - from FPort 3
  rpm?: number;                  // RPM from decoder (FPort 3)
  distance?: number;             // distance in mm (from FPort 1)
  temperature?: number;          // temperature in Celsius (from FPort 1)
  rssi?: number;
  snr?: number;
  devEui: string;
}

export interface DeviceInfo {
  devEui: string;
  devAddr: string;
  hwVersion?: string;
  fwVersion?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  locationName?: string;     // Reverse geocoded from lat/long (e.g., "Mallemolen")
  locationCity?: string;     // Reverse geocoded from lat/long (e.g., "Gouda")
  locationCountry?: string;  // Reverse geocoded from lat/long (e.g., "Netherlands")
  lastSeen: string;
}

/**
 * KV Key Patterns:
 * - device:{devEui} → DeviceInfo (hash)
 * - devices → Set of all device EUIs
 * - readings:{devEui} → Sorted set (score = timestamp)
 * - readings:all → Sorted set of all readings (score = timestamp)
 * - reading:{id} → SensorReading (hash)
 */

class KVDataStore {
  private maxReadingsPerDevice = 1000; // Keep last 1000 per device
  private maxTotalReadings = 5000; // Keep last 5000 total

  /**
   * Store or update device information
   */
  async upsertDevice(device: DeviceInfo): Promise<void> {
  const key = `device:${device.devEui}`;

  await redis.hset(key,
      'devEui', device.devEui,
      'devAddr', device.devAddr,
      'hwVersion', device.hwVersion || '',
      'fwVersion', device.fwVersion || '',
      'latitude', device.latitude?.toString() || '',
      'longitude', device.longitude?.toString() || '',
      'altitude', device.altitude?.toString() || '',
      'locationName', device.locationName || '',
      'locationCity', device.locationCity || '',
      'locationCountry', device.locationCountry || '',
      'lastSeen', device.lastSeen
  );

  // Add to devices set
  await redis.sadd('devices', device.devEui);
  }

  /**
   * Get device by EUI
   */
  async getDevice(devEui: string): Promise<DeviceInfo | null> {
  const key = `device:${devEui}`;
  const device = await redis.hgetall(key) as any;

  if (!device || !device.devEui) return null;

  return {
      devEui: device.devEui,
      devAddr: device.devAddr,
      hwVersion: device.hwVersion || undefined,
      fwVersion: device.fwVersion || undefined,
      latitude: device.latitude ? parseFloat(device.latitude) : undefined,
      longitude: device.longitude ? parseFloat(device.longitude) : undefined,
      altitude: device.altitude ? parseFloat(device.altitude) : undefined,
      locationName: device.locationName || undefined,
      locationCity: device.locationCity || undefined,
      locationCountry: device.locationCountry || undefined,
      lastSeen: device.lastSeen,
  };
  }

  /**
   * Get all devices
   */
  async getAllDevices(): Promise<DeviceInfo[]> {
  const devEuis = await redis.smembers('devices');
  const devices: DeviceInfo[] = [];

  for (const devEui of devEuis) {
      const device = await this.getDevice(devEui);
      if (device) devices.push(device);
  }

  return devices.sort((a, b) =>
      new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
  );
  }

  /**
   * Store a sensor reading
   */
  async storeReading(reading: SensorReading): Promise<void> {
  const timestamp = new Date(reading.timestamp).getTime();
  const readingId = `${reading.devEui}:${timestamp}`;
  const readingKey = `reading:${readingId}`;

  // Store reading data as hash
  const fields: Record<string, string> = {
      'devEui': reading.devEui,
      'timestamp': reading.timestamp,
      'ind': reading.ind ? '1' : '0',
      'rpm': (reading.rpm ?? 0).toString(),
      'rssi': (reading.rssi || 0).toString(),
      'snr': (reading.snr || 0).toString()
  };

  // Add optional fields if present
  if (reading.distance !== undefined) {
      fields['distance'] = reading.distance.toString();
  }
  if (reading.temperature !== undefined) {
      fields['temperature'] = reading.temperature.toString();
  }

  await redis.hset(readingKey, fields);

  // Add to device-specific sorted set (score = timestamp)
  await redis.zadd(`readings:${reading.devEui}`, timestamp, readingId);

  // Add to global sorted set
  await redis.zadd('readings:all', timestamp, readingId);

  // Trim old readings (keep last N)
  await this.trimReadings(reading.devEui);
  }

  /**
   * Trim old readings to stay within limits
   */
  private async trimReadings(devEui: string): Promise<void> {
  // Trim device-specific readings
  const deviceCount = await redis.zcard(`readings:${devEui}`);
  if (deviceCount && deviceCount > this.maxReadingsPerDevice) {
      const toRemove = deviceCount - this.maxReadingsPerDevice;
      const oldIds = await redis.zrange(`readings:${devEui}`, 0, toRemove - 1);

      if (oldIds && oldIds.length > 0) {
    // Remove from sorted set
    await redis.zrem(`readings:${devEui}`, ...oldIds);

    // Remove reading data using pipeline
    const pipeline = redis.pipeline();
    for (const id of oldIds) {
          pipeline.del(`reading:${id}`);
    }
    await pipeline.exec();
      }
  }

  // Trim global readings
  const totalCount = await redis.zcard('readings:all');
  if (totalCount && totalCount > this.maxTotalReadings) {
      const toRemove = totalCount - this.maxTotalReadings;
      const oldIds = await redis.zrange('readings:all', 0, toRemove - 1);

      if (oldIds && oldIds.length > 0) {
    await redis.zrem('readings:all', ...oldIds);
      }
  }
  }

  /**
   * Get recent readings for a device
   */
  async getDeviceReadings(devEui: string, limit: number = 100): Promise<SensorReading[]> {
  // Get reading IDs from sorted set (newest first)
  const readingIds = await redis.zrevrange(`readings:${devEui}`, 0, limit - 1);

  if (!readingIds || readingIds.length === 0) return [];

  return await this.fetchReadings(readingIds);
  }

  /**
   * Get recent readings across all devices
   */
  async getRecentReadings(limit: number = 100): Promise<SensorReading[]> {
  const readingIds = await redis.zrevrange('readings:all', 0, limit - 1);

  if (!readingIds || readingIds.length === 0) return [];

  return await this.fetchReadings(readingIds);
  }

  /**
   * Fetch reading details by IDs
   */
  private async fetchReadings(readingIds: string[]): Promise<SensorReading[]> {
  const readings: SensorReading[] = [];

  for (const id of readingIds) {
      const data = await redis.hgetall(`reading:${id}`) as any;
      if (data && data.timestamp) {
    readings.push({
          devEui: data.devEui,
          timestamp: data.timestamp,
          ind: data.ind === 1 || data.ind === '1',
          rpm: data.rpm ? parseFloat(data.rpm) : undefined,
          distance: data.distance ? parseInt(data.distance) : undefined,
          temperature: data.temperature ? parseFloat(data.temperature) : undefined,
          rssi: data.rssi ? parseInt(data.rssi) : undefined,
          snr: data.snr ? parseFloat(data.snr) : undefined,
    });
      }
  }

  return readings;
  }

  /**
   * Get statistics for a device
   */
  async getDeviceStats(devEui: string): Promise<any> {
  const readings = await this.getDeviceReadings(devEui, 1000);

  if (readings.length === 0) {
      return {
    count: 0,
    avgRssi: 0,
    firstReading: null,
    lastReading: null,
      };
  }

  const rssis = readings.filter(r => r.rssi).map(r => r.rssi!);

  return {
      count: readings.length,
      avgRssi: rssis.length > 0 ? rssis.reduce((a, b) => a + b, 0) / rssis.length : 0,
      firstReading: readings[readings.length - 1]?.timestamp,
      lastReading: readings[0]?.timestamp,
  };
  }

  /**
   * Clear all data (for testing/reset)
   */
  async clearAll(): Promise<void> {
  const devices = await redis.smembers('devices');

  // Delete device-specific keys
  const pipeline = redis.pipeline();
  for (const devEui of devices) {
      pipeline.del(`device:${devEui}`);
      pipeline.del(`readings:${devEui}`);
  }

  // Delete global keys
  pipeline.del('devices');
  pipeline.del('readings:all');

  await pipeline.exec();

  // Note: Individual reading:{id} keys will expire or be cleaned up by trimming
  }
}

// Export singleton instance
export const kvStore = new KVDataStore();
