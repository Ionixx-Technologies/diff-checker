/**
 * Modern Diff Checker & Validator - Main Application Page
 * 
 * Integrates both diff-checker and validator functionality with tabs
 * for easy navigation between tools.
 * 
 * Key Features:
 * - Fully responsive design (mobile, tablet, desktop)
 * - Drag & drop file upload
 * - Theme switching with smooth transitions
 * - Modern UI with animations and hover effects
 * - Accessible (keyboard navigation, ARIA labels)
 * - Tab-based navigation between Diff Checker and Validator
 */

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { DiffChecker } from '@/components/DiffChecker';
import { Validator } from '@/components/Validator';
import { Tabs, TabItem } from '@/components/Tabs/Tabs';
import { lightTheme, darkTheme } from '@/theme';

// Type definition for theme mode
type ThemeMode = 'light' | 'dark';

// Styled components for the main page layout
const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${(props) => props.theme.colors.background};
  transition: background-color 0.3s ease;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacing(4)};
  border-bottom: 1px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.border};
  }

  &:active {
    transform: scale(0.98);
  }
`;

const TabsContainer = styled.div`
  padding: ${(props) => props.theme.spacing(4)};
`;

/**
 * Main application page component
 * Integrates theme management, tabs, and both diff checker and validator functionality
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

  // Define tab items
  const tabItems: TabItem[] = [
    {
      key: 'diff-checker',
      label: 'Diff Checker',
      content: <DiffChecker />,
    },
    {
      key: 'validator',
      label: 'Validator',
      content: <Validator />,
    },
  ];

  return (
    <>
      {/* Head section with metadata */}
      <Head>
        <title>Diff Checker & Validator - Compare and Validate JSON, XML, Text</title>
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
        <PageContainer>
          {/* Global Header with Theme Toggle */}
          <Header>
            <Title>Diff Checker & Validator</Title>
            <ThemeToggle onClick={toggleTheme}>
              {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </ThemeToggle>
          </Header>

          {/* Tabs Container */}
          <TabsContainer>
            <Tabs items={tabItems} defaultActiveKey="diff-checker" />
          </TabsContainer>
        </PageContainer>
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

