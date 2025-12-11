/**
 * Reverse Geocoding Utility
 *
 * Uses OpenStreetMap Nominatim API to convert GPS coordinates to location names
 * https://nominatim.org/release-docs/develop/api/Reverse/
 *
 * Note: Free to use, no API key required, but has usage limits:
 * - Max 1 request per second
 * - Must include User-Agent header
 */

export interface ReverseGeocodeResult {
  locationName?: string;    // e.g., "Mallemolen" or address
  locationCity?: string;    // e.g., "Gouda"
  locationCountry?: string; // e.g., "Netherlands"
}

// Rate limiting: track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 1000; // 1 second (Nominatim requirement)
const GEOCODING_TIMEOUT = 5000; // 5 second timeout for API requests

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * Reverse geocode GPS coordinates to location information
 *
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 * @returns Location information or null if request fails
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<ReverseGeocodeResult | null> {
  try {
    // Rate limiting: ensure 1 second between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve =>
        setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest)
      );
    }
    lastRequestTime = Date.now();

    // Construct Nominatim API URL
    const url = new URL('https://nominatim.openstreetmap.org/reverse');
    url.searchParams.set('lat', latitude.toString());
    url.searchParams.set('lon', longitude.toString());
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('zoom', '18'); // High detail for buildings/landmarks
    url.searchParams.set('addressdetails', '1');

    // Make request with required User-Agent and timeout
    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        'User-Agent': 'Multiflexmeter/3.7.0 (https://github.com/MrMisterMisterMister/MFM-docs)',
        'Accept': 'application/json',
      },
    }, GEOCODING_TIMEOUT);

    if (!response.ok) {
      console.error(`Nominatim API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json();

    // Extract location information from response
    const address = data.address || {};

    // Try to find a meaningful location name
    // Priority: tourism/building name, hamlet, suburb, neighbourhood
    const locationName =
      address.tourism ||
      address.building ||
      address.hamlet ||
      address.suburb ||
      address.neighbourhood ||
      address.road ||
      undefined;

    // Extract city (try multiple fields)
    const locationCity =
      address.city ||
      address.town ||
      address.village ||
      address.municipality ||
      undefined;

    // Extract country
    const locationCountry = address.country || undefined;

    console.log(`Reverse geocoded (${latitude}, ${longitude}) →`, {
      locationName,
      locationCity,
      locationCountry,
    });

    return {
      locationName,
      locationCity,
      locationCountry,
    };
  } catch (error) {
    console.error('Error during reverse geocoding:', error);
    return null;
  }
}

/**
 * Check if reverse geocoding is needed
 *
 * @param latitude - New latitude value
 * @param longitude - New longitude value
 * @param existingLat - Existing latitude in database
 * @param existingLon - Existing longitude in database
 * @returns true if coordinates have changed significantly
 */
export function needsReverseGeocoding(
  latitude: number,
  longitude: number,
  existingLat?: number,
  existingLon?: number
): boolean {
  // If no existing coordinates, needs geocoding
  if (existingLat === undefined || existingLon === undefined) {
    return true;
  }

  // Calculate distance change (simplified)
  const latDiff = Math.abs(latitude - existingLat);
  const lonDiff = Math.abs(longitude - existingLon);

  // Threshold: ~100 meters (roughly 0.001 degrees)
  const threshold = 0.001;

  return latDiff > threshold || lonDiff > threshold;
}
