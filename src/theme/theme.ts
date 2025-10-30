// Light and Dark theme configurations
export const lightTheme = {
  colors: {
    primary: '#111827',
    text: '#111827',
    subtleText: '#6b7280',
    border: '#e5e7eb',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    white: '#ffffff',
    background: '#ffffff',
    cardBackground: '#f9fafb',
    // Diff colors for light mode
    diffAdded: '#d1fae5',
    diffAddedText: '#065f46',
    diffRemoved: '#fee2e2',
    diffRemovedText: '#991b1b',
    diffChanged: '#fef3c7',
    diffChangedText: '#92400e',
    diffUnchanged: '#f3f4f6',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  spacing: (n: number) => `${n * 4}px`,
} as const;

export const darkTheme = {
  colors: {
    primary: '#f9fafb',
    text: '#f9fafb',
    subtleText: '#9ca3af',
    border: '#374151',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    white: '#ffffff',
    background: '#111827',
    cardBackground: '#1f2937',
    // Diff colors for dark mode
    diffAdded: '#064e3b',
    diffAddedText: '#6ee7b7',
    diffRemoved: '#7f1d1d',
    diffRemovedText: '#fca5a5',
    diffChanged: '#78350f',
    diffChangedText: '#fcd34d',
    diffUnchanged: '#374151',
  },
  radii: {
    sm: '6px',
    md: '8px',
    lg: '12px',
  },
  spacing: (n: number) => `${n * 4}px`,
} as const;

// Default theme (light)
export const theme = lightTheme;

// Base theme type for styled-components
export type AppTheme = {
  colors: {
    primary: string;
    text: string;
    subtleText: string;
    border: string;
    error: string;
    success: string;
    warning: string;
    white: string;
    background: string;
    cardBackground: string;
    diffAdded: string;
    diffAddedText: string;
    diffRemoved: string;
    diffRemovedText: string;
    diffChanged: string;
    diffChangedText: string;
    diffUnchanged: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
  };
  spacing: (n: number) => string;
};

