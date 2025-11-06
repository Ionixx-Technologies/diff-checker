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
import { LoadingOverlay } from './LoadingOverlay';
import { VirtualDiffContent } from './VirtualDiffContent';
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
    reset,
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

  /**
   * Validate file size before processing
   * Returns true if file is valid, false otherwise
   */
  const validateFileSize = useCallback((file: File): boolean => {
    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB
    if (file.size > MAX_FILE_SIZE) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      alert(
        `❌ File Too Large\n\n` +
        `File size: ${fileSizeMB} MB\n` +
        `Maximum allowed: 2 MB\n\n` +
        `Please select a smaller file or compress the content.`
      );
      return false;
    }
    return true;
  }, []);

  /**
   * Validate file format matches the selected format
   * Returns true if file format is valid, false otherwise
   */
  const validateFileFormat = useCallback((file: File, expectedFormat: FormatType): boolean => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split('.').pop() || '';
    
    // Define valid extensions for each format
    const validExtensions: Record<FormatType, string[]> = {
      json: ['json'],
      xml: ['xml'],
      text: ['txt', 'text'],
    };
    
    const allowedExtensions = validExtensions[expectedFormat];
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert(
        `❌ Invalid File Format\n\n` +
        `Expected: .${allowedExtensions.join(', .')}\n` +
        `Received: .${fileExtension}\n\n` +
        `Please select "${expectedFormat.toUpperCase()}" format in the dropdown or choose a matching file.`
      );
      return false;
    }
    
    return true;
  }, []);

  /**
   * Comprehensive file validation
   */
  const validateFile = useCallback((file: File, expectedFormat: FormatType): boolean => {
    // Check file size first
    if (!validateFileSize(file)) {
      return false;
    }
    
    // Check file format
    if (!validateFileFormat(file, expectedFormat)) {
      return false;
    }
    
    return true;
  }, [validateFileSize, validateFileFormat]);

  /**
   * Generic file reader utility with chunked reading for large files
   * Reads file content and calls the provided callback
   */
  const readFile = useCallback(async (file: File, onLoad: (content: string) => void) => {
    // For files larger than 500KB, read in chunks
    const CHUNK_SIZE = 512 * 1024; // 512KB chunks

    if (file.size > CHUNK_SIZE) {
      try {
        let content = '';
        let offset = 0;

        while (offset < file.size) {
          const chunk = file.slice(offset, offset + CHUNK_SIZE);

          // Use FileReader for better jsdom compatibility
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.onerror = () => reject(new Error('Failed to read chunk'));
            reader.readAsText(chunk);
          });

          content += text;
          offset += CHUNK_SIZE;

          // Yield to browser to keep UI responsive
          await new Promise(resolve => setTimeout(resolve, 0));
        }

        // Use requestAnimationFrame for smooth UI update
        requestAnimationFrame(() => {
          onLoad(content);
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Failed to read file:', error);
        alert('Failed to read file. Please try again.');
      }
    } else {
      // For small files, read normally
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        requestAnimationFrame(() => {
          onLoad(content);
        });
      };
      reader.onerror = () => {
        alert('Failed to read file. Please try again.');
      };
      reader.readAsText(file);
    }
  }, []);

  /**
   * Handle file upload for left input via input element
   */
  const handleLeftFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before reading
      if (validateFile(file, leftFormat)) {
        readFile(file, setLeftInput);
      }
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [readFile, setLeftInput, validateFile, leftFormat]);

  /**
   * Handle file upload for right input via input element
   */
  const handleRightFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before reading
      if (validateFile(file, rightFormat)) {
        readFile(file, setRightInput);
      }
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [readFile, setRightInput, validateFile, rightFormat]);

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
      const expectedFormat = side === 'left' ? leftFormat : rightFormat;
      
      // Validate file before reading
      if (validateFile(file, expectedFormat)) {
        readFile(file, side === 'left' ? setLeftInput : setRightInput);
      }
    }
  }, [readFile, setLeftInput, setRightInput, validateFile, leftFormat, rightFormat]);

  /**
   * Validate clipboard content format matches expected format
   */
  const validateClipboardFormat = useCallback((text: string, expectedFormat: FormatType): boolean => {
    if (expectedFormat === 'text') {
      return true; // Text format accepts any content
    }

    // Try to validate JSON
    if (expectedFormat === 'json') {
      try {
        JSON.parse(text);
        return true;
      } catch {
        alert(
          `❌ Invalid JSON Format\n\n` +
          `The clipboard content is not valid JSON.\n` +
          `Expected format: JSON\n\n` +
          `Please paste valid JSON content or change the format to TEXT.`
        );
        return false;
      }
    }

    // Try to validate XML
    if (expectedFormat === 'xml') {
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(text, 'text/xml');
        const parserError = xmlDoc.querySelector('parsererror');
        
        if (parserError) {
          alert(
            `❌ Invalid XML Format\n\n` +
            `The clipboard content is not valid XML.\n` +
            `Expected format: XML\n\n` +
            `Please paste valid XML content or change the format to TEXT.`
          );
          return false;
        }
        return true;
      } catch {
        alert(
          `❌ Invalid XML Format\n\n` +
          `The clipboard content is not valid XML.\n` +
          `Expected format: XML\n\n` +
          `Please paste valid XML content or change the format to TEXT.`
        );
        return false;
      }
    }

    return true;
  }, []);

  /**
   * Handle paste from clipboard with content size and format validation
   */
  const handlePaste = useCallback(async (side: 'left' | 'right') => {
    try {
      const text = await navigator.clipboard.readText();
      
      // Validate clipboard content size (2MB limit)
      const textSize = new TextEncoder().encode(text).length;
      const maxSize = 2 * 1024 * 1024; // 2 MB
      
      if (textSize > maxSize) {
        const sizeMB = (textSize / (1024 * 1024)).toFixed(2);
        alert(
          `❌ Clipboard Content Too Large\n\n` +
          `Content size: ${sizeMB} MB\n` +
          `Maximum allowed: 2 MB\n\n` +
          `Please paste smaller content or use file upload with compression.`
        );
        return;
      }

      // Validate content format
      const expectedFormat = side === 'left' ? leftFormat : rightFormat;
      if (!validateClipboardFormat(text, expectedFormat)) {
        return;
      }
      
      if (side === 'left') {
        setLeftInput(text);
      } else {
        setRightInput(text);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard:', error);
      alert(
        `❌ Clipboard Access Failed\n\n` +
        `Unable to read from clipboard.\n` +
        `Please check your browser permissions.`
      );
    }
  }, [setLeftInput, setRightInput, leftFormat, rightFormat, validateClipboardFormat]);

  /**
   * Handle paste event directly in text area with format validation
   */
  const handleTextAreaPaste = useCallback((e: React.ClipboardEvent<HTMLTextAreaElement>, side: 'left' | 'right') => {
    const text = e.clipboardData.getData('text');
    
    if (!text) return;
    
    // Validate clipboard content size (2MB limit)
    const textSize = new TextEncoder().encode(text).length;
    const maxSize = 2 * 1024 * 1024; // 2 MB
    
    if (textSize > maxSize) {
      e.preventDefault();
      const sizeMB = (textSize / (1024 * 1024)).toFixed(2);
      alert(
        `❌ Clipboard Content Too Large\n\n` +
        `Content size: ${sizeMB} MB\n` +
        `Maximum allowed: 2 MB\n\n` +
        `Please paste smaller content or use file upload with compression.`
      );
      return;
    }

    // Validate content format
    const expectedFormat = side === 'left' ? leftFormat : rightFormat;
    if (!validateClipboardFormat(text, expectedFormat)) {
      e.preventDefault();
      return;
    }
    
    // If validation passes, allow default paste behavior
  }, [leftFormat, rightFormat, validateClipboardFormat]);

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
   * Disables ignoreAttributeOrder if format is not XML
   */
  const handleUnifiedFormatChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFormat = e.target.value as FormatType;
    
    // If changing away from JSON, disable ignoreKeyOrder option
    if (newFormat !== 'json' && diffOptions.ignoreKeyOrder) {
      setDiffOptions({ ignoreKeyOrder: false });
    }
    
    // If changing away from XML, disable ignoreAttributeOrder option
    if (newFormat !== 'xml' && diffOptions.ignoreAttributeOrder) {
      setDiffOptions({ ignoreAttributeOrder: false });
    }
    
    // Update both formats simultaneously
    setLeftFormat(newFormat);
    setRightFormat(newFormat);
  }, [diffOptions.ignoreKeyOrder, diffOptions.ignoreAttributeOrder, setDiffOptions, setLeftFormat, setRightFormat]);

  /**
   * Handle comparison option changes
   * Automatically re-compare if diff result exists
   */
  const handleOptionChange = useCallback((option: 'ignoreWhitespace' | 'caseSensitive' | 'ignoreKeyOrder' | 'ignoreAttributeOrder') => {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setDiffOptions({ [option]: e.target.checked });
      // If there's already a comparison result, automatically update it
      if (diffResult && canCompare) {
        setTimeout(() => compare(), 100);
      }
    };
  }, [diffResult, canCompare, setDiffOptions, compare]);

  return (
    <>
      {isComparing && <LoadingOverlay message="Comparing files... Please wait" />}
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
    onClick={() => {
      if (confirm('Reset all inputs and settings to default?\n\nNote: This will clear saved session data.')) {
        reset();
      }
    }}
    aria-label="Reset to initial state"
  >
    🔄 Reset
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
    
    <S.CheckboxLabel>
      <S.Checkbox
        checked={diffOptions.ignoreAttributeOrder}
        onChange={handleOptionChange('ignoreAttributeOrder')}
        disabled={leftFormat !== 'xml' || rightFormat !== 'xml'}
        aria-label="Ignore attribute order in XML comparison"
        title={leftFormat !== 'xml' || rightFormat !== 'xml' ? 'Only available for XML format' : ''}
      />
      <span>Ignore Attribute Order (XML)</span>
      <S.OptionBadge $isActive={diffOptions.ignoreAttributeOrder && leftFormat === 'xml'}>
        {leftFormat === 'xml' && rightFormat === 'xml' 
          ? (diffOptions.ignoreAttributeOrder ? 'ON' : 'OFF')
          : 'XML ONLY'}
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
            accept={leftFormat === 'json' ? '.json' : leftFormat === 'xml' ? '.xml' : '.txt'}
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
              onPaste={(e) => handleTextAreaPaste(e, 'left')}
              placeholder={`Drop file here or paste ${leftFormat.toUpperCase()} content...`}
              aria-label="Left input text area"
            />
            {leftDragging && (
              <S.DropOverlay>
                <S.DropMessage>
                  📂 Drop {leftFormat.toUpperCase()} file here
                  <S.FileSizeHint>(Max 2 MB)</S.FileSizeHint>
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
            accept={rightFormat === 'json' ? '.json' : rightFormat === 'xml' ? '.xml' : '.txt'}
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
              onPaste={(e) => handleTextAreaPaste(e, 'right')}
              placeholder={`Drop file here or paste ${rightFormat.toUpperCase()} content...`}
              aria-label="Right input text area"
            />
            {rightDragging && (
              <S.DropOverlay>
                <S.DropMessage>
                  📂 Drop {rightFormat.toUpperCase()} file here
                  <S.FileSizeHint>(Max 2 MB)</S.FileSizeHint>
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
            <S.StatValue>{diffResult.hasChanges ? '✗ Different' : '✓ Identical'}</S.StatValue>
          </S.StatItem>
        </S.Stats>
      )}

      {/* Diff results display - responsive grid with virtual scrolling */}
      {diffResult ? (
        <S.DiffContainer>
          <S.DiffPanel>
            <S.PanelTitle>Original (Left) - Diff View</S.PanelTitle>
            <VirtualDiffContent 
              lines={diffResult.leftLines} 
              containerHeight={600}
            />
          </S.DiffPanel>

          <S.DiffPanel>
            <S.PanelTitle>Modified (Right) - Diff View</S.PanelTitle>
            <VirtualDiffContent 
              lines={diffResult.rightLines} 
              containerHeight={600}
            />
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
    </>
  );
};

