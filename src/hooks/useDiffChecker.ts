/**
 * useDiffChecker Hook
 * 
 * Manages state and logic for the diff checker functionality
 * Includes session storage integration for preserving user data
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { computeDiff, sortObjectKeys, type DiffResult, type DiffOptions } from '@/utils/diffChecker';
import { validateFormat, detectFormat, type FormatType, type ValidationResult } from '@/utils/formatValidators';
import { normalizeXMLAttributes } from '@/utils/xmlNormalizer';
import {
  saveSessionData,
  loadSessionData,
  isSessionPreserveEnabled,
  clearSessionData,
  setSessionPreserveEnabled
} from '@/services/sessionStorage';
import { createDiffWorker } from '@/workers/workerFactory';

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
  ignoreAttributeOrder: false,
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

  const workerRef = useRef<Worker | null>(null);

  // Initialize Web Worker
  useEffect(() => {
    // Create worker using factory (returns null in test environment)
    workerRef.current = createDiffWorker();

    return () => {
      workerRef.current?.terminate();
    };
  }, []);

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
          diffOptions: { ...defaultDiffOptions, ...savedSession.diffOptions },
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

  // Compare inputs and generate diff with Web Worker support
  const compare = useCallback(async () => {
    setState((prev) => ({ ...prev, isComparing: true }));

    // Yield to browser to show loading state
    await new Promise(resolve => setTimeout(resolve, 0));

    const leftValidation = validateFormat(state.leftInput, state.leftFormat);
    const rightValidation = validateFormat(state.rightInput, state.rightFormat);

    if (state.leftFormat !== state.rightFormat) {
      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation,
        diffResult: null,
        isComparing: false,
      }));
      return { success: false, error: 'Format mismatch' };
    }

    if (!leftValidation.isValid || !rightValidation.isValid) {
      setState((prev) => ({
        ...prev,
        leftValidation,
        rightValidation,
        diffResult: null,
        isComparing: false,
      }));
      return { success: false, error: 'Invalid input' };
    }

    let leftText = leftValidation.formatted || state.leftInput;
    let rightText = rightValidation.formatted || state.rightInput;

    // JSON key order normalization (async)
    if (state.diffOptions.ignoreKeyOrder && state.leftFormat === 'json') {
      try {
        await new Promise(resolve => setTimeout(resolve, 0));
        const leftObj = JSON.parse(leftText);
        const rightObj = JSON.parse(rightText);
        leftText = JSON.stringify(sortObjectKeys(leftObj), null, 2);
        rightText = JSON.stringify(sortObjectKeys(rightObj), null, 2);
      } catch {
        // Use original text if parsing fails
      }
    }

    // XML attribute order normalization (async)
    if (state.diffOptions.ignoreAttributeOrder && state.leftFormat === 'xml') {
      try {
        await new Promise(resolve => setTimeout(resolve, 0));
        leftText = normalizeXMLAttributes(leftText);
        rightText = normalizeXMLAttributes(rightText);
      } catch {
        // Use original text if normalization fails
      }
    }

    // Use Web Worker for files larger than 10KB (reduced threshold)
    const isLargeFile = leftText.length > 10000 || rightText.length > 10000;

    if (isLargeFile && workerRef.current) {
      try {
        const diffResult = await new Promise<DiffResult>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error('Worker timeout'));
          }, 30000); // 30 second timeout

          const handleMessage = (e: MessageEvent) => {
            clearTimeout(timeoutId);
            if (e.data.success) {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error));
            }
            workerRef.current?.removeEventListener('message', handleMessage);
          };

          workerRef.current?.addEventListener('message', handleMessage);
          workerRef.current?.postMessage({
            type: 'COMPUTE_DIFF',
            payload: { left: leftText, right: rightText, options: state.diffOptions },
          });
        });

        // Use requestAnimationFrame for smooth state update
        await new Promise(resolve => requestAnimationFrame(resolve));

        setState((prev) => ({
          ...prev,
          leftValidation,
          rightValidation,
          diffResult,
          isComparing: false,
        }));

        return { success: true, diffResult };
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Worker diff failed, falling back to async processing:', error);
        // Fall through to async processing
      }
    }

    // Async diff processing for smoother UI
    await new Promise(resolve => setTimeout(resolve, 0));
    const diffResult = await new Promise<DiffResult>((resolve) => {
      setTimeout(() => {
        resolve(computeDiff(leftText, rightText, state.diffOptions));
      }, 0);
    });

    // Use requestAnimationFrame for smooth state update
    await new Promise(resolve => requestAnimationFrame(resolve));

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

  // Reset to initial state and clear session storage
  const reset = useCallback(() => {
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
      diffOptions: defaultDiffOptions,
      // Disable session storage
      preserveSession: false,
    }));
    
    // Clear session storage data and disable the feature
    clearSessionData();
    setSessionPreserveEnabled(false);
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
      diffOptions: prev.diffOptions,
      preserveSession: prev.preserveSession,
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
    reset,
    swap,
    canCompare,
    togglePreserveSession,
  };
};

