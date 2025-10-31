/**
 * DiffChecker Component
 * 
 * A comprehensive diff checker that supports JSON, XML, and plain text comparison
 * with visual highlighting and validation.
 */

import React, { useRef, useCallback } from 'react';
import { useDiffChecker } from '@/hooks/useDiffChecker';
import type { FormatType } from '@/utils/formatValidators';
import * as S from './DiffChecker.styles';

export const DiffChecker: React.FC = () => {
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

  // Handle file upload for left input
  const handleLeftFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setLeftInput(content);
      };
      reader.readAsText(file);
    }
  }, [setLeftInput]);

  // Handle file upload for right input
  const handleRightFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setRightInput(content);
      };
      reader.readAsText(file);
    }
  }, [setRightInput]);

  // Handle paste from clipboard for left input
  const handleLeftPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setLeftInput(text);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard:', error);
      alert('Failed to read from clipboard. Please check your browser permissions.');
    }
  }, [setLeftInput]);

  // Handle paste from clipboard for right input
  const handleRightPaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setRightInput(text);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard:', error);
      alert('Failed to read from clipboard. Please check your browser permissions.');
    }
  }, [setRightInput]);

  // Calculate diff statistics
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
      <S.ControlBar>
        <S.Button variant="primary" onClick={compare} disabled={!canCompare || isComparing}>
          {isComparing ? 'Comparing...' : '🔍 Compare'}
        </S.Button>
        <S.Button onClick={autoDetectFormats}>
          🔮 Auto-detect Format
        </S.Button>
        <S.Button onClick={swap} disabled={!leftInput && !rightInput}>
          ⇄ Swap
        </S.Button>
        <S.Button variant="danger" onClick={clear}>
          🗑️ Clear All
        </S.Button>
      </S.ControlBar>

      <S.InputContainer>
        {/* Left Input Panel */}
        <S.InputPanel>
          <S.PanelHeader>
            <S.PanelTitle>Original (Left)</S.PanelTitle>
            <S.Select
              value={leftFormat}
              onChange={(e) => setLeftFormat(e.target.value as FormatType)}
            >
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </S.Select>
          </S.PanelHeader>

          <S.ControlBar>
            <S.FileInput
              ref={leftFileInputRef}
              type="file"
              id="left-file-input"
              accept=".txt,.json,.xml"
              onChange={handleLeftFileUpload}
            />
            <S.FileInputLabel htmlFor="left-file-input">
              📁 Upload File
            </S.FileInputLabel>
            <S.Button onClick={handleLeftPaste}>
              📋 Paste from Clipboard
            </S.Button>
          </S.ControlBar>

          <S.TextArea
            value={leftInput}
            onChange={(e) => setLeftInput(e.target.value)}
            placeholder={`Enter or paste ${leftFormat.toUpperCase()} content here...`}
          />

          {leftValidation && !leftValidation.isValid && (
            <S.ValidationMessage type="error">
              ❌ {leftValidation.error}
            </S.ValidationMessage>
          )}
          {leftValidation && leftValidation.isValid && diffResult && (
            <S.ValidationMessage type="success">
              ✅ Valid {leftFormat.toUpperCase()}
            </S.ValidationMessage>
          )}
        </S.InputPanel>

        {/* Right Input Panel */}
        <S.InputPanel>
          <S.PanelHeader>
            <S.PanelTitle>Modified (Right)</S.PanelTitle>
            <S.Select
              value={rightFormat}
              onChange={(e) => setRightFormat(e.target.value as FormatType)}
            >
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
              <option value="xml">XML</option>
            </S.Select>
          </S.PanelHeader>

          <S.ControlBar>
            <S.FileInput
              ref={rightFileInputRef}
              type="file"
              id="right-file-input"
              accept=".txt,.json,.xml"
              onChange={handleRightFileUpload}
            />
            <S.FileInputLabel htmlFor="right-file-input">
              📁 Upload File
            </S.FileInputLabel>
            <S.Button onClick={handleRightPaste}>
              📋 Paste from Clipboard
            </S.Button>
          </S.ControlBar>

          <S.TextArea
            value={rightInput}
            onChange={(e) => setRightInput(e.target.value)}
            placeholder={`Enter or paste ${rightFormat.toUpperCase()} content here...`}
          />

          {rightValidation && !rightValidation.isValid && (
            <S.ValidationMessage type="error">
              ❌ {rightValidation.error}
            </S.ValidationMessage>
          )}
          {rightValidation && rightValidation.isValid && diffResult && (
            <S.ValidationMessage type="success">
              ✅ Valid {rightFormat.toUpperCase()}
            </S.ValidationMessage>
          )}
        </S.InputPanel>
      </S.InputContainer>

      {/* Format Mismatch Warning */}
      {leftFormat !== rightFormat && (leftInput || rightInput) && (
        <S.ValidationMessage type="warning">
          ⚠️ Warning: Format mismatch detected. Left is {leftFormat.toUpperCase()}, Right is {rightFormat.toUpperCase()}. 
          Please select the same format for both sides to compare.
        </S.ValidationMessage>
      )}

      {/* Diff Statistics */}
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
            <S.StatValue style={{ color: '#10b981' }}>{stats.addedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Removed</S.StatLabel>
            <S.StatValue style={{ color: '#ef4444' }}>{stats.removedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Changed</S.StatLabel>
            <S.StatValue style={{ color: '#f59e0b' }}>{stats.changedLines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Has Changes</S.StatLabel>
            <S.StatValue>{diffResult.hasChanges ? '✓ Yes' : '✗ No'}</S.StatValue>
          </S.StatItem>
        </S.Stats>
      )}

      {/* Diff Results */}
      {diffResult ? (
        <S.DiffContainer>
          <S.DiffPanel>
            <S.PanelTitle>Original (Left) - Diff View</S.PanelTitle>
            <S.DiffContent>
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
            <S.DiffContent>
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
        <S.EmptyState>
          <S.EmptyStateText>
            Enter content in both panels and click &quot;Compare&quot; to see the differences
          </S.EmptyStateText>
        </S.EmptyState>
      )}
    </S.Container>
  );
};

