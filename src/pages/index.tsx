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

// Modern styled components with enhanced visual design
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${(props) => `linear-gradient(135deg, ${props.theme.colors.background} 0%, ${props.theme.colors.cardBackground} 100%)`};
  font-family: ${(props) => props.theme.fonts.body};
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${(props) => props.theme.spacing(5)} ${(props) => props.theme.spacing(6)};
  background: ${(props) => props.theme.colors.cardBackground};
  backdrop-filter: blur(10px);
  box-shadow: ${(props) => props.theme.shadows.sm};
  border-bottom: 1px solid ${(props) => props.theme.colors.borderLight};
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing(4)};
  }
`;

const Title = styled.h1`
  font-size: 1.875rem;
  font-weight: 700;
  background: linear-gradient(135deg, ${(props) => props.theme.colors.gradientStart} 0%, ${(props) => props.theme.colors.gradientEnd} 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.025em;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const ThemeToggle = styled.button`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => props.theme.spacing(2.5)} ${(props) => props.theme.spacing(4)};
  background: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.full};
  color: ${(props) => props.theme.colors.text};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: ${(props) => props.theme.fonts.body};
  box-shadow: ${(props) => props.theme.shadows.sm};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: linear-gradient(135deg, ${(props) => props.theme.colors.gradientStart} 0%, ${(props) => props.theme.colors.gradientEnd} 100%);
    color: ${(props) => props.theme.colors.white};
    border-color: transparent;
    box-shadow: ${(props) => props.theme.shadows.md};
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0) scale(0.98);
  }

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(3)};
    font-size: 0.813rem;
  }
`;

const TabsContainer = styled.div`
  padding: ${(props) => props.theme.spacing(6)};
  max-width: 1400px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: ${(props) => props.theme.spacing(4)};
  }
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
        <meta name="theme-color" content={themeMode === 'light' ? '#3b82f6' : '#60a5fa'} />
        
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
        Modern Global Styles with enhanced visual design
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
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
            'Ubuntu', 'Cantarell', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          transition: background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), color 0.3s ease;
        }

        /* Modern custom scrollbar with gradient */
        ::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }

        ::-webkit-scrollbar-track {
          background: ${themeMode === 'light' ? '#f1f5f9' : '#1e293b'};
          border-radius: 10px;
          border: 3px solid transparent;
          background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb {
          background: ${themeMode === 'light' 
            ? 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' 
            : 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'};
          border-radius: 10px;
          border: 3px solid transparent;
          background-clip: content-box;
          transition: all 0.3s ease;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${themeMode === 'light'
            ? 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)'
            : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'};
        }

        /* Enhanced focus visible for better accessibility */
        *:focus-visible {
          outline: 3px solid ${themeMode === 'light' ? '#3b82f6' : '#60a5fa'};
          outline-offset: 2px;
          border-radius: 4px;
        }

        /* Modern selection color with gradient */
        ::selection {
          background: ${themeMode === 'light' ? '#3b82f6' : '#60a5fa'};
          color: #ffffff;
        }

        /* Smooth animations for theme transitions */
        * {
          transition-property: background-color, color, border-color, box-shadow;
          transition-duration: 0.3s;
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
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

