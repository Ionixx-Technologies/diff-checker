/**
 * Diff Checker Utility
 * 
 * Provides functionality to compare two strings and generate a diff representation.
 * Supports line-by-line comparison with change detection.
 */

export type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

export interface DiffLine {
  type: DiffType;
  content: string;
  lineNumber: number;
  correspondingLine?: number; // Line number in the other input
}

export interface DiffResult {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  hasChanges: boolean;
}

/**
 * Performs a simple line-by-line diff between two strings
 * Uses a basic LCS (Longest Common Subsequence) inspired algorithm
 */
export const computeDiff = (left: string, right: string): DiffResult => {
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');

  const leftResult: DiffLine[] = [];
  const rightResult: DiffLine[] = [];

  let hasChanges = false;
  let leftIndex = 0;
  let rightIndex = 0;

  // Simple diff algorithm
  while (leftIndex < leftLines.length || rightIndex < rightLines.length) {
    const leftLine = leftLines[leftIndex];
    const rightLine = rightLines[rightIndex];

    if (leftIndex >= leftLines.length) {
      // Only right lines remain - they are added
      rightResult.push({
        type: 'added',
        content: rightLine,
        lineNumber: rightIndex + 1,
      });
      hasChanges = true;
      rightIndex++;
    } else if (rightIndex >= rightLines.length) {
      // Only left lines remain - they are removed
      leftResult.push({
        type: 'removed',
        content: leftLine,
        lineNumber: leftIndex + 1,
      });
      hasChanges = true;
      leftIndex++;
    } else if (leftLine === rightLine) {
      // Lines are identical
      leftResult.push({
        type: 'unchanged',
        content: leftLine,
        lineNumber: leftIndex + 1,
        correspondingLine: rightIndex + 1,
      });
      rightResult.push({
        type: 'unchanged',
        content: rightLine,
        lineNumber: rightIndex + 1,
        correspondingLine: leftIndex + 1,
      });
      leftIndex++;
      rightIndex++;
    } else {
      // Lines are different - check if next lines match
      const leftNextMatch = rightLines.indexOf(leftLine, rightIndex + 1);
      const rightNextMatch = leftLines.indexOf(rightLine, leftIndex + 1);

      if (leftNextMatch !== -1 && (rightNextMatch === -1 || leftNextMatch < rightNextMatch)) {
        // Right line was added
        rightResult.push({
          type: 'added',
          content: rightLine,
          lineNumber: rightIndex + 1,
        });
        hasChanges = true;
        rightIndex++;
      } else if (rightNextMatch !== -1) {
        // Left line was removed
        leftResult.push({
          type: 'removed',
          content: leftLine,
          lineNumber: leftIndex + 1,
        });
        hasChanges = true;
        leftIndex++;
      } else {
        // Lines are changed
        leftResult.push({
          type: 'changed',
          content: leftLine,
          lineNumber: leftIndex + 1,
          correspondingLine: rightIndex + 1,
        });
        rightResult.push({
          type: 'changed',
          content: rightLine,
          lineNumber: rightIndex + 1,
          correspondingLine: leftIndex + 1,
        });
        hasChanges = true;
        leftIndex++;
        rightIndex++;
      }
    }
  }

  return {
    leftLines: leftResult,
    rightLines: rightResult,
    hasChanges,
  };
};

/**
 * Computes character-level diff for a single line
 * Useful for highlighting specific changes within a line
 */
export const computeLineDiff = (left: string, right: string): { same: boolean; parts: Array<{ value: string; added?: boolean; removed?: boolean }> } => {
  if (left === right) {
    return { same: true, parts: [{ value: left }] };
  }

  // Simple character-level diff
  const parts: Array<{ value: string; added?: boolean; removed?: boolean }> = [];
  let i = 0;
  let j = 0;

  while (i < left.length || j < right.length) {
    if (i < left.length && j < right.length && left[i] === right[j]) {
      // Characters match
      let matchStr = '';
      while (i < left.length && j < right.length && left[i] === right[j]) {
        matchStr += left[i];
        i++;
        j++;
      }
      parts.push({ value: matchStr });
    } else {
      // Characters differ
      let removedStr = '';
      let addedStr = '';
      
      if (i < left.length) {
        removedStr = left[i];
        i++;
      }
      
      if (j < right.length) {
        addedStr = right[j];
        j++;
      }

      if (removedStr) parts.push({ value: removedStr, removed: true });
      if (addedStr) parts.push({ value: addedStr, added: true });
    }
  }

  return { same: false, parts };
};

