# LocalStorage Feature Usage Examples

## Quick Start Guide

### 1. Enable Session Preservation

Navigate to the DiffChecker interface and:

1. Look for the **Session Storage** section
2. Check the box: `☑️ Auto-save inputs & settings`
3. Status changes to: `[ENABLED]`
4. You'll see: `🕐 Last saved: Just now`

### 2. Use the DiffChecker Normally

```
Left Panel:                  Right Panel:
{"name": "John"}            {"name": "Jane"}
Format: JSON                Format: JSON
```

Your inputs are automatically saved after 1 second of inactivity.

### 3. Reload the Page

- All your inputs are restored automatically
- Format settings are preserved
- Comparison options are maintained

---

## Common Use Cases

### Use Case 1: Comparing Large JSON Files

**Scenario:** You're comparing two large JSON API responses that take time to format.

**Steps:**
1. Enable session preservation
2. Paste first JSON in left panel
3. Paste second JSON in right panel
4. Select JSON format
5. Enable "Ignore Key Order"
6. Click Compare

**Result:** If you accidentally close the tab, everything is restored when you reopen it!

---

### Use Case 2: Iterative Comparison

**Scenario:** You're making multiple small changes and comparing repeatedly.

**Steps:**
1. Enable session preservation
2. Load initial files
3. Make changes
4. Compare
5. Refresh page to see changes
6. Continue editing without losing data

---

### Use Case 3: Documentation Work

**Scenario:** You're documenting differences between two versions of text.

**Steps:**
1. Enable session preservation
2. Paste both versions
3. Enable relevant options (ignore whitespace, etc.)
4. Take breaks without losing work
5. Come back hours later - everything is still there

---

## Code Examples

### Programmatic Usage (Advanced)

If you want to integrate with the storage service directly:

```typescript
import { 
  saveSessionData, 
  loadSessionData, 
  clearSessionData 
} from '@/services/sessionStorage';

// Save custom data
saveSessionData({
  leftInput: 'const x = 1;',
  rightInput: 'const x = 2;',
  leftFormat: 'text',
  rightFormat: 'text',
  diffOptions: {
    ignoreWhitespace: false,
    caseSensitive: true,
    ignoreKeyOrder: false
  }
});

// Load saved data
const saved = loadSessionData();
if (saved) {
  console.log('Loaded:', saved.savedAt);
  console.log('Left input:', saved.leftInput);
}

// Clear all data
clearSessionData();
```

### Checking Storage Status

```typescript
import { 
  isSessionPreserveEnabled,
  getSessionStorageSize 
} from '@/services/sessionStorage';
import { formatBytes } from '@/utils/errorHandling';

// Check if enabled
const enabled = isSessionPreserveEnabled();
console.log('Preservation enabled:', enabled);

// Check storage size
const size = getSessionStorageSize();
console.log('Storage size:', formatBytes(size));
```

---

## Tips & Tricks

### 💡 Tip 1: Use with Keyboard Shortcuts

Enable preservation before using keyboard shortcuts for paste/swap operations to ensure nothing is lost.

### 💡 Tip 2: Monitor Storage Size

Keep an eye on the storage indicator. If it gets too large (> 1 MB), consider:
- Splitting large files
- Using file upload instead
- Disabling preservation for that session

### 💡 Tip 3: Privacy Mode

If working with sensitive data:
- Keep preservation disabled
- Or clear data immediately after use
- Remember: data is stored locally in browser

### 💡 Tip 4: Multiple Windows

Each browser tab shares the same localStorage:
- Opening a new tab will load the same session
- Changes in one tab affect others
- Be careful when working in multiple tabs

---

## Real-World Example

### API Development Workflow

```typescript
// 1. Developer is comparing API responses
// Left panel: Production API response
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ],
  "status": "success"
}

// Right panel: Development API response
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"}
  ],
  "status": "success"
}

// 2. Settings:
Format: JSON
✓ Ignore Key Order
✓ Ignore Whitespace
✓ Case Sensitive

// 3. Enable session preservation
☑️ Auto-save inputs & settings [ENABLED]

// 4. Developer's laptop battery dies

// 5. After reboot and opening browser:
// Everything is exactly as it was! ✨
```

---

## Comparison: Before vs After

### Before Session Preservation

❌ Lost work on accidental refresh  
❌ Had to re-paste large content  
❌ Forgot which comparison options were used  
❌ Couldn't resume work after break  

### After Session Preservation

✅ Work survives refreshes  
✅ Inputs automatically restored  
✅ Settings remembered  
✅ Resume work anytime  
✅ Peace of mind 😌  

---

## FAQ

**Q: How long is data stored?**  
A: Indefinitely, until you disable preservation or clear browser data.

**Q: Is my data secure?**  
A: Data is stored locally in your browser. Don't store sensitive information.

**Q: What's the storage limit?**  
A: Typically 5-10 MB per domain, depending on browser.

**Q: Can I export my session?**  
A: Not yet, but it's a planned feature! Current data is in localStorage.

**Q: Does it work in incognito mode?**  
A: Yes, but data is cleared when you close the incognito window.

**Q: What if I clear browser history?**  
A: If you clear "Cookies and site data," saved sessions are lost.

---

## Keyboard Shortcuts + Persistence

Combine with DiffChecker shortcuts for maximum productivity:

```
Ctrl/Cmd + V    = Paste (auto-saved after 1 second)
Swap Button     = Swap inputs (new state saved)
Clear Button    = Clear all (cleared state saved if enabled)
F5              = Refresh (everything restored)
```

---

## Storage Monitoring

Watch the storage indicator to understand your usage:

```
📊 Storage: 0 Bytes       → Empty state
📊 Storage: 125 Bytes     → Small text inputs
📊 Storage: 2.5 KB        → Typical JSON comparison
📊 Storage: 50 KB         → Large JSON files
📊 Storage: 500 KB        → Very large inputs
📊 Storage: 5 MB+         → Consider splitting or disabling
```

---

## Browser DevTools Inspection

Want to see exactly what's stored?

1. Open Browser DevTools (F12)
2. Go to "Application" tab (Chrome) or "Storage" tab (Firefox)
3. Navigate to "Local Storage" → your domain
4. Look for keys starting with `diffchecker-`

Example:
```
Key                            Value
diffchecker-preserve-session   "true"
diffchecker-left-input         "Hello World"
diffchecker-right-input        "Hello Universe"
diffchecker-left-format        "text"
diffchecker-right-format       "text"
diffchecker-last-saved         "2025-11-03T10:30:00.000Z"
```

---

**Happy Comparing! 🎉**

Remember: Enable session preservation for a worry-free experience!

