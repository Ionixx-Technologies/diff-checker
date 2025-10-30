# Diff Checker & Validator - Feature Documentation

## Overview

The Diff Checker & Validator is a comprehensive, modular feature that allows users to compare and validate JSON, XML, and plain text content. It provides visual diff highlighting, format validation, and supports multiple input modes.

## Features

### Core Functionality

1. **Multi-Format Support**
   - JSON with automatic formatting and validation
   - XML with structure validation and formatting
   - Plain text with line-by-line comparison

2. **Three Input Modes**
   - **Manual Entry**: Type or paste content directly into text areas
   - **File Upload**: Upload `.txt`, `.json`, or `.xml` files
   - **Clipboard Paste**: One-click paste from system clipboard

3. **Visual Diff Highlighting**
   - **Added lines**: Highlighted in green
   - **Removed lines**: Highlighted in red
   - **Changed lines**: Highlighted in yellow
   - **Unchanged lines**: Displayed with neutral background
   - Line numbers for easy reference

4. **Format Validation**
   - Real-time validation for JSON and XML
   - Detailed error messages for invalid formats
   - Auto-detect format from content structure

5. **Theme Support**
   - Light and dark themes
   - Persistent theme preference via localStorage
   - Theme-aware diff colors for optimal visibility

6. **Additional Features**
   - Swap inputs with one click
   - Clear all inputs
   - Auto-detect format
   - Diff statistics (added/removed/changed/unchanged lines)
   - Format mismatch warnings

## Architecture

### Project Structure

```
src/
├── components/
│   └── DiffChecker/
│       ├── DiffChecker.tsx           # Main component
│       ├── DiffChecker.styles.ts     # Styled components
│       └── index.ts                  # Barrel export
├── hooks/
│   ├── useTheme.ts                   # Theme management hook
│   ├── useDiffChecker.ts             # Diff logic and state hook
│   └── index.ts                      # Barrel export
├── utils/
│   ├── diffChecker.ts                # Core diff algorithm
│   ├── formatValidators.ts           # Format validation utilities
│   └── index.ts                      # Barrel export
├── theme/
│   ├── theme.ts                      # Theme definitions (light/dark)
│   └── index.ts                      # Barrel export
└── pages/
    └── diff-checker.tsx              # Demo page with theme provider
```

## Module Descriptions

### 1. Utilities (`src/utils/`)

#### `diffChecker.ts`
Core diff computation logic using a simplified LCS (Longest Common Subsequence) algorithm.

**Key Functions:**
- `computeDiff(left: string, right: string): DiffResult` - Performs line-by-line comparison
- `computeLineDiff(left: string, right: string)` - Character-level diff for inline changes

**Types:**
```typescript
type DiffType = 'added' | 'removed' | 'changed' | 'unchanged';

interface DiffLine {
  type: DiffType;
  content: string;
  lineNumber: number;
  correspondingLine?: number;
}

interface DiffResult {
  leftLines: DiffLine[];
  rightLines: DiffLine[];
  hasChanges: boolean;
}
```

#### `formatValidators.ts`
Validation and formatting for different content types.

**Key Functions:**
- `validateJSON(input: string): ValidationResult` - Validates and formats JSON
- `validateXML(input: string): ValidationResult` - Validates and formats XML (browser and SSR)
- `validateText(input: string): ValidationResult` - Normalizes plain text
- `detectFormat(input: string): FormatType` - Auto-detects content format
- `validateFormat(input: string, format: FormatType): ValidationResult` - Unified validation

**Types:**
```typescript
type FormatType = 'json' | 'xml' | 'text';

interface ValidationResult {
  isValid: boolean;
  error?: string;
  formatted?: string;
}
```

### 2. Hooks (`src/hooks/`)

#### `useTheme.ts`
Manages theme state with localStorage persistence.

**Returns:**
```typescript
{
  themeMode: 'light' | 'dark',
  currentTheme: AppTheme,
  toggleTheme: () => void,
  setTheme: (mode: ThemeMode) => void,
  isDark: boolean
}
```

**Features:**
- Automatic localStorage persistence
- Initial theme loading from storage
- Toggle and explicit set methods

#### `useDiffChecker.ts`
Central state management for diff checker functionality.

**Returns:**
```typescript
{
  // State
  leftInput: string,
  rightInput: string,
  leftFormat: FormatType,
  rightFormat: FormatType,
  leftValidation: ValidationResult | null,
  rightValidation: ValidationResult | null,
  diffResult: DiffResult | null,
  isComparing: boolean,
  canCompare: boolean,

  // Actions
  setLeftInput: (input: string) => void,
  setRightInput: (input: string) => void,
  setLeftFormat: (format: FormatType) => void,
  setRightFormat: (format: FormatType) => void,
  autoDetectFormats: () => { left: FormatType, right: FormatType },
  validateInputs: () => ValidationResult,
  compare: () => { success: boolean, error?: string, diffResult?: DiffResult },
  clear: () => void,
  swap: () => void
}
```

### 3. Components (`src/components/DiffChecker/`)

#### `DiffChecker.tsx`
Main component that orchestrates all functionality.

**Props:**
```typescript
interface DiffCheckerProps {
  themeMode?: 'light' | 'dark';
  onThemeToggle?: () => void;
}
```

**Features:**
- File upload handling
- Clipboard paste integration
- Real-time validation feedback
- Interactive diff display
- Responsive layout

#### `DiffChecker.styles.ts`
Styled-components for all UI elements with theme support.

**Key Components:**
- `Container` - Main wrapper
- `TextArea` - Input areas
- `DiffLine` - Individual diff lines with type-based styling
- `ValidationMessage` - Error/success messages
- `Button`, `Select` - Interactive controls
- `Stats` - Diff statistics display

### 4. Theme (`src/theme/`)

Extended theme with diff-specific colors for both light and dark modes.

**New Theme Properties:**
```typescript
colors: {
  // ... existing colors
  background: string,
  cardBackground: string,
  diffAdded: string,
  diffAddedText: string,
  diffRemoved: string,
  diffRemovedText: string,
  diffChanged: string,
  diffChangedText: string,
  diffUnchanged: string,
  success: string,
  warning: string
}
```

## Usage

### Basic Integration

```tsx
import { DiffChecker } from '@/components';

function MyPage() {
  return <DiffChecker />;
}
```

### With Theme Control

```tsx
import { DiffChecker } from '@/components';
import { useTheme } from '@/hooks';
import { ThemeProvider } from 'styled-components';

function MyPage() {
  const { currentTheme, themeMode, toggleTheme } = useTheme();

  return (
    <ThemeProvider theme={currentTheme}>
      <DiffChecker themeMode={themeMode} onThemeToggle={toggleTheme} />
    </ThemeProvider>
  );
}
```

### Using Individual Utilities

```tsx
import { computeDiff, validateJSON, detectFormat } from '@/utils';

// Compute a diff
const diff = computeDiff(leftText, rightText);

// Validate JSON
const validation = validateJSON('{"key": "value"}');

// Auto-detect format
const format = detectFormat(content);
```

## Testing

### Manual Testing Scenarios

1. **JSON Comparison**
   - Test with valid JSON objects
   - Test with invalid JSON (missing quotes, trailing commas)
   - Test with deeply nested structures
   - Test with arrays

2. **XML Comparison**
   - Test with valid XML documents
   - Test with unclosed tags
   - Test with self-closing tags
   - Test with attributes

3. **Plain Text Comparison**
   - Test with multi-line text
   - Test with special characters
   - Test with different line endings

4. **Input Modes**
   - Upload text files
   - Upload JSON files
   - Upload XML files
   - Paste from clipboard
   - Type manually

5. **Theme Switching**
   - Toggle between light and dark
   - Verify persistence after refresh
   - Check diff colors in both themes

6. **Edge Cases**
   - Empty inputs
   - Very large files
   - Format mismatches
   - Identical inputs
   - Completely different inputs

### Example Test Data

#### JSON Example
```json
// Left (Original)
{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}

// Right (Modified)
{
  "name": "John Doe",
  "age": 31,
  "email": "john.doe@example.com",
  "phone": "+1234567890"
}
```

#### XML Example
```xml
<!-- Left (Original) -->
<person>
  <name>John Doe</name>
  <age>30</age>
</person>

<!-- Right (Modified) -->
<person>
  <name>John Doe</name>
  <age>31</age>
  <phone>+1234567890</phone>
</person>
```

## Dependencies

### Required
- `react` (19.0.0-rc) - Component framework
- `styled-components` (^6.1.13) - Styling
- `next` (^15.4.1) - Framework

### No Additional Dependencies
This feature is built using only the existing project dependencies. No new external libraries were added.

## Browser Support

- **Modern Browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **File Upload**: HTML5 File API required
- **Clipboard Access**: Requires HTTPS in production (Clipboard API)
- **XML Validation**: Uses DOMParser API (universally supported)

## Performance Considerations

1. **Diff Algorithm**: O(n*m) complexity for simple cases, optimized for typical use
2. **Large Files**: May experience slowdown with files >10,000 lines
3. **Memory**: Stores complete content in state - consider chunking for very large files
4. **Rendering**: Virtual scrolling not implemented - may lag with extensive diffs

## Future Enhancements

Potential improvements for future iterations:

1. **Advanced Diff Algorithm**: Implement Myers diff algorithm for better accuracy
2. **Virtual Scrolling**: Handle very large files efficiently
3. **Inline Edit**: Edit directly in diff view
4. **Export Results**: Download diff as patch file or HTML report
5. **Syntax Highlighting**: Code-aware highlighting for programming languages
6. **Side-by-Side Scrolling**: Synchronized scroll for both panels
7. **Unified Diff View**: Alternative single-panel view
8. **Diff Merge**: Three-way merge functionality
9. **History**: Keep track of previous comparisons
10. **URL Sharing**: Share diffs via URL parameters

## Accessibility

- Semantic HTML structure
- Keyboard navigation support
- Focus indicators
- ARIA labels where appropriate
- Color contrast meets WCAG guidelines

## Security Considerations

1. **Client-Side Only**: All processing happens in the browser
2. **No Data Transmission**: Files and content never leave the user's machine
3. **XSS Prevention**: Input is properly escaped in React
4. **File Upload**: Limited to text-based formats

## Contributing

When extending this feature:

1. Keep utilities pure and testable
2. Follow the established file structure
3. Add TypeScript types for all new functions
4. Update theme definitions for new colors
5. Maintain responsive design patterns
6. Document new functionality

## License

Same as the parent project (MIT).

