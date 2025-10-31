/**
 * Validator Component Tests
 * 
 * Comprehensive test suite covering:
 * - Rendering and UI
 * - JSON validation (valid and invalid)
 * - XML validation (valid and invalid)
 * - Drag and drop functionality
 * - File upload
 * - Clipboard paste
 * - Format/prettify
 * - Clear functionality
 * - Auto-detection
 * - Error handling
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { Validator } from './Validator';
import { lightTheme } from '@/theme';

// Helper to render with theme
const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      {component}
    </ThemeProvider>
  );
};

// Mock FileReader
const mockFileReader = () => {
  const originalFileReader = global.FileReader;
  
  // @ts-expect-error - Mocking FileReader
  global.FileReader = jest.fn().mockImplementation(function() {
    this.readAsText = jest.fn(function(file: File) {
      // Simulate async file reading
      setTimeout(() => {
        if (this.onload) {
          this.onload({ target: { result: file.name === 'test.json' ? '{"test": true}' : '<root></root>' } });
        }
      }, 0);
    });
    this.onerror = jest.fn();
  });

  return () => {
    global.FileReader = originalFileReader;
  };
};

describe('Validator Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the validator component', () => {
      renderWithTheme(<Validator />);
      
      expect(screen.getByRole('button', { name: /validate/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
    });

    it('should render dropdown with JSON and XML options', () => {
      renderWithTheme(<Validator />);
      
      const dropdown = screen.getByRole('combobox');
      expect(dropdown).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /JSON/i })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: /XML/i })).toBeInTheDocument();
    });

    it('should render textarea with correct placeholder', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      expect(textarea).toBeInTheDocument();
    });

    it('should render empty state message initially', () => {
      renderWithTheme(<Validator />);
      
      expect(screen.getByText(/Ready to validate/i)).toBeInTheDocument();
    });

    it('should render file upload button', () => {
      renderWithTheme(<Validator />);
      
      expect(screen.getByText(/Upload File/i)).toBeInTheDocument();
    });

    it('should render paste button', () => {
      renderWithTheme(<Validator />);
      
      expect(screen.getByRole('button', { name: /Paste from Clipboard/i })).toBeInTheDocument();
    });
  });

  describe('JSON Validation - Valid', () => {
    it('should validate valid JSON successfully', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      // Enter valid JSON
      fireEvent.change(textarea, { target: { value: '{"name": "test", "value": 123}' } });
      
      // Click validate
      fireEvent.click(validateButton);
      
      // Wait for validation result
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
        expect(screen.getByText(/✅/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate empty object JSON', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate array JSON', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '[1, 2, 3]' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate nested JSON', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      const complexJSON = JSON.stringify({
        user: {
          name: 'John',
          age: 30,
          hobbies: ['reading', 'coding'],
          address: {
            city: 'New York',
            zip: '10001'
          }
        }
      });
      
      fireEvent.change(textarea, { target: { value: complexJSON } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('JSON Validation - Invalid', () => {
    it('should show error for invalid JSON with trailing comma', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '{"name": "test",}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
        expect(screen.getByText(/❌/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should show error for unclosed bracket', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '{"name": "test"' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should show error for missing quotes', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '{name: "test"}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should disable validate button for whitespace-only input', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      // Whitespace trimmed to empty, button should be disabled
      fireEvent.change(textarea, { target: { value: '   ' } });
      
      expect(validateButton).toBeDisabled();
    });
  });

  describe('XML Validation - Valid', () => {
    it('should validate valid XML successfully', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      // Switch to XML
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      
      // Enter valid XML
      fireEvent.change(textarea, { target: { value: '<root><item>test</item></root>' } });
      
      // Validate
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid XML/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate XML with attributes', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      fireEvent.change(textarea, { target: { value: '<root id="1"><item type="test">value</item></root>' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid XML/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should validate XML with declaration', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      fireEvent.change(textarea, { target: { value: '<?xml version="1.0"?><root><item>test</item></root>' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid XML/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('XML Validation - Invalid', () => {
    it('should show error for unclosed XML tag', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      fireEvent.change(textarea, { target: { value: '<root><item>test</root>' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid XML/i)).toBeInTheDocument();
      }, { timeout: 1000 });
    });

    it('should disable validate button for empty XML input', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      fireEvent.change(textarea, { target: { value: '' } });
      
      expect(validateButton).toBeDisabled();
    });
  });

  describe('Drag and Drop', () => {
    it('should show drag overlay when dragging file over', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      
      // Simulate drag over
      fireEvent.dragOver(dropZone!, {
        dataTransfer: {
          files: [new File(['{}'], 'test.json', { type: 'application/json' })],
        },
      });
      
      expect(screen.getByText(/Drop JSON file here/i)).toBeInTheDocument();
    });

    it('should handle JSON file drop', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      
      const jsonFile = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
      
      // Simulate drop
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [jsonFile],
        },
      });
      
      await waitFor(() => {
        expect(textarea).toHaveValue('{"test": true}');
      });
      
      restoreFileReader();
    });

    it('should handle XML file drop', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      
      const xmlFile = new File(['<root></root>'], 'test.xml', { type: 'application/xml' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [xmlFile],
        },
      });
      
      await waitFor(() => {
        expect(textarea).toHaveValue('<root></root>');
      });
      
      restoreFileReader();
    });

    it('should reject non-JSON/XML files', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      
      const txtFile = new File(['plain text'], 'test.txt', { type: 'text/plain' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [txtFile],
        },
      });
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith('Please drop only .json or .xml files');
      });
    });

    it('should auto-detect JSON format on drop', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      const dropdown = screen.getByRole('combobox');
      
      const jsonFile = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [jsonFile],
        },
      });
      
      await waitFor(() => {
        expect(dropdown).toHaveValue('JSON');
      });
      
      restoreFileReader();
    });

    it('should auto-detect XML format on drop', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropZone = textarea.parentElement;
      const dropdown = screen.getByRole('combobox');
      
      const xmlFile = new File(['<root></root>'], 'test.xml', { type: 'application/xml' });
      
      fireEvent.drop(dropZone!, {
        dataTransfer: {
          files: [xmlFile],
        },
      });
      
      await waitFor(() => {
        expect(dropdown).toHaveValue('XML');
      });
      
      restoreFileReader();
    });
  });

  describe('File Upload', () => {
    it('should handle file upload via button', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const jsonFile = new File(['{"test": true}'], 'test.json', { type: 'application/json' });
      
      fireEvent.change(fileInput, { target: { files: [jsonFile] } });
      
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
        expect(textarea).toHaveValue('{"test": true}');
      });
      
      restoreFileReader();
    });

    it('should auto-detect format from uploaded file extension', async () => {
      const restoreFileReader = mockFileReader();
      renderWithTheme(<Validator />);
      
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      const dropdown = screen.getByRole('combobox');
      const xmlFile = new File(['<root></root>'], 'test.xml', { type: 'application/xml' });
      
      fireEvent.change(fileInput, { target: { files: [xmlFile] } });
      
      await waitFor(() => {
        expect(dropdown).toHaveValue('XML');
      });
      
      restoreFileReader();
    });
  });

  describe('Clipboard Paste', () => {
    it('should paste content from clipboard', async () => {
      const mockClipboard = navigator.clipboard as jest.Mocked<typeof navigator.clipboard>;
      mockClipboard.readText.mockResolvedValue('{"test": "clipboard"}');
      
      renderWithTheme(<Validator />);
      
      const pasteButton = screen.getByRole('button', { name: /Paste from Clipboard/i });
      
      fireEvent.click(pasteButton);
      
      await waitFor(() => {
        const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
        expect(textarea).toHaveValue('{"test": "clipboard"}');
      });
    });

    it('should handle clipboard error gracefully', async () => {
      const mockClipboard = navigator.clipboard as jest.Mocked<typeof navigator.clipboard>;
      mockClipboard.readText.mockRejectedValue(new Error('Clipboard permission denied'));
      
      renderWithTheme(<Validator />);
      
      const pasteButton = screen.getByRole('button', { name: /Paste from Clipboard/i });
      
      fireEvent.click(pasteButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Failed to read from clipboard. Please check your browser permissions.'
        );
      });
    });
  });

  describe('Format/Prettify', () => {
    it('should format valid JSON', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const formatButton = screen.getByRole('button', { name: /✨ Format/i });
      
      // Enter compact JSON
      fireEvent.change(textarea, { target: { value: '{"name":"test","value":123}' } });
      
      // Click format
      fireEvent.click(formatButton);
      
      await waitFor(() => {
        expect(textarea).toHaveValue(JSON.stringify({ name: 'test', value: 123 }, null, 2));
      });
    });

    it('should show alert for invalid JSON format attempt', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const formatButton = screen.getByRole('button', { name: /✨ Format/i });
      
      fireEvent.change(textarea, { target: { value: '{invalid json}' } });
      fireEvent.click(formatButton);
      
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          'Cannot format invalid JSON. Please validate your JSON first.'
        );
      });
    });

    it('should format button be disabled when textarea is empty', () => {
      renderWithTheme(<Validator />);
      
      const formatButton = screen.getByRole('button', { name: /✨ Format/i });
      
      expect(formatButton).toBeDisabled();
    });
  });

  describe('Clear Functionality', () => {
    it('should clear textarea content', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const clearButton = screen.getByRole('button', { name: /🗑️ Clear/i });
      
      // Add content
      fireEvent.change(textarea, { target: { value: '{"test": true}' } });
      expect(textarea).toHaveValue('{"test": true}');
      
      // Clear
      fireEvent.click(clearButton);
      
      expect(textarea).toHaveValue('');
    });

    it('should clear validation results', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      const clearButton = screen.getByRole('button', { name: /🗑️ Clear/i });
      
      // Add and validate
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Clear
      fireEvent.click(clearButton);
      
      expect(screen.queryByText(/Valid JSON/i)).not.toBeInTheDocument();
    });
  });

  describe('UI State Management', () => {
    it('should disable validate button when empty', () => {
      renderWithTheme(<Validator />);
      
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      expect(validateButton).toBeDisabled();
    });

    it('should enable validate button when content is present', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: 'test' } });
      
      expect(validateButton).not.toBeDisabled();
    });

    it('should show validating state during validation', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      
      fireEvent.change(textarea, { target: { value: '{}' } });
      
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      fireEvent.click(validateButton);
      
      // Should show "Validating..." immediately
      expect(screen.getByRole('button', { name: /Validating.../i })).toBeInTheDocument();
    });

    it('should clear validation result when content changes', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      // Validate
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Change content
      fireEvent.change(textarea, { target: { value: '{"new": "content"}' } });
      
      // Validation result should be cleared
      expect(screen.queryByText(/Valid JSON/i)).not.toBeInTheDocument();
    });

    it('should clear validation result when format type changes', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const dropdown = screen.getByRole('combobox');
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      // Validate JSON
      fireEvent.change(textarea, { target: { value: '{}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Valid JSON/i)).toBeInTheDocument();
      }, { timeout: 1000 });
      
      // Change to XML
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      
      // Validation result should be cleared
      expect(screen.queryByText(/Valid JSON/i)).not.toBeInTheDocument();
    });
  });

  describe('Statistics Display', () => {
    it('should show statistics when content is present', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      
      fireEvent.change(textarea, { target: { value: '{"test": true}' } });
      
      // Check for statistics labels (more specific)
      expect(screen.getAllByText(/Format/i).length).toBeGreaterThan(0);
      expect(screen.getByText('Size')).toBeInTheDocument();
      expect(screen.getByText('Lines')).toBeInTheDocument();
      expect(screen.getByText('Characters')).toBeInTheDocument();
    });

    it('should not show statistics when content is empty', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      
      fireEvent.change(textarea, { target: { value: '' } });
      
      // Statistics should not be visible
      expect(screen.queryByText(/^Size$/)).not.toBeInTheDocument();
    });

    it('should update statistics dynamically', () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      
      fireEvent.change(textarea, { target: { value: 'test' } });
      
      // Check initial stats
      expect(screen.getByText('4')).toBeInTheDocument(); // 4 characters
      
      // Update content
      fireEvent.change(textarea, { target: { value: 'test\ntest' } });
      
      // Should show updated stats
      expect(screen.getByText('9')).toBeInTheDocument(); // 9 characters
    });
  });

  describe('Error Display', () => {
    it('should show error message for invalid content', async () => {
      renderWithTheme(<Validator />);
      
      const textarea = screen.getByPlaceholderText(/Drop .json or .xml file here/i);
      const validateButton = screen.getByRole('button', { name: /✓ Validate/i });
      
      fireEvent.change(textarea, { target: { value: '{invalid}' } });
      fireEvent.click(validateButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Invalid JSON/i)).toBeInTheDocument();
        // Error message should display
        expect(screen.getByText(/❌/)).toBeInTheDocument();
      }, { timeout: 1000 });
    });
  });

  describe('Dropdown Interaction', () => {
    it('should switch between JSON and XML', () => {
      renderWithTheme(<Validator />);
      
      const dropdown = screen.getByRole('combobox');
      
      expect(dropdown).toHaveValue('JSON');
      
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      
      expect(dropdown).toHaveValue('XML');
    });

    it('should update placeholder when switching format', () => {
      renderWithTheme(<Validator />);
      
      const dropdown = screen.getByRole('combobox');
      
      // Initially JSON
      expect(screen.getByPlaceholderText(/type JSON content/i)).toBeInTheDocument();
      
      // Switch to XML
      fireEvent.change(dropdown, { target: { value: 'XML' } });
      
      expect(screen.getByPlaceholderText(/type XML content/i)).toBeInTheDocument();
    });
  });
});

