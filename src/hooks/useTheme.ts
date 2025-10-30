/**
 * useTheme Hook
 * 
 * Provides theme switching functionality with persistence to localStorage
 */

import { useState, useEffect } from 'react';
import { lightTheme, darkTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme-mode';

export const useTheme = () => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(lightTheme);

  // Load theme from localStorage on mount
  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeMode(storedTheme);
      setCurrentTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, []);

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setCurrentTheme(newMode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newMode);
  };

  // Set a specific theme mode
  const setTheme = (mode: ThemeMode) => {
    setThemeMode(mode);
    setCurrentTheme(mode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  return {
    themeMode,
    currentTheme,
    toggleTheme,
    setTheme,
    isDark: themeMode === 'dark',
  };
};

