/**
 * Database Reset Utility
 *
 * Provides configurable database reset functionality for development and deployment
 * Can be triggered automatically on startup or manually via API endpoint
 */

import { db } from './dbAdapter';

export interface ResetOptions {
  force?: boolean;
  logReason?: string;
}

/**
 * Check if database should be reset based on environment configuration
 */
export function shouldResetOnDeploy(): boolean {
  const resetFlag = process.env.RESET_DB_ON_DEPLOY;

  // Only reset if explicitly set to 'true'
  return resetFlag === 'true';
}

/**
 * Reset the database (clear all data)
 */
export async function resetDatabase(options: ResetOptions = {}): Promise<void> {
  const { force = false, logReason = 'Database reset' } = options;

  // Safety check: Don't reset in production unless forced or configured
  const isProduction = process.env.NODE_ENV === 'production' || process.env.REDIS_URL !== undefined;

  if (isProduction && !force && !shouldResetOnDeploy()) {
    console.warn('Database reset skipped: Not configured for production reset');
    console.warn('   Set RESET_DB_ON_DEPLOY=true in environment to enable');
    return;
  }

  console.log(`${logReason}...`);

  try {
    await db.clearAll();
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Failed to reset database:', error);
    throw error;
  }
}

/**
 * Automatically reset database on startup if configured
 * Call this during application initialization
 */
export async function autoResetOnStartup(): Promise<void> {
  if (!shouldResetOnDeploy()) {
    return;
  }

  console.log('RESET_DB_ON_DEPLOY is enabled');
  await resetDatabase({
    force: true,
    logReason: 'Automatic database reset on deployment',
  });
}
