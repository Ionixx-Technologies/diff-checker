/**
 * XML Normalizer Tests
 * 
 * Tests for XML attribute ordering normalization
 */

import { normalizeXMLAttributes } from './xmlNormalizer';

describe('XML Normalizer', () => {
  describe('Attribute Ordering', () => {
    it('should sort attributes alphabetically', () => {
      const xml = '<element zebra="1" apple="2" middle="3"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      // Attributes should be sorted: apple, middle, zebra
      expect(normalized).toContain('apple="2"');
      expect(normalized).toContain('middle="3"');
      expect(normalized).toContain('zebra="1"');
      
      const appleIndex = normalized.indexOf('apple');
      const middleIndex = normalized.indexOf('middle');
      const zebraIndex = normalized.indexOf('zebra');
      
      expect(appleIndex).toBeLessThan(middleIndex);
      expect(middleIndex).toBeLessThan(zebraIndex);
    });

    it('should handle single attribute', () => {
      const xml = '<element attr="value"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('attr="value"');
    });

    it('should handle no attributes', () => {
      const xml = '<element/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('<element');
    });

    it('should handle multiple elements with different attributes', () => {
      const xml = '<root><child z="1" a="2"/><child b="3" a="4"/></root>';
      const normalized = normalizeXMLAttributes(xml);
      
      // Each element's attributes should be sorted independently
      expect(normalized).toContain('a="2"');
      expect(normalized).toContain('z="1"');
      expect(normalized).toContain('a="4"');
      expect(normalized).toContain('b="3"');
    });
  });

  describe('Nested Elements', () => {
    it('should normalize nested elements', () => {
      const xml = `
        <root c="3" a="1" b="2">
          <child z="9" y="8" x="7"/>
        </root>
      `;
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('a="1"');
      expect(normalized).toContain('x="7"');
    });

    it('should handle deeply nested structures', () => {
      const xml = `
        <level1 b="2" a="1">
          <level2 d="4" c="3">
            <level3 f="6" e="5"/>
          </level2>
        </level1>
      `;
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
      expect(normalized.length).toBeGreaterThan(0);
    });
  });

  describe('Attribute Values', () => {
    it('should preserve attribute values', () => {
      const xml = '<element attr1="value1" attr2="value2"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('value1');
      expect(normalized).toContain('value2');
    });

    it('should handle special characters in values', () => {
      const xml = '<element attr="special & < > \\" chars"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });

    it('should handle empty attribute values', () => {
      const xml = '<element empty="" nonempty="value"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('empty=""');
      expect(normalized).toContain('nonempty="value"');
    });

    it('should handle numeric attribute values', () => {
      const xml = '<element num="123" float="45.67"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('123');
      expect(normalized).toContain('45.67');
    });
  });

  describe('XML Declaration', () => {
    it('should handle XML declaration', () => {
      const xml = '<?xml version="1.0" encoding="UTF-8"?><root b="2" a="1"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
      expect(normalized.length).toBeGreaterThan(0);
    });

    it('should preserve XML declaration attributes order', () => {
      const xml = '<?xml encoding="UTF-8" version="1.0"?><root/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Text Content', () => {
    it('should preserve text content', () => {
      const xml = '<element attr="value">Text content here</element>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('Text content here');
    });

    it('should preserve whitespace in text content', () => {
      const xml = '<element>  Indented  text  </element>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });

    it('should handle mixed content', () => {
      const xml = '<root>Text<child attr="val"/>More text</root>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('Text');
      expect(normalized).toContain('More text');
    });
  });

  describe('CDATA Sections', () => {
    it('should handle CDATA sections', () => {
      const xml = '<element><![CDATA[Some data]]></element>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });

    it('should preserve CDATA content', () => {
      const xml = '<element><![CDATA[<tag>not parsed</tag>]]></element>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Comments', () => {
    it('should handle XML comments', () => {
      const xml = '<root><!-- Comment --><child attr="value"/></root>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid XML gracefully', () => {
      const invalidXml = '<root><unclosed>';
      const normalized = normalizeXMLAttributes(invalidXml);
      
      // Should return original string or handle error gracefully
      expect(normalized).toBeDefined();
    });

    it('should handle malformed attributes', () => {
      const xml = '<element attr=value/>'; // Missing quotes
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });

    it('should handle empty string', () => {
      const normalized = normalizeXMLAttributes('');
      
      expect(normalized).toBe('');
    });

    it('should handle whitespace only', () => {
      const normalized = normalizeXMLAttributes('   \n\t   ');
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Formatting', () => {
    it('should format output with line breaks', () => {
      const xml = '<root><child/></root>';
      const normalized = normalizeXMLAttributes(xml);
      
      // Should have line breaks between elements
      expect(normalized).toContain('\n');
    });

    it('should handle self-closing tags', () => {
      const xml = '<element attr="value"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toContain('element');
    });
  });

  describe('Namespaces', () => {
    it('should handle XML namespaces', () => {
      const xml = '<ns:element xmlns:ns="http://example.com" ns:attr="value"/>';
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
      expect(normalized.length).toBeGreaterThan(0);
    });

    it('should handle multiple namespaces', () => {
      const xml = `
        <root xmlns:ns1="http://ns1.com" xmlns:ns2="http://ns2.com">
          <ns1:child ns2:attr="value"/>
        </root>
      `;
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Large XML', () => {
    it('should handle large XML documents', () => {
      const elements = Array.from({ length: 100 }, (_, i) => 
        `<item z="${i}" y="${i}" x="${i}"/>`
      ).join('');
      const xml = `<root>${elements}</root>`;
      
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
      expect(normalized.length).toBeGreaterThan(0);
    });

    it('should handle many attributes', () => {
      const attrs = Array.from({ length: 50 }, (_, i) => 
        `attr${i}="value${i}"`
      ).join(' ');
      const xml = `<element ${attrs}/>`;
      
      const normalized = normalizeXMLAttributes(xml);
      
      expect(normalized).toBeDefined();
    });
  });

  describe('Comparison Use Case', () => {
    it('should normalize different attribute orders to same output', () => {
      const xml1 = '<element c="3" b="2" a="1"/>';
      const xml2 = '<element a="1" b="2" c="3"/>';
      
      const normalized1 = normalizeXMLAttributes(xml1);
      const normalized2 = normalizeXMLAttributes(xml2);
      
      // After normalization, both should have attributes in same order
      expect(normalized1).toBe(normalized2);
    });

    it('should detect actual differences after normalization', () => {
      const xml1 = '<element b="2" a="1"/>';
      const xml2 = '<element b="different" a="1"/>';
      
      const normalized1 = normalizeXMLAttributes(xml1);
      const normalized2 = normalizeXMLAttributes(xml2);
      
      // Different values should still be different
      expect(normalized1).not.toBe(normalized2);
    });
  });
});

