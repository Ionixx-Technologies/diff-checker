/**
 * Validator Component
 * 
 * A comprehensive validator that supports JSON and XML validation
 * with visual error highlighting and user-friendly messages.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import * as S from './Validator.styles';
import {
  saveValidatorData,
  loadValidatorData,
  clearValidatorData,
  isValidatorSessionEnabled,
  setValidatorSessionEnabled,
  getValidatorLastSavedTime,
} from '@/services/validatorStorage';
import { formatBytes, getStorageSize } from '@/utils/errorHandling';

type ValidationType = 'JSON' | 'XML';

interface ValidationResult {
  isValid: boolean;
  message: string;
  error?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/**
 * Validate JSON content
 */
const validateJSON = (content: string): ValidationResult => {
  if (!content.trim()) {
    return {
      isValid: false,
      message: 'Input is empty',
      error: 'Please enter JSON content to validate',
    };
  }

  try {
    JSON.parse(content);
    return {
      isValid: true,
      message: 'Valid JSON! ✨',
    };
  } catch (error) {
    try {
      const errorMessage = (error as Error).message || 'Unknown JSON parsing error';
      // Extract line and column information if available
      const positionMatch = errorMessage.match(/position (\d+)/i);
      const lineMatch = errorMessage.match(/line (\d+)/i);
      
      let lineNumber: number | undefined;
      let columnNumber: number | undefined;

      if (positionMatch) {
        try {
          const position = parseInt(positionMatch[1], 10);
          const lines = content.substring(0, position).split('\n');
          lineNumber = lines.length;
          columnNumber = lines[lines.length - 1].length + 1;
        } catch {
          // If position calculation fails, just show the original error
          // Error is silently ignored as we fall back to showing the original message
        }
      } else if (lineMatch) {
        lineNumber = parseInt(lineMatch[1], 10);
      }

      let detailedError = errorMessage;
      if (lineNumber && columnNumber) {
        detailedError = `${errorMessage} (Line ${lineNumber}, Column ${columnNumber})`;
      } else if (lineNumber) {
        detailedError = `${errorMessage} (Line ${lineNumber})`;
      }

      return {
        isValid: false,
        message: 'Invalid JSON',
        error: detailedError,
        lineNumber,
        columnNumber,
      };
    } catch {
      // Fallback error handling if error processing itself fails
      return {
        isValid: false,
        message: 'Invalid JSON',
        error: 'JSON parsing failed. Please check your syntax.',
      };
    }
  }
};

/**
 * Validate XML content
 */
const validateXML = (content: string): ValidationResult => {
  if (!content.trim()) {
    return {
      isValid: false,
      message: 'Input is empty',
      error: 'Please enter XML content to validate',
    };
  }

  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    
    if (parserError) {
      try {
        const errorText = parserError.textContent || 'Unknown XML parsing error';
        
        // Try to extract line and column information
        const lineMatch = errorText.match(/line (\d+)/i);
        const columnMatch = errorText.match(/column (\d+)/i);
        
        const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;
        const columnNumber = columnMatch ? parseInt(columnMatch[1], 10) : undefined;

        let detailedError = errorText;
        if (lineNumber && columnNumber) {
          detailedError = `Parsing error at Line ${lineNumber}, Column ${columnNumber}: ${errorText}`;
        } else if (lineNumber) {
          detailedError = `Parsing error at Line ${lineNumber}: ${errorText}`;
        }

        return {
          isValid: false,
          message: 'Invalid XML',
          error: detailedError,
          lineNumber,
          columnNumber,
        };
      } catch {
        // Fallback if error text extraction fails
        return {
          isValid: false,
          message: 'Invalid XML',
          error: 'XML parsing failed. Please check your syntax.',
        };
      }
    }

    // Additional validation: check if root element exists
    if (!xmlDoc.documentElement) {
      return {
        isValid: false,
        message: 'Invalid XML',
        error: 'No root element found',
      };
    }

    return {
      isValid: true,
      message: 'Valid XML! ✨',
    };
  } catch (error) {
    try {
      const errorMessage = (error as Error).message || 'Unknown XML error';
      return {
        isValid: false,
        message: 'Invalid XML',
        error: errorMessage,
      };
    } catch {
      // Ultimate fallback
      return {
        isValid: false,
        message: 'Invalid XML',
        error: 'XML parsing failed. Please check your syntax.',
      };
    }
  }
};

export const Validator: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [validationType, setValidationType] = useState<ValidationType>('JSON');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [preserveSession, setPreserveSession] = useState<boolean>(isValidatorSessionEnabled());
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [storageSize, setStorageSize] = useState<string>('0 Bytes');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // Load saved session on mount (async)
  useEffect(() => {
    const loadSavedSession = async () => {
      const savedData = await loadValidatorData();
      
      if (savedData) {
        // eslint-disable-next-line no-console
        console.log('📂 Loaded saved validator session (encrypted) from:', savedData.savedAt);
        setContent(savedData.content);
        setValidationType(savedData.validationType);
      }
    };

    loadSavedSession();
  }, []); // Run once on mount

  // Auto-save validator data when relevant state changes (async)
  useEffect(() => {
    if (!preserveSession) {
      return;
    }

    // Debounce saves to avoid excessive localStorage writes
    const timeoutId = setTimeout(async () => {
      await saveValidatorData({
        content,
        validationType,
      });
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timeoutId);
  }, [content, validationType, preserveSession]);

  // Update last saved time and storage size when preserve session is active
  useEffect(() => {
    if (preserveSession) {
      const updateInfo = async () => {
        const savedTime = await getValidatorLastSavedTime();
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
  }, [preserveSession, content, validationType]);

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
   * Handle validation
   */
  const handleValidate = useCallback(() => {
    setIsValidating(true);
    
    // Small delay for UX (shows loading state)
    setTimeout(() => {
      try {
        const result = validationType === 'JSON' 
          ? validateJSON(content) 
          : validateXML(content);
        
        setValidationResult(result);
        setIsValidating(false);

        // Scroll to error position if available
        if (!result.isValid && result.lineNumber && textAreaRef.current) {
          try {
            const lines = content.split('\n');
            const position = lines.slice(0, result.lineNumber - 1).join('\n').length + 
                            (result.columnNumber || 0);
            textAreaRef.current.focus();
            textAreaRef.current.setSelectionRange(position, position);
          } catch (scrollError) {
            // Silently fail if scrolling doesn't work
            // eslint-disable-next-line no-console
            console.error('Error scrolling to position:', scrollError);
          }
        }
      } catch (error) {
        // Handle any unexpected errors during validation
        setValidationResult({
          isValid: false,
          message: 'Validation Error',
          error: `Unexpected error during validation: ${(error as Error).message || 'Unknown error'}`,
        });
        setIsValidating(false);
      }
    }, 300);
  }, [content, validationType]);

  /**
   * Handle content change
   */
  const handleContentChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
    // Clear validation result when content changes
    if (validationResult) {
      setValidationResult(null);
    }
  }, [validationResult]);

  /**
   * Handle validation type change
   */
  const handleValidationTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setValidationType(event.target.value as ValidationType);
    // Clear validation result when type changes
    if (validationResult) {
      setValidationResult(null);
    }
  }, [validationResult]);

  /**
   * Handle clear
   */
  const handleClear = useCallback(async () => {
    setContent('');
    setValidationResult(null);
    
    // If session preservation is enabled, save the cleared state
    if (preserveSession) {
      await saveValidatorData({
        content: '',
        validationType,
      });
    }
  }, [preserveSession, validationType]);

  /**
   * Handle preserve session toggle
   */
  const handlePreserveSessionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setPreserveSession(enabled);
    setValidatorSessionEnabled(enabled);
    
    if (!enabled) {
      // Clear saved data when disabling
      clearValidatorData();
      setLastSaved(null);
    }
  }, []);

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
   * Handle drag over event - prevents default to allow drop
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  /**
   * Handle drag leave event - remove visual feedback
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Only remove dragging state if leaving the drop zone entirely
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x <= rect.left || x >= rect.right || y <= rect.top || y >= rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  /**
   * Handle drop event - read dropped file and update content
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Get the first dropped file
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      // Validate file type - only accept .json and .xml files
      const fileName = file.name.toLowerCase();
      const validExtensions = ['.json', '.xml'];
      const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidFile) {
        alert('Please drop only .json or .xml files');
        return;
      }

      // Validate file size before reading
      if (!validateFileSize(file)) {
        return;
      }

      // Read file content
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const fileContent = event.target?.result as string;
          setContent(fileContent);
          setValidationResult(null);
          
          // Auto-detect format based on file extension
          if (fileName.endsWith('.json')) {
            setValidationType('JSON');
          } else if (fileName.endsWith('.xml')) {
            setValidationType('XML');
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error reading file:', error);
          alert('Failed to read file content. Please try again.');
        }
      };
      reader.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('FileReader error');
        alert('Failed to read file. Please try again.');
      };
      reader.readAsText(file);
    }
  }, [validateFileSize]);

  /**
   * Handle file upload via input element
   */
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size before reading
      if (!validateFileSize(file)) {
        // Reset input to allow re-selection
        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const fileContent = e.target?.result as string;
          setContent(fileContent);
          setValidationResult(null);
          
          // Auto-detect format based on file extension
          if (file.name.endsWith('.json')) {
            setValidationType('JSON');
          } else if (file.name.endsWith('.xml')) {
            setValidationType('XML');
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Error reading file:', error);
          alert('Failed to read file content. Please try again.');
        }
      };
      reader.onerror = () => {
        // eslint-disable-next-line no-console
        console.error('FileReader error');
        alert('Failed to read file. Please try again.');
      };
      reader.readAsText(file);
    }
    // Reset input value to allow re-uploading the same file
    event.target.value = '';
  }, [validateFileSize]);

  /**
   * Handle paste from clipboard
   */
  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
      setValidationResult(null);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to read clipboard:', error);
      alert('Failed to read from clipboard. Please check your browser permissions.');
    }
  }, []);

  /**
   * Format content (prettify JSON/XML)
   */
  const handleFormat = useCallback(() => {
    if (!content.trim()) return;

    try {
      if (validationType === 'JSON') {
        try {
          const parsed = JSON.parse(content);
          const formatted = JSON.stringify(parsed, null, 2);
          setContent(formatted);
        } catch (jsonError) {
          // eslint-disable-next-line no-console
          console.error('JSON formatting error:', jsonError);
          alert('Cannot format invalid JSON. Please validate your JSON first.');
        }
      } else if (validationType === 'XML') {
        try {
          // Basic XML formatting
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(content, 'text/xml');
          
          if (!xmlDoc.querySelector('parsererror')) {
            const serializer = new XMLSerializer();
            let formatted = serializer.serializeToString(xmlDoc);
            
            // Simple formatting with indentation
            formatted = formatted
              .replace(/></g, '>\n<')
              .split('\n')
              .map((line, index, arr) => {
                const trimmed = line.trim();
                const depth = arr.slice(0, index).reduce((d, l) => {
                  if (l.trim().startsWith('</')) return d - 1;
                  if (l.trim().startsWith('<') && !l.trim().startsWith('<?') && !l.trim().endsWith('/>')) return d + 1;
                  return d;
                }, 0);
                return '  '.repeat(Math.max(0, depth)) + trimmed;
              })
              .join('\n');
            
            setContent(formatted);
          } else {
            alert('Cannot format invalid XML. Please validate your XML first.');
          }
        } catch (xmlError) {
          // eslint-disable-next-line no-console
          console.error('XML formatting error:', xmlError);
          alert('Cannot format invalid XML. Please validate your XML first.');
        }
      }
    } catch (error) {
      // Ultimate fallback if formatting doesn't work
      // eslint-disable-next-line no-console
      console.error('Formatting error:', error);
      alert('An error occurred while formatting. Please check your content and try again.');
    }
  }, [content, validationType]);

  /**
   * Calculate statistics
   */
  const getStats = useCallback(() => {
    const lines = content.split('\n').length;
    const characters = content.length;
    const bytes = new TextEncoder().encode(content).length;
    
    return { lines, characters, bytes };
  }, [content]);

  const stats = getStats();

  /**
   * Format byte size
   */
  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <S.Container>
      <S.ControlBar>
        <S.Button 
          variant="primary" 
          onClick={handleValidate} 
          disabled={!content.trim() || isValidating}
        >
          {isValidating ? 'Validating...' : '✓ Validate'}
        </S.Button>
        <S.Button onClick={handleFormat} disabled={!content.trim()}>
          ✨ Format
        </S.Button>
        <S.Button variant="danger" onClick={handleClear} disabled={!content}>
          🗑️ Clear
        </S.Button>
      </S.ControlBar>

      {/* Session Preservation Toggle */}
      <S.OptionsBar role="group" aria-label="Session preservation">
        <S.OptionsTitle>💾 Session Storage:</S.OptionsTitle>
        <S.CheckboxGroup>
          <S.CheckboxLabel>
            <S.Checkbox
              id="validator-preserve-session"
              checked={preserveSession}
              onChange={handlePreserveSessionChange}
              aria-label="Preserve validator session data in encrypted localStorage"
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

      <S.InputPanel>
        <S.PanelHeader>
          <S.PanelTitle>Content to Validate</S.PanelTitle>
          <S.Select value={validationType} onChange={handleValidationTypeChange}>
            <option value="JSON">JSON</option>
            <option value="XML">XML</option>
          </S.Select>
        </S.PanelHeader>

        <S.ControlBar>
          <S.FileInput
            ref={fileInputRef}
            type="file"
            id="validator-file-input"
            accept=".json,.xml"
            onChange={handleFileUpload}
          />
          <S.FileInputLabel htmlFor="validator-file-input">
            📁 Upload File
          </S.FileInputLabel>
          <S.Button onClick={handlePaste}>
            📋 Paste from Clipboard
          </S.Button>
        </S.ControlBar>

        {/* Drop zone with drag-and-drop support */}
        <S.DropZone
          $isDragging={isDragging}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <S.TextArea
            ref={textAreaRef}
            value={content}
            onChange={handleContentChange}
            placeholder={`Drop .json or .xml file here, or type ${validationType} content...`}
            $hasError={validationResult !== null && !validationResult.isValid}
          />
          {isDragging && (
            <S.DropOverlay>
              <S.DropMessage>
                📂 Drop {validationType} file here
                <S.FileSizeHint>(Max 5 MB)</S.FileSizeHint>
              </S.DropMessage>
            </S.DropOverlay>
          )}
        </S.DropZone>

        {/* Validation Result */}
        {validationResult && (
          <S.ValidationMessage type={validationResult.isValid ? 'success' : 'error'}>
            <S.ValidationTitle>
              {validationResult.isValid ? '✅' : '❌'} {validationResult.message}
            </S.ValidationTitle>
            {validationResult.error && (
              <S.ValidationError>{validationResult.error}</S.ValidationError>
            )}
          </S.ValidationMessage>
        )}
      </S.InputPanel>

      {/* Statistics */}
      {content && (
        <S.Stats>
          <S.StatItem>
            <S.StatLabel>Format</S.StatLabel>
            <S.StatValue>{validationType}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Size</S.StatLabel>
            <S.StatValue>{formatByteSize(stats.bytes)}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Lines</S.StatLabel>
            <S.StatValue>{stats.lines}</S.StatValue>
          </S.StatItem>
          <S.StatItem>
            <S.StatLabel>Characters</S.StatLabel>
            <S.StatValue>{stats.characters}</S.StatValue>
          </S.StatItem>
          {validationResult && (
            <S.StatItem>
              <S.StatLabel>Status</S.StatLabel>
              <S.StatValue style={{ color: validationResult.isValid ? '#10b981' : '#ef4444' }}>
                {validationResult.isValid ? '✓ Valid' : '✗ Invalid'}
              </S.StatValue>
            </S.StatItem>
          )}
        </S.Stats>
      )}

      {/* Help Section */}
      {!content && !validationResult && (
        <S.EmptyState>
          <S.EmptyStateIcon>📝</S.EmptyStateIcon>
          <S.EmptyStateText>
            <strong>Ready to validate?</strong>
          </S.EmptyStateText>
          <S.EmptyStateText>
            Drag & drop a .json or .xml file, upload, paste, or type {validationType} content above
          </S.EmptyStateText>
          <S.EmptyStateHint>
            💡 Tip: The validator provides detailed error messages with line and column numbers
          </S.EmptyStateHint>
        </S.EmptyState>
      )}
    </S.Container>
  );
};

