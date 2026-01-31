/**
 * Devices API Endpoint
 *
 * Returns a list of all registered devices in a standardized format.
 *
 * GET /api/v1/devices
 *
 * Authentication: Basic Auth required (API_USERNAME/API_PASSWORD)
 * In development mode, authentication is skipped.
 *
 * Response format:
 * [
 *   {
 *     "identifier": "MFM-A1B2C3D4",
 *     "description": "Multiflexmeter device",
 *     "location": { ... },
 *     "created": "2025-01-01T00:00:00Z",
 *     "active": true,
 *     "characteristics": { ... },
 *     "payload_format": { ... }
 *   }
 * ]
 */

import type { APIRoute } from 'astro';
import { dataStore, type DeviceInfo } from '../../../lib/dataStore';
import { verifyBasicAuth, createUnauthorizedResponse } from '../../../lib/auth';
import { getDeviceDisplayId } from '../../../lib/deviceIdentifier';

// Time threshold to consider a device "active" (in milliseconds)
// Device is active if last seen within 24 hours
const ACTIVE_THRESHOLD_MS = 24 * 60 * 60 * 1000;

/**
 * Format a device for API response
 * Uses anonymous identifiers to protect device privacy
 */
function formatDeviceResponse(device: DeviceInfo) {
  const lastSeenDate = new Date(device.lastSeen);
  const isActive = (Date.now() - lastSeenDate.getTime()) < ACTIVE_THRESHOLD_MS;

  // Build location object if coordinates are available
  const location = device.latitude !== undefined && device.longitude !== undefined
    ? {
        latitude: device.latitude,
        longitude: device.longitude,
        altitude: device.altitude,
        name: device.locationName,
        city: device.locationCity,
        country: device.locationCountry,
      }
    : null;

  // Build characteristics object with device versions
  const characteristics: Record<string, string> = {};
  if (device.hwVersion) {
    characteristics.hardware_version = device.hwVersion;
  }
  if (device.fwVersion) {
    characteristics.firmware_version = device.fwVersion;
  }

  return {
    identifier: getDeviceDisplayId(device.devEui),
    description: device.locationName
      ? `Multiflexmeter at ${device.locationName}`
      : 'Multiflexmeter device',
    location,
    last_seen: device.lastSeen,
    active: isActive,
    characteristics,
    payload_format: {
      sensors: ['jsn_sr04t', 'rpm_sensor'],
      measurements: [
        {
          name: 'water_distance_from_device',
          unit: 'mm',
          fport: 1,
        },
        {
          name: 'temperature',
          unit: 'celsius',
          fport: 1,
        },
        {
          name: 'rpm',
          unit: 'rotations_per_minute',
          fport: 3,
        },
        {
          name: 'in_operation',
          unit: 'boolean',
          fport: 3,
        },
      ],
    },
  };
}

export const GET: APIRoute = async ({ request }) => {
  // Require authentication using API credentials
  // In development mode, authentication is skipped
  const isAuthenticated = verifyBasicAuth(request, true, 'api');

  if (!isAuthenticated) {
    console.warn('Unauthorized GET request to /api/v1/devices');
    return createUnauthorizedResponse('Devices API');
  }

  try {
    // Get all devices from the data store
    const devices = await dataStore.getDevices();

    // Format devices for API response
    const formattedDevices = devices.map(formatDeviceResponse);

    return new Response(JSON.stringify(formattedDevices), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error fetching devices:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch devices' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
