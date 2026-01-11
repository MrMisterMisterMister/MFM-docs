/**
 * Timeseries API Endpoint
 *
 * Returns time-series data with aggregation support
 *
 * URL Pattern: /api/v1/timeseries/{deviceEui}/?resolution=30s&measurement=rpm&start=2025-10-02T09:40:00Z&end=2025-10-07T11:50:00Z
 *
 * Query Parameters:
 * - resolution: Time bucket size (e.g., "30s", "1m", "5m", "1h", "1d")
 * - measurement: What to measure ("inb", "rpm", "distance", "temperature")
 * - start: ISO 8601 start time (required)
 * - end: ISO 8601 end time (required)
 */

import type { APIRoute } from 'astro';
import { dataStore } from '../../../../lib/dataStore';
import { verifyBasicAuth, createUnauthorizedResponse } from '../../../../lib/auth';

export const GET: APIRoute = async ({ params, url, request }) => {
  // Require authentication
  const isAuthenticated = verifyBasicAuth(request, true);

  if (!isAuthenticated) {
    console.warn('Unauthorized GET request to timeseries API');
    return createUnauthorizedResponse('Timeseries API');
  }

  const { deviceEui } = params;

  if (!deviceEui) {
    return new Response(
      JSON.stringify({ error: 'Device EUI is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Parse query parameters
  const resolution = url.searchParams.get('resolution') || '1m';
  const measurement = url.searchParams.get('measurement') || 'rpm';
  const startParam = url.searchParams.get('start');
  const endParam = url.searchParams.get('end');

  if (!startParam || !endParam) {
    return new Response(
      JSON.stringify({ error: 'Both start and end parameters are required (ISO 8601 format)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const startTime = new Date(startParam);
  const endTime = new Date(endParam);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return new Response(
      JSON.stringify({ error: 'Invalid date format. Use ISO 8601 format (e.g., 2025-10-02T09:40:00Z)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Get all readings for the device (we'll fetch a large limit and filter)
  const allReadings = await dataStore.getDeviceReadings(deviceEui, 10000);

  // Filter readings by time range
  const filteredReadings = allReadings.filter(reading => {
    const readingTime = new Date(reading.timestamp);
    return readingTime >= startTime && readingTime <= endTime;
  });

  // Sort by timestamp (ascending - oldest first)
  filteredReadings.sort((a, b) =>
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  // Parse resolution to milliseconds
  const resolutionMs = parseResolution(resolution);

  // Aggregate data into time buckets
  const buckets = aggregateByResolution(filteredReadings, measurement, resolutionMs, startTime, endTime);

  // Format response
  const points = buckets.map(bucket => ({
    time: bucket.time.toISOString(),
    mean_value: bucket.mean_value
  }));

  return new Response(
    JSON.stringify({
      count: points.length,
      points: points
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    }
  );
};

/**
 * Parse resolution string to milliseconds
 */
function parseResolution(resolution: string): number {
  const match = resolution.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 60000; // Default: 1 minute
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value * 1000;           // seconds
    case 'm': return value * 60 * 1000;      // minutes
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    default: return 60000;
  }
}

/**
 * Aggregate readings into time buckets
 */
function aggregateByResolution(
  readings: any[],
  measurement: string,
  resolutionMs: number,
  startTime: Date,
  endTime: Date
): Array<{ time: Date; mean_value: number }> {
  const buckets = new Map<number, number[]>();

  // Group readings into buckets
  readings.forEach(reading => {
    const readingTime = new Date(reading.timestamp).getTime();
    const bucketKey = Math.floor(readingTime / resolutionMs) * resolutionMs;

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, []);
    }

    // Extract the measurement value
    let value: number | null = null;

    switch (measurement) {
      case 'inb':
        value = reading.inb ? 1 : 0;
        break;
      case 'rpm':
        value = reading.rpm ?? null;
        break;
      case 'distance':
        value = reading.distance ?? null;
        break;
      case 'temperature':
        value = reading.temperature ?? null;
        break;
      default:
        value = null;
    }

    if (value !== null && value !== undefined) {
      buckets.get(bucketKey)!.push(value);
    }
  });

  // Calculate mean for each bucket and convert to result format
  const result: Array<{ time: Date; mean_value: number }> = [];

  // Create buckets for the entire time range (even if no data)
  const startBucket = Math.floor(startTime.getTime() / resolutionMs) * resolutionMs;
  const endBucket = Math.floor(endTime.getTime() / resolutionMs) * resolutionMs;

  for (let bucketKey = startBucket; bucketKey <= endBucket; bucketKey += resolutionMs) {
    const values = buckets.get(bucketKey) || [];

    let meanValue = 0;
    if (values.length > 0) {
      const sum = values.reduce((a, b) => a + b, 0);
      meanValue = Math.round((sum / values.length) * 100) / 100; // Round to 2 decimals
    } else {
      // No data for this bucket - could use 65535 like your example or 0
      meanValue = 65535; // Using 65535 to match your example format for missing data
    }

    result.push({
      time: new Date(bucketKey),
      mean_value: meanValue
    });
  }

  return result;
}
