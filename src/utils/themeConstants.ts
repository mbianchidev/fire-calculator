/**
 * Theme constants
 * Central location for theme-related configuration
 */

export const DEFAULT_THEME = 'dark' as const;

/**
 * Mobile browser theme-color meta tag values
 * These colors affect the browser UI (address bar, status bar) on mobile devices
 * Should match the primary background color of each theme
 */
export const THEME_META_COLORS = {
  dark: '#0F0F0F',
  light: '#FFFFFF',
} as const;

export type Theme = 'dark' | 'light' | 'system';
export type ResolvedTheme = 'dark' | 'light';
