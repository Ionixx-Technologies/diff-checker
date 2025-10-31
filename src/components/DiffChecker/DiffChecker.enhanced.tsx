/**
 * Enhanced DiffChecker Component
 * 
 * Modern, responsive diff checker with drag & drop support, smooth animations,
 * and enhanced interactivity.
 */

import React, { useRef, useCallback, useState } from 'react';
import { useDiffChecker } from '@/hooks/useDiffChecker';
import type { FormatType } from '@/utils/formatValidators';
import * as S from './DiffChecker.styles';

interface DiffCheckerProps {
  themeMode?: 'light' | 'dark';
  onThemeToggle?: () => void;
}

export const DiffChecker: React.FC<DiffCheckerProps> = ({
  themeMode = 'light',
  onThemeToggle,
}) => {
  const {
    leftInput,
    rightInput,
    leftFormat,
    rightFormat,
    leftValidation,
    rightValidation,
    diffResult,
    isComparing,
    setLeftInput,
    setRightInput,
    setLeftFormat,
    setRightFormat,
    autoDetectFormats,
    compare,
    clear,
    swap,
    canCompare,
  } = useDiffChecker();

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop states for visual feedback
  const [leftDragging, setLeftDragging] = useState(false);
  const [rightDragging, setRightDragging] = useState(false);

  /**
   * Generic file reader utility
   * Reads file content and calls the provided callback
   */
  const readFile = useCallback((file: File, onLoad: (content: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onLoad(content);
    };
    reader.onerror = () => {
      alert('Failed to read file. Please try again.');
    };
    reader.readAsText(file);
  }, []);

  /**
   * Handle file upload for left input via input element
   */
  const handleLeftFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file, setLeftInput);
    }
  }, [readFile, setLeftInput]);

  /**
   * Handle file upload for right input via input element
   */
  const handleRightFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      readFile(file, setRightInput);
    }
  }, [readFile, setRightInput]);

  /**
   * Handle drag over event - prevents default to allow drop
   */
  const handleDragOver = useCallback((e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Update dragging state for visual feedback
    if (side === 'left') {
      setLeftDragging(true);
    } else {
      setRightDragging(true);
    }
  }, []);

  /**
   * Handle drag leave event - remove visual feedback
   */
  const handleDragLeave = useCallback((e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only remove dragging state if leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      if (side === 'left') {
        setLeftDragging(false);
      } else {
        setRightDragging(false);
      }
    }
  }, []);

  /**
   * Handle drop event - read dropped file and update input
   */
  const handleDrop = useCallback((e: React.DragEvent, side: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    // Reset dragging state
    if (side === 'left') {
      setLeftDragging(false);
    } else {
      setRightDragging(false);
    }

    // Get the first dropped file
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type (text-based files only)
      const validTypes = [
        'text/plain',
        'application/json',
        'text/xml',
        'application/xml',
        'text/html',
      ];
      
      if (validTypes.includes(file.type) || file.name.endsWith('.txt') || 
          file.name.endsWith('.json') || file.name.endsWith('.xml')) {
        readFile(file, side === 'left' ? setLeftInput : setRightInput);
      } else {
        alert('Please drop a text-based file (.txt, .json, .xml)');
      }
    }
  }, [readFile, setLeftInput, setRightInput]);

  /**
   * Handle paste from clipboard
   */
  const handlePaste = useCallback(async (side: 'left' | 'right') => {
    try {
      const text = await navigator.clipboard.readText();
      if (side === 'left') {
        setLeftInput(text);
      } else {
        setRightInput(text);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard:', error);
      alert('Failed to read from clipboard. Please check your browser permissions.');
    }
  }, [setLeftInput, setRightInput]);

  /**
   * Calculate diff statistics for display
   */
  const getStats = useCallback(() => {
    if (!diffResult) return null;

    const addedLines = diffResult.rightLines.filter(line => line.type === 'added').length;
    const removedLines = diffResult.leftLines.filter(line => line.type === 'removed').length;
    const changedLines = Math.max(
      diffResult.leftLines.filter(line => line.type === 'changed').length,
      diffResult.rightLines.filter(line => line.type === 'changed').length
    );
    const unchangedLines = diffResult.leftLines.filter(line => line.type === 'unchanged').length;

    return { addedLines, removedLines, changedLines, unchangedLines };
  }, [diffResult]);

  const stats = getStats();

  return (
    <S.Container>
      {/* Header with title and theme toggle */}
      <S.Header>
        {onThemeToggle && (
          <S.ThemeToggle onClick={onThemeToggle} aria-label={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
            {themeMode === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </S.ThemeToggle>
        )}
      </S.Header>

      {/* Control bar with action buttons */}
      <S.ControlBar>
        <S.Button 
          variant="primary" 
          onClick={compare} 
          disabled={!canCompare || isComparing}
          aria-label="Compare inputs"
        >
          {isComparing ? '⏳ Comparing...' : '🔍 Compare'}
        </S.Button>
        <S.Button 
          onClick={autoDetectFormats}
          aria-label="Auto-detect format"
        >
          🔮 Auto-detect Format
        </S.Button>
        <S.Button 
          onClick={swap} 
          disabled={!leftInput && !rightInput}
          aria-label="Swap left and right inputs"
        >
          ⇄ Swap
        </S.Button>
        <S.Button 
          variant="danger" 
          onClick={clear}
          aria-label="Clear all inputs"
        >
          🗑️ Clear All
        </S.Button>
      </S.ControlBar>

      {/* Input panels - responsive grid layout */}
      <S.InputContainer>
        {/* Left Input Panel with Drag & Drop */}
        <S.InputPanel>
          <S.PanelHeader>
            <S.PanelTitle>Original (Left)</S.PanelTitle>
            <S.Select
              value={leftFormat}
              onChange={(e) => setLeftFormat(e.target.value as FormatType)}
              aria-label="Select format for left input"
            >
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </S.Select>
          </S.PanelHeader>

          {/* Input mode controls */}
          <S.ControlBar>
            <S.FileInput
              ref={leftFileInputRef}
              type="file"
              id="left-file-input"
              accept=".txt,.json,.xml"
              onChange={handleLeftFileUpload}
              aria-label="Upload file for left input"
            />
            <S.FileInputLabel htmlFor="left-file-input">
              📁 Upload File
            </S.FileInputLabel>
            <S.Button onClick={() => handlePaste('left')}>
              📋 Paste
            </S.Button>
          </S.ControlBar>

          {/* Drop zone with visual feedback */}
              <S.DropZone
                $isDragging={leftDragging}
                onDragOver={(e) => handleDragOver(e, 'left')}
                onDragLeave={(e) => handleDragLeave(e, 'left')}
                onDrop={(e) => handleDrop(e, 'left')}
              >
            <S.TextArea
              value={leftInput}
              onChange={(e) => setLeftInput(e.target.value)}
              placeholder={`Drop file here or paste ${leftFormat.toUpperCase()} content...`}
              aria-label="Left input text area"
            />
            {leftDragging && (
              <S.DropOverlay>
                <S.DropMessage>📂 Drop file here</S.DropMessage>
              </S.DropOverlay>
            )}
          </S.DropZone>

          {/* Validation feedback */}
          {leftValidation && !leftValidation.isValid && (
            <S.ValidationMessage type="error" role="alert">
              ❌ {leftValidation.error}
            </S.ValidationMessage>
          )}
          {leftValidation && leftValidation.isValid && diffResult && (
            <S.ValidationMessage type="success" role="status">
              ✅ Valid {leftFormat.toUpperCase()}
            </S.ValidationMessage>
          )}
        </S.InputPanel>

        {/* Right Input Panel with Drag & Drop */}
        <S.InputPanel>
          <S.PanelHeader>
            <S.PanelTitle>Modified (Right)</S.PanelTitle>
            <S.Select
              value={rightFormat}
              onChange={(e) => setRightFormat(e.target.value as FormatType)}
              aria-label="Select format for right input"
            >
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </S.Select>
          </S.PanelHeader>

          {/* Input mode controls */}
          <S.ControlBar>
            <S.FileInput
              ref={rightFileInputRef}
              type="file"
              id="right-file-input"
              accept=".txt,.json,.xml"
              onChange={handleRightFileUpload}
              aria-label="Upload file for right input"
            />
            <S.FileInputLabel htmlFor="right-file-input">
              📁 Upload File
            </S.FileInputLabel>
            <S.Button onClick={() => handlePaste('right')}>
              📋 Paste
            </S.Button>
          </S.ControlBar>

          {/* Drop zone with visual feedback */}
              <S.DropZone
                $isDragging={rightDragging}
                onDragOver={(e) => handleDragOver(e, 'right')}
                onDragLeave={(e) => handleDragLeave(e, 'right')}
                onDrop={(e) => handleDrop(e, 'right')}
              >
            <S.TextArea
              value={rightInput}
              onChange={(e) => setRightInput(e.target.value)}
              placeholder={`Drop file here or paste ${rightFormat.toUpperCase()} content...`}
              aria-label="Right input text area"
            />
            {rightDragging && (
              <S.DropOverlay>
                <S.DropMessage>📂 Drop file here</S.DropMessage>
              </S.DropOverlay>
            )}
          </S.DropZone>

          {/* Validation feedback */}
          {rightValidation && !rightValidation.isValid && (
            <S.ValidationMessage type="error" role="alert">
              ❌ {rightValidation.error}
            </S.ValidationMessage>
          )}
          {rightValidation && rightValidation.isValid && diffResult && (
            <S.ValidationMessage type="success" role="status">
              ✅ Valid {rightFormat.toUpperCase()}
            </S.ValidationMessage>
          )}
        </S.InputPanel>
      </S.InputContainer>

      {/* Format mismatch warning */}
      {leftFormat !== rightFormat && (leftInput || rightInput) && (
        <S.ValidationMessage type="warning" role="alert">
          ⚠️ Warning: Format mismatch detected. Left is {leftFormat.toUpperCase()}, Right is {rightFormat.toUpperCase()}. 
          Please select the same format for both sides to compare.
        </S.ValidationMessage>
      )}

      {/* Diff statistics panel */}
      {stats && diffResult && (
        <S.Stats>
          <S.StatItem>
            <S.StatLabel>Total Lines</S.StatLabel>
            <S.StatValue>{Math.max(diffResult.leftLines.length, diffResult.rightLines.length)}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Unchanged</S.StatLabel>
            <S.StatValue style={{ color: '#6b7280' }}>{stats.unchangedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Added</S.StatLabel>
            <S.StatValue style={{ color: '#10b981' }}>+{stats.addedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Removed</S.StatLabel>
            <S.StatValue style={{ color: '#ef4444' }}>-{stats.removedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Changed</S.StatLabel>
            <S.StatValue style={{ color: '#f59e0b' }}>~{stats.changedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Status</S.StatLabel>
            <S.StatValue>{diffResult.hasChanges ? '✓ Different' : '✗ Identical'}</S.StatValue>
          </S.StatItem>
        </S.Stats>
      )}

      {/* Diff results display - responsive grid */}
      {diffResult ? (
        <S.DiffContainer>
          <S.DiffPanel>
            <S.PanelTitle>Original (Left) - Diff View</S.PanelTitle>
            <S.DiffContent role="region" aria-label="Left diff content">
              {diffResult.leftLines.map((line, index) => (
                <S.DiffLine key={index} type={line.type}>
                  <S.LineNumber>{line.lineNumber}</S.LineNumber>
                  {line.content || ' '}
                </S.DiffLine>
              ))}
            </S.DiffContent>
          </S.DiffPanel>

          <S.DiffPanel>
            <S.PanelTitle>Modified (Right) - Diff View</S.PanelTitle>
            <S.DiffContent role="region" aria-label="Right diff content">
              {diffResult.rightLines.map((line, index) => (
                <S.DiffLine key={index} type={line.type}>
                  <S.LineNumber>{line.lineNumber}</S.LineNumber>
                  {line.content || ' '}
                </S.DiffLine>
              ))}
            </S.DiffContent>
          </S.DiffPanel>
        </S.DiffContainer>
      ) : (
        <S.EmptyState role="status">
          <S.EmptyStateIcon>📋</S.EmptyStateIcon>
          <S.EmptyStateText>
            <strong>Ready to compare?</strong>
          </S.EmptyStateText>
          <S.EmptyStateText>
            Drop files, paste content, or type directly in both panels, then click &quot;Compare&quot;
          </S.EmptyStateText>
        </S.EmptyState>
      )}
    </S.Container>
  );
};

