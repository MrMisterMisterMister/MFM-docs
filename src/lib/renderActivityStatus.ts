/**
 * Shared utility to render device activity status
 * Used by both server-side (Astro) and client-side (browser) code
 */

export function renderActivityStatus(reading: any): string {
  if (!reading) return '<span class="no-data">No data</span>';

  // Use ind (in_bedrijf) and rpm to determine status
  const isOperating = reading.ind || (reading.rpm && reading.rpm > 0);
  const status = isOperating ? 'In Operation' : 'Idle';

  // Optionally include RPM if available
  if (reading.rpm !== undefined && reading.rpm !== null) {
    return `${status} • ${reading.rpm.toFixed(2)} RPM`;
  }

  return status;
}
