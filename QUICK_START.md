# 🚀 Diff Checker - Quick Start Guide

## What's Been Built

A fully functional **Diff Checker & Validator** that compares and validates JSON, XML, and plain text files with visual highlighting.

## ⚡ Get Started in 3 Steps

### 1. Start the Development Server
```bash
pnpm dev
```

### 2. Open Your Browser
Navigate to: **http://localhost:3000/diff-checker**

Or click the "Diff Checker & Validator" button on the home page.

### 3. Try It Out!

**Option A: Use Example Files**
1. Click "Upload File" on the left panel
2. Select `examples/sample-json-left.json`
3. Click "Upload File" on the right panel
4. Select `examples/sample-json-right.json`
5. Select "JSON" format from dropdown
6. Click "🔍 Compare" button
7. See the visual diff with highlighted changes!

**Option B: Paste Some Text**
1. Copy any JSON/XML/text to your clipboard
2. Click "📋 Paste from Clipboard" in left panel
3. Modify it slightly
4. Click "📋 Paste from Clipboard" in right panel
5. Click "🔍 Compare"

**Option C: Type Manually**
Just start typing in the text areas!

## 🎨 Features

### Core Functionality
- ✅ **JSON** validation and comparison
- ✅ **XML** validation and comparison
- ✅ **Plain Text** line-by-line comparison
- ✅ **Auto-detect** format from content
- ✅ **Visual highlighting** (green=added, red=removed, yellow=changed)

### Input Methods
- ✅ Type directly in text areas
- ✅ Upload files (.txt, .json, .xml)
- ✅ Paste from clipboard

### UI Features
- ✅ **Light/Dark theme** toggle
- ✅ **Swap** left and right inputs
- ✅ **Clear all** inputs
- ✅ **Statistics** showing changes
- ✅ **Format mismatch** warnings
- ✅ **Error validation** with helpful messages

## 📱 Responsive Design

Works on:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 🎯 Quick Examples

### Example 1: Compare JSON
```json
// Left (Original)
{"name": "John", "age": 30}

// Right (Modified)
{"name": "John", "age": 31, "email": "john@example.com"}

// Result: Shows age change and email addition with color highlighting
```

### Example 2: Compare XML
```xml
<!-- Left -->
<person><name>John</name><age>30</age></person>

<!-- Right -->
<person><name>John</name><age>31</age><email>john@example.com</email></person>

<!-- Result: Highlights the differences -->
```

### Example 3: Compare Text
```
Left: Hello World     →  Right: Hello World
      Original line   →         Modified line
                      →         New line added
```

## 🎓 Features Demo Checklist

Try these features:

- [ ] Upload two JSON files and compare them
- [ ] Upload two XML files and compare them
- [ ] Type some text and see the diff
- [ ] Use "Auto-detect Format" button
- [ ] Toggle between Light and Dark themes
- [ ] Swap left and right inputs
- [ ] Try pasting from clipboard
- [ ] Compare files with format mismatch (see warning)
- [ ] Compare identical files (see "No changes" message)
- [ ] Try invalid JSON/XML (see error messages)

## 📁 Project Structure

```
src/
├── components/DiffChecker/     # Main component
├── hooks/                      # useTheme, useDiffChecker
├── utils/                      # Validation & diff algorithms
├── pages/diff-checker.tsx      # Demo page
└── theme/                      # Light/Dark themes

examples/                       # Sample files to test
docs/                          # Full documentation
```

## 📚 Documentation

For detailed information, see:
- **CODE_OUTPUT.md** - Complete implementation summary
- **DIFF_CHECKER_DOCUMENTATION.md** - Feature documentation
- **IMPLEMENTATION_PLAN.md** - Technical details
- **examples/README.md** - How to use example files

## 🛠️ Using in Your Code

### Import the Component
```tsx
import { DiffChecker } from '@/components';

export default function MyPage() {
  return <DiffChecker />;
}
```

### Use Individual Utilities
```tsx
import { computeDiff, validateJSON } from '@/utils';

const diff = computeDiff(text1, text2);
const validation = validateJSON(jsonString);
```

### Use the Hooks
```tsx
import { useTheme, useDiffChecker } from '@/hooks';

const { toggleTheme, isDark } = useTheme();
const { compare, swap, clear } = useDiffChecker();
```

## ✨ No New Dependencies!

Everything is built using only the existing project dependencies:
- React
- Next.js
- TypeScript
- Styled-Components

## 🎉 Ready to Use!

The feature is **production-ready** and fully integrated. Just run `pnpm dev` and start comparing!

---

**Need Help?** Check the documentation files or explore the well-commented code.

**Have Fun!** 🚀

