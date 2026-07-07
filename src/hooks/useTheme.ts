/* ============================================================
   KashFinance Project Tracker V3 — useTheme Hook
   ============================================================ */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ThemeMode } from '../types/settings';

const STORAGE_KEY = 'kash-theme-mode';

type ResolvedTheme = 'dark' | 'light';

interface UseThemeReturn {
  /** The user's theme preference (may be 'system') */
  themeMode: ThemeMode;
  /** The resolved theme actually applied ('dark' | 'light') */
  resolvedTheme: ResolvedTheme;
  /** Whether the resolved theme is dark */
  isDark: boolean;
  /** Set a specific theme mode */
  setThemeMode: (mode: ThemeMode) => void;
  /** Toggle between dark and light (ignores 'system') */
  toggleTheme: () => void;
  /** Cycle through: dark → light → system → dark */
  cycleTheme: () => void;
  /** Alias of resolvedTheme (convenience) */
  theme: ResolvedTheme;
  /** Alias of setThemeMode (convenience) */
  setTheme: (mode: ThemeMode) => void;
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStoredTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light' || stored === 'system') {
      return stored;
    }
  } catch {
    // localStorage may be unavailable
  }
  return 'system';
}

function applyTheme(resolved: ResolvedTheme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  // Update meta theme-color for PWA
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? '#0a0e1a' : '#f8fafc');
  }
}

export function useTheme(): UseThemeReturn {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(getStoredTheme);
  const [systemPref, setSystemPref] = useState<ResolvedTheme>(getSystemPreference);

  // Listen for system preference changes
  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = (e: MediaQueryListEvent) => {
      setSystemPref(e.matches ? 'dark' : 'light');
    };

    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  // Resolve and apply theme whenever mode or system preference changes
  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (themeMode === 'system') return systemPref;
    return themeMode;
  }, [themeMode, systemPref]);

  useEffect(() => {
    applyTheme(resolvedTheme);
  }, [resolvedTheme]);

  const setThemeMode = useCallback((mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // Silent fail
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  }, [resolvedTheme, setThemeMode]);

  const cycleTheme = useCallback(() => {
    const cycle: ThemeMode[] = ['dark', 'light', 'system'];
    const currentIndex = cycle.indexOf(themeMode);
    const nextIndex = (currentIndex + 1) % cycle.length;
    setThemeMode(cycle[nextIndex]);
  }, [themeMode, setThemeMode]);

  return {
    themeMode,
    resolvedTheme,
    isDark: resolvedTheme === 'dark',
    setThemeMode,
    toggleTheme,
    cycleTheme,
    theme: resolvedTheme,
    setTheme: setThemeMode,
  };
}
