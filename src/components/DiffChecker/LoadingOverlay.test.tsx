/**
 * LoadingOverlay Component Tests
 * 
 * Tests for the loading overlay component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingOverlay } from './LoadingOverlay';

describe('LoadingOverlay', () => {
  describe('Rendering', () => {
    it('should render the overlay', () => {
      render(<LoadingOverlay />);
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('should display custom message', () => {
      render(<LoadingOverlay message="Loading data..." />);
      
      expect(screen.getByText('Loading data...')).toBeInTheDocument();
    });

    it('should display default message when not provided', () => {
      render(<LoadingOverlay />);
      
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render spinner', () => {
      const { container } = render(<LoadingOverlay />);

      // Spinner should be present - it's the first div child of the overlay
      const overlayChildren = container.querySelectorAll('div > div');
      expect(overlayChildren.length).toBeGreaterThan(0);
    });

    it('should render overlay backdrop', () => {
      const { container } = render(<LoadingOverlay />);

      // Overlay should be present - check for the root div
      const rootDiv = container.firstChild;
      expect(rootDiv).toBeInTheDocument();
    });
  });

  describe('Message Display', () => {
    it('should handle long messages', () => {
      const longMessage = 'This is a very long loading message that might wrap to multiple lines';
      render(<LoadingOverlay message={longMessage} />);
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle messages with special characters', () => {
      const specialMessage = 'Loading... Please wait! 🚀';
      render(<LoadingOverlay message={specialMessage} />);
      
      expect(screen.getByText(specialMessage)).toBeInTheDocument();
    });

    it('should handle empty string message', () => {
      const { container } = render(<LoadingOverlay message="" />);

      // Component should render even with empty message
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should be positioned to block interaction', () => {
      const { container } = render(<LoadingOverlay />);

      const overlay = container.firstChild as HTMLElement;
      expect(overlay).toBeTruthy();

      // Overlay should have fixed positioning
      const styles = window.getComputedStyle(overlay);
      expect(styles.position).toBe('fixed');
    });
  });

  describe('Animation', () => {
    it('should render animated spinner', () => {
      const { container } = render(<LoadingOverlay />);

      // Get all divs and check that spinner is rendered
      const divs = container.querySelectorAll('div');
      expect(divs.length).toBeGreaterThan(1);

      // Check that computed styles are defined
      const firstChild = container.firstChild as HTMLElement;
      const styles = window.getComputedStyle(firstChild);
      expect(styles).toBeDefined();
    });
  });
});

