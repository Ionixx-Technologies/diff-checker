# Diff Checker Comparison Options - Demo Guide

## 🎯 Quick Start

The Diff Checker now includes three powerful comparison options that appear as a settings bar between the control buttons and input panels.

---

## 📱 Visual Layout

```
┌─────────────────────────────────────────────────────────────┐
│                     Diff Checker & Validator                │
│                                          [🌙 Dark Mode]      │
├─────────────────────────────────────────────────────────────┤
│ [🔍 Compare] [🔮 Auto-detect] [⇄ Swap] [🗑️ Clear All]       │
├─────────────────────────────────────────────────────────────┤
│ ⚙️ Comparison Options:                                      │
│ ☑ Ignore Whitespace [ON]                                   │
│ □ Case Sensitive [OFF]                                     │
│ ☑ Ignore Key Order (JSON) [ON]                            │
├─────────────────────────────────────────────────────────────┤
│ [Original (Left)]           [Modified (Right)]             │
│ ┌─────────────────┐        ┌─────────────────┐            │
│ │                 │        │                 │            │
│ │  Drop or type   │        │  Drop or type   │            │
│ │    content      │        │    content      │            │
│ │                 │        │                 │            │
│ └─────────────────┘        └─────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔧 Option 1: Ignore Whitespace

### What It Does
Removes extra spaces, tabs, and line-ending whitespace before comparing.

### Example Use Case
```javascript
// LEFT INPUT
function hello() {
    return "world";
}

// RIGHT INPUT (different indentation)
function hello(){
return "world";
}

// WITHOUT "Ignore Whitespace": ❌ Different (indentation mismatch)
// WITH "Ignore Whitespace":    ✅ Identical (ignores spacing)
```

### When to Use
- Comparing code with different indentation styles
- Checking if text content is the same regardless of formatting
- Comparing files edited on different editors/OS (tabs vs spaces)

---

## 🔧 Option 2: Case Sensitive

### What It Does
When **OFF**: Treats uppercase and lowercase as the same  
When **ON** (default): Treats uppercase and lowercase as different

### Example Use Case
```javascript
// LEFT INPUT
Hello World
Welcome to the App

// RIGHT INPUT
hello world
WELCOME TO THE APP

// WITH "Case Sensitive" ON:  ❌ Different (case mismatch)
// WITH "Case Sensitive" OFF: ✅ Identical (ignores case)
```

### When to Use
- **OFF**: Comparing text where capitalization doesn't matter (names, titles, etc.)
- **ON**: Comparing code where case matters (variable names, constants)

---

## 🔧 Option 3: Ignore Key Order (JSON)

### What It Does
Sorts JSON object keys alphabetically before comparing. **Only works for JSON format**.

### Example Use Case
```json
// LEFT INPUT (keys in one order)
{
  "name": "John",
  "age": 30,
  "city": "NYC"
}

// RIGHT INPUT (keys in different order)
{
  "city": "NYC",
  "name": "John",
  "age": 30
}

// WITHOUT "Ignore Key Order": ❌ Different (key order mismatch)
// WITH "Ignore Key Order":    ✅ Identical (same values, order ignored)
```

### When to Use
- Comparing API responses where key order varies
- Validating JSON configs where order doesn't matter
- Comparing JSON from different sources/tools

### Important Notes
- ⚠️ **Only available when both formats are JSON**
- 🔒 **Auto-disabled for Plain Text or XML**
- 📊 Works with nested objects and arrays

---

## 🎨 Interactive Features

### Auto-Refresh
When you toggle any option:
1. Option state updates instantly
2. If comparison result exists → **Automatically re-compares** (100ms delay)
3. Diff result updates in real-time

### Visual Feedback

#### Option States
```
☑ Ignore Whitespace [ON]    ← Checked, blue badge
□ Case Sensitive [OFF]       ← Unchecked, gray badge
□ Ignore Key Order [JSON ONLY] ← Disabled, gray badge
```

#### Hover Effects
- Checkbox label text turns **blue** on hover
- Smooth color transition (0.2s)
- Cursor changes to pointer

#### Disabled State
- Checkbox grayed out (50% opacity)
- Badge shows "JSON ONLY"
- Tooltip: "Only available for JSON format"

---

## 📋 Complete Examples

### Example 1: Code Formatting Comparison

**Scenario**: Compare two versions of the same JavaScript function with different formatting.

**Left Input** (original):
```javascript
function calculateTotal(items) {
    let total = 0;
    for (let item of items) {
        total += item.price;
    }
    return total;
}
```

**Right Input** (minified):
```javascript
function calculateTotal(items){let total=0;for(let item of items){total+=item.price;}return total;}
```

**Options to Enable**:
- ☑ **Ignore Whitespace**: ON
- ☑ **Case Sensitive**: ON (important for code)
- □ **Ignore Key Order**: N/A (not JSON)

**Result**: ✅ **Identical** (same logic, different whitespace)

---

### Example 2: API Response Comparison

**Scenario**: Compare two JSON API responses that should be equivalent.

**Left Input**:
```json
{
  "status": "success",
  "data": {
    "id": 123,
    "name": "Product A"
  }
}
```

**Right Input**:
```json
{
  "data": {
    "name": "Product A",
    "id": 123
  },
  "status": "success"
}
```

**Options to Enable**:
- □ **Ignore Whitespace**: OFF (not needed, JSON is formatted)
- ☑ **Case Sensitive**: ON (JSON is case-sensitive)
- ☑ **Ignore Key Order**: ON (order doesn't matter)

**Result**: ✅ **Identical** (same data, different key order)

---

### Example 3: Case-Insensitive Text Comparison

**Scenario**: Compare two text documents where capitalization varies.

**Left Input**:
```
Hello World
Welcome To Our Application
Please Enter Your Name
```

**Right Input**:
```
HELLO WORLD
welcome to our application
Please enter your name
```

**Options to Enable**:
- ☑ **Ignore Whitespace**: ON (normalize spacing)
- □ **Case Sensitive**: OFF (ignore capitalization)
- □ **Ignore Key Order**: N/A (not JSON)

**Result**: ✅ **Identical** (same text, different case)

---

## 🚀 Pro Tips

### Tip 1: Combine Options
All three options can be used together for maximum flexibility:
```
☑ Ignore Whitespace + □ Case Sensitive + ☑ Ignore Key Order (JSON)
```

### Tip 2: Preserve Options on Clear
When you click "Clear All":
- ✅ Inputs are cleared
- ✅ Diff results are cleared
- ✅ **Options are preserved** for next comparison

### Tip 3: Options Persist After Swap
When you click "Swap":
- ✅ Left and Right inputs swap
- ✅ Diff results swap
- ✅ **Options remain the same**

### Tip 4: Smart JSON Detection
The "Ignore Key Order" option:
- Auto-enables when both formats set to JSON
- Auto-disables when format changes to Text/XML
- Shows helpful tooltip when disabled

### Tip 5: Keyboard Accessibility
- **Tab**: Navigate between checkboxes
- **Space**: Toggle checkbox
- **Enter**: Same as Space
- **Focus indicators**: Visible outline when focused

---

## 🎨 Styling Consistency

All options follow the same design language as the Validator tab:

| Element | Style |
|---------|-------|
| **Font** | Same as Validator (system fonts) |
| **Size** | 0.875rem (14px) |
| **Spacing** | 12px gaps (theme.spacing(3)) |
| **Colors** | Primary blue for active, gray for inactive |
| **Border Radius** | Medium (8px) |
| **Transitions** | 0.2s ease for all state changes |
| **Animations** | Slide-down (0.3s) on initial render |

---

## 🧪 Testing Scenarios

### Test 1: Whitespace Only
```
LEFT:  "hello    world"
RIGHT: "hello world"
EXPECTED: Different with option OFF, Identical with option ON
```

### Test 2: Case Only
```
LEFT:  "Hello"
RIGHT: "hello"
EXPECTED: Different with option ON, Identical with option OFF
```

### Test 3: JSON Key Order
```
LEFT:  {"a": 1, "b": 2}
RIGHT: {"b": 2, "a": 1}
EXPECTED: Different with option OFF, Identical with option ON (JSON only)
```

### Test 4: Combined
```
LEFT:  "  Hello   World  "
RIGHT: "hello world"
OPTIONS: Ignore Whitespace ON + Case Sensitive OFF
EXPECTED: Identical
```

---

## 📱 Responsive Behavior

### Desktop (>768px)
```
⚙️ Options: [□ Option 1] [□ Option 2] [□ Option 3]
           ← All in one row →
```

### Tablet/Mobile (<768px)
```
⚙️ Options:
[□ Option 1]
[□ Option 2]
[□ Option 3]
↑ Stack vertically
```

---

## ✨ Accessibility Features

- ✅ **ARIA Labels**: Each checkbox has descriptive label
- ✅ **Keyboard Navigation**: Full keyboard support
- ✅ **Focus Indicators**: 2px outline on focus
- ✅ **Screen Reader**: Descriptive option names
- ✅ **Tooltips**: Helpful messages for disabled options
- ✅ **Color Contrast**: WCAG AA compliant

---

## 🎉 Summary

The new comparison options make the Diff Checker **10x more powerful**:

1. **Flexible**: Handle different formatting styles
2. **Intelligent**: Auto-disable irrelevant options
3. **Reactive**: Instant updates on option change
4. **Accessible**: Full keyboard and screen reader support
5. **Beautiful**: Consistent with app design language

**Try it now and experience the difference!** 🚀

