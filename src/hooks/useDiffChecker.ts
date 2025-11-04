/**
 * useDiffChecker Hook
 * 
 * Manages state and logic for the diff checker functionality
 * Includes session storage integration for preserving user data
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { computeDiff, sortObjectKeys, type DiffResult, type DiffOptions } from '@/utils/diffChecker';
import { validateFormat, detectFormat, type FormatType, type ValidationResult } from '@/utils/formatValidators';
import { 
  saveSessionData, 
  loadSessionData, 
  isSessionPreserveEnabled 
} from '@/services/sessionStorage';

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
  preserveSession: boolean; // Track if session preservation is enabled
}

const defaultDiffOptions: DiffOptions = {
  ignoreWhitespace: false,
  caseSensitive: true,
  ignoreKeyOrder: false,
};

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
    diffOptions: defaultDiffOptions,
    preserveSession: isSessionPreserveEnabled(),
  });

  // Load saved session on mount (async)
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedSession = await loadSessionData();
      
      if (savedSession) {
        // eslint-disable-next-line no-console
        console.log('📂 Loaded saved session (encrypted) from:', savedSession.savedAt);
        setState(prev => ({
          ...prev,
          leftInput: savedSession.leftInput,
          rightInput: savedSession.rightInput,
          leftFormat: savedSession.leftFormat,
          rightFormat: savedSession.rightFormat,
          diffOptions: savedSession.diffOptions,
          preserveSession: true,
        }));
      }
    };

    loadSavedSession();
  }, []); // Run once on mount

  // Auto-save session data when relevant state changes (async)
  useEffect(() => {
    if (!state.preserveSession) {
      return;
    }

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(async () => {
      await saveSessionData({
        leftInput: state.leftInput,
        rightInput: state.rightInput,
        leftFormat: state.leftFormat,
        rightFormat: state.rightFormat,
        diffOptions: state.diffOptions,
      });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [
    state.leftInput,
    state.rightInput,
    state.leftFormat,
    state.rightFormat,
    state.diffOptions,
    state.preserveSession,
  ]);

  // Toggle session preservation
  const togglePreserveSession = useCallback((enabled: boolean) => {
    setState((prev) => ({
      ...prev,
      preserveSession: enabled,
    }));
  }, []);

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
  const clear = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      leftInput: '',
      rightInput: '',
      leftFormat: 'text',
      rightFormat: 'text',
      leftValidation: null,
      rightValidation: null,
      diffResult: null,
      isComparing: false,
      diffOptions: defaultDiffOptions, // Preserve diff options
    }));
    
    // If session preservation is enabled, save the cleared state
    if (state.preserveSession) {
      await saveSessionData({
        leftInput: '',
        rightInput: '',
        leftFormat: 'text',
        rightFormat: 'text',
        diffOptions: defaultDiffOptions,
      });
    }
  }, [state.preserveSession]);

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
      preserveSession: prev.preserveSession, // Preserve session setting
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
    togglePreserveSession, // Export session preservation toggle
  };
};

