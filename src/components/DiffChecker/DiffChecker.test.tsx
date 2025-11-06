/**
 * DiffChecker Component Tests
 * 
 * Comprehensive tests for the DiffChecker component including:
 * - File upload and drag-and-drop
 * - Theme toggle
 * - Format selection
 * - Diff comparison
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { DiffChecker } from './DiffChecker.enhanced';
import { lightTheme, darkTheme } from '@/theme';

// Helper to render component with theme
const renderWithTheme = (ui: React.ReactElement, theme = lightTheme) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('DiffChecker Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component', () => {
      renderWithTheme(<DiffChecker />);
      // DiffChecker no longer has header - it's in the parent page
      expect(screen.getByText('Original (Left)')).toBeInTheDocument();
      expect(screen.getByText('Modified (Right)')).toBeInTheDocument();
    });

    it('should render left and right input panels', () => {
      renderWithTheme(<DiffChecker />);
      expect(screen.getByText('Original (Left)')).toBeInTheDocument();
      expect(screen.getByText('Modified (Right)')).toBeInTheDocument();
    });

    it('should render control buttons', () => {
      renderWithTheme(<DiffChecker />);
      expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /auto-detect/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /swap/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear all/i })).toBeInTheDocument();
    });

    it('should render format selector', () => {
      renderWithTheme(<DiffChecker />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument(); // Unified format selector
    });

    it('should render empty state initially', () => {
      renderWithTheme(<DiffChecker />);
      expect(screen.getByText(/Ready to compare/i)).toBeInTheDocument();
    });
  });

  describe('Theme Support', () => {
    it('should render with light theme', () => {
      renderWithTheme(<DiffChecker />, lightTheme);
      // Theme is applied via ThemeProvider, component should render
      expect(screen.getByText('Original (Left)')).toBeInTheDocument();
    });

    it('should render with dark theme', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderWithTheme(<DiffChecker />, darkTheme as any);
      // Theme is applied via ThemeProvider, component should render
      expect(screen.getByText('Original (Left)')).toBeInTheDocument();
    });
  });

  describe('Text Input', () => {
    it('should allow typing in left text area', () => {
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      
      fireEvent.change(leftTextArea, { target: { value: 'Test content' } });
      
      expect(leftTextArea).toHaveValue('Test content');
    });

    it('should allow typing in right text area', () => {
      renderWithTheme(<DiffChecker />);
      const rightTextArea = screen.getAllByRole('textbox')[1];
      
      fireEvent.change(rightTextArea, { target: { value: 'Test content' } });
      
      expect(rightTextArea).toHaveValue('Test content');
    });
  });

  describe('Format Selection', () => {
    it('should change format for both inputs simultaneously', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      
      expect(formatSelect).toHaveValue('json');
      // Format badges should show JSON (at least 2 occurrences including badges)
      expect(screen.getAllByText('JSON').length).toBeGreaterThanOrEqual(2);
    });

    it('should change format to XML', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      
      fireEvent.change(formatSelect, { target: { value: 'xml' } });
      
      expect(formatSelect).toHaveValue('xml');
      // Format badges should show XML (at least 2 occurrences including badges)
      expect(screen.getAllByText('XML').length).toBeGreaterThanOrEqual(2);
    });

    it('should default to text format', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      
      expect(formatSelect).toHaveValue('text');
      // Format badges should show TEXT (at least 2 occurrences including badges)
      expect(screen.getAllByText('TEXT').length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Compare Functionality', () => {
    it('should disable compare button when inputs are empty', () => {
      renderWithTheme(<DiffChecker />);
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      expect(compareButton).toBeDisabled();
    });

    it('should enable compare button when both inputs have content', () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(leftTextArea, { target: { value: 'Content' } });
      fireEvent.change(rightTextArea, { target: { value: 'Content' } });
      
      expect(compareButton).not.toBeDisabled();
    });

    it('should show diff results after comparison', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(leftTextArea, { target: { value: 'Line 1\nLine 2' } });
      fireEvent.change(rightTextArea, { target: { value: 'Line 1\nLine 3' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Original.*Diff View/i)).toBeInTheDocument();
        expect(screen.getByText(/Modified.*Diff View/i)).toBeInTheDocument();
      });
    });

    it('should show statistics after comparison', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(leftTextArea, { target: { value: 'Line 1' } });
      fireEvent.change(rightTextArea, { target: { value: 'Line 2' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Total Lines/i)).toBeInTheDocument();
        expect(screen.getByText(/Added/i)).toBeInTheDocument();
        expect(screen.getByText(/Removed/i)).toBeInTheDocument();
      });
    });
  });

  describe('Swap Functionality', () => {
    it('should swap left and right inputs', () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const swapButton = screen.getByRole('button', { name: /swap/i });
      
      fireEvent.change(leftTextArea, { target: { value: 'Left content' } });
      fireEvent.change(rightTextArea, { target: { value: 'Right content' } });
      fireEvent.click(swapButton);
      
      expect(leftTextArea).toHaveValue('Right content');
      expect(rightTextArea).toHaveValue('Left content');
    });

    it('should disable swap button when both inputs are empty', () => {
      renderWithTheme(<DiffChecker />);
      const swapButton = screen.getByRole('button', { name: /swap/i });
      
      expect(swapButton).toBeDisabled();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear all inputs', () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const clearButton = screen.getByRole('button', { name: /clear all/i });
      
      fireEvent.change(leftTextArea, { target: { value: 'Content' } });
      fireEvent.change(rightTextArea, { target: { value: 'Content' } });
      fireEvent.click(clearButton);
      
      expect(leftTextArea).toHaveValue('');
      expect(rightTextArea).toHaveValue('');
    });
  });

  describe('Clipboard Paste', () => {
    it('should paste content from clipboard to left input', async () => {
      const clipboardMock = navigator.clipboard as jest.Mocked<typeof navigator.clipboard>;
      (clipboardMock.readText as jest.Mock).mockResolvedValue('Clipboard content');
      
      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      
      fireEvent.click(pasteButtons[0]);
      
      await waitFor(() => {
        expect(leftTextArea).toHaveValue('Clipboard content');
      });
    });

    it('should paste content from clipboard to right input', async () => {
      const clipboardMock = navigator.clipboard as jest.Mocked<typeof navigator.clipboard>;
      (clipboardMock.readText as jest.Mock).mockResolvedValue('Clipboard content');
      
      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });
      const rightTextArea = screen.getAllByRole('textbox')[1];
      
      fireEvent.click(pasteButtons[1]);
      
      await waitFor(() => {
        expect(rightTextArea).toHaveValue('Clipboard content');
      });
    });

    it('should handle clipboard errors gracefully', async () => {
      const clipboardMock = navigator.clipboard as jest.Mocked<typeof navigator.clipboard>;
      (clipboardMock.readText as jest.Mock).mockRejectedValue(new Error('Clipboard error'));

      // Mock alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();

      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });

      fireEvent.click(pasteButtons[0]);

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('read from clipboard')
        );
      });

      alertMock.mockRestore();
    });
  });

  describe('Validation Messages', () => {
    it('should show error for invalid JSON', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const formatSelect = screen.getByRole('combobox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      fireEvent.change(leftTextArea, { target: { value: '{invalid json}' } });
      fireEvent.change(rightTextArea, { target: { value: '{"valid": "json"}' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        // Check for validation error message (may show "Invalid" or error indicator)
        const errorElements = screen.queryAllByText(/invalid|error|❌/i);
        expect(errorElements.length).toBeGreaterThan(0);
      }, { timeout: 2000 });
    });

    it('should show success for valid JSON', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const formatSelect = screen.getByRole('combobox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      fireEvent.change(leftTextArea, { target: { value: '{"key": "value"}' } });
      fireEvent.change(rightTextArea, { target: { value: '{"key": "value2"}' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        const successMessages = screen.getAllByText(/✅/);
        expect(successMessages.length).toBeGreaterThan(0);
      });
    });

    it('should keep formats synchronized with unified selector', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      
      // Change to JSON
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      expect(screen.getAllByText('JSON').length).toBeGreaterThanOrEqual(2); // Both badges show JSON
      
      // Change to XML
      fireEvent.change(formatSelect, { target: { value: 'xml' } });
      expect(screen.getAllByText('XML').length).toBeGreaterThanOrEqual(2); // Both badges show XML
      
      // Format mismatch warning should never appear
      expect(screen.queryByText(/Format mismatch/i)).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle file drop on left panel', async () => {
      const file = new File(['Test content'], 'test.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            files: [file],
          },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue('Test content');
        }, { timeout: 1000 });
      }
    });
  });

  describe('File Size Validation', () => {
    beforeEach(() => {
      // Mock alert for file size validation tests
      global.alert = jest.fn();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should reject files larger than 2 MB on drag and drop', async () => {
      // Create a file larger than 2 MB (2 * 1024 * 1024 bytes)
      const largeContent = 'a'.repeat(3 * 1024 * 1024); // 3 MB
      const largeFile = new File([largeContent], 'large.txt', { type: 'text/plain' });

      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;

      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            files: [largeFile],
          },
        });

        fireEvent(dropZone, dropEvent);

        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('File Too Large')
          );
        });

        // Textarea should remain empty
        expect(leftTextArea).toHaveValue('');
      }
    });

    it('should accept files smaller than 2 MB', async () => {
      const smallContent = 'Small file content';
      const smallFile = new File([smallContent], 'small.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            files: [smallFile],
          },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue(smallContent);
        });
        
        // Alert should not be called for valid files
        expect(global.alert).not.toHaveBeenCalled();
      }
    });

    it('should display file size in MB in error message', async () => {
      const largeContent = 'a'.repeat(7 * 1024 * 1024); // 7 MB
      const largeFile = new File([largeContent], 'large.json', { type: 'application/json' });
      
      renderWithTheme(<DiffChecker />);
      const rightTextArea = screen.getAllByRole('textbox')[1];
      const dropZone = rightTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: {
            files: [largeFile],
          },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          const alertCall = (global.alert as jest.Mock).mock.calls[0][0];
          expect(alertCall).toMatch(/\d+\.\d+ MB/); // Should show file size
          expect(alertCall).toContain('2 MB'); // Should show limit
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have ARIA labels on buttons', () => {
      renderWithTheme(<DiffChecker />);
      
      expect(screen.getByLabelText(/compare inputs/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/auto-detect format/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/swap left and right/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/clear all inputs/i)).toBeInTheDocument();
    });

    it('should have ARIA labels on text areas', () => {
      renderWithTheme(<DiffChecker />);
      
      expect(screen.getByLabelText(/left input text area/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/right input text area/i)).toBeInTheDocument();
    });

    it('should have ARIA labels on selects', () => {
      renderWithTheme(<DiffChecker />);
      
      expect(screen.getByLabelText(/select format for both inputs/i)).toBeInTheDocument();
    });
  });
});

