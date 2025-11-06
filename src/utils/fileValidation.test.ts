/**
 * File Validation Utilities Tests
 * 
 * Tests for file validation functions including:
 * - File size validation
 * - File format validation
 * - Combined validation
 * - Helper functions
 */

import {
  MAX_FILE_SIZE,
  validateFileSize,
  validateFileFormat,
  validateFile,
  validateClipboardSize,
  formatFileSize,
  getAcceptedExtensions,
} from './fileValidation';

describe('File Validation Utilities', () => {
  describe('Constants', () => {
    it('should have correct MAX_FILE_SIZE', () => {
      expect(MAX_FILE_SIZE).toBe(2 * 1024 * 1024); // 2 MB
    });
  });

  describe('validateFileSize', () => {
    it('should accept files within size limit', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = validateFileSize(file);
      
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject files exceeding size limit', () => {
      const largeContent = 'a'.repeat(3 * 1024 * 1024); // 3 MB
      const file = new File([largeContent], 'large.txt', { type: 'text/plain' });
      const result = validateFileSize(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('2 MB');
      expect(result.errorTitle).toBe('File Too Large');
    });

    it('should format file size in error message', () => {
      const content = 'a'.repeat(2.5 * 1024 * 1024); // 2.5 MB
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = validateFileSize(file);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toMatch(/\d+\.\d+ MB/);
    });

    it('should accept file exactly at limit', () => {
      const content = 'a'.repeat(MAX_FILE_SIZE);
      const file = new File([content], 'test.txt', { type: 'text/plain' });
      const result = validateFileSize(file);
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('validateFileFormat', () => {
    describe('JSON format', () => {
      it('should accept .json files', () => {
        const file = new File(['{}'], 'test.json', { type: 'application/json' });
        const result = validateFileFormat(file, 'json');
        
        expect(result.isValid).toBe(true);
      });

      it('should reject non-JSON files', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const result = validateFileFormat(file, 'json');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('JSON');
        expect(result.errorTitle).toBe('Invalid File Format');
      });

      it('should accept .json extension regardless of MIME type', () => {
        const file = new File(['{}'], 'test.json', { type: 'text/plain' });
        const result = validateFileFormat(file, 'json');
        
        expect(result.isValid).toBe(true);
      });
    });

    describe('XML format', () => {
      it('should accept .xml files', () => {
        const file = new File(['<root/>'], 'test.xml', { type: 'application/xml' });
        const result = validateFileFormat(file, 'xml');
        
        expect(result.isValid).toBe(true);
      });

      it('should accept text/xml MIME type', () => {
        const file = new File(['<root/>'], 'test.xml', { type: 'text/xml' });
        const result = validateFileFormat(file, 'xml');
        
        expect(result.isValid).toBe(true);
      });

      it('should reject non-XML files', () => {
        const file = new File(['content'], 'test.txt', { type: 'text/plain' });
        const result = validateFileFormat(file, 'xml');
        
        expect(result.isValid).toBe(false);
        expect(result.error).toContain('XML');
      });
    });

    describe('Text format', () => {
      it('should accept .txt files', () => {
        const file = new File(['text'], 'test.txt', { type: 'text/plain' });
        const result = validateFileFormat(file, 'text');
        
        expect(result.isValid).toBe(true);
      });

      it('should reject non-text files', () => {
        const file = new File(['{}'], 'test.json', { type: 'application/json' });
        const result = validateFileFormat(file, 'text');

        expect(result.isValid).toBe(false);
        expect(result.error).toContain('TEXT');
      });
    });

    describe('Case insensitivity', () => {
      it('should accept uppercase extensions', () => {
        const file = new File(['{}'], 'test.JSON', { type: 'application/json' });
        const result = validateFileFormat(file, 'json');
        
        expect(result.isValid).toBe(true);
      });

      it('should accept mixed case extensions', () => {
        const file = new File(['<root/>'], 'test.XmL', { type: 'application/xml' });
        const result = validateFileFormat(file, 'xml');
        
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe('validateFile', () => {
    it('should validate both size and format', () => {
      const file = new File(['{}'], 'test.json', { type: 'application/json' });
      const result = validateFile(file, 'json');
      
      expect(result.isValid).toBe(true);
    });

    it('should fail if size is invalid', () => {
      const largeContent = 'a'.repeat(3 * 1024 * 1024);
      const file = new File([largeContent], 'test.json', { type: 'application/json' });
      const result = validateFile(file, 'json');
      
      expect(result.isValid).toBe(false);
      expect(result.errorTitle).toBe('File Too Large');
    });

    it('should fail if format is invalid', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file, 'json');

      expect(result.isValid).toBe(false);
      expect(result.errorTitle).toBe('Invalid File Format');
    });

    it('should fail if both size and format are invalid (size checked first)', () => {
      const largeContent = 'a'.repeat(3 * 1024 * 1024);
      const file = new File([largeContent], 'test.txt', { type: 'text/plain' });
      const result = validateFile(file, 'json');
      
      expect(result.isValid).toBe(false);
      // Size is checked first
      expect(result.errorTitle).toBe('File Too Large');
    });
  });

  describe('validateClipboardSize', () => {
    it('should accept text within size limit', () => {
      const text = 'Small text content';
      const result = validateClipboardSize(text);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject text exceeding size limit', () => {
      const largeText = 'a'.repeat(3 * 1024 * 1024); // 3 MB
      const result = validateClipboardSize(largeText);

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('2 MB');
      expect(result.errorTitle).toBe('Clipboard Content Too Large');
    });

    it('should calculate byte size correctly for UTF-8', () => {
      const text = '你好世界'; // Chinese characters (3 bytes each in UTF-8)
      const result = validateClipboardSize(text);
      
      expect(result.isValid).toBe(true);
    });

    it('should handle empty string', () => {
      const result = validateClipboardSize('');
      
      expect(result.isValid).toBe(true);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(100)).toBe('100 B');
      expect(formatFileSize(1024)).toBe('1.00 KB');
      expect(formatFileSize(1024 * 1024)).toBe('1.00 MB');
      expect(formatFileSize(1536 * 1024)).toBe('1.50 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.50 MB');
    });

    it('should handle zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 B');
    });

    it('should handle large sizes', () => {
      expect(formatFileSize(10 * 1024 * 1024)).toBe('10.00 MB');
    });

    it('should round to 2 decimal places', () => {
      expect(formatFileSize(1234567)).toMatch(/\d+\.\d{2} MB/);
    });
  });

  describe('getAcceptedExtensions', () => {
    it('should return correct extensions for JSON', () => {
      expect(getAcceptedExtensions('json')).toBe('.json');
    });

    it('should return correct extensions for XML', () => {
      expect(getAcceptedExtensions('xml')).toBe('.xml');
    });

    it('should return correct extensions for text', () => {
      expect(getAcceptedExtensions('text')).toBe('.txt');
    });
  });

  describe('Edge Cases', () => {
    it('should handle files without extensions', () => {
      const file = new File(['content'], 'noextension', { type: 'text/plain' });
      const result = validateFileFormat(file, 'text');
      
      expect(result.isValid).toBe(true);
    });

    it('should handle files with multiple dots in name', () => {
      const file = new File(['{}'], 'my.file.name.json', { type: 'application/json' });
      const result = validateFileFormat(file, 'json');
      
      expect(result.isValid).toBe(true);
    });

    it('should handle empty file name', () => {
      const file = new File(['content'], '', { type: 'text/plain' });
      const result = validateFileFormat(file, 'text');
      
      // Should validate based on MIME type when name is empty
      expect(result.isValid).toBe(true);
    });

    it('should handle very small files', () => {
      const file = new File(['a'], 'tiny.txt', { type: 'text/plain' });
      const result = validateFileSize(file);
      
      expect(result.isValid).toBe(true);
    });
  });
});

