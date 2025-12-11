/**
 * SQLite Database for Multiflexmeter Sensor Data
 *
 * This module provides persistent storage for sensor readings and device information
 * using better-sqlite3 for synchronous, fast database operations.
 */

import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file location (in project root/data directory)
const DB_DIR = join(__dirname, '../../data');
const DB_PATH = join(DB_DIR, 'multiflexmeter.db');

// Ensure data directory exists
if (!existsSync(DB_DIR)) {
  mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database connection
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined
});

// Enable Write-Ahead Logging for better concurrency
db.pragma('journal_mode = WAL');

/**
 * Initialize database schema
 * MUST be called before creating prepared statements
 */
function initDatabase() {
  try {
  // Devices table
  db.exec(`
      CREATE TABLE IF NOT EXISTS devices (
    dev_eui TEXT PRIMARY KEY,
    dev_addr TEXT,
    hw_version TEXT,
    fw_version TEXT,
    location_name TEXT,
    location_city TEXT,
    last_seen TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
  `);

  // Sensor readings table with indexes for efficient queries
  db.exec(`
      CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    dev_eui TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    spinning INTEGER NOT NULL,
    pumping INTEGER NOT NULL,
    rssi INTEGER,
    snr REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dev_eui) REFERENCES devices(dev_eui)
      )
  `);

  // Create indexes for common queries
  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_readings_dev_eui
      ON readings(dev_eui);
  `);

  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_readings_timestamp
      ON readings(timestamp DESC);
  `);

  db.exec(`
      CREATE INDEX IF NOT EXISTS idx_readings_dev_timestamp
      ON readings(dev_eui, timestamp DESC);
  `);

  console.log('✅ Database initialized:', DB_PATH);
  } catch (error) {
  console.error('❌ Database initialization failed:', error);
  throw error;
  }
}

// Initialize database tables BEFORE creating prepared statements
initDatabase();

/**
 * Device operations
 */
export const devices = {
  /**
   * Upsert a device (insert or update)
   */
  upsert: db.prepare(`
  INSERT INTO devices (dev_eui, dev_addr, hw_version, fw_version, location_name, location_city, last_seen)
  VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(dev_eui) DO UPDATE SET
      dev_addr = excluded.dev_addr,
      hw_version = COALESCE(excluded.hw_version, hw_version),
      fw_version = COALESCE(excluded.fw_version, fw_version),
      location_name = COALESCE(excluded.location_name, location_name),
      location_city = COALESCE(excluded.location_city, location_city),
      last_seen = excluded.last_seen
  `),

  /**
   * Get a device by EUI
   */
  getByEui: db.prepare(`
  SELECT * FROM devices WHERE dev_eui = ?
  `),

  /**
   * Get all devices
   */
  getAll: db.prepare(`
  SELECT * FROM devices ORDER BY last_seen DESC
  `),

  /**
   * Get device with reading count
   */
  getWithStats: db.prepare(`
  SELECT
      d.*,
      COUNT(r.id) as reading_count,
      MAX(r.timestamp) as latest_reading
  FROM devices d
  LEFT JOIN readings r ON d.dev_eui = r.dev_eui
  WHERE d.dev_eui = ?
  GROUP BY d.dev_eui
  `),
};

/**
 * Readings operations
 */
export const readings = {
  /**
   * Insert a new reading
   */
  insert: db.prepare(`
  INSERT INTO readings (
      dev_eui, timestamp, temperature, humidity,
      spinning, pumping, rssi, snr
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `),

  /**
   * Get recent readings for a device
   */
  getRecent: db.prepare(`
  SELECT * FROM readings
  WHERE dev_eui = ?
  ORDER BY timestamp DESC
  LIMIT ?
  `),

  /**
   * Get recent readings across all devices
   */
  getRecentAll: db.prepare(`
  SELECT * FROM readings
  ORDER BY timestamp DESC
  LIMIT ?
  `),

  /**
   * Get readings in a time range
   */
  getByTimeRange: db.prepare(`
  SELECT * FROM readings
  WHERE dev_eui = ?
      AND timestamp >= ?
      AND timestamp <= ?
  ORDER BY timestamp ASC
  `),

  /**
   * Get readings for the last N hours
   */
  getLastHours: db.prepare(`
  SELECT * FROM readings
  WHERE dev_eui = ?
      AND timestamp >= datetime('now', '-' || ? || ' hours')
  ORDER BY timestamp ASC
  `),

  /**
   * Get reading statistics for a device
   */
  getStats: db.prepare(`
  SELECT
      COUNT(*) as count,
      AVG(temperature) as avg_temp,
      MIN(temperature) as min_temp,
      MAX(temperature) as max_temp,
      AVG(humidity) as avg_humidity,
      MIN(humidity) as min_humidity,
      MAX(humidity) as max_humidity,
      AVG(rssi) as avg_rssi,
      MIN(timestamp) as first_reading,
      MAX(timestamp) as last_reading
  FROM readings
  WHERE dev_eui = ?
  `),

  /**
   * Delete old readings (retention policy)
   */
  deleteOlderThan: db.prepare(`
  DELETE FROM readings
  WHERE timestamp < datetime('now', '-' || ? || ' days')
  `),

  /**
   * Get total count
   */
  count: db.prepare(`
  SELECT COUNT(*) as count FROM readings
  `),
};

/**
 * Transaction helper for bulk operations
 */
export function transaction<T>(fn: () => T): T {
  return db.transaction(fn)();
}

/**
 * Clean up old data (run periodically)
 */
export function cleanupOldData(retentionDays: number = 30) {
  const result = readings.deleteOlderThan.run(retentionDays);
  console.log(`🧹 Cleaned up ${result.changes} readings older than ${retentionDays} days`);

  // Optimize database
  db.pragma('optimize');

  return result.changes;
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  const deviceCount = db.prepare('SELECT COUNT(*) as count FROM devices').get() as { count: number };
  const readingCount = readings.count.get() as { count: number };
  const dbSize = db.prepare("SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()").get() as { size: number };

  return {
  devices: deviceCount.count,
  readings: readingCount.count,
  sizeBytes: dbSize.size,
  sizeMB: (dbSize.size / 1024 / 1024).toFixed(2),
  path: DB_PATH,
  };
}

/**
 * Close database connection (call on shutdown)
 */
export function closeDatabase() {
  db.close();
  console.log('📪 Database connection closed');
}

// Export database instance for advanced queries
export { db };
