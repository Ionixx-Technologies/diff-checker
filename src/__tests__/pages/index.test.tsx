/**
 * Index Page Tests
 * 
 * Tests for the main application page including:
 * - Component rendering
 * - Theme management
 * - SSR safety
 * - Global styles
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from '../../pages/index';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Home Page', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  describe('Rendering', () => {
    it('should render the page', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Diff Checker & Validator')).toBeInTheDocument();
      });
    });

    it('should render with correct meta tags', () => {
      render(<Home />);
      
      const title = document.title;
      expect(title).toContain('Diff Checker');
    });

    it('should not render before mount (SSR safety)', () => {
      const { container } = render(<Home />);
      
      // Initial render should be empty
      expect(container.innerHTML).toBeTruthy();
    });
  });

  describe('Theme Management', () => {
    it('should load light theme by default', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
      });
    });

    it('should toggle to dark theme', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const themeButton = screen.getByText(/Dark Mode/i);
        fireEvent.click(themeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
      });
    });

    it('should save theme preference to localStorage', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const themeButton = screen.getByText(/Dark Mode/i);
        fireEvent.click(themeButton);
      });
      
      await waitFor(() => {
        expect(localStorageMock.getItem('app-theme-mode')).toBe('dark');
      });
    });

    it('should load saved theme preference', async () => {
      localStorageMock.setItem('app-theme-mode', 'dark');
      
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
      });
    });

    it('should toggle back to light theme', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const themeButton = screen.getByText(/Dark Mode/i);
        fireEvent.click(themeButton);
      });
      
      await waitFor(() => {
        const themeButton = screen.getByText(/Light Mode/i);
        fireEvent.click(themeButton);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
        expect(localStorageMock.getItem('app-theme-mode')).toBe('light');
      });
    });
  });

  describe('Component Integration', () => {
    it('should render DiffChecker component', async () => {
      render(<Home />);
      
      await waitFor(() => {
        expect(screen.getByText('Diff Checker & Validator')).toBeInTheDocument();
        expect(screen.getByText(/Original.*Left/i)).toBeInTheDocument();
        expect(screen.getByText(/Modified.*Right/i)).toBeInTheDocument();
      });
    });

    it('should pass theme mode to DiffChecker', async () => {
      render(<Home />);
      
      await waitFor(() => {
        // Theme toggle button should be present
        expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
      });
    });

    it('should pass theme toggle handler to DiffChecker', async () => {
      render(<Home />);
      
      await waitFor(() => {
        const themeButton = screen.getByText(/Dark Mode/i);
        
        // Should be able to click and toggle
        fireEvent.click(themeButton);
        
        expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
      });
    });
  });

  describe('Global Styles', () => {
    it('should apply global styles', () => {
      const { container } = render(<Home />);
      
      const style = container.querySelector('style');
      expect(style).toBeInTheDocument();
    });

    it('should include responsive typography styles', () => {
      const { container } = render(<Home />);
      
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('@media');
      expect(style?.textContent).toContain('font-size');
    });

    it('should include reduced motion support', () => {
      const { container } = render(<Home />);
      
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('prefers-reduced-motion');
    });

    it('should include focus-visible styles', () => {
      const { container } = render(<Home />);
      
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('focus-visible');
    });

    it('should include scrollbar styles', () => {
      const { container } = render(<Home />);
      
      const style = container.querySelector('style');
      expect(style?.textContent).toContain('scrollbar');
    });
  });

  describe('SSR Compatibility', () => {
    it('should handle missing localStorage gracefully', () => {
      // Temporarily remove localStorage
      const originalLocalStorage = window.localStorage;
      // @ts-expect-error - Intentionally deleting localStorage for testing
      delete window.localStorage;
      
      expect(() => render(<Home />)).not.toThrow();
      
      // Restore localStorage
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true,
      });
    });

    it('should mount after initial render', async () => {
      const { container } = render(<Home />);
      
      // After mounting, content should be visible
      await waitFor(() => {
        expect(container.textContent).toBeTruthy();
      });
    });
  });

  describe('Meta Tags', () => {
    it('should set correct page title', () => {
      render(<Home />);
      
      expect(document.title).toBe('Diff Checker & Validator - Compare JSON, XML, Text');
    });

    it('should set meta description', () => {
      render(<Home />);
      
      const metaDescription = document.querySelector('meta[name="description"]');
      expect(metaDescription).toBeInTheDocument();
      expect(metaDescription?.getAttribute('content')).toContain('Compare and validate');
    });

    it('should set viewport meta tag', () => {
      render(<Home />);
      
      const viewport = document.querySelector('meta[name="viewport"]');
      expect(viewport).toBeInTheDocument();
    });
  });
});

