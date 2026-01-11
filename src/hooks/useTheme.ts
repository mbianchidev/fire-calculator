/**
 * Theme Hook
 * Manages theme state and provides theme toggle functionality
 */

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'fire-tools-theme';

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Update meta theme-color tags for mobile browsers
  const metaThemeColors = document.querySelectorAll('meta[name="theme-color"]');
  const themeColor = resolved === 'dark' ? '#0F0F0F' : '#FFFFFF';
  metaThemeColors.forEach(meta => {
    meta.setAttribute('content', themeColor);
  });
};

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    return stored || 'dark'; // Default to dark mode
  });

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const currentTheme = stored || 'dark';
    return currentTheme === 'system' ? getSystemTheme() : currentTheme;
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  }, [resolvedTheme, setTheme]);

  // Apply theme on mount and remove no-transitions class
  useEffect(() => {
    applyTheme(resolvedTheme);
    
    // Remove no-transitions class after initial render
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('no-transitions');
    });
  }, [resolvedTheme]); // Re-run when resolvedTheme changes

  // Watch for system theme changes when in system mode
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        const resolved = e.matches ? 'dark' : 'light';
        setResolvedTheme(resolved);
        applyTheme(resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const isDark = resolvedTheme === 'dark';

  return {
    theme,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
  };
}
