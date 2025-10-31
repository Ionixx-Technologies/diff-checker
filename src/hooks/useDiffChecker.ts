/**
 * useDiffChecker Hook
 * 
 * Manages state and logic for the diff checker functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { computeDiff, sortObjectKeys, type DiffResult, type DiffOptions } from '@/utils/diffChecker';
import { validateFormat, detectFormat, type FormatType, type ValidationResult } from '@/utils/formatValidators';

export type InputMode = 'text' | 'file' | 'paste';

export interface DiffState {
  leftInput: string;
  rightInput: string;
  leftFormat: FormatType;
  rightFormat: FormatType;
  leftValidation: ValidationResult | null;
  rightValidation: ValidationResult | null;
  diffResult: DiffResult | null;
  isComparing: boolean;
  diffOptions: DiffOptions;
}

export const useDiffChecker = () => {
  const [state, setState] = useState<DiffState>({
    leftInput: '',
    rightInput: '',
    leftFormat: 'text',
    rightFormat: 'text',
    leftValidation: null,
    rightValidation: null,
    diffResult: null,
    isComparing: false,
    diffOptions: {
      ignoreWhitespace: false,
      caseSensitive: true,
      ignoreKeyOrder: false,
    },
  });

  // Update left input
  const setLeftInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      leftInput: input,
      leftValidation: null,
      diffResult: null,
    }));
  }, []);

  // Update right input
  const setRightInput = useCallback((input: string) => {
    setState((prev) => ({
      ...prev,
      rightInput: input,
      rightValidation: null,
      diffResult: null,
    }));
  }, []);

  // Set format for left input
  const setLeftFormat = useCallback((format: FormatType) => {
    setState((prev) => ({
      ...prev,
      leftFormat: format,
      leftValidation: null,
      diffResult: null,
    }));
  }, []);

  // Set format for right input
  const setRightFormat = useCallback((format: FormatType) => {
    setState((prev) => ({
      ...prev,
      rightFormat: format,
      rightValidation: null,
      diffResult: null,
    }));
  }, []);

  // Update diff options
  const setDiffOptions = useCallback((options: Partial<DiffOptions>) => {
    setState((prev) => ({
      ...prev,
      diffOptions: { ...prev.diffOptions, ...options },
      diffResult: null, // Clear result to trigger re-comparison
    }));
  }, []);

  // Auto-detect format for both inputs
  const autoDetectFormats = useCallback(() => {
    const leftDetected = detectFormat(state.leftInput);
    const rightDetected = detectFormat(state.rightInput);
    
    setState((prev) => ({
      ...prev,
      leftFormat: leftDetected,
      rightFormat: rightDetected,
    }));

    return { left: leftDetected, right: rightDetected };
  }, [state.leftInput, state.rightInput]);

  // Validate both inputs
  const validateInputs = useCallback(() => {
    const leftValidation = validateFormat(state.leftInput, state.leftFormat);
    const rightValidation = validateFormat(state.rightInput, state.rightFormat);

    setState((prev) => ({
      ...prev,
      leftValidation,
      rightValidation,
    }));

    return {
      left: leftValidation,
      right: rightValidation,
      bothValid: leftValidation.isValid && rightValidation.isValid,
    };
  }, [state.leftInput, state.rightInput, state.leftFormat, state.rightFormat]);

  // Compare inputs and generate diff
  const compare = useCallback(() => {
    setState((prev) => ({ ...prev, isComparing: true }));

    // First validate both inputs
    const leftValidation = validateFormat(state.leftInput, state.leftFormat);
    const rightValidation = validateFormat(state.rightInput, state.rightFormat);

    // Check if formats match
    if (state.leftFormat !== state.rightFormat) {
      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation,
        diffResult: null,
        isComparing: false,
      }));
      return {
        success: false,
        error: 'Format mismatch: Cannot compare different formats',
      };
    }

    // If either is invalid, don't proceed with diff
    if (!leftValidation.isValid || !rightValidation.isValid) {
      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation,
        diffResult: null,
        isComparing: false,
      }));
      return {
        success: false,
        error: 'Cannot compare: One or both inputs are invalid',
      };
    }

    // Use formatted versions for comparison
    let leftText = leftValidation.formatted || state.leftInput;
    let rightText = rightValidation.formatted || state.rightInput;

    // If ignoreKeyOrder is enabled and format is JSON, normalize JSON
    if (state.diffOptions.ignoreKeyOrder && state.leftFormat === 'json') {
      try {
        const leftObj = JSON.parse(leftText);
        const rightObj = JSON.parse(rightText);
        leftText = JSON.stringify(sortObjectKeys(leftObj), null, 2);
        rightText = JSON.stringify(sortObjectKeys(rightObj), null, 2);
      } catch {
        // If parsing fails, use original text
      }
    }

    // Compute diff with options
    const diffResult = computeDiff(leftText, rightText, state.diffOptions);

    setState((prev) => ({
      ...prev,
      leftValidation,
      rightValidation,
      diffResult,
      isComparing: false,
    }));

    return { success: true, diffResult };
  }, [state.leftInput, state.rightInput, state.leftFormat, state.rightFormat, state.diffOptions]);

  // Clear all inputs and results
  const clear = useCallback(() => {
    setState((prev) => ({
      leftInput: '',
      rightInput: '',
      leftFormat: 'text',
      rightFormat: 'text',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
      diffOptions: prev.diffOptions, // Preserve diff options
    }));
  }, []);

  // Swap left and right inputs
  const swap = useCallback(() => {
    setState((prev) => ({
      leftInput: prev.rightInput,
      rightInput: prev.leftInput,
      leftFormat: prev.rightFormat,
      rightFormat: prev.leftFormat,
      leftValidation: prev.rightValidation,
      rightValidation: prev.leftValidation,
      diffResult: prev.diffResult ? {
        leftLines: prev.diffResult.rightLines,
        rightLines: prev.diffResult.leftLines,
        hasChanges: prev.diffResult.hasChanges,
      } : null,
      isComparing: false,
      diffOptions: prev.diffOptions, // Preserve diff options
    }));
  }, []);

  // Check if inputs are ready to compare
  const canCompare = useMemo(() => {
    return state.leftInput.trim().length > 0 && 
           state.rightInput.trim().length > 0 &&
           !state.isComparing;
  }, [state.leftInput, state.rightInput, state.isComparing]);

  return {
    ...state,
    setLeftInput,
    setRightInput,
    setLeftFormat,
    setRightFormat,
    setDiffOptions,
    autoDetectFormats,
    validateInputs,
    compare,
    clear,
    swap,
    canCompare,
  };
};

