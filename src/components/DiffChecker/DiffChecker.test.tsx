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

// Mock clipboard API
const mockClipboard = {
  readText: jest.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

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
      expect(screen.getByText('Diff Checker & Validator')).toBeInTheDocument();
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

    it('should render format selectors', () => {
      renderWithTheme(<DiffChecker />);
      const selects = screen.getAllByRole('combobox');
      expect(selects).toHaveLength(2); // Left and right format selectors
    });

    it('should render empty state initially', () => {
      renderWithTheme(<DiffChecker />);
      expect(screen.getByText(/Ready to compare/i)).toBeInTheDocument();
    });
  });

  describe('Theme Toggle', () => {
    it('should call theme toggle handler', () => {
      const mockToggle = jest.fn();
      renderWithTheme(<DiffChecker themeMode="light" onThemeToggle={mockToggle} />);
      
      const themeButton = screen.getByText(/Dark Mode/i);
      fireEvent.click(themeButton);
      
      expect(mockToggle).toHaveBeenCalledTimes(1);
    });

    it('should show correct theme button text for light mode', () => {
      renderWithTheme(<DiffChecker themeMode="light" onThemeToggle={() => {}} />);
      expect(screen.getByText(/Dark Mode/i)).toBeInTheDocument();
    });

    it('should show correct theme button text for dark mode', () => {
      renderWithTheme(<DiffChecker themeMode="dark" onThemeToggle={() => {}} />, darkTheme);
      expect(screen.getByText(/Light Mode/i)).toBeInTheDocument();
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
    it('should change format for left input', () => {
      renderWithTheme(<DiffChecker />);
      const leftSelect = screen.getAllByRole('combobox')[0];
      
      fireEvent.change(leftSelect, { target: { value: 'json' } });
      
      expect(leftSelect).toHaveValue('json');
    });

    it('should change format for right input', () => {
      renderWithTheme(<DiffChecker />);
      const rightSelect = screen.getAllByRole('combobox')[1];
      
      fireEvent.change(rightSelect, { target: { value: 'xml' } });
      
      expect(rightSelect).toHaveValue('xml');
    });

    it('should default to text format', () => {
      renderWithTheme(<DiffChecker />);
      const selects = screen.getAllByRole('combobox');
      
      expect(selects[0]).toHaveValue('text');
      expect(selects[1]).toHaveValue('text');
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
      mockClipboard.readText.mockResolvedValue('Clipboard content');
      
      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      
      fireEvent.click(pasteButtons[0]);
      
      await waitFor(() => {
        expect(leftTextArea).toHaveValue('Clipboard content');
      });
    });

    it('should paste content from clipboard to right input', async () => {
      mockClipboard.readText.mockResolvedValue('Clipboard content');
      
      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });
      const rightTextArea = screen.getAllByRole('textbox')[1];
      
      fireEvent.click(pasteButtons[1]);
      
      await waitFor(() => {
        expect(rightTextArea).toHaveValue('Clipboard content');
      });
    });

    it('should handle clipboard errors gracefully', async () => {
      mockClipboard.readText.mockRejectedValue(new Error('Clipboard error'));
      
      // Mock alert
      const alertMock = jest.spyOn(window, 'alert').mockImplementation();
      
      renderWithTheme(<DiffChecker />);
      const pasteButtons = screen.getAllByRole('button', { name: /paste/i });
      
      fireEvent.click(pasteButtons[0]);
      
      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          expect.stringContaining('Failed to read from clipboard')
        );
      });
      
      alertMock.mockRestore();
    });
  });

  describe('Validation Messages', () => {
    it('should show error for invalid JSON', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea] = screen.getAllByRole('textbox');
      const leftSelect = screen.getAllByRole('combobox')[0];
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(leftSelect, { target: { value: 'json' } });
      fireEvent.change(leftTextArea, { target: { value: 'Invalid JSON' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        expect(screen.getByText(/❌/)).toBeInTheDocument();
      });
    });

    it('should show success for valid JSON', async () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const [leftSelect, rightSelect] = screen.getAllByRole('combobox');
      const compareButton = screen.getByRole('button', { name: /compare/i });
      
      fireEvent.change(leftSelect, { target: { value: 'json' } });
      fireEvent.change(rightSelect, { target: { value: 'json' } });
      fireEvent.change(leftTextArea, { target: { value: '{"key": "value"}' } });
      fireEvent.change(rightTextArea, { target: { value: '{"key": "value2"}' } });
      fireEvent.click(compareButton);
      
      await waitFor(() => {
        const successMessages = screen.getAllByText(/✅/);
        expect(successMessages.length).toBeGreaterThan(0);
      });
    });

    it('should show warning for format mismatch', () => {
      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const [leftSelect, rightSelect] = screen.getAllByRole('combobox');
      
      fireEvent.change(leftSelect, { target: { value: 'json' } });
      fireEvent.change(rightSelect, { target: { value: 'xml' } });
      fireEvent.change(leftTextArea, { target: { value: 'content' } });
      fireEvent.change(rightTextArea, { target: { value: 'content' } });
      
      expect(screen.getByText(/Format mismatch/i)).toBeInTheDocument();
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
      
      expect(screen.getByLabelText(/select format for left input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/select format for right input/i)).toBeInTheDocument();
    });
  });
});

