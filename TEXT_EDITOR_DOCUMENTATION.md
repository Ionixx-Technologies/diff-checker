# Text Editor Component - Complete Documentation

## Overview

A modern, fully-featured text editor component built with React, TypeScript, and styled-components. The editor includes synchronized line numbers, a live status bar with real-time file statistics, and cursor position tracking.

## Features

###  Core Features

1. **Synchronized Line Numbers**
   - Automatically updates when adding or removing lines
   - Scrolls in sync with text content
   - Responsive sizing for different screen sizes

2. **Live Status Bar**
   - **Size**: Displays file size in B, KB, or MB
   - **Ln**: Current line count
   - **Ch**: Total character count
   - **Position**: Current cursor position (line:column)

3. **Real-time Updates**
   - All statistics update as you type
   - Cursor position tracks clicks and keyboard navigation
   - Instant visual feedback

4. **Rich Text Handling**
   - Supports multi-byte characters (UTF-8)
   - Handles various line endings (LF, CR, CRLF)
   - Tab key inserts spaces instead of losing focus
   - Preserves formatting

5. **Theme Support**
   - Light and dark mode
   - Smooth theme transitions
   - Customizable via props

6. **Responsive Design**
   - Mobile-first approach
   - Adapts to tablets and desktops
   - Custom breakpoints for optimal viewing

7. **Accessibility**
   - Proper ARIA labels
   - Keyboard navigation support
   - Focus indicators
   - Screen reader friendly

## Component API

### Props

```typescript
interface TextEditorProps {
  /** Initial content for the editor */
  initialValue?: string;
  
  /** Placeholder text when editor is empty */
  placeholder?: string;
  
  /** Callback when content changes */
  onChange?: (value: string) => void;
  
  /** Theme mode for styling ('light' | 'dark') */
  theme?: 'light' | 'dark';
  
  /** Whether the editor is read-only */
  readOnly?: boolean;
  
  /** Maximum height in pixels (auto-scrolls after) */
  maxHeight?: number;
}
```

### Usage Examples

#### Basic Usage

```tsx
import { TextEditor } from '@/components/TextEditor';

function MyComponent() {
  return <TextEditor placeholder="Start typing..." />;
}
```

#### With State Management

```tsx
import { useState } from 'react';
import { TextEditor } from '@/components/TextEditor';

function MyComponent() {
  const [content, setContent] = useState('// Initial code');

  return (
    <TextEditor
      initialValue={content}
      onChange={setContent}
      theme="dark"
      maxHeight={500}
    />
  );
}
```

#### Read-Only Mode

```tsx
<TextEditor
  initialValue={someCode}
  readOnly
  placeholder="View only"
/>
```

## File Structure

```
src/components/TextEditor/
├── TextEditor.tsx           # Main component logic
├── TextEditor.styles.ts     # Styled components
├── TextEditor.test.tsx      # Comprehensive tests
└── index.ts                 # Export file
```

## Styling System

The editor uses `styled-components` with theme-aware styling:

### Light Theme
- Background: `#ffffff`
- Text: `#000000`
- Line numbers: `#237893`
- Status bar: `#007acc`

### Dark Theme
- Background: `#1e1e1e`
- Text: `#d4d4d4`
- Line numbers: `#858585`
- Status bar: `#007acc`

### Responsive Breakpoints
- **Mobile**: < 480px
- **Tablet**: < 768px
- **Desktop**: ≥ 768px

## Technical Implementation

### Line Number Synchronization

The component uses refs and scroll event handlers to keep line numbers in sync:

```typescript
const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
  const target = event.target as HTMLTextAreaElement;
  if (lineNumbersRef.current) {
    lineNumbersRef.current.scrollTop = target.scrollTop;
  }
};
```

### Cursor Position Tracking

Cursor position is calculated based on the absolute position in the text:

```typescript
const calculateCursorPosition = (text: string, cursorPos: number) => {
  const beforeCursor = text.substring(0, cursorPos);
  const lines = beforeCursor.split('\n');
  return {
    line: lines.length,
    column: lines[lines.length - 1].length,
    absolutePosition: cursorPos,
  };
};
```

### Byte Size Calculation

Uses `TextEncoder` for accurate UTF-8 byte counting:

```typescript
const getByteSize = (text: string): number => {
  return new TextEncoder().encode(text).length;
};
```

### Tab Key Handling

Prevents default behavior and inserts spaces:

```typescript
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    // Insert 2 spaces at cursor position
    // Update content and cursor position
  }
};
```

## Testing

The component includes comprehensive tests covering:

- **Rendering**: All UI elements appear correctly
- **Line Numbers**: Update properly when content changes
- **Status Bar**: Displays accurate statistics
- **Cursor Position**: Tracks correctly
- **User Interactions**: Typing, clicking, keyboard navigation
- **Scrolling**: Synchronizes between text and line numbers
- **Accessibility**: ARIA labels, keyboard access
- **Edge Cases**: Empty content, long content, multi-byte characters
- **Theme Support**: Both light and dark themes
- **Custom Props**: All props work as expected

Run tests:
```bash
pnpm test TextEditor
```

Run tests with coverage:
```bash
pnpm test TextEditor -- --coverage
```

## Performance Considerations

1. **Efficient Re-renders**
   - Uses `useCallback` for event handlers
   - Refs for DOM manipulation
   - Minimal state updates

2. **Large Files**
   - Virtual scrolling not implemented (suitable for files < 10,000 lines)
   - For larger files, consider implementing virtualization

3. **Memory Usage**
   - Stores full content in state
   - Line numbers generated on render
   - Minimal memory footprint for typical use cases

## Browser Compatibility

- **Chrome**: ✅ Fully supported
- **Firefox**: ✅ Fully supported
- **Safari**: ✅ Fully supported
- **Edge**: ✅ Fully supported
- **Mobile**: ✅ Responsive design works on all mobile browsers

## Accessibility Features

1. **ARIA Labels**
   - Textarea has proper `aria-label="Text editor"`
   - All interactive elements are labeled

2. **Keyboard Navigation**
   - Tab key works (inserts spaces)
   - All standard text editing shortcuts
   - Focus indicators visible

3. **Screen Readers**
   - Proper semantic HTML
   - Status updates announced
   - Line numbers hidden from screen readers (decorative)

## Common Issues & Solutions

### Issue: Line numbers don't sync when scrolling
**Solution**: Ensure the `scrollTop` property is being set correctly on the line numbers container.

### Issue: Cursor position is incorrect after paste
**Solution**: The component handles paste events. Ensure you're not preventing default behavior elsewhere.

### Issue: Performance issues with large files
**Solution**: Consider implementing virtual scrolling or limiting the maximum content size.

### Issue: Theme not applying correctly
**Solution**: Ensure `ThemeProvider` wraps the component and theme prop matches provider theme.

## Future Enhancements

Potential features for future versions:

1. **Syntax Highlighting**
   - Language detection
   - Color-coded tokens
   - Multiple language support

2. **Code Folding**
   - Collapse/expand sections
   - Smart folding based on indentation

3. **Line Highlighting**
   - Current line highlight
   - Error/warning indicators
   - Custom highlight ranges

4. **Virtual Scrolling**
   - Handle very large files (> 10,000 lines)
   - Render only visible lines

5. **Minimap**
   - Visual overview of document
   - Quick navigation

6. **Find & Replace**
   - Search functionality
   - Regex support
   - Replace all feature

## Demo Page

A complete demo is available at `/text-editor-demo` showcasing:
- Theme switching
- Real-time statistics
- All core features
- Responsive behavior

View the demo:
```bash
pnpm dev
# Navigate to http://localhost:3000/text-editor-demo
```

## Contributing

When contributing to the TextEditor component:

1. Maintain TypeScript strict mode compliance
2. Add tests for new features
3. Update documentation
4. Follow existing code style
5. Ensure accessibility standards

## License

Part of the framework-template project. See main project license.

---

**Last Updated**: October 30, 2025
**Version**: 1.0.0
**Author**: Framework Template Team

