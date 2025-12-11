/**
 * Theme Management System
 * Handles light/dark mode detection, persistence, and switching
 */

const THEME_KEY = 'multiflexmeter-theme';
const LIGHT_MODE_CLASS = 'light-mode';

export type Theme = 'light' | 'dark';

/**
 * Get the current theme from localStorage or system preference
 */
export function getTheme(): Theme {
  // Check localStorage first
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') {
  return stored;
  }

  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  return 'light';
  }

  return 'dark'; // Default to dark
}

/**
 * Apply the theme to the document
 */
export function applyTheme(theme: Theme): void {
  if (theme === 'light') {
  document.body.classList.add(LIGHT_MODE_CLASS);
  } else {
  document.body.classList.remove(LIGHT_MODE_CLASS);
  }
}

/**
 * Save the theme preference to localStorage
 */
export function saveTheme(theme: Theme): void {
  localStorage.setItem(THEME_KEY, theme);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): Theme {
  const current = getTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  applyTheme(newTheme);
  saveTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on page load (call this immediately to prevent flash)
 */
export function initTheme(): void {
  const theme = getTheme();
  applyTheme(theme);
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(): void {
  if (!window.matchMedia) return;

  const mediaQuery = window.matchMedia('(prefers-color-scheme: light)');
  mediaQuery.addEventListener('change', (e) => {
  // Only auto-switch if user hasn't set a preference
  const stored = localStorage.getItem(THEME_KEY);
  if (!stored) {
      const theme = e.matches ? 'light' : 'dark';
      applyTheme(theme);
  }
  });
}
