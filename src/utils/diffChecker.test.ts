/**
 * DiffChecker Utility Tests
 * 
 * Comprehensive tests for diff computation logic
 */

import { computeDiff, computeLineDiff } from './diffChecker';

describe('computeDiff', () => {
  describe('Basic Functionality', () => {
    it('should detect identical strings', () => {
      const left = 'Hello World';
      const right = 'Hello World';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(false);
      expect(result.leftLines).toHaveLength(1);
      expect(result.rightLines).toHaveLength(1);
      expect(result.leftLines[0].type).toBe('unchanged');
      expect(result.rightLines[0].type).toBe('unchanged');
    });

    it('should detect added lines', () => {
      const left = 'Line 1';
      const right = 'Line 1\nLine 2';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      expect(result.leftLines).toHaveLength(1);
      expect(result.rightLines).toHaveLength(2);
      expect(result.rightLines[1].type).toBe('added');
      expect(result.rightLines[1].content).toBe('Line 2');
    });

    it('should detect removed lines', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      expect(result.leftLines).toHaveLength(2);
      expect(result.rightLines).toHaveLength(1);
      expect(result.leftLines[1].type).toBe('removed');
      expect(result.leftLines[1].content).toBe('Line 2');
    });

    it('should detect changed lines', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nLine 2 Modified\nLine 3';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      expect(result.leftLines[1].type).toBe('changed');
      expect(result.rightLines[1].type).toBe('changed');
      expect(result.leftLines[1].content).toBe('Line 2');
      expect(result.rightLines[1].content).toBe('Line 2 Modified');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings', () => {
      const left = '';
      const right = '';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(false);
      expect(result.leftLines).toHaveLength(1);
      expect(result.rightLines).toHaveLength(1);
    });

    it('should handle one empty string', () => {
      const left = 'Content';
      const right = '';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      // The algorithm may detect this as 'changed' or 'removed' depending on implementation
      expect(['removed', 'changed']).toContain(result.leftLines[0].type);
    });

    it('should handle multiline with mixed changes', () => {
      const left = 'Line 1\nLine 2\nLine 3\nLine 4';
      const right = 'Line 1\nLine 2 Modified\nLine 4\nLine 5';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      expect(result.leftLines).toHaveLength(4);
      expect(result.rightLines).toHaveLength(4);
    });

    it('should handle whitespace differences', () => {
      const left = 'Line 1';
      const right = 'Line 1 ';
      const result = computeDiff(left, right);

      expect(result.hasChanges).toBe(true);
      expect(result.leftLines[0].type).toBe('changed');
      expect(result.rightLines[0].type).toBe('changed');
    });
  });

  describe('Line Numbering', () => {
    it('should correctly number lines', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nLine 2\nLine 3';
      const result = computeDiff(left, right);

      result.leftLines.forEach((line, index) => {
        expect(line.lineNumber).toBe(index + 1);
      });

      result.rightLines.forEach((line, index) => {
        expect(line.lineNumber).toBe(index + 1);
      });
    });

    it('should maintain line numbers with changes', () => {
      const left = 'Line 1\nLine 2\nLine 3';
      const right = 'Line 1\nLine 3';
      const result = computeDiff(left, right);

      expect(result.leftLines[0].lineNumber).toBe(1);
      expect(result.leftLines[1].lineNumber).toBe(2);
      expect(result.leftLines[2].lineNumber).toBe(3);
      expect(result.rightLines[0].lineNumber).toBe(1);
      expect(result.rightLines[1].lineNumber).toBe(2);
    });
  });

  describe('Corresponding Lines', () => {
    it('should link corresponding unchanged lines', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1\nLine 2';
      const result = computeDiff(left, right);

      expect(result.leftLines[0].correspondingLine).toBe(1);
      expect(result.rightLines[0].correspondingLine).toBe(1);
      expect(result.leftLines[1].correspondingLine).toBe(2);
      expect(result.rightLines[1].correspondingLine).toBe(2);
    });

    it('should link corresponding changed lines', () => {
      const left = 'Line 1\nLine 2';
      const right = 'Line 1\nLine 2 Modified';
      const result = computeDiff(left, right);

      expect(result.leftLines[1].correspondingLine).toBe(2);
      expect(result.rightLines[1].correspondingLine).toBe(2);
    });
  });
});

describe('computeLineDiff', () => {
  it('should detect identical lines', () => {
    const left = 'Hello World';
    const right = 'Hello World';
    const result = computeLineDiff(left, right);

    expect(result.same).toBe(true);
    expect(result.parts).toHaveLength(1);
    expect(result.parts[0].value).toBe('Hello World');
    expect(result.parts[0].added).toBeUndefined();
    expect(result.parts[0].removed).toBeUndefined();
  });

  it('should detect character additions', () => {
    const left = 'Hello';
    const right = 'Hello World';
    const result = computeLineDiff(left, right);

    expect(result.same).toBe(false);
    expect(result.parts.some(p => p.added)).toBe(true);
  });

  it('should detect character removals', () => {
    const left = 'Hello World';
    const right = 'Hello';
    const result = computeLineDiff(left, right);

    expect(result.same).toBe(false);
    expect(result.parts.some(p => p.removed)).toBe(true);
  });

  it('should handle completely different strings', () => {
    const left = 'ABC';
    const right = 'XYZ';
    const result = computeLineDiff(left, right);

    expect(result.same).toBe(false);
    expect(result.parts.length).toBeGreaterThan(0);
  });

  it('should handle empty strings', () => {
    const left = '';
    const right = '';
    const result = computeLineDiff(left, right);

    expect(result.same).toBe(true);
  });
});

