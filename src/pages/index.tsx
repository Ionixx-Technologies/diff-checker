/**
 * Modern Diff Checker - Main Application Page
 * 
 * Refactored version that integrates all diff-checker functionality directly
 * into the main index page with enhanced UI, drag & drop support, and modern animations.
 * 
 * Key Features:
 * - Fully responsive design (mobile, tablet, desktop)
 * - Drag & drop file upload
 * - Theme switching with smooth transitions
 * - Modern UI with animations and hover effects
 * - Accessible (keyboard navigation, ARIA labels)
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { DiffChecker } from '@/components/DiffChecker';
import { lightTheme, darkTheme } from '@/theme';

// Type definition for theme mode
type ThemeMode = 'light' | 'dark';

/**
 * Main application page component
 * Integrates theme management and diff checker functionality
 */
export default function Home() {
  // Theme state management
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [currentTheme, setCurrentTheme] = useState<typeof lightTheme | typeof darkTheme>(lightTheme);
  const [mounted, setMounted] = useState(false);

  /**
   * Load saved theme preference from localStorage on component mount
   * Runs only on client side to avoid hydration mismatch
   */
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('app-theme-mode') as ThemeMode | null;
    
    // If a valid theme preference exists, apply it
    if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
      setThemeMode(storedTheme);
      setCurrentTheme(storedTheme === 'dark' ? darkTheme : lightTheme);
    }
  }, []);

  /**
   * Toggle between light and dark themes
   * Saves preference to localStorage for persistence
   */
  const toggleTheme = () => {
    const newMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    setCurrentTheme(newMode === 'dark' ? darkTheme : lightTheme);
    localStorage.setItem('app-theme-mode', newMode);
  };

  /**
   * Prevent flash of unstyled content during SSR
   * Show loading state until client-side hydration is complete
   */
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Head section with metadata */}
      <Head>
        <title>Diff Checker & Validator - Compare JSON, XML, Text</title>
        <meta name="description" content="Compare and validate JSON, XML, and plain text files with visual diff highlighting. Supports drag & drop, file upload, and clipboard paste." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content={themeMode === 'light' ? '#ffffff' : '#111827'} />
        
        {/* Open Graph / Social Media Meta Tags */}
        <meta property="og:title" content="Diff Checker & Validator" />
        <meta property="og:description" content="Compare and validate JSON, XML, and plain text with visual diff highlighting" />
        <meta property="og:type" content="website" />
        
        {/* Favicon and icons */}
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Theme provider wraps the entire application */}
      <ThemeProvider theme={currentTheme}>
        {/* 
          DiffChecker Component
          - Handles all diff comparison logic
          - Includes drag & drop file upload
          - Supports manual entry, file upload, clipboard paste
          - Provides visual diff highlighting
          - Validates JSON, XML, and plain text formats
        */}
        <DiffChecker 
          themeMode={themeMode} 
          onThemeToggle={toggleTheme}
        />
      </ThemeProvider>

      {/* 
        Global Styles for smooth transitions and animations
        Injected via styled-components createGlobalStyle would go here
        if needed for body/html level styles
      */}
      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
            sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          transition: background-color 0.3s ease, color 0.3s ease;
        }

        /* Custom scrollbar styling for modern look */
        ::-webkit-scrollbar {
          width: 12px;
          height: 12px;
        }

        ::-webkit-scrollbar-track {
          background: ${themeMode === 'light' ? '#f1f1f1' : '#1f2937'};
          border-radius: 6px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${themeMode === 'light' ? '#888' : '#4b5563'};
          border-radius: 6px;
          transition: background 0.2s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${themeMode === 'light' ? '#555' : '#6b7280'};
        }

        /* Focus visible for keyboard navigation */
        *:focus-visible {
          outline: 2px solid ${themeMode === 'light' ? '#111827' : '#f9fafb'};
          outline-offset: 2px;
        }

        /* Selection color */
        ::selection {
          background-color: ${themeMode === 'light' ? '#111827' : '#f9fafb'};
          color: ${themeMode === 'light' ? '#ffffff' : '#111827'};
        }

        /* Smooth animations for theme transitions */
        * {
          transition-property: background-color, color, border-color;
          transition-duration: 0.3s;
          transition-timing-function: ease;
        }

        /* Disable animations for reduced motion preference */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Print styles */
        @media print {
          body {
            background: white;
            color: black;
          }
        }

        /* Responsive typography */
        @media (max-width: 768px) {
          html {
            font-size: 14px;
          }
        }

        @media (min-width: 769px) and (max-width: 1024px) {
          html {
            font-size: 15px;
          }
        }

        @media (min-width: 1025px) {
          html {
            font-size: 16px;
          }
        }
      `}</style>
    </>
  );
}

