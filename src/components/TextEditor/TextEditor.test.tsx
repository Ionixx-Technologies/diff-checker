/**
 * TextEditor Component Tests
 * 
 * Comprehensive tests for the TextEditor component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '@/theme';
import { TextEditor } from './TextEditor';

// Helper to render with theme
const renderWithTheme = (ui: React.ReactElement, theme: 'light' | 'dark' = 'light') => {
  return render(
    <ThemeProvider theme={theme === 'dark' ? darkTheme : lightTheme}>
      {ui}
    </ThemeProvider>
  );
};

describe('TextEditor', () => {
  describe('Rendering', () => {
    it('should render the editor with default props', () => {
      renderWithTheme(<TextEditor />);
      
      expect(screen.getByText('Text Editor')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with initial value', () => {
      const initialValue = 'Hello World\nLine 2\nLine 3';
      renderWithTheme(<TextEditor initialValue={initialValue} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(initialValue);
    });

    it('should render with placeholder', () => {
      const placeholder = 'Type something...';
      renderWithTheme(<TextEditor placeholder={placeholder} />);
      
      const textarea = screen.getByPlaceholderText(placeholder);
      expect(textarea).toBeInTheDocument();
    });

    it('should render in read-only mode', () => {
      renderWithTheme(<TextEditor readOnly />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('readonly');
    });

    it('should render with dark theme', () => {
      renderWithTheme(<TextEditor theme="dark" />, 'dark');
      
      expect(screen.getByText('Text Editor')).toBeInTheDocument();
    });
  });

  describe('Line Numbers', () => {
    it('should display correct number of line numbers', () => {
      const initialValue = 'Line 1\nLine 2\nLine 3\nLine 4';
      renderWithTheme(<TextEditor initialValue={initialValue} />);
      
      // Check for line numbers 1-4
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should start with line number 1 for empty editor', () => {
      renderWithTheme(<TextEditor />);
      
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should update line numbers when adding lines', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor initialValue="Line 1" />);
      
      const textarea = screen.getByRole('textbox');
      
      // Add a new line
      await user.click(textarea);
      await user.keyboard('{End}{Enter}Line 2');
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });
  });

  describe('Status Bar', () => {
    it('should display initial statistics', () => {
      renderWithTheme(<TextEditor initialValue="Hello" />);
      
      // Check for status bar labels
      expect(screen.getByText('Size:')).toBeInTheDocument();
      expect(screen.getByText('Ln:')).toBeInTheDocument();
      expect(screen.getByText('Ch:')).toBeInTheDocument();
      expect(screen.getByText('Position:')).toBeInTheDocument();
    });

    it('should show correct line count', () => {
      renderWithTheme(<TextEditor initialValue="Line 1\nLine 2\nLine 3" />);
      
      // Should show 3 lines
      const lineCountElement = screen.getByText('3');
      expect(lineCountElement).toBeInTheDocument();
    });

    it('should show correct character count', () => {
      const content = 'Hello World';
      renderWithTheme(<TextEditor initialValue={content} />);
      
      // Should show 11 characters
      const charCount = screen.getByText('11');
      expect(charCount).toBeInTheDocument();
    });

    it('should update statistics when typing', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor initialValue="" />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('Test');
      
      await waitFor(() => {
        // Should show 4 characters
        expect(screen.getByText('4')).toBeInTheDocument();
      });
    });

    it('should display byte size correctly', () => {
      const content = 'Hello';
      renderWithTheme(<TextEditor initialValue={content} />);
      
      // "Hello" is 5 bytes
      expect(screen.getByText('5 B')).toBeInTheDocument();
    });
  });

  describe('Cursor Position', () => {
    it('should show initial cursor position', () => {
      renderWithTheme(<TextEditor initialValue="Test" />);
      
      // Initial position should be shown
      expect(screen.getByText(/Position:/)).toBeInTheDocument();
    });

    it('should update cursor position when clicking', async () => {
      renderWithTheme(<TextEditor initialValue="Line 1\nLine 2" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Click in the textarea
      fireEvent.click(textarea);
      
      // Position should be updated (may vary based on where click lands)
      await waitFor(() => {
        const positionText = screen.getByText(/Position:/);
        expect(positionText).toBeInTheDocument();
      });
    });

    it('should update cursor position when typing', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor initialValue="" />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('A');
      
      await waitFor(() => {
        // After typing one character, position should update
        const positionElement = screen.getByText(/1:1/);
        expect(positionElement).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should allow typing text', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.keyboard('Hello World');
      
      expect(textarea.value).toBe('Hello World');
    });

    it('should call onChange callback when content changes', async () => {
      const user = userEvent.setup();
      const mockOnChange = jest.fn();
      renderWithTheme(<TextEditor onChange={mockOnChange} />);
      
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.keyboard('Test');
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });
    });

    it('should handle Enter key to create new lines', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor initialValue="Line 1" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.keyboard('{End}{Enter}Line 2');
      
      expect(textarea.value).toContain('Line 1\nLine 2');
    });

    it('should handle Tab key by inserting spaces', async () => {
      renderWithTheme(<TextEditor />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Focus and type Tab
      fireEvent.click(textarea);
      fireEvent.keyDown(textarea, { key: 'Tab', code: 'Tab' });
      
      await waitFor(() => {
        // Should have 2 spaces inserted
        expect(textarea.value).toBe('  ');
      });
    });

    it('should not allow typing in read-only mode', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor readOnly initialValue="Read only" />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      await user.click(textarea);
      await user.keyboard('Test');
      
      // Value should remain unchanged
      expect(textarea.value).toBe('Read only');
    });
  });

  describe('Scrolling', () => {
    it('should handle scroll events', () => {
      const longContent = 'Line 1\n'.repeat(50);
      renderWithTheme(<TextEditor initialValue={longContent} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      
      // Trigger scroll event
      fireEvent.scroll(textarea, { target: { scrollTop: 100 } });
      
      // Should not throw error
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria-label', () => {
      renderWithTheme(<TextEditor />);
      
      const textarea = screen.getByLabelText('Text editor');
      expect(textarea).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      renderWithTheme(<TextEditor />);
      
      const textarea = screen.getByRole('textbox');
      
      // Should be able to focus with Tab
      await user.tab();
      expect(textarea).toHaveFocus();
    });

    it('should support spellcheck disabled', () => {
      renderWithTheme(<TextEditor />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute('spellcheck', 'false');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content', () => {
      renderWithTheme(<TextEditor initialValue="" />);
      
      // Should show 1 line for empty content
      expect(screen.getByText('1')).toBeInTheDocument();
      // Should show 0 bytes
      expect(screen.getByText('0 B')).toBeInTheDocument();
    });

    it('should handle very long content', () => {
      const longContent = 'A'.repeat(10000);
      renderWithTheme(<TextEditor initialValue={longContent} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(longContent);
    });

    it('should handle multi-byte characters', () => {
      const content = '你好世界 🌍';
      renderWithTheme(<TextEditor initialValue={content} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(content);
    });

    it('should handle mixed line endings', () => {
      const content = 'Line 1\nLine 2\rLine 3\r\nLine 4';
      renderWithTheme(<TextEditor initialValue={content} />);
      
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe(content);
    });
  });

  describe('Theme Support', () => {
    it('should apply light theme styles', () => {
      renderWithTheme(<TextEditor theme="light" />);
      
      const title = screen.getByText('Text Editor');
      expect(title).toBeInTheDocument();
    });

    it('should apply dark theme styles', () => {
      renderWithTheme(<TextEditor theme="dark" />, 'dark');
      
      const title = screen.getByText('Text Editor');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Custom Props', () => {
    it('should respect maxHeight prop', () => {
      renderWithTheme(<TextEditor maxHeight={400} />);
      
      // Component should render without errors
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should use custom placeholder', () => {
      const customPlaceholder = 'Enter your code here...';
      renderWithTheme(<TextEditor placeholder={customPlaceholder} />);
      
      expect(screen.getByPlaceholderText(customPlaceholder)).toBeInTheDocument();
    });
  });
});

