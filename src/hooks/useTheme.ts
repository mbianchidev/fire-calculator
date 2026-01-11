import { useState, useEffect, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

// NOTE: This storage key must match the one in index.html flash prevention script
const STORAGE_KEY = 'fire-tools-theme';

const getSystemTheme = (): ResolvedTheme => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (resolved: ResolvedTheme) => {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  
  // Update meta theme-color tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', resolved === 'dark' ? '#0F0F0F' : '#FFFFFF');
  }
};

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    return stored || 'dark'; // Default to 'dark' if no preference
  } catch (error) {
    // localStorage might not be available (SSR, strict privacy settings)
    console.warn('localStorage not available, defaulting to dark theme', error);
    return 'dark';
  }
};

export const useTheme = () => {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme);

  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => {
    const themeToResolve = getStoredTheme();
    return themeToResolve === 'system' ? getSystemTheme() : themeToResolve;
  });

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    
    try {
      localStorage.setItem(STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('Failed to save theme to localStorage', error);
    }
    
    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme;
    setResolvedTheme(resolved);
    applyTheme(resolved);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setTheme]);

  // Apply theme on mount
  useEffect(() => {
    applyTheme(resolvedTheme);
  }, []);

  // Watch for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newResolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(newResolved);
      applyTheme(newResolved);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  const isDark = resolvedTheme === 'dark';

  return {
    theme,
    resolvedTheme,
    isDark,
    setTheme,
    toggleTheme,
  };
};
