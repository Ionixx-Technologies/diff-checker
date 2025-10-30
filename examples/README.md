# Example Files for Diff Checker

This directory contains sample files that can be used to test the Diff Checker & Validator functionality.

## JSON Examples

- **sample-json-left.json**: Original JSON data
- **sample-json-right.json**: Modified JSON data with changes in age, email, location, and added phone field

### Changes to Test:
- Modified field value (age: 30 → 31)
- Modified field value (email)
- Modified nested object (city changed)
- Added new nested field (state)
- Added new array element (TypeScript skill)
- Added new root field (phone)

## XML Examples

- **sample-xml-left.xml**: Original XML catalog
- **sample-xml-right.xml**: Modified XML catalog with price change and new book

### Changes to Test:
- Modified element value (book 1 price)
- Added new element (ISBN for book 1)
- Added new book entry (book 3)

## How to Use

1. Navigate to `/diff-checker` page
2. Click "Upload File" on the left panel
3. Select `sample-json-left.json` or `sample-xml-left.xml`
4. Click "Upload File" on the right panel
5. Select the corresponding `-right` file
6. Select the appropriate format (JSON or XML)
7. Click "Compare" to see the differences

## Plain Text Testing

You can also create your own plain text files to test line-by-line comparison:

**Example Left:**
```
Hello World
This is a test
Some content here
Original line
```

**Example Right:**
```
Hello World
This is a modified test
Some content here
Modified line
New line added
```

