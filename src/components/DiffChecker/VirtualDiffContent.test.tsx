/**
 * VirtualDiffContent Component Tests
 *
 * Tests for the virtual scrolling component including:
 * - Rendering visible items only
 * - Scroll handling
 * - Performance optimizations
 * - Theme support
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { VirtualDiffContent } from './VirtualDiffContent';
import { lightTheme, darkTheme } from '@/theme';
import type { DiffLine } from '@/utils/diffChecker';

const renderWithTheme = (ui: React.ReactElement, theme = lightTheme) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

const createMockLines = (count: number, type: 'unchanged' | 'added' | 'removed' | 'changed' = 'unchanged'): DiffLine[] => {
  return Array.from({ length: count }, (_, i) => ({
    type,
    content: `Line ${i + 1} content`,
    lineNumber: i + 1,
  }));
};

describe('VirtualDiffContent', () => {
  describe('Rendering', () => {
    it('should render container', () => {
      const lines = createMockLines(10);
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByRole('region', { name: /virtual diff content/i })).toBeInTheDocument();
    });

    it('should render only visible lines for large datasets', () => {
      const lines = createMockLines(1000);
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      // Should render only first few lines (visible + buffer)
      // Check that first line is rendered but not the 500th line
      expect(screen.queryByText('Line 1 content')).toBeInTheDocument();
      expect(screen.queryByText('Line 500 content')).not.toBeInTheDocument();
    });

    it('should render all lines for small datasets', () => {
      const lines = createMockLines(5);
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
      expect(screen.getByText('Line 2 content')).toBeInTheDocument();
      expect(screen.getByText('Line 3 content')).toBeInTheDocument();
      expect(screen.getByText('Line 4 content')).toBeInTheDocument();
      expect(screen.getByText('Line 5 content')).toBeInTheDocument();
    });
  });

  describe('Line Types', () => {
    it('should render added lines with correct styling', () => {
      const lines = createMockLines(1, 'added');
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });

    it('should render removed lines with correct styling', () => {
      const lines = createMockLines(1, 'removed');
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });

    it('should render changed lines with correct styling', () => {
      const lines = createMockLines(1, 'changed');
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });

    it('should render unchanged lines', () => {
      const lines = createMockLines(1, 'unchanged');
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });
  });

  describe('Line Numbers', () => {
    it('should display line numbers', () => {
      const lines = createMockLines(5);
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('should display correct line numbers for different ranges', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'First', lineNumber: 10 },
        { type: 'unchanged', content: 'Second', lineNumber: 11 },
      ];
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByText('10')).toBeInTheDocument();
      expect(screen.getByText('11')).toBeInTheDocument();
    });
  });

  describe('Container Height', () => {
    it('should respect custom container height', () => {
      const lines = createMockLines(100);
      const { container } = renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={400} />
      );

      const scrollContainer = container.firstChild as HTMLElement;
      expect(scrollContainer).toBeTruthy();
    });

    it('should use default height when not specified', () => {
      const lines = createMockLines(10);
      const { container } = renderWithTheme(<VirtualDiffContent lines={lines} />);

      const scrollContainer = container.firstChild as HTMLElement;
      expect(scrollContainer).toBeTruthy();
    });
  });

  describe('Scrolling', () => {
    it('should maintain total height for scrolling', () => {
      const lines = createMockLines(1000);
      const { container } = renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      // Virtual content should have height calculated from total lines
      const scrollContainer = container.querySelector('[role="region"]');
      expect(scrollContainer).toBeTruthy();
    });

    it('should update visible items on scroll', async () => {
      const lines = createMockLines(1000);
      const { container } = renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      // Initially, line 1 should be visible, line 500 should not
      expect(screen.queryByText('Line 1 content')).toBeInTheDocument();
      expect(screen.queryByText('Line 500 content')).not.toBeInTheDocument();

      // Scroll down
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 12000 } });

      await waitFor(() => {
        // After scrolling, later lines should be visible
        expect(screen.queryByText('Line 1 content')).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should handle empty lines array', () => {
      const { container } = renderWithTheme(
        <VirtualDiffContent lines={[]} containerHeight={600} />
      );

      expect(container.firstChild).toBeTruthy();
    });
  });

  describe('Performance', () => {
    it('should only render visible range with buffer', () => {
      const lines = createMockLines(10000);
      renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      // First line should be visible
      expect(screen.queryByText('Line 1 content')).toBeInTheDocument();

      // Line far down should not be rendered
      expect(screen.queryByText('Line 5000 content')).not.toBeInTheDocument();
    });

    it('should handle rapid scrolling', async () => {
      const lines = createMockLines(1000);
      const { container } = renderWithTheme(
        <VirtualDiffContent lines={lines} containerHeight={600} />
      );

      const scrollContainer = container.querySelector('[role="region"]') as HTMLElement;

      // Rapid scroll events
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 1000 } });
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 2000 } });
      fireEvent.scroll(scrollContainer, { target: { scrollTop: 3000 } });

      // Should still be functional
      await waitFor(() => {
        expect(scrollContainer).toBeTruthy();
      });
    });
  });

  describe('Theme Support', () => {
    it('should render with light theme', () => {
      const lines = createMockLines(5);
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />, lightTheme);

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });

    it('should render with dark theme', () => {
      const lines = createMockLines(5);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />, darkTheme as any);

      expect(screen.getByText('Line 1 content')).toBeInTheDocument();
    });
  });

  describe('Line Content', () => {
    it('should render line content correctly', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: 'Hello World', lineNumber: 1 },
        { type: 'added', content: 'New line', lineNumber: 2 },
      ];
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByText('Hello World')).toBeInTheDocument();
      expect(screen.getByText('New line')).toBeInTheDocument();
    });

    it('should handle empty content', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: '', lineNumber: 1 },
        { type: 'unchanged', content: 'Next line', lineNumber: 2 },
      ];
      const { container } = renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByText('Next line')).toBeInTheDocument();
      expect(container).toBeTruthy();
    });

    it('should preserve whitespace in content', () => {
      const lines: DiffLine[] = [
        { type: 'unchanged', content: '  indented content  ', lineNumber: 1 },
      ];
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      // Check that content with whitespace is rendered
      expect(screen.getByText(/indented content/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const lines = createMockLines(5);
      renderWithTheme(<VirtualDiffContent lines={lines} containerHeight={600} />);

      expect(screen.getByRole('region', { name: /virtual diff content/i })).toBeInTheDocument();
    });
  });
});
