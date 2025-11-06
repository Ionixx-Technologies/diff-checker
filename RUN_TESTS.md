# How to Run the Tests

## Quick Start

### Run All Tests
```bash
npm test
```

This will run:
- ✅ 125 new tests (new features)
- ✅ 31 existing tests (original features)
- ✅ **156 total tests**

---

## Test Files Summary

### NEW TEST FILES (5 files, 125 tests)

#### 1. Virtual Scrolling Component
```bash
npm test -- VirtualDiffContent.test.tsx
```
**Tests**: 28  
**Coverage**: Virtual scrolling, performance, large datasets

#### 2. Loading Overlay
```bash
npm test -- LoadingOverlay.test.tsx
```
**Tests**: 10  
**Coverage**: Loading states, animation, messages

#### 3. File Validation Utilities
```bash
npm test -- fileValidation.test.ts
```
**Tests**: 35  
**Coverage**: Size validation, format validation, helpers

#### 4. XML Normalizer
```bash
npm test -- xmlNormalizer.test.ts
```
**Tests**: 30  
**Coverage**: Attribute ordering, normalization, comparison

#### 5. Enhanced File Handling
```bash
npm test -- DiffChecker.fileHandling.test.tsx
```
**Tests**: 22  
**Coverage**: Drag-drop, paste, chunked reading, reset

---

## What Each Test File Covers

### ✅ VirtualDiffContent.test.tsx
Tests the virtual scrolling implementation that fixes scroll lag:
- Only renders visible lines (not all 10,000+)
- Smooth 60fps scrolling
- Performance benchmarks
- Line types (added/removed/changed)
- Theme support
- Content display

**Why Important**: Ensures scroll performance for large files

---

### ✅ LoadingOverlay.test.tsx
Tests the loading indicator:
- Displays during long operations
- Custom/default messages
- Spinner animation
- Backdrop overlay

**Why Important**: Ensures users see feedback during processing

---

### ✅ fileValidation.test.ts
Tests the file validation system:
- 2MB file size limit enforcement
- JSON/XML/Text format validation
- Clipboard size validation
- Error message formatting
- Edge cases (empty files, special chars, etc.)

**Why Important**: Prevents invalid files from crashing the app

---

### ✅ xmlNormalizer.test.ts
Tests XML attribute normalization:
- Sorts attributes alphabetically
- Handles nested elements
- Preserves content
- Error handling for invalid XML
- Large XML documents

**Why Important**: Enables "ignore attribute order" feature

---

### ✅ DiffChecker.fileHandling.test.tsx
Tests enhanced file handling:
- Drag and drop validation
- Direct paste (Ctrl+V) validation
- File upload button validation
- Chunked reading for large files
- Reset with session storage clear
- Dynamic accept attributes

**Why Important**: Ensures complete file handling workflow

---

## Expected Output

When you run `npm test`, you should see:

```
PASS  src/components/DiffChecker/VirtualDiffContent.test.tsx
  VirtualDiffContent
    ✓ Rendering (8 tests)
    ✓ Line Types (4 tests)
    ✓ Line Numbers (2 tests)
    ✓ Scrolling (2 tests)
    ✓ Performance (2 tests)
    ✓ Empty State (2 tests)
    ✓ Theme Support (2 tests)
    ✓ Container Height (2 tests)
    ✓ Content Display (3 tests)
    ✓ Reset on Content Change (1 test)

PASS  src/components/DiffChecker/LoadingOverlay.test.tsx
  LoadingOverlay
    ✓ Rendering (3 tests)
    ✓ Visual Elements (2 tests)
    ✓ Message Display (3 tests)
    ✓ Accessibility (1 test)
    ✓ Animation (1 test)

PASS  src/utils/fileValidation.test.ts
  File Validation Utilities
    ✓ Constants (1 test)
    ✓ validateFileSize (4 tests)
    ✓ validateFileFormat (11 tests)
    ✓ validateFile (4 tests)
    ✓ validateClipboardSize (4 tests)
    ✓ formatFileSize (4 tests)
    ✓ getAcceptedExtensions (3 tests)
    ✓ Edge Cases (4 tests)

PASS  src/utils/xmlNormalizer.test.ts
  XML Normalizer
    ✓ Attribute Ordering (4 tests)
    ✓ Nested Elements (2 tests)
    ✓ Attribute Values (4 tests)
    ✓ XML Declaration (2 tests)
    ✓ Text Content (3 tests)
    ✓ CDATA Sections (2 tests)
    ✓ Comments (1 test)
    ✓ Error Handling (4 tests)
    ✓ Formatting (2 tests)
    ✓ Namespaces (2 tests)
    ✓ Large XML (2 tests)
    ✓ Comparison Use Case (2 tests)

PASS  src/components/DiffChecker/DiffChecker.fileHandling.test.tsx
  DiffChecker - File Handling
    ✓ File Size Validation (3 tests)
    ✓ File Format Validation (6 tests)
    ✓ Direct Paste Validation (3 tests)
    ✓ File Upload Button (2 tests)
    ✓ Chunked File Reading (2 tests)
    ✓ Reset Functionality (2 tests)
    ✓ Dynamic Accept Attribute (3 tests)
    ✓ Drop Overlay Messages (1 test)

Test Suites: 5 passed, 5 total
Tests:       125 passed, 125 total
Snapshots:   0 total
Time:        ~10-15s
Ran all test suites.
```

---

## Coverage Report

To see detailed coverage:

```bash
npm test -- --coverage
```

Expected coverage for new code:
- **Statements**: >85%
- **Branches**: >80%
- **Functions**: >85%
- **Lines**: >85%

Coverage report will be in `coverage/lcov-report/index.html`

---

## Testing Specific Features

### Test Virtual Scrolling Performance
```bash
npm test -- -t "should handle very large datasets efficiently"
```

### Test File Validation
```bash
npm test -- -t "File Size Validation"
```

### Test XML Normalization
```bash
npm test -- -t "Attribute Ordering"
```

### Test Direct Paste
```bash
npm test -- -t "Direct Paste Validation"
```

---

## Verification Checklist

After running tests, verify:

- [ ] All 125 new tests pass ✅
- [ ] No console errors
- [ ] No warnings about missing mocks
- [ ] Coverage meets targets (>80%)
- [ ] Performance tests complete in reasonable time
- [ ] No timeouts or hanging tests

---

## Troubleshooting

### If Tests Fail

1. **Check Error Message**: Read the specific test failure
2. **Run Single Test**: Isolate the failing test
   ```bash
   npm test -- -t "specific test name"
   ```
3. **Check Mocks**: Ensure mocks are properly set up
4. **Clear Cache**: Try clearing Jest cache
   ```bash
   npm test -- --clearCache
   ```
5. **Check Dependencies**: Ensure all packages installed
   ```bash
   npm install
   ```

### Common Issues

**Issue**: Tests timeout  
**Solution**: Increase timeout in test file
```typescript
jest.setTimeout(10000);
```

**Issue**: Mock not working  
**Solution**: Ensure mock is in beforeEach
```typescript
beforeEach(() => {
  global.alert = jest.fn();
});
```

**Issue**: Async test failing  
**Solution**: Use waitFor properly
```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

---

## What Gets Tested

### Performance ✅
- Virtual scrolling handles 10,000+ lines
- Chunked reading for large files (1MB+)
- Scroll performance (60fps target)
- Memory efficiency

### Functionality ✅
- File size validation (2MB limit)
- File format validation (JSON/XML/Text)
- Direct paste validation
- Drag and drop validation
- XML attribute normalization
- Loading overlay display
- Reset functionality

### User Experience ✅
- Error messages are user-friendly
- Loading indicators appear
- Validation happens before processing
- Session storage management

### Edge Cases ✅
- Empty files
- Files exactly at size limit
- Invalid formats
- Special characters
- Large datasets
- Malformed content

---

## Integration with CI/CD

These tests are ready for continuous integration:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm test -- --coverage
```

---

## Documentation References

- **TEST_COVERAGE_SUMMARY.md**: Detailed breakdown of all tests
- **TESTING_GUIDE.md**: Complete testing guide and best practices
- **VIRTUAL_SCROLLING_IMPLEMENTATION.md**: Virtual scrolling technical details
- **SCROLL_LAG_FIX.md**: Scroll performance optimization details

---

## Summary

✅ **125 new tests** covering all new features  
✅ **5 new test files** with comprehensive coverage  
✅ **All optimizations tested**: Virtual scrolling, file validation, XML normalization  
✅ **Performance verified**: Large file handling, smooth scrolling  
✅ **Edge cases covered**: Error conditions, boundaries, special cases  

**Run `npm test` to verify everything works! 🧪✅**

