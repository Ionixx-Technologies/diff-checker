/**
 * TextEditor Component
 * 
 * A modern text editor with line numbers and live status bar.
 * Features:
 * - Synchronized line numbers
 * - Real-time cursor position tracking
 * - Live file statistics (size, lines, characters)
 * - Responsive layout
 * - Theme support
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import * as S from './TextEditor.styles';

interface TextEditorProps {
  /** Initial content for the editor */
  initialValue?: string;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Theme mode for styling */
  theme?: 'light' | 'dark';
  /** Whether the editor is read-only */
  readOnly?: boolean;
  /** Maximum height in pixels (auto-scrolls after) */
  maxHeight?: number;
}

interface CursorPosition {
  line: number;
  column: number;
  absolutePosition: number;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  initialValue = '',
  placeholder = 'Start typing...',
  onChange,
  theme = 'light',
  readOnly = false,
  maxHeight = 600,
}) => {
  // State management
  const [content, setContent] = useState<string>(initialValue);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({
    line: 1,
    column: 0,
    absolutePosition: 0,
  });

  // Refs for DOM elements
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  /**
   * Calculate the number of lines in the content
   */
  const getLineCount = useCallback((text: string): number => {
    if (!text) return 1;
    return text.split('\n').length;
  }, []);

  /**
   * Calculate file size in bytes (UTF-8 encoding)
   */
  const getByteSize = useCallback((text: string): number => {
    // Use TextEncoder for accurate UTF-8 byte count
    return new TextEncoder().encode(text).length;
  }, []);

  /**
   * Calculate cursor position (line and column)
   * based on the absolute cursor position in the text
   */
  const calculateCursorPosition = useCallback((
    text: string,
    cursorPos: number
  ): CursorPosition => {
    const beforeCursor = text.substring(0, cursorPos);
    const lines = beforeCursor.split('\n');
    const line = lines.length;
    const column = lines[lines.length - 1].length;

    return {
      line,
      column,
      absolutePosition: cursorPos,
    };
  }, []);

  /**
   * Handle text content changes
   */
  const handleContentChange = useCallback((
    event: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newContent = event.target.value;
    setContent(newContent);

    // Update cursor position
    const cursorPos = event.target.selectionStart || 0;
    const position = calculateCursorPosition(newContent, cursorPos);
    setCursorPosition(position);

    // Notify parent component
    if (onChange) {
      onChange(newContent);
    }
  }, [calculateCursorPosition, onChange]);

  /**
   * Handle cursor position changes (clicks, arrow keys, etc.)
   */
  const handleCursorMove = useCallback((
    event: React.SyntheticEvent<HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLTextAreaElement;
    const cursorPos = target.selectionStart || 0;
    const position = calculateCursorPosition(content, cursorPos);
    setCursorPosition(position);
  }, [content, calculateCursorPosition]);

  /**
   * Synchronize scroll between textarea and line numbers
   */
  const handleScroll = useCallback((
    event: React.UIEvent<HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLTextAreaElement;
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }
  }, []);

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    // Tab key - insert 2 spaces instead of losing focus
    if (event.key === 'Tab') {
      event.preventDefault();
      const target = event.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const newContent = 
        content.substring(0, start) + '  ' + content.substring(end);
      
      setContent(newContent);
      
      // Set cursor position after the inserted spaces
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
        const position = calculateCursorPosition(newContent, start + 2);
        setCursorPosition(position);
      }, 0);

      if (onChange) {
        onChange(newContent);
      }
    }
  }, [content, calculateCursorPosition, onChange]);

  /**
   * Generate line numbers based on content
   */
  const lineNumbers = Array.from(
    { length: getLineCount(content) },
    (_, i) => i + 1
  );

  /**
   * Calculate statistics for status bar
   */
  const stats = {
    bytes: getByteSize(content),
    lines: getLineCount(content),
    characters: content.length,
    position: `${cursorPosition.line}:${cursorPosition.column}`,
  };

  /**
   * Format byte size for display (B, KB, MB)
   */
  const formatByteSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  /**
   * Initialize cursor position on mount
   */
  useEffect(() => {
    if (textAreaRef.current) {
      const cursorPos = textAreaRef.current.selectionStart || 0;
      const position = calculateCursorPosition(content, cursorPos);
      setCursorPosition(position);
    }
  }, [content, calculateCursorPosition]);

  return (
    <S.EditorContainer theme={theme}>
      {/* Editor Header (optional - can be extended) */}
      <S.EditorHeader>
        <S.EditorTitle>Text Editor</S.EditorTitle>
      </S.EditorHeader>

      {/* Main Editor Area */}
      <S.EditorBody maxHeight={maxHeight}>
        {/* Line Numbers Panel */}
        <S.LineNumbers ref={lineNumbersRef} theme={theme}>
          {lineNumbers.map((lineNum) => (
            <S.LineNumber key={lineNum} theme={theme}>
              {lineNum}
            </S.LineNumber>
          ))}
        </S.LineNumbers>

        {/* Text Input Area */}
        <S.TextArea
          ref={textAreaRef}
          value={content}
          onChange={handleContentChange}
          onSelect={handleCursorMove}
          onClick={handleCursorMove}
          onKeyUp={handleCursorMove}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          readOnly={readOnly}
          theme={theme}
          spellCheck={false}
          aria-label="Text editor"
        />
      </S.EditorBody>

      {/* Status Bar */}
      <S.StatusBar theme={theme}>
        <S.StatusBarSection>
          <S.StatusBarItem>
            <S.StatusBarLabel>Size:</S.StatusBarLabel>
            <S.StatusBarValue>{formatByteSize(stats.bytes)}</S.StatusBarValue>
          </S.StatusBarItem>

          <S.StatusBarDivider>|</S.StatusBarDivider>

          <S.StatusBarItem>
            <S.StatusBarLabel>Ln:</S.StatusBarLabel>
            <S.StatusBarValue>{stats.lines}</S.StatusBarValue>
          </S.StatusBarItem>

          <S.StatusBarDivider>|</S.StatusBarDivider>

          <S.StatusBarItem>
            <S.StatusBarLabel>Ch:</S.StatusBarLabel>
            <S.StatusBarValue>{stats.characters}</S.StatusBarValue>
          </S.StatusBarItem>
        </S.StatusBarSection>

        <S.StatusBarSection>
          <S.StatusBarItem>
            <S.StatusBarLabel>Position:</S.StatusBarLabel>
            <S.StatusBarValue>{stats.position}</S.StatusBarValue>
          </S.StatusBarItem>
        </S.StatusBarSection>
      </S.StatusBar>
    </S.EditorContainer>
  );
};

