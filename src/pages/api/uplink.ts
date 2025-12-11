/**
 * API endpoint to receive LoRaWAN uplink messages
 *
 * Supports two modes:
 * 1. DEV mode (import.meta.env.DEV) - Receives simplified messages from device-simulator
 * 2. PRODUCTION mode - Only accepts TTN webhook payloads with Basic Auth
 */

import type { APIRoute } from 'astro';
import { dataStore } from '../../lib/dataStore';
import { reverseGeocode, needsReverseGeocoding } from '../../lib/geocoding';
import { verifyBasicAuth, createUnauthorizedResponse } from '../../lib/auth';

export const POST: APIRoute = async ({ request }) => {
  try {
  // Verify Basic Authentication (skip in DEV mode for local simulator)
  const isAuthenticated = verifyBasicAuth(request, true);

  if (!isAuthenticated) {
      console.warn('Unauthorized webhook request');
      return createUnauthorizedResponse('TTN Webhook');
  }

  if (!import.meta.env.DEV) {
      console.log('Webhook authenticated');
  }

  const body = await request.json();

  // Debug: Log the entire payload structure (limited to avoid log overflow)
  console.log('Received webhook payload structure:');
  console.log(`- end_device_ids: ${body.end_device_ids ? 'present' : 'missing'}`);
  console.log(`- uplink_message: ${body.uplink_message ? 'present' : 'missing'}`);
  console.log(`- locations (root): ${body.locations ? 'present' : 'missing'}`);
  console.log(`- uplink_message.locations: ${body.uplink_message?.locations ? 'present' : 'missing'}`);
  if (body.locations?.user) {
      console.log(`- locations.user (root): present`);
      console.log(`- latitude: ${body.locations.user.latitude}`);
      console.log(`- longitude: ${body.locations.user.longitude}`);
      console.log(`- altitude: ${body.locations.user.altitude}`);
  }
  if (body.uplink_message?.locations?.user) {
      console.log(`- uplink_message.locations.user: present`);
      console.log(`- latitude: ${body.uplink_message.locations.user.latitude}`);
      console.log(`- longitude: ${body.uplink_message.locations.user.longitude}`);
      console.log(`- altitude: ${body.uplink_message.locations.user.altitude}`);
  }

  // Detect message format
  if (body.end_device_ids) {
      // TTN webhook format
      return handleTTNWebhook(body);
  } else if (body.devEui && body.fPort !== undefined) {
      // Local simulator format - ONLY ALLOWED IN DEV MODE
      if (!import.meta.env.DEV) {
  return new Response(
          JSON.stringify({ error: 'Local simulator not allowed in production. Use TTN webhook.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
  );
      }
      return handleLocalMessage(body);
  } else {
      return new Response(
  JSON.stringify({ error: 'Invalid message format' }),
  { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
  }
  } catch (error) {
  console.error('Error processing uplink:', error);
  return new Response(
      JSON.stringify({ error: 'Internal server error', message: String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
  );
  }
};

/**
 * Handle TTN webhook payload
 */
async function handleTTNWebhook(body: any) {
  const { end_device_ids, uplink_message, locations } = body;

  if (!uplink_message) {
  return new Response(
      JSON.stringify({ error: 'Missing uplink_message' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
  }

  // Extract GPS coordinates from TTN location
  // Try uplink_message.locations first (standard location), then fall back to root locations
  const userLocation = uplink_message.locations?.user || locations?.user;
  const latitude = userLocation?.latitude;
  const longitude = userLocation?.longitude;
  const altitude = userLocation?.altitude;

  // Debug: Log if location data is present
  if (latitude !== undefined && longitude !== undefined) {
  console.log(`Received GPS coordinates: (${latitude}, ${longitude}) @ ${altitude}m`);
  } else {
  console.warn(`No GPS coordinates in webhook payload for device ${end_device_ids.dev_eui}`);
  console.warn(`uplink_message.locations:`, JSON.stringify(uplink_message.locations || 'undefined'));
  console.warn(`root locations:`, JSON.stringify(locations || 'undefined'));
  }

  // Prepare message with GPS coordinates
  const message = {
  devEui: end_device_ids.dev_eui,
  devAddr: end_device_ids.dev_addr,
  fPort: uplink_message.f_port,
  payload: uplink_message.frm_payload,
  receivedAt: uplink_message.received_at || new Date().toISOString(),
  decoded: uplink_message.decoded_payload,
  rssi: uplink_message.rx_metadata?.[0]?.rssi,
  snr: uplink_message.rx_metadata?.[0]?.snr,
  latitude,
  longitude,
  altitude,
  };

  await dataStore.processUplink(message);

  return new Response(
  JSON.stringify({ success: true, message: 'Uplink processed' }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * Handle local simulator message
 */
async function handleLocalMessage(body: any) {
  const { devEui, devAddr, fPort, payload, receivedAt, decoded, rssi, snr, latitude, longitude, altitude } = body;

  if (!devEui || fPort === undefined || !payload) {
  return new Response(
      JSON.stringify({ error: 'Missing required fields: devEui, fPort, payload' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
  );
  }

  const message = {
  devEui,
  devAddr,
  fPort,
  payload,
  receivedAt: receivedAt || new Date().toISOString(),
  decoded,
  rssi,
  snr,
  latitude,
  longitude,
  altitude,
  };

  await dataStore.processUplink(message);

  return new Response(
  JSON.stringify({ success: true, message: 'Uplink processed' }),
  { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}

/**
 * GET endpoint - returns current status (requires authentication)
 */
export const GET: APIRoute = async ({ request }) => {
  // Require authentication for GET endpoint
  const isAuthenticated = verifyBasicAuth(request, true);

  if (!isAuthenticated) {
    console.warn('Unauthorized GET request to /api/uplink');
    return createUnauthorizedResponse('API');
  }

  const devices = await dataStore.getDevices();
  const recentReadings = await dataStore.getRecentReadings(10);

  return new Response(
    JSON.stringify({
      status: 'running',
      deviceCount: devices.length,
      recentReadingsCount: recentReadings.length,
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
