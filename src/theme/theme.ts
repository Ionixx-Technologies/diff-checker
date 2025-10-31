// Light and Dark theme configurations with modern developer-tool aesthetic
export const lightTheme = {
  colors: {
    primary: '#3b82f6', // Modern blue
    primaryDark: '#2563eb',
    primaryLight: '#60a5fa',
    text: '#0f172a',
    subtleText: '#64748b',
    border: '#e2e8f0',
    borderLight: '#f1f5f9',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#06b6d4',
    white: '#ffffff',
    background: '#f8fafc',
    cardBackground: '#ffffff',
    cardBackgroundHover: '#f8fafc',
    // Diff colors for light mode with modern palette
    diffAdded: '#d1fae5',
    diffAddedText: '#065f46',
    diffAddedBorder: '#10b981',
    diffRemoved: '#fee2e2',
    diffRemovedText: '#991b1b',
    diffRemovedBorder: '#ef4444',
    diffChanged: '#fef3c7',
    diffChangedText: '#92400e',
    diffChangedBorder: '#f59e0b',
    diffUnchanged: '#f8fafc',
    // Gradient colors
    gradientStart: '#3b82f6',
    gradientEnd: '#8b5cf6',
    // Overlay colors
    overlayLight: 'rgba(255, 255, 255, 0.95)',
    overlayDark: 'rgba(0, 0, 0, 0.05)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  spacing: (n: number) => `${n * 4}px`,
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
    mono: '"Roboto Mono", "Fira Code", "Consolas", "Monaco", monospace',
  },
} as const;

export const darkTheme = {
  colors: {
    primary: '#60a5fa', // Brighter blue for dark mode
    primaryDark: '#3b82f6',
    primaryLight: '#93c5fd',
    text: '#f1f5f9',
    subtleText: '#94a3b8',
    border: '#334155',
    borderLight: '#475569',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    info: '#22d3ee',
    white: '#ffffff',
    background: '#0f172a',
    cardBackground: '#1e293b',
    cardBackgroundHover: '#334155',
    // Diff colors for dark mode with enhanced contrast
    diffAdded: '#064e3b',
    diffAddedText: '#6ee7b7',
    diffAddedBorder: '#10b981',
    diffRemoved: '#7f1d1d',
    diffRemovedText: '#fca5a5',
    diffRemovedBorder: '#ef4444',
    diffChanged: '#78350f',
    diffChangedText: '#fcd34d',
    diffChangedBorder: '#f59e0b',
    diffUnchanged: '#1e293b',
    // Gradient colors
    gradientStart: '#60a5fa',
    gradientEnd: '#a78bfa',
    // Overlay colors
    overlayLight: 'rgba(30, 41, 59, 0.95)',
    overlayDark: 'rgba(0, 0, 0, 0.3)',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.25)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
  },
  spacing: (n: number) => `${n * 4}px`,
  fonts: {
    body: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", "Roboto", "Oxygen", "Ubuntu", sans-serif',
    mono: '"Roboto Mono", "Fira Code", "Consolas", "Monaco", monospace',
  },
} as const;

// Default theme (light)
export const theme = lightTheme;

// Base theme type for styled-components
export type AppTheme = {
  colors: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    text: string;
    subtleText: string;
    border: string;
    borderLight: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    white: string;
    background: string;
    cardBackground: string;
    cardBackgroundHover: string;
    diffAdded: string;
    diffAddedText: string;
    diffAddedBorder: string;
    diffRemoved: string;
    diffRemovedText: string;
    diffRemovedBorder: string;
    diffChanged: string;
    diffChangedText: string;
    diffChangedBorder: string;
    diffUnchanged: string;
    gradientStart: string;
    gradientEnd: string;
    overlayLight: string;
    overlayDark: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    inner: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  spacing: (n: number) => string;
  fonts: {
    body: string;
    mono: string;
  };
};

