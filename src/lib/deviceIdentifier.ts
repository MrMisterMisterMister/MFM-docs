/**
 * Device Identifier Utilities
 *
 * Generates anonymous, non-identifying display names for devices
 * to prevent DevEUI exposure and potential spoofing attacks.
 */

import { createHash } from 'crypto';

/**
 * Generate a short, anonymous identifier for a device
 *
 * This creates a consistent 8-character hash from the DevEUI
 * that cannot be reversed to obtain the original DevEUI.
 *
 * @param devEui - The device EUI
 * @returns 8-character anonymous identifier
 */
export function getDeviceDisplayId(devEui: string): string {
  // Create SHA-256 hash and take first 8 characters
  const hash = createHash('sha256')
    .update(devEui)
    .digest('hex')
    .substring(0, 8)
    .toUpperCase();

  return `MFM-${hash}`;
}

/**
 * Get a friendly device name for display
 *
 * Priority:
 * 1. Location name if available
 * 2. Anonymous hash-based ID
 *
 * @param device - Device info
 * @returns User-friendly device name
 */
export function getDeviceDisplayName(device: { devEui: string; locationName?: string }): string {
  if (device.locationName) {
    return device.locationName;
  }

  return getDeviceDisplayId(device.devEui);
}

/**
 * Get full device label with location context
 *
 * @param device - Device info
 * @returns Full label like "Mallemolen (MFM-A1B2C3D4)" or just "MFM-A1B2C3D4"
 */
export function getDeviceLabel(device: {
  devEui: string;
  locationName?: string;
  locationCity?: string;
}): string {
  const id = getDeviceDisplayId(device.devEui);

  if (device.locationName && device.locationCity) {
    return `${device.locationName}, ${device.locationCity}`;
  } else if (device.locationName) {
    return device.locationName;
  }

  return id;
}
