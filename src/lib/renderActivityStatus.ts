/**
 * Shared utility to render device activity status
 * Used by both server-side (Astro) and client-side (browser) code
 */

export function renderActivityStatus(reading: any): string {
  if (!reading) return '<span class="no-data">No data</span>';
  
  let status = reading.spinning ? 'Spinning' : 'Stopped';
  if (reading.pumping) status += ' • Pumping';
  return status;
}
