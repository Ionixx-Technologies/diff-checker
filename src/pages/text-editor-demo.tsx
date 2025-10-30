/**
 * Text Editor Demo Page
 * 
 * Demonstrates the TextEditor component with theme switching
 */

import React, { useState } from 'react';
import Head from 'next/head';
import { ThemeProvider } from 'styled-components';
import { TextEditor } from '@/components/TextEditor';
import { lightTheme, darkTheme } from '@/theme';
import styled from 'styled-components';

type ThemeMode = 'light' | 'dark';

const Container = styled.div<{ isDark: boolean }>`
  min-height: 100vh;
  padding: 40px 20px;
  background-color: ${props => props.isDark ? '#1a1a1a' : '#f5f5f5'};
  transition: background-color 0.3s ease;
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1<{ isDark: boolean }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.isDark ? '#ffffff' : '#000000'};
  margin: 0;
`;

const ThemeToggle = styled.button<{ isDark: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background-color: ${props => props.isDark ? '#007acc' : '#0066cc'};
  border: none;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.3s ease;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const Description = styled.p<{ isDark: boolean }>`
  color: ${props => props.isDark ? '#d4d4d4' : '#666666'};
  margin-bottom: 24px;
  font-size: 1rem;
  line-height: 1.6;
`;

const initialContent = `// Welcome to the Text Editor!
// Try typing, adding new lines, and watch the status bar update in real-time.

function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet("World");

// Features:
// - Line numbers that sync with your content
// - Real-time file statistics (size, lines, characters)
// - Cursor position tracking (line:column)
// - Smooth scrolling synchronization
// - Tab key support (inserts 2 spaces)
// - Responsive design for all screen sizes
// - Light and dark theme support

// Start editing and see the magic happen! ✨
`;

export default function TextEditorDemo() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [content, setContent] = useState<string>(initialContent);

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const isDark = themeMode === 'dark';

  return (
    <>
      <Head>
        <title>Text Editor Demo - Modern Code Editor</title>
        <meta name="description" content="A modern text editor with line numbers, live status bar, and real-time statistics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <Container isDark={isDark}>
          <Content>
            <Header>
              <Title isDark={isDark}>Modern Text Editor</Title>
              <ThemeToggle onClick={toggleTheme} isDark={isDark}>
                {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </ThemeToggle>
            </Header>

            <Description isDark={isDark}>
              A fully-featured text editor with synchronized line numbers, real-time file statistics, 
              and cursor position tracking. Try typing, adding new lines, and watch the status bar 
              update instantly!
            </Description>

            <TextEditor
              initialValue={content}
              onChange={setContent}
              theme={themeMode}
              placeholder="Start typing your code or text here..."
              maxHeight={600}
            />
          </Content>
        </Container>
      </ThemeProvider>
    </>
  );
}

