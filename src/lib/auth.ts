/**
 * Authentication utilities
 *
 * Provides secure Basic Authentication verification with constant-time comparison
 * to prevent timing attacks.
 */

import { timingSafeEqual } from 'crypto';

/**
 * Verify Basic Authentication using constant-time comparison
 *
 * @param request - The incoming HTTP request
 * @param skipInDev - Whether to skip auth in development mode (default: true)
 * @returns true if authenticated, false otherwise
 */
export function verifyBasicAuth(request: Request, skipInDev: boolean = true): boolean {
  // Skip authentication in DEV mode if requested
  if (skipInDev && import.meta.env.DEV) {
    return true;
  }

  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  try {
    // Extract credentials from Authorization header
    const base64Credentials = authHeader.substring(6); // Remove 'Basic '
    const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
    const [username, password] = credentials.split(':');

    // Get expected credentials from environment
    const expectedUsername = process.env.WEBHOOK_USERNAME;
    const expectedPassword = process.env.WEBHOOK_PASSWORD;

    // Verify credentials are configured
    if (!expectedUsername || !expectedPassword) {
      console.warn('WARNING: WEBHOOK_USERNAME or WEBHOOK_PASSWORD not configured');
      return false;
    }

    // Use constant-time comparison to prevent timing attacks
    const usernameMatch = timingSafeEqual(
      Buffer.from(username),
      Buffer.from(expectedUsername)
    );
    const passwordMatch = timingSafeEqual(
      Buffer.from(password),
      Buffer.from(expectedPassword)
    );

    return usernameMatch && passwordMatch;
  } catch (error) {
    console.error('Error parsing Basic Auth:', error);
    return false;
  }
}

/**
 * Create a 401 Unauthorized response
 *
 * @param realm - The authentication realm name
 * @returns HTTP 401 Response with WWW-Authenticate header
 */
export function createUnauthorizedResponse(realm: string = 'API'): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'WWW-Authenticate': `Basic realm="${realm}"`,
      },
    }
  );
}
