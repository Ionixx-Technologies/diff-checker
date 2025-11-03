# 💾 LocalStorage Session Preservation Feature

## Overview

The DiffChecker now includes a powerful session preservation feature that automatically saves your inputs, format selections, and comparison settings to the browser's localStorage. This ensures your work is preserved across browser sessions and accidental page refreshes.

## Features

✅ **Automatic Saving**: Debounced auto-save (1 second after last change)  
✅ **Session Restoration**: Automatically loads saved data on page load  
✅ **Real-time Feedback**: Shows when data was last saved  
✅ **Storage Monitoring**: Displays current storage usage  
✅ **User Control**: Easy toggle to enable/disable preservation  
✅ **Data Validation**: Validates all loaded data before applying  
✅ **Error Handling**: Graceful fallbacks for all localStorage operations  

---

## How It Works

### 1. **Enabling Session Preservation**

Look for the **Session Storage** section in the DiffChecker interface:

```
💾 Session Storage:
[ ] Auto-save inputs & settings [DISABLED]
```

**To enable:**
1. Check the "Auto-save inputs & settings" checkbox
2. Your current state is immediately saved
3. All future changes are automatically saved after 1 second of inactivity

### 2. **What Gets Saved**

The following data is preserved:

- **Left Input Content**: Full text of the left panel
- **Right Input Content**: Full text of the right panel  
- **Left Format**: Selected format (text/json/xml)
- **Right Format**: Selected format (text/json/xml)
- **Comparison Options**:
  - Ignore Whitespace setting
  - Case Sensitive setting
  - Ignore Key Order (JSON) setting

### 3. **Visual Feedback**

When session preservation is enabled, you'll see:

```
[ ✓ ] Auto-save inputs & settings [ENABLED]
🕐 Last saved: Just now
📊 Storage: 2.5 KB
```

The timestamp updates automatically and shows:
- "Just now" (< 5 seconds ago)
- "X seconds ago" (< 1 minute)
- "X minutes ago" (< 1 hour)
- "X hours ago" (< 24 hours)
- Full date/time for older saves

### 4. **Automatic Restoration**

When you return to the DiffChecker:

1. If session preservation is enabled
2. The page automatically loads your saved data
3. You see a console message: `📂 Loaded saved session from: [timestamp]`
4. All your previous inputs and settings are restored

### 5. **Disabling Session Preservation**

**To disable:**
1. Uncheck the "Auto-save inputs & settings" checkbox
2. All saved data is immediately cleared from localStorage
3. Current session continues but won't be saved

---

## Implementation Details

### Architecture

The feature is built with three main components:

#### 1. **useLocalStorage Hook** (`src/hooks/useLocalStorage.ts`)
- Generic hook for localStorage operations
- Automatic JSON serialization/deserialization
- Type-safe with TypeScript generics
- Error handling for quota exceeded and parse errors

#### 2. **Session Storage Service** (`src/services/sessionStorage.ts`)
- Dedicated service for DiffChecker session management
- Validates all data before saving/loading
- Separate storage keys for each data type
- Calculates storage usage

#### 3. **Error Handling Utilities** (`src/utils/errorHandling.ts`)
- localStorage availability checks
- Storage quota monitoring
- Byte formatting utilities
- Safe JSON parsing with fallbacks

### Storage Keys

The following localStorage keys are used:

```typescript
{
  'diffchecker-preserve-session': 'true' | 'false',
  'diffchecker-left-input': string,
  'diffchecker-right-input': string,
  'diffchecker-left-format': 'text' | 'json' | 'xml',
  'diffchecker-right-format': 'text' | 'json' | 'xml',
  'diffchecker-diff-options': JSON string,
  'diffchecker-last-saved': ISO timestamp string
}
```

### Debouncing Strategy

To prevent excessive writes to localStorage (which can be slow), the implementation uses:

- **1-second debounce**: Saves occur 1 second after the last change
- **useEffect cleanup**: Cancels pending saves when component unmounts
- **Conditional saving**: Only saves when preservation is enabled

### Data Validation

All loaded data is validated before being applied:

```typescript
// Format validation
const validFormats = ['text', 'json', 'xml'];
const isValidFormat = validFormats.includes(loadedFormat);

// JSON parsing with fallback
const diffOptions = safeJsonParse(optionsString, defaultOptions);

// Existence checks
if (!leftInput && !rightInput && !diffOptions) {
  return null; // No valid data found
}
```

---

## Usage Examples

### Example 1: Basic Usage

```typescript
// 1. User types in left panel: "Hello World"
// 2. After 1 second of inactivity, automatically saved
// 3. User refreshes page
// 4. "Hello World" is automatically restored
```

### Example 2: Format Changes

```typescript
// 1. User selects JSON format
// 2. User pastes JSON content
// 3. User enables "Ignore Key Order"
// 4. All settings saved after 1 second
// 5. Page reload restores everything
```

### Example 3: Disabling Preservation

```typescript
// 1. User unchecks "Auto-save inputs & settings"
// 2. clearSessionData() is called
// 3. All localStorage keys removed
// 4. Next page load starts fresh
```

---

## API Reference

### Session Storage Service Functions

#### `saveSessionData(data: SavedSessionData)`
Saves complete session data to localStorage.

**Parameters:**
- `data`: Object containing all session data (inputs, formats, options)

**Example:**
```typescript
saveSessionData({
  leftInput: '{"name": "John"}',
  rightInput: '{"name": "Jane"}',
  leftFormat: 'json',
  rightFormat: 'json',
  diffOptions: {
    ignoreWhitespace: true,
    caseSensitive: false,
    ignoreKeyOrder: true
  }
});
```

#### `loadSessionData(): SavedSessionData | null`
Loads session data from localStorage.

**Returns:**
- `SavedSessionData` object if data exists
- `null` if no data or preservation disabled

**Example:**
```typescript
const savedData = loadSessionData();
if (savedData) {
  console.log('Restored session from:', savedData.savedAt);
}
```

#### `clearSessionData(): void`
Clears all session data from localStorage.

**Example:**
```typescript
clearSessionData();
console.log('Session data cleared');
```

#### `isSessionPreserveEnabled(): boolean`
Checks if session preservation is enabled.

**Returns:**
- `true` if enabled
- `false` if disabled or localStorage unavailable

#### `setSessionPreserveEnabled(enabled: boolean): void`
Enables or disables session preservation.

**Parameters:**
- `enabled`: `true` to enable, `false` to disable

---

## Error Handling

### Quota Exceeded

If localStorage quota is exceeded (typically 5-10 MB):

```typescript
try {
  localStorage.setItem(key, value);
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.error('Storage quota exceeded!');
    // Handle gracefully - don't crash the app
  }
}
```

### Parse Errors

If saved data is corrupted:

```typescript
const safeJsonParse = (jsonString, fallback) => {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback; // Use default values
  }
};
```

### Unavailable localStorage

If localStorage is blocked (private browsing, etc.):

```typescript
if (!isLocalStorageAvailable()) {
  console.warn('localStorage not available');
  return; // Gracefully degrade
}
```

---

## Best Practices

### 1. **Keep Data Minimal**
Only save essential data. Don't save:
- Computed/derived values (diff results)
- Validation results (can be recalculated)
- Temporary UI state

### 2. **Debounce Aggressively**
Use appropriate debounce times:
- **Text input**: 1000ms (1 second)
- **Checkbox toggles**: 100ms
- **Select dropdowns**: Immediate

### 3. **Validate Everything**
Always validate loaded data:
- Check data types
- Validate enum values
- Provide sensible defaults

### 4. **Handle Errors Gracefully**
Never crash the app due to localStorage errors:
- Wrap all operations in try-catch
- Provide fallback behavior
- Log errors for debugging

### 5. **Respect User Privacy**
- Make preservation opt-in
- Provide clear UI to disable
- Completely clear data when disabled

---

## Browser Compatibility

The feature works in all modern browsers that support:

- **localStorage API** (IE8+, all modern browsers)
- **JSON.stringify/parse** (IE8+, all modern browsers)
- **Storage API** (Chrome 55+, Firefox 51+, Safari 10+) for quota info

### Fallback Behavior

If localStorage is unavailable:
- Feature is automatically disabled
- No error thrown
- App continues to work normally without persistence

---

## Performance Considerations

### Memory Usage
- Typical session: 2-10 KB
- Large JSON files: Up to 500 KB
- Browser limit: ~5-10 MB total

### Write Performance
- Debounced to max 1 write/second
- Asynchronous (doesn't block UI)
- Minimal performance impact

### Read Performance
- Reads only on page load
- Cached in React state
- No repeated localStorage access

---

## Security Considerations

### What's Safe to Store
✅ User input content (text, JSON, XML)  
✅ UI preferences (format, options)  
✅ Non-sensitive configuration

### What NOT to Store
❌ Passwords or credentials  
❌ API keys or tokens  
❌ Personal identifiable information (PII)  
❌ Sensitive business data

### Protection Measures
- Data stored locally (not sent to servers)
- Cleared when user disables feature
- No encryption (don't store sensitive data)

---

## Troubleshooting

### Issue: Data not saving

**Check:**
1. Is preservation enabled? (Checkbox checked)
2. Is localStorage available? (Check browser settings)
3. Is quota exceeded? (Check storage size indicator)
4. Are there console errors?

**Solution:**
```typescript
// Check localStorage availability
console.log(isLocalStorageAvailable());

// Check current storage usage
console.log(getStorageSize());
```

### Issue: Data not loading

**Check:**
1. Was preservation enabled when data was saved?
2. Was localStorage cleared (browser history cleared)?
3. Different browser/incognito mode?

**Solution:**
```typescript
// Manually check stored data
const data = localStorage.getItem('diffchecker-left-input');
console.log('Stored data:', data);
```

### Issue: "Quota exceeded" error

**Solution:**
1. Clear browser data
2. Disable preservation for large files
3. Use file upload instead of direct input

---

## Future Enhancements

Potential improvements for future versions:

1. **Export/Import Sessions**: Save sessions as JSON files
2. **Multiple Saved Sessions**: Named session slots
3. **Cloud Sync**: Optional backend sync across devices
4. **Compression**: Compress large inputs before storing
5. **IndexedDB**: Use IndexedDB for larger storage capacity
6. **Auto-cleanup**: Clear old sessions after X days

---

## Testing

### Manual Testing Checklist

- [ ] Enable preservation, refresh page, verify data restored
- [ ] Disable preservation, verify data cleared
- [ ] Type in inputs, wait 1 second, check localStorage
- [ ] Change formats, verify saved correctly
- [ ] Toggle options, verify saved correctly
- [ ] Close tab, reopen, verify restoration
- [ ] Fill in large content, verify storage size updates
- [ ] Verify "last saved" timestamp updates

### Edge Cases Tested

- ✅ Empty inputs
- ✅ Very large inputs (> 1 MB)
- ✅ Invalid JSON in storage
- ✅ localStorage unavailable
- ✅ Quota exceeded
- ✅ Rapid changes (debounce test)
- ✅ Format mismatches

---

## Support

For questions or issues related to this feature:

1. Check browser console for error messages
2. Verify localStorage is enabled in browser settings
3. Try clearing browser data and testing again
4. Review the troubleshooting section above

---

## Changelog

### v1.0.0 (Current)
- ✅ Initial implementation
- ✅ Auto-save with debouncing
- ✅ Auto-restore on page load
- ✅ Last saved timestamp display
- ✅ Storage size monitoring
- ✅ Complete error handling
- ✅ User-controlled enable/disable

---

**Created:** November 3, 2025  
**Last Updated:** November 3, 2025  
**Version:** 1.0.0

