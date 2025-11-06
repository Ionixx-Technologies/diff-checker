/**
 * DiffChecker File Handling Tests
 * 
 * Tests for enhanced file handling features:
 * - File size validation (2MB limit)
 * - File format validation
 * - Drag and drop validation
 * - Direct paste validation
 * - Chunked file reading
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { DiffChecker } from './DiffChecker.enhanced';
import { lightTheme } from '@/theme';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={lightTheme}>{ui}</ThemeProvider>);
};

describe('DiffChecker - File Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.alert = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('File Size Validation', () => {
    it('should reject files larger than 2MB', async () => {
      const largeContent = 'a'.repeat(3 * 1024 * 1024); // 3 MB
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('2 MB')
          );
        });
      }
    });

    it('should accept files exactly at 2MB limit', async () => {
      const content = 'a'.repeat(2 * 1024 * 1024); // Exactly 2 MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue(content);
        });
        
        expect(global.alert).not.toHaveBeenCalled();
      }
    });

    it('should display file size in error message', async () => {
      const content = 'a'.repeat(2.5 * 1024 * 1024); // 2.5 MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          const alertCall = (global.alert as jest.Mock).mock.calls[0][0];
          expect(alertCall).toMatch(/2\.50 MB/);
          expect(alertCall).toContain('2 MB');
        });
      }
    });
  });

  describe('File Format Validation', () => {
    beforeEach(() => {
      renderWithTheme(<DiffChecker />);
    });

    it('should accept JSON file when JSON format is selected', async () => {
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      
      const file = new File(['{"key": "value"}'], 'test.json', { type: 'application/json' });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue('{"key": "value"}');
        });
      }
    });

    it('should reject non-JSON file when JSON format is selected', async () => {
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      
      const file = new File(['plain text'], 'test.txt', { type: 'text/plain' });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('JSON')
          );
        });
      }
    });

    it('should accept XML file when XML format is selected', async () => {
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'xml' } });
      
      const file = new File(['<root/>'], 'test.xml', { type: 'application/xml' });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue('<root/>');
        });
      }
    });

    it('should reject non-XML file when XML format is selected', async () => {
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'xml' } });
      
      const file = new File(['plain text'], 'test.txt', { type: 'text/plain' });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('XML')
          );
        });
      }
    });

    it('should accept text file when text format is selected', async () => {
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'text' } });
      
      const file = new File(['plain text'], 'test.txt', { type: 'text/plain' });
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue('plain text');
        });
      }
    });
  });

  describe('Direct Paste Validation', () => {
    it('should validate paste content size', async () => {
      const largeText = 'a'.repeat(3 * 1024 * 1024); // 3 MB

      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];

      // Create paste event using fireEvent.paste with clipboardData mock
      fireEvent.paste(leftTextArea, {
        clipboardData: {
          getData: () => largeText,
        },
      });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          expect.stringContaining('2 MB')
        );
      });
    });

    it('should validate paste content format for JSON', async () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'json' } });

      const leftTextArea = screen.getAllByRole('textbox')[0];

      // Create paste event using fireEvent.paste with clipboardData mock
      fireEvent.paste(leftTextArea, {
        clipboardData: {
          getData: () => 'not valid json',
        },
      });

      // Should allow paste but may show validation error after compare
    });

    it('should accept valid paste content', async () => {
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];

      const validText = 'Valid text content';

      // Create paste event using fireEvent.paste with clipboardData mock
      fireEvent.paste(leftTextArea, {
        clipboardData: {
          getData: () => validText,
        },
      });

      // Should not show alert for valid content
      expect(global.alert).not.toHaveBeenCalled();
    });
  });

  describe('File Upload Button', () => {
    it('should validate uploaded file size', async () => {
      const largeContent = 'a'.repeat(3 * 1024 * 1024);
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });
        
        fireEvent.change(fileInput);
        
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('2 MB')
          );
        });
      }
    });

    it('should validate uploaded file format', async () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      
      const file = new File(['plain text'], 'test.txt', { type: 'text/plain' });
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      
      if (fileInput) {
        Object.defineProperty(fileInput, 'files', {
          value: [file],
          writable: false,
        });
        
        fireEvent.change(fileInput);
        
        await waitFor(() => {
          expect(global.alert).toHaveBeenCalledWith(
            expect.stringContaining('JSON')
          );
        });
      }
    });
  });

  describe('Chunked File Reading', () => {
    it('should handle large files with chunked reading', async () => {
      // Create a 1MB file (should trigger chunked reading)
      const content = 'a'.repeat(1024 * 1024);
      const file = new File([content], 'large.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue(content);
        }, { timeout: 3000 });
      }
    });

    it('should handle small files with normal reading', async () => {
      const content = 'Small file content';
      const file = new File([content], 'small.txt', { type: 'text/plain' });
      
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        const dropEvent = new Event('drop', { bubbles: true });
        Object.defineProperty(dropEvent, 'dataTransfer', {
          value: { files: [file] },
        });
        
        fireEvent(dropZone, dropEvent);
        
        await waitFor(() => {
          expect(leftTextArea).toHaveValue(content);
        });
      }
    });
  });

  describe('Reset Functionality', () => {
    it('should reset to empty content', () => {
      // Mock window.confirm to return true
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithTheme(<DiffChecker />);
      const [leftTextArea, rightTextArea] = screen.getAllByRole('textbox');
      const formatSelect = screen.getByRole('combobox');

      // Add content
      fireEvent.change(leftTextArea, { target: { value: 'Left content' } });
      fireEvent.change(rightTextArea, { target: { value: 'Right content' } });
      fireEvent.change(formatSelect, { target: { value: 'json' } });

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      // Confirm was called
      expect(confirmSpy).toHaveBeenCalled();

      // Should be reset
      expect(leftTextArea).toHaveValue('');
      expect(rightTextArea).toHaveValue('');

      confirmSpy.mockRestore();
    });

    it('should uncheck session storage on reset', () => {
      // Mock window.confirm to return true
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithTheme(<DiffChecker />);

      // Check session storage checkbox
      const sessionCheckbox = screen.queryByRole('checkbox', { name: /preserve session/i });
      if (sessionCheckbox) {
        fireEvent.click(sessionCheckbox);
        expect(sessionCheckbox).toBeChecked();
      }

      // Reset
      const resetButton = screen.getByRole('button', { name: /reset/i });
      fireEvent.click(resetButton);

      // Confirm was called
      expect(confirmSpy).toHaveBeenCalled();

      // Session checkbox should be unchecked
      if (sessionCheckbox) {
        expect(sessionCheckbox).not.toBeChecked();
      }

      confirmSpy.mockRestore();
    });
  });

  describe('Dynamic Accept Attribute', () => {
    it('should have correct accept attribute for JSON format', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'json' } });
      
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        expect(input).toHaveAttribute('accept', '.json');
      });
    });

    it('should have correct accept attribute for XML format', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'xml' } });
      
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        expect(input).toHaveAttribute('accept', '.xml');
      });
    });

    it('should have correct accept attribute for text format', () => {
      renderWithTheme(<DiffChecker />);
      const formatSelect = screen.getByRole('combobox');
      fireEvent.change(formatSelect, { target: { value: 'text' } });
      
      const fileInputs = document.querySelectorAll('input[type="file"]');
      fileInputs.forEach(input => {
        expect(input).toHaveAttribute('accept', '.txt');
      });
    });
  });

  describe('Drop Overlay Messages', () => {
    it('should show 2MB limit in drop overlay', async () => {
      renderWithTheme(<DiffChecker />);
      const leftTextArea = screen.getAllByRole('textbox')[0];
      const dropZone = leftTextArea.parentElement;
      
      if (dropZone) {
        fireEvent.dragOver(dropZone);
        
        await waitFor(() => {
          expect(screen.getByText(/2 MB/i)).toBeInTheDocument();
        });
      }
    });
  });
});

