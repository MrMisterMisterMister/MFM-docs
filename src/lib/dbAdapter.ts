/**
 * Database Adapter - Environment-aware database layer
 *
 * Uses SQLite for local development and Redis for production
 * This allows seamless development without requiring Redis credentials locally
 */

import type { SensorReading, DeviceInfo } from './kv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

// Check if we're in production with Redis available
const isProduction = process.env.NODE_ENV === 'production' ||
                     process.env.REDIS_URL !== undefined;

let dbImplementation: DatabaseInterface;

// Define the interface that both implementations must follow
interface DatabaseInterface {
  upsertDevice(device: DeviceInfo): Promise<void>;
  getDevice(devEui: string): Promise<DeviceInfo | null>;
  getAllDevices(): Promise<DeviceInfo[]>;
  storeReading(reading: SensorReading): Promise<void>;
  getDeviceReadings(devEui: string, limit: number): Promise<SensorReading[]>;
  getRecentReadings(limit: number): Promise<SensorReading[]>;
  getDeviceStats(devEui: string): Promise<any>;
  clearAll(): Promise<void>;
}

// SQLite implementation for local development
class SQLiteAdapter implements DatabaseInterface {
  private db: any;
  private devices: any;
  private readings: any;
  private initPromise: Promise<void>;

  constructor() {
  // Lazy load better-sqlite3 only in development
  this.initPromise = this.initialize();
  }

  private async initialize() {
  if (typeof window === 'undefined') {
      try {
    // Dynamic import for better-sqlite3
    const Database = (await import('better-sqlite3')).default;

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const DB_DIR = join(__dirname, '../../data');
    const DB_PATH = join(DB_DIR, 'multiflexmeter.db');

    // Ensure data directory exists
    if (!existsSync(DB_DIR)) {
          mkdirSync(DB_DIR, { recursive: true });
    }

    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');

    this.initDatabase();
    console.log('Using SQLite for local development:', DB_PATH);
      } catch (error) {
    console.error('Failed to initialize SQLite:', error);
    throw error;
      }
  }
  }

  private initDatabase() {
  this.db.exec(`
      CREATE TABLE IF NOT EXISTS devices (
    dev_eui TEXT PRIMARY KEY,
    dev_addr TEXT,
    hw_version TEXT,
    fw_version TEXT,
    latitude REAL,
    longitude REAL,
    altitude REAL,
    location_name TEXT,
    location_city TEXT,
    location_country TEXT,
    last_seen TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
  `);

  // Migration: Add location and GPS columns if they don't exist
  try {
      const columns = this.db.pragma('table_info(devices)');
      const columnNames = columns.map((col: any) => col.name);

      if (!columnNames.includes('latitude')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN latitude REAL');
    console.log('Added latitude column to devices table');
      }
      if (!columnNames.includes('longitude')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN longitude REAL');
    console.log('Added longitude column to devices table');
      }
      if (!columnNames.includes('altitude')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN altitude REAL');
    console.log('Added altitude column to devices table');
      }
      if (!columnNames.includes('location_name')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN location_name TEXT');
    console.log('Added location_name column to devices table');
      }
      if (!columnNames.includes('location_city')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN location_city TEXT');
    console.log('Added location_city column to devices table');
      }
      if (!columnNames.includes('location_country')) {
    this.db.exec('ALTER TABLE devices ADD COLUMN location_country TEXT');
    console.log('Added location_country column to devices table');
      }
  } catch (error) {
      console.error('Error during database migration:', error);
  }

  this.db.exec(`
      CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dev_eui TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    ind INTEGER NOT NULL DEFAULT 0,
    rpm REAL,
    distance INTEGER,
    temperature REAL,
    rssi INTEGER,
    snr REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dev_eui) REFERENCES devices(dev_eui)
      )
  `);

  // Migration: Add ind and rpm columns if needed
  try {
      const columns = this.db.pragma('table_info(readings)');
      const columnNames = columns.map((col: any) => col.name);

      if (!columnNames.includes('ind')) {
    this.db.exec('ALTER TABLE readings ADD COLUMN ind INTEGER NOT NULL DEFAULT 0');
    console.log('Added ind column to readings table');
      }
      if (!columnNames.includes('rpm')) {
    this.db.exec('ALTER TABLE readings ADD COLUMN rpm REAL');
    console.log('Added rpm column to readings table');
      }
      if (!columnNames.includes('distance')) {
    this.db.exec('ALTER TABLE readings ADD COLUMN distance INTEGER');
    console.log('Added distance column to readings table');
      }
      if (!columnNames.includes('temperature')) {
    this.db.exec('ALTER TABLE readings ADD COLUMN temperature REAL');
    console.log('Added temperature column to readings table');
      }
  } catch (error) {
      console.error('Error during readings table migration:', error);
  }

  this.db.exec(`CREATE INDEX IF NOT EXISTS idx_readings_dev_eui ON readings(dev_eui)`);
  this.db.exec(`CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp DESC)`);
  this.db.exec(`CREATE INDEX IF NOT EXISTS idx_readings_dev_timestamp ON readings(dev_eui, timestamp DESC)`);

  // Prepare statements
  this.devices = {
      upsert: this.db.prepare(`
    INSERT INTO devices (dev_eui, dev_addr, hw_version, fw_version, latitude, longitude, altitude, location_name, location_city, location_country, last_seen)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(dev_eui) DO UPDATE SET
          dev_addr = excluded.dev_addr,
          hw_version = COALESCE(excluded.hw_version, hw_version),
          fw_version = COALESCE(excluded.fw_version, fw_version),
          latitude = COALESCE(excluded.latitude, latitude),
          longitude = COALESCE(excluded.longitude, longitude),
          altitude = COALESCE(excluded.altitude, altitude),
          location_name = COALESCE(excluded.location_name, location_name),
          location_city = COALESCE(excluded.location_city, location_city),
          location_country = COALESCE(excluded.location_country, location_country),
          last_seen = excluded.last_seen
      `),
      getByEui: this.db.prepare(`SELECT * FROM devices WHERE dev_eui = ?`),
      getAll: this.db.prepare(`SELECT * FROM devices ORDER BY last_seen DESC`),
  };

  this.readings = {
      insert: this.db.prepare(`
    INSERT INTO readings (dev_eui, timestamp, ind, rpm, distance, temperature, rssi, snr)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `),
      getRecent: this.db.prepare(`
    SELECT * FROM readings WHERE dev_eui = ? ORDER BY timestamp DESC LIMIT ?
      `),
      getRecentAll: this.db.prepare(`SELECT * FROM readings ORDER BY timestamp DESC LIMIT ?`),
      getStats: this.db.prepare(`
    SELECT
          COUNT(*) as count,
          AVG(rssi) as avg_rssi,
          MIN(timestamp) as first_reading,
          MAX(timestamp) as last_reading
    FROM readings
    WHERE dev_eui = ?
      `),
  };
  }

  async upsertDevice(device: DeviceInfo): Promise<void> {
  await this.initPromise;
  this.devices.upsert.run(
      device.devEui,
      device.devAddr,
      device.hwVersion || null,
      device.fwVersion || null,
      device.latitude || null,
      device.longitude || null,
      device.altitude || null,
      device.locationName || null,
      device.locationCity || null,
      device.locationCountry || null,
      device.lastSeen
  );
  }

  async getDevice(devEui: string): Promise<DeviceInfo | null> {
  await this.initPromise;
  const row = this.devices.getByEui.get(devEui);
  if (!row) return null;
  return {
      devEui: row.dev_eui,
      devAddr: row.dev_addr,
      hwVersion: row.hw_version || undefined,
      fwVersion: row.fw_version || undefined,
      latitude: row.latitude || undefined,
      longitude: row.longitude || undefined,
      altitude: row.altitude || undefined,
      locationName: row.location_name || undefined,
      locationCity: row.location_city || undefined,
      locationCountry: row.location_country || undefined,
      lastSeen: row.last_seen,
  };
  }

  async getAllDevices(): Promise<DeviceInfo[]> {
  await this.initPromise;
  const rows = this.devices.getAll.all();
  return rows.map((row: any) => ({
      devEui: row.dev_eui,
      devAddr: row.dev_addr,
      hwVersion: row.hw_version || undefined,
      fwVersion: row.fw_version || undefined,
      latitude: row.latitude || undefined,
      longitude: row.longitude || undefined,
      altitude: row.altitude || undefined,
      locationName: row.location_name || undefined,
      locationCity: row.location_city || undefined,
      locationCountry: row.location_country || undefined,
      lastSeen: row.last_seen,
  }));
  }

  async storeReading(reading: SensorReading): Promise<void> {
  await this.initPromise;
  this.readings.insert.run(
      reading.devEui,
      reading.timestamp,
      reading.ind ? 1 : 0,
      reading.rpm ?? null,
      reading.distance ?? null,
      reading.temperature ?? null,
      reading.rssi ?? null,
      reading.snr ?? null
  );
  }

  async getDeviceReadings(devEui: string, limit: number): Promise<SensorReading[]> {
  await this.initPromise;
  const rows = this.readings.getRecent.all(devEui, limit);
  return rows.map((row: any) => ({
      devEui: row.dev_eui,
      timestamp: row.timestamp,
      ind: row.ind === 1,
      rpm: row.rpm != null ? row.rpm : undefined,
      distance: row.distance != null ? row.distance : undefined,
      temperature: row.temperature != null ? row.temperature : undefined,
      rssi: row.rssi != null ? row.rssi : undefined,
      snr: row.snr != null ? row.snr : undefined,
  }));
  }

  async getRecentReadings(limit: number): Promise<SensorReading[]> {
  await this.initPromise;
  const rows = this.readings.getRecentAll.all(limit);
  return rows.map((row: any) => ({
      devEui: row.dev_eui,
      timestamp: row.timestamp,
      ind: row.ind === 1,
      rpm: row.rpm != null ? row.rpm : undefined,
      distance: row.distance != null ? row.distance : undefined,
      temperature: row.temperature != null ? row.temperature : undefined,
      rssi: row.rssi != null ? row.rssi : undefined,
      snr: row.snr != null ? row.snr : undefined,
  }));
  }

  async getDeviceStats(devEui: string): Promise<any> {
  await this.initPromise;
  const stats = this.readings.getStats.get(devEui);
  return {
      count: stats.count || 0,
      avgRssi: stats.avg_rssi || 0,
      firstReading: stats.first_reading || null,
      lastReading: stats.last_reading || null,
  };
  }

  async clearAll(): Promise<void> {
  await this.initPromise;
  this.db.exec('DELETE FROM readings');
  this.db.exec('DELETE FROM devices');
  }
}

// Redis implementation for production
class RedisAdapter implements DatabaseInterface {
  private kvStore: any;

  constructor() {
  // Lazy load KV store
  import('./kv').then(module => {
      this.kvStore = module.kvStore;
      console.log('Using Redis for production');
  });
  }

  async upsertDevice(device: DeviceInfo): Promise<void> {
  await this.kvStore.upsertDevice(device);
  }

  async getDevice(devEui: string): Promise<DeviceInfo | null> {
  return await this.kvStore.getDevice(devEui);
  }

  async getAllDevices(): Promise<DeviceInfo[]> {
  return await this.kvStore.getAllDevices();
  }

  async storeReading(reading: SensorReading): Promise<void> {
  await this.kvStore.storeReading(reading);
  }

  async getDeviceReadings(devEui: string, limit: number): Promise<SensorReading[]> {
  return await this.kvStore.getDeviceReadings(devEui, limit);
  }

  async getRecentReadings(limit: number): Promise<SensorReading[]> {
  return await this.kvStore.getRecentReadings(limit);
  }

  async getDeviceStats(devEui: string): Promise<any> {
  return await this.kvStore.getDeviceStats(devEui);
  }

  async clearAll(): Promise<void> {
  await this.kvStore.clearAll();
  }
}

// Initialize the appropriate implementation
if (isProduction) {
  dbImplementation = new RedisAdapter();
} else {
  dbImplementation = new SQLiteAdapter();
}

// Export the database adapter
export const db = dbImplementation;
export type { SensorReading, DeviceInfo };
