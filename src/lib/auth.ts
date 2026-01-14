/**
 * Authentication utilities
 *
 * Provides secure Basic Authentication verification with constant-time comparison
 * to prevent timing attacks.
 *
 * Supports two credential types:
 * - WEBHOOK_USERNAME/WEBHOOK_PASSWORD: For TTN webhook endpoints
 * - API_USERNAME/API_PASSWORD: For public API endpoints
 */

import { timingSafeEqual } from 'crypto';

export type AuthType = 'webhook' | 'api';

/**
 * Verify Basic Authentication using constant-time comparison
 *
 * @param request - The incoming HTTP request
 * @param skipInDev - Whether to skip auth in development mode (default: true)
 * @param authType - Which credentials to verify against ('webhook' or 'api', default: 'webhook')
 * @returns true if authenticated, false otherwise
 */
export function verifyBasicAuth(
  request: Request,
  skipInDev: boolean = true,
  authType: AuthType = 'webhook'
): boolean {
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

    // Get expected credentials from environment based on auth type
    let expectedUsername: string | undefined;
    let expectedPassword: string | undefined;

    if (authType === 'api') {
      expectedUsername = process.env.API_USERNAME;
      expectedPassword = process.env.API_PASSWORD;
    } else {
      expectedUsername = process.env.WEBHOOK_USERNAME;
      expectedPassword = process.env.WEBHOOK_PASSWORD;
    }

    // Verify credentials are configured
    if (!expectedUsername || !expectedPassword) {
      const envPrefix = authType === 'api' ? 'API' : 'WEBHOOK';
      console.warn(`WARNING: ${envPrefix}_USERNAME or ${envPrefix}_PASSWORD not configured`);
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
