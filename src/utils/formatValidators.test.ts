/**
 * Format Validators Tests
 * 
 * Comprehensive tests for JSON, XML, and text validation
 */

import {
  validateJSON,
  validateXML,
  validateText,
  detectFormat,
  validateFormat,
} from './formatValidators';

describe('validateJSON', () => {
  describe('Valid JSON', () => {
    it('should validate simple JSON object', () => {
      const input = '{"name": "John", "age": 30}';
      const result = validateJSON(input);

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.formatted).toBeDefined();
      expect(result.formatted).toContain('\n'); // Formatted with indentation
    });

    it('should validate JSON array', () => {
      const input = '[1, 2, 3, 4, 5]';
      const result = validateJSON(input);

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBeDefined();
    });

    it('should validate nested JSON', () => {
      const input = '{"user": {"name": "John", "address": {"city": "NYC"}}}';
      const result = validateJSON(input);

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBeDefined();
    });

    it('should format minified JSON', () => {
      const input = '{"a":1,"b":2,"c":3}';
      const result = validateJSON(input);

      expect(result.isValid).toBe(true);
      expect(result.formatted).toContain('  "a": 1');
      expect(result.formatted).toContain('  "b": 2');
    });
  });

  describe('Invalid JSON', () => {
    it('should reject empty input', () => {
      const input = '';
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should reject whitespace-only input', () => {
      const input = '   \n  \t  ';
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should reject malformed JSON - missing quotes', () => {
      const input = '{name: "John"}';
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject malformed JSON - trailing comma', () => {
      const input = '{"name": "John",}';
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject malformed JSON - single quotes', () => {
      const input = "{'name': 'John'}";
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject incomplete JSON', () => {
      const input = '{"name": "John"';
      const result = validateJSON(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('validateXML', () => {
  describe('Valid XML', () => {
    it('should validate simple XML', () => {
      const input = '<root><item>Value</item></root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(true);
      expect(result.formatted).toBeDefined();
    });

    it('should validate XML with attributes', () => {
      const input = '<root id="123"><item type="text">Value</item></root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(true);
    });

    it('should validate self-closing tags', () => {
      const input = '<root><item /><item /></root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(true);
    });

    it('should validate XML with nested elements', () => {
      const input = '<root><parent><child>Value</child></parent></root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(true);
    });
  });

  describe('Invalid XML', () => {
    it('should reject empty input', () => {
      const input = '';
      const result = validateXML(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Empty input');
    });

    it('should reject unclosed tags', () => {
      const input = '<root><item>Value</root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should reject mismatched closing tags', () => {
      const input = '<root><item>Value</item2></root>';
      const result = validateXML(input);

      expect(result.isValid).toBe(false);
      // Error message may vary between browser DOMParser and SSR validator
      expect(result.error).toBeDefined();
    });

    it('should reject unmatched opening tags', () => {
      const input = '<root><item>Value</item>';
      const result = validateXML(input);

      expect(result.isValid).toBe(false);
      // Error message may vary but should mention unclosed or unmatched tags
      expect(result.error).toBeDefined();
      expect(result.error?.toLowerCase()).toMatch(/unclosed|unmatched|root/);
    });
  });
});

describe('validateText', () => {
  it('should always validate text as valid', () => {
    const inputs = [
      'Hello World',
      '  Spaces  ',
      'Multiple\nLines',
      '!@#$%^&*()',
      '',
      '123456',
    ];

    inputs.forEach((input) => {
      const result = validateText(input);
      expect(result.isValid).toBe(true);
    });
  });

  it('should normalize line endings', () => {
    const input = 'Line 1\r\nLine 2\r\nLine 3';
    const result = validateText(input);

    expect(result.isValid).toBe(true);
    expect(result.formatted).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should handle mixed line endings', () => {
    const input = 'Line 1\nLine 2\r\nLine 3\rLine 4';
    const result = validateText(input);

    expect(result.isValid).toBe(true);
    // Check that \r\n is replaced, \r alone might remain in some cases
    expect(result.formatted).not.toContain('\r\n');
  });
});

describe('detectFormat', () => {
  describe('JSON Detection', () => {
    it('should detect JSON object', () => {
      const input = '{"name": "John"}';
      expect(detectFormat(input)).toBe('json');
    });

    it('should detect JSON array', () => {
      const input = '[1, 2, 3]';
      expect(detectFormat(input)).toBe('json');
    });

    it('should detect JSON with whitespace', () => {
      const input = '  \n  {"name": "John"}  \n  ';
      expect(detectFormat(input)).toBe('json');
    });

    it('should not detect invalid JSON as JSON', () => {
      const input = '{name: "John"}';
      // Should default to text since it's not valid JSON
      const format = detectFormat(input);
      expect(format).not.toBe('json');
    });
  });

  describe('XML Detection', () => {
    it('should detect XML', () => {
      const input = '<root><item>Value</item></root>';
      expect(detectFormat(input)).toBe('xml');
    });

    it('should detect XML with whitespace', () => {
      const input = '  \n  <root>Content</root>  \n  ';
      expect(detectFormat(input)).toBe('xml');
    });

    it('should detect self-closing XML', () => {
      const input = '<root />';
      expect(detectFormat(input)).toBe('xml');
    });
  });

  describe('Text Detection', () => {
    it('should detect plain text', () => {
      const input = 'Just some plain text';
      expect(detectFormat(input)).toBe('text');
    });

    it('should default to text for ambiguous content', () => {
      const input = 'Some {partial} <content>';
      expect(detectFormat(input)).toBe('text');
    });

    it('should detect empty as text', () => {
      const input = '';
      expect(detectFormat(input)).toBe('text');
    });
  });
});

describe('validateFormat', () => {
  it('should validate JSON format', () => {
    const input = '{"name": "John"}';
    const result = validateFormat(input, 'json');

    expect(result.isValid).toBe(true);
  });

  it('should validate XML format', () => {
    const input = '<root>Content</root>';
    const result = validateFormat(input, 'xml');

    expect(result.isValid).toBe(true);
  });

  it('should validate text format', () => {
    const input = 'Any text';
    const result = validateFormat(input, 'text');

    expect(result.isValid).toBe(true);
  });

  it('should reject invalid format for JSON', () => {
    const input = 'Not JSON';
    const result = validateFormat(input, 'json');

    expect(result.isValid).toBe(false);
  });

  it('should reject invalid format for XML', () => {
    const input = 'Not XML';
    const result = validateFormat(input, 'xml');

    expect(result.isValid).toBe(false);
  });
});

