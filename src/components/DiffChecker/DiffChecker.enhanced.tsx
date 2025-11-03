/**
 * Enhanced DiffChecker Component
 * 
 * Modern, responsive diff checker with drag & drop support, smooth animations,
 * and enhanced interactivity.
 */

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { useDiffChecker } from '@/hooks/useDiffChecker';
import type { FormatType } from '@/utils/formatValidators';
import { 
  setSessionPreserveEnabled, 
  clearSessionData,
  getLastSavedTime 
} from '@/services/sessionStorage';
import { formatBytes, getStorageSize } from '@/utils/errorHandling';
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
    diffOptions,
    preserveSession,
    setLeftInput,
    setRightInput,
    setLeftFormat,
    setRightFormat,
    setDiffOptions,
    autoDetectFormats,
    compare,
    clear,
    swap,
    canCompare,
    togglePreserveSession,
  } = useDiffChecker();

  // Track last saved time for display
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [storageSize, setStorageSize] = useState<string>('0 Bytes');

  // Update last saved time and storage size when preserve session changes
  useEffect(() => {
    if (preserveSession) {
      const updateInfo = async () => {
        const savedTime = await getLastSavedTime();
        setLastSaved(savedTime);
        
        const size = getStorageSize();
        setStorageSize(formatBytes(size));
      };

      updateInfo();
      
      // Update every 5 seconds when preservation is active
      const interval = setInterval(updateInfo, 5000);
      return () => clearInterval(interval);
    } else {
      setLastSaved(null);
    }
  }, [preserveSession, leftInput, rightInput, diffOptions]);

  const leftFileInputRef = useRef<HTMLInputElement>(null);
  const rightFileInputRef = useRef<HTMLInputElement>(null);

  // Drag and Drop states for visual feedback
  const [leftDragging, setLeftDragging] = useState(false);
  const [rightDragging, setRightDragging] = useState(false);

  // Maximum file size in bytes (5 MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  /**
   * Validate file size before processing
   * Returns true if file is valid, false otherwise
   */
  const validateFileSize = useCallback((file: File): boolean => {
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(
        `File size (${fileSizeMB} MB) exceeds the maximum allowed size of 5 MB.\n\n` +
        `Please select a smaller file.`
      );
      return false;
    }
    return true;
  }, [MAX_FILE_SIZE]);

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
      // Validate file size before reading
      if (validateFileSize(file)) {
        readFile(file, setLeftInput);
      }
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [readFile, setLeftInput, validateFileSize]);

  /**
   * Handle file upload for right input via input element
   */
  const handleRightFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size before reading
      if (validateFileSize(file)) {
        readFile(file, setRightInput);
      }
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [readFile, setRightInput, validateFileSize]);

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
      
      if (!validTypes.includes(file.type) && 
          !file.name.endsWith('.txt') && 
          !file.name.endsWith('.json') && 
          !file.name.endsWith('.xml')) {
        alert('Please drop a text-based file (.txt, .json, .xml)');
        return;
      }

      // Validate file size before reading
      if (validateFileSize(file)) {
        readFile(file, side === 'left' ? setLeftInput : setRightInput);
      }
    }
  }, [readFile, setLeftInput, setRightInput, validateFileSize]);

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

  /**
   * Handle preserve session toggle
   */
  const handlePreserveSessionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    togglePreserveSession(enabled);
    setSessionPreserveEnabled(enabled);
    
    if (!enabled) {
      // Clear saved data when disabling
      clearSessionData();
      setLastSaved(null);
    }
  }, [togglePreserveSession]);

  /**
   * Format last saved time for display
   */
  const formatLastSaved = useCallback(() => {
    if (!lastSaved) return null;
    
    try {
      const savedDate = new Date(lastSaved);
      const now = new Date();
      const diffMs = now.getTime() - savedDate.getTime();
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      
      if (diffSecs < 5) return 'Just now';
      if (diffSecs < 60) return `${diffSecs} seconds ago`;
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      
      return savedDate.toLocaleString();
    } catch {
      return null;
    }
  }, [lastSaved]);

  /**
   * Handle unified format change - updates both left and right formats
   * Disables ignoreKeyOrder if format is not JSON
   */
  const handleUnifiedFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as FormatType;
    
    // If changing away from JSON, disable ignoreKeyOrder option
    if (newFormat !== 'json' && diffOptions.ignoreKeyOrder) {
      setDiffOptions({ ignoreKeyOrder: false });
    }
    
    // Update both formats simultaneously
    setLeftFormat(newFormat);
    setRightFormat(newFormat);
  }, [diffOptions.ignoreKeyOrder, setDiffOptions, setLeftFormat, setRightFormat]);

  /**
   * Handle comparison option changes
   * Automatically re-compare if diff result exists
   */
  const handleOptionChange = useCallback((option: 'ignoreWhitespace' | 'caseSensitive' | 'ignoreKeyOrder') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setDiffOptions({ [option]: e.target.checked });
      // If there's already a comparison result, automatically update it
      if (diffResult && canCompare) {
        setTimeout(() => compare(), 100);
      }
    };
  }, [diffResult, canCompare, setDiffOptions, compare]);

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

      {/* Control bar with action buttons and unified format selector */}
      <S.ControlBar>
        <S.FormatGroup role="group" aria-label="Format selection">
          <S.FormatLabel htmlFor="unified-format-select">Format:</S.FormatLabel>
          <S.Select
            id="unified-format-select"
            value={leftFormat}
            onChange={handleUnifiedFormatChange}
            aria-label="Select format for both inputs"
          >
            <option value="text">Plain Text</option>
            <option value="json">JSON</option>
            <option value="xml">XML</option>
          </S.Select>
        </S.FormatGroup>

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

      {/* Comparison Options Bar */}
      <S.OptionsBar role="group" aria-label="Comparison options">
        <S.OptionsTitle>⚙️ Comparison Options:</S.OptionsTitle>
        <S.CheckboxGroup>
          <S.CheckboxLabel>
            <S.Checkbox
              checked={diffOptions.ignoreWhitespace}
              onChange={handleOptionChange('ignoreWhitespace')}
              aria-label="Ignore whitespace in comparison"
            />
            <span>Ignore Whitespace</span>
            <S.OptionBadge $isActive={diffOptions.ignoreWhitespace}>
              {diffOptions.ignoreWhitespace ? 'ON' : 'OFF'}
            </S.OptionBadge>
          </S.CheckboxLabel>
          
          <S.CheckboxLabel>
            <S.Checkbox
              checked={diffOptions.caseSensitive}
              onChange={handleOptionChange('caseSensitive')}
              aria-label="Case sensitive comparison"
            />
            <span>Case Sensitive</span>
            <S.OptionBadge $isActive={diffOptions.caseSensitive}>
              {diffOptions.caseSensitive ? 'ON' : 'OFF'}
            </S.OptionBadge>
          </S.CheckboxLabel>
          
          <S.CheckboxLabel>
            <S.Checkbox
              checked={diffOptions.ignoreKeyOrder}
              onChange={handleOptionChange('ignoreKeyOrder')}
              disabled={leftFormat !== 'json' || rightFormat !== 'json'}
              aria-label="Ignore key order in JSON comparison"
              title={leftFormat !== 'json' || rightFormat !== 'json' ? 'Only available for JSON format' : ''}
            />
            <span>Ignore Key Order (JSON)</span>
            <S.OptionBadge $isActive={diffOptions.ignoreKeyOrder && leftFormat === 'json'}>
              {leftFormat === 'json' && rightFormat === 'json' 
                ? (diffOptions.ignoreKeyOrder ? 'ON' : 'OFF')
                : 'JSON ONLY'}
            </S.OptionBadge>
          </S.CheckboxLabel>
        </S.CheckboxGroup>
      </S.OptionsBar>

      {/* Session Preservation Toggle */}
      <S.OptionsBar role="group" aria-label="Session preservation">
        <S.OptionsTitle>💾 Session Storage:</S.OptionsTitle>
        <S.CheckboxGroup>
          <S.CheckboxLabel>
            <S.Checkbox
              id="preserve-session"
              checked={preserveSession}
              onChange={handlePreserveSessionChange}
              aria-label="Preserve session data in encrypted localStorage"
            />
            <span>Auto-save inputs & settings (Encrypted 🔒)</span>
            <S.OptionBadge $isActive={preserveSession}>
              {preserveSession ? 'ENABLED' : 'DISABLED'}
            </S.OptionBadge>
          </S.CheckboxLabel>
          {preserveSession && formatLastSaved() && (
            <S.LastSavedIndicator>
              🕐 Last saved: {formatLastSaved()}
            </S.LastSavedIndicator>
          )}
          {preserveSession && (
            <S.StorageSizeIndicator>
              📊 Storage: {storageSize}
            </S.StorageSizeIndicator>
          )}
        </S.CheckboxGroup>
      </S.OptionsBar>

      {/* Input panels - responsive grid layout */}
      <S.InputContainer>
        {/* Left Input Panel with Drag & Drop */}
        <S.InputPanel>
          <S.PanelHeader>
            <S.PanelTitle>Original (Left)</S.PanelTitle>
            <S.FormatBadge>{leftFormat.toUpperCase()}</S.FormatBadge>
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
                <S.DropMessage>
                  📂 Drop file here
                  <S.FileSizeHint>(Max 5 MB)</S.FileSizeHint>
                </S.DropMessage>
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
            <S.FormatBadge>{rightFormat.toUpperCase()}</S.FormatBadge>
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
                <S.DropMessage>
                  📂 Drop file here
                  <S.FileSizeHint>(Max 5 MB)</S.FileSizeHint>
                </S.DropMessage>
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

