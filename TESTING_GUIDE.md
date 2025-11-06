# Testing Guide - Quick Reference

## Test Files Created

### New Test Files (125 Tests Total)

1. **VirtualDiffContent.test.tsx** (28 tests)
   - Virtual scrolling component
   - Performance tests for large datasets
   - Scroll handling and optimization

2. **LoadingOverlay.test.tsx** (10 tests)
   - Loading overlay display
   - Animation and styling
   - Custom messages

3. **fileValidation.test.ts** (35 tests)
   - File size validation (2MB limit)
   - File format validation (JSON/XML/Text)
   - Helper functions

4. **xmlNormalizer.test.ts** (30 tests)
   - XML attribute normalization
   - Comparison logic
   - Error handling

5. **DiffChecker.fileHandling.test.tsx** (22 tests)
   - Enhanced file handling
   - Direct paste validation
   - Chunked reading
   - Reset functionality

## Quick Commands

### Run All Tests
```bash
npm test
```

### Run Specific Test File
```bash
# Virtual scrolling tests
npm test -- VirtualDiffContent.test

# File validation tests
npm test -- fileValidation.test

# XML normalizer tests
npm test -- xmlNormalizer.test

# File handling tests
npm test -- DiffChecker.fileHandling.test

# Loading overlay tests
npm test -- LoadingOverlay.test
```

### Run Tests with Coverage
```bash
npm test -- --coverage
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```

### Run Tests for Changed Files Only
```bash
npm test -- --onlyChanged
```

### Run Tests with Verbose Output
```bash
npm test -- --verbose
```

## Test Categories

### ✅ Component Tests
- `VirtualDiffContent.test.tsx` - Virtual scrolling component
- `LoadingOverlay.test.tsx` - Loading overlay
- `DiffChecker.fileHandling.test.tsx` - Enhanced file handling
- `DiffChecker.test.tsx` - Main DiffChecker (existing)
- `Validator.test.tsx` - Validator component (existing)

### ✅ Utility Tests
- `fileValidation.test.ts` - File validation utilities
- `xmlNormalizer.test.ts` - XML normalization
- `diffChecker.test.ts` - Diff computation (existing)
- `formatValidators.test.ts` - Format validators (existing)

## Coverage by Feature

### Virtual Scrolling ✅
- Rendering only visible items
- Scroll performance (60fps)
- Large dataset handling (10,000+ lines)
- Memory efficiency
- Theme support

### File Validation ✅
- Size limit enforcement (2MB)
- Format validation (JSON/XML/Text)
- Drag and drop validation
- Direct paste validation (Ctrl+V)
- User-friendly error messages

### XML Normalization ✅
- Attribute ordering
- Nested elements
- Special characters
- Large documents
- Error handling

### Performance Optimizations ✅
- Chunked file reading (512KB chunks)
- Async processing
- RequestAnimationFrame usage
- Web Worker integration
- Throttled scroll handling

### User Experience ✅
- Loading indicators
- Progress feedback
- Error messages
- Reset functionality
- Session storage management

## Expected Test Results

### All Tests Should Pass ✅
```
Test Suites: 7 passed, 7 total
Tests:       156 passed, 156 total (125 new + 31 existing)
Snapshots:   0 total
Time:        ~10-20s
```

### Coverage Metrics Target
- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%

## Common Test Scenarios

### 1. File Upload Flow
```typescript
// Test: Upload → Validate Size → Validate Format → Display
it('should handle complete file upload flow', async () => {
  // Upload file
  // Check size validation
  // Check format validation
  // Verify content display
});
```

### 2. Virtual Scrolling Performance
```typescript
// Test: Large dataset → Render → Scroll → Performance check
it('should handle 10,000 lines efficiently', () => {
  // Create 10,000 line dataset
  // Render component
  // Measure render time
  // Expect < 200ms
});
```

### 3. Direct Paste Validation
```typescript
// Test: Paste → Validate Size → Validate Format → Display
it('should validate direct paste content', async () => {
  // Simulate Ctrl+V
  // Check size validation
  // Check format validation
  // Verify content
});
```

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "test name pattern"
```

### Run Tests with Debugging
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Clear Jest Cache
```bash
npm test -- --clearCache
```

## Test Structure Example

```typescript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Cleanup after each test
    jest.restoreAllMocks();
  });

  describe('Sub-feature', () => {
    it('should do something', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = doSomething(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Mocking Examples

### Mock Alert
```typescript
beforeEach(() => {
  global.alert = jest.fn();
});
```

### Mock Clipboard
```typescript
beforeEach(() => {
  Object.assign(navigator, {
    clipboard: {
      readText: jest.fn().mockResolvedValue('text'),
    },
  });
});
```

### Mock File Reader
```typescript
beforeEach(() => {
  global.FileReader = jest.fn().mockImplementation(() => ({
    readAsText: jest.fn(),
    onload: jest.fn(),
  }));
});
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v2
```

## Troubleshooting

### Tests Timing Out
```bash
# Increase timeout
npm test -- --testTimeout=10000
```

### Memory Issues
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm test
```

### Watch Mode Not Working
```bash
# Clear watchman cache (if using)
watchman watch-del-all
```

## Best Practices

### ✅ Do's
- Write descriptive test names
- Test one thing per test
- Use beforeEach/afterEach for setup/cleanup
- Mock external dependencies
- Test edge cases
- Test error conditions
- Use waitFor for async operations

### ❌ Don'ts
- Don't test implementation details
- Don't share state between tests
- Don't use real API calls
- Don't skip cleanup
- Don't test third-party code
- Don't write flaky tests

## Test Checklist

Before committing:
- [ ] All tests pass
- [ ] No console errors
- [ ] Coverage meets targets
- [ ] No linter errors
- [ ] Tests are descriptive
- [ ] Edge cases covered
- [ ] Mocks cleaned up
- [ ] Async properly handled

## Performance Benchmarks

Expected test execution times:
- **VirtualDiffContent**: ~2-3s (includes performance tests)
- **LoadingOverlay**: ~0.5s (simple component)
- **fileValidation**: ~1-2s (many unit tests)
- **xmlNormalizer**: ~2-3s (includes large XML tests)
- **DiffChecker.fileHandling**: ~3-4s (integration tests)

Total: ~10-15 seconds for all 125 new tests

## Support

If tests fail:
1. Check test output for specific errors
2. Run failed test in isolation
3. Check mocks are properly setup
4. Verify component props
5. Check async operations with waitFor
6. Review console warnings

For help:
- Review `TEST_COVERAGE_SUMMARY.md` for details
- Check existing test patterns in codebase
- Refer to Jest documentation

---

**All 125 new tests are ready to run! 🧪✅**

