/**
 * TextEditor Styled Components
 * 
 * Modern, responsive styling for the text editor component.
 * Supports light and dark themes with smooth transitions.
 */

import styled from 'styled-components';

interface ThemeProps {
  theme?: 'light' | 'dark';
}

interface EditorBodyProps {
  maxHeight?: number;
}

/**
 * Get theme colors based on mode
 */
const getThemeColors = (theme?: 'light' | 'dark') => {
  if (theme === 'dark') {
    return {
      background: '#1e1e1e',
      editorBackground: '#252526',
      text: '#d4d4d4',
      lineNumberBackground: '#1e1e1e',
      lineNumberText: '#858585',
      lineNumberHover: '#c6c6c6',
      border: '#3e3e42',
      statusBarBackground: '#007acc',
      statusBarText: '#ffffff',
      placeholder: '#6a6a6a',
      scrollbar: '#424242',
      scrollbarHover: '#4e4e4e',
    };
  }
  
  // Light theme (default)
  return {
    background: '#ffffff',
    editorBackground: '#ffffff',
    text: '#000000',
    lineNumberBackground: '#f5f5f5',
    lineNumberText: '#237893',
    lineNumberHover: '#0b7285',
    border: '#e0e0e0',
    statusBarBackground: '#007acc',
    statusBarText: '#ffffff',
    placeholder: '#999999',
    scrollbar: '#c5c5c5',
    scrollbarHover: '#a6a6a6',
  };
};

/**
 * Main editor container
 */
export const EditorContainer = styled.div<ThemeProps>`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: auto;
  border: 1px solid ${(props) => getThemeColors(props.theme).border};
  border-radius: 8px;
  overflow: hidden;
  background-color: ${(props) => getThemeColors(props.theme).background};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    border-radius: 4px;
  }
`;

/**
 * Editor header
 */
export const EditorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: ${(props) => props.theme.colors?.cardBackground || '#f5f5f5'};
  border-bottom: 1px solid ${(props) => props.theme.colors?.border || '#e0e0e0'};
`;

/**
 * Editor title
 */
export const EditorTitle = styled.h3`
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors?.text || '#000000'};
  letter-spacing: 0.5px;
`;

/**
 * Main editor body containing line numbers and textarea
 */
export const EditorBody = styled.div<EditorBodyProps>`
  display: flex;
  position: relative;
  overflow: hidden;
  max-height: ${(props) => props.maxHeight || 600}px;
  min-height: 300px;

  /* Responsive height adjustments */
  @media (max-width: 768px) {
    min-height: 250px;
    max-height: 400px;
  }

  @media (max-width: 480px) {
    min-height: 200px;
    max-height: 300px;
  }
`;

/**
 * Line numbers panel
 */
export const LineNumbers = styled.div<ThemeProps>`
  flex-shrink: 0;
  width: 50px;
  background-color: ${(props) => getThemeColors(props.theme).lineNumberBackground};
  border-right: 1px solid ${(props) => getThemeColors(props.theme).border};
  overflow: hidden;
  user-select: none;
  padding: 16px 0;
  text-align: right;
  
  /* Hide scrollbar but keep functionality */
  scrollbar-width: none;
  -ms-overflow-style: none;
  &::-webkit-scrollbar {
    display: none;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    width: 40px;
  }

  @media (max-width: 480px) {
    width: 35px;
  }
`;

/**
 * Individual line number
 */
export const LineNumber = styled.div<ThemeProps>`
  height: 21px;
  line-height: 21px;
  padding: 0 12px;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: ${(props) => getThemeColors(props.theme).lineNumberText};
  transition: color 0.2s ease;

  &:hover {
    color: ${(props) => getThemeColors(props.theme).lineNumberHover};
  }

  /* Responsive font size */
  @media (max-width: 768px) {
    font-size: 12px;
    padding: 0 8px;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    padding: 0 6px;
  }
`;

/**
 * Main text area
 */
export const TextArea = styled.textarea<ThemeProps>`
  flex: 1;
  width: 100%;
  height: 100%;
  padding: 16px;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Courier New', 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  line-height: 21px;
  color: ${(props) => getThemeColors(props.theme).text};
  background-color: ${(props) => getThemeColors(props.theme).editorBackground};
  overflow-y: auto;
  overflow-x: auto;
  white-space: pre;
  word-wrap: normal;

  /* Placeholder styling */
  &::placeholder {
    color: ${(props) => getThemeColors(props.theme).placeholder};
    opacity: 0.6;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  &::-webkit-scrollbar-track {
    background: ${(props) => getThemeColors(props.theme).editorBackground};
  }

  &::-webkit-scrollbar-thumb {
    background: ${(props) => getThemeColors(props.theme).scrollbar};
    border-radius: 6px;
    border: 2px solid ${(props) => getThemeColors(props.theme).editorBackground};
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${(props) => getThemeColors(props.theme).scrollbarHover};
  }

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: ${(props) => getThemeColors(props.theme).scrollbar} 
                   ${(props) => getThemeColors(props.theme).editorBackground};

  /* Responsive font size */
  @media (max-width: 768px) {
    font-size: 13px;
    padding: 12px;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    padding: 10px;
  }
`;

/**
 * Status bar at the bottom
 */
export const StatusBar = styled.div<ThemeProps>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 16px;
  background-color: ${(props) => getThemeColors(props.theme).statusBarBackground};
  color: ${(props) => getThemeColors(props.theme).statusBarText};
  font-size: 12px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  border-top: 1px solid ${(props) => getThemeColors(props.theme).border};
  min-height: 32px;

  /* Responsive adjustments */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
    padding: 8px 12px;
  }
`;

/**
 * Section within status bar
 */
export const StatusBarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    gap: 8px;
    width: 100%;
    justify-content: center;
  }
`;

/**
 * Individual status bar item
 */
export const StatusBarItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

/**
 * Status bar label
 */
export const StatusBarLabel = styled.span`
  font-weight: 600;
  opacity: 0.9;
`;

/**
 * Status bar value
 */
export const StatusBarValue = styled.span`
  font-weight: 400;
  font-variant-numeric: tabular-nums;
`;

/**
 * Status bar divider
 */
export const StatusBarDivider = styled.span`
  opacity: 0.5;
  user-select: none;

  @media (max-width: 480px) {
    display: none;
  }
`;

