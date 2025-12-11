/**
 * API endpoint to manually reset the database
 *
 * POST /api/reset - Clears all database data
 *
 * Security:
 * - Requires Basic Authentication (same credentials as webhook)
 * - Only works in DEV mode OR with valid auth in production
 */

import type { APIRoute } from 'astro';
import { resetDatabase } from '../../lib/dbReset';
import { verifyBasicAuth, createUnauthorizedResponse } from '../../lib/auth';

/**
 * POST - Reset database
 */
export const POST: APIRoute = async ({ request }) => {
  try {
  // Check authentication (skip in DEV mode)
  const isAuthenticated = verifyBasicAuth(request, true);

  if (!isAuthenticated) {
      console.warn('Unauthorized database reset attempt');
      return createUnauthorizedResponse('Database Reset');
  }

  // Perform database reset
  await resetDatabase({
      force: true,
      logReason: 'Manual database reset via API',
  });

  return new Response(
      JSON.stringify({
  success: true,
  message: 'Database reset successfully',
  timestamp: new Date().toISOString(),
      }),
      {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
      }
  );
  } catch (error) {
  console.error('Error resetting database:', error);
  return new Response(
      JSON.stringify({
  error: 'Failed to reset database',
  message: String(error),
      }),
      {
  status: 500,
  headers: { 'Content-Type': 'application/json' },
      }
  );
  }
};

/**
 * GET - Show reset status and configuration
 */
export const GET: APIRoute = async () => {
  const resetOnDeploy = process.env.RESET_DB_ON_DEPLOY === 'true';
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REDIS_URL !== undefined;

  return new Response(
  JSON.stringify({
      status: 'Database Reset API',
      resetOnDeployEnabled: resetOnDeploy,
      environment: isProduction ? 'production' : 'development',
      instructions: 'POST to this endpoint with Basic Auth to manually reset the database',
  }),
  {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
  }
  );
};
