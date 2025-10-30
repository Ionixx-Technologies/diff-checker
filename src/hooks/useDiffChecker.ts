/**
 * useDiffChecker Hook
 * 
 * Manages state and logic for the diff checker functionality
 */

import { useState, useCallback, useMemo } from 'react';
import { computeDiff, type DiffResult } from '@/utils/diffChecker';
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
    const leftText = leftValidation.formatted || state.leftInput;
    const rightText = rightValidation.formatted || state.rightInput;

    // Compute diff
    const diffResult = computeDiff(leftText, rightText);

    setState((prev) => ({
      ...prev,
      leftValidation,
      rightValidation,
      diffResult,
      isComparing: false,
    }));

    return { success: true, diffResult };
  }, [state.leftInput, state.rightInput, state.leftFormat, state.rightFormat]);

  // Clear all inputs and results
  const clear = useCallback(() => {
    setState({
      leftInput: '',
      rightInput: '',
      leftFormat: 'text',
      rightFormat: 'text',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
    });
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
    autoDetectFormats,
    validateInputs,
    compare,
    clear,
    swap,
    canCompare,
  };
};

