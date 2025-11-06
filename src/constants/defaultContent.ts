/**
 * Default Content Constants
 * 
 * Provides example content for DiffChecker and Validator components
 * Used when resetting to initial state with examples
 */

export const DEFAULT_DIFF_CONTENT = {
  left: `{
  "name": "Original Document",
  "version": "1.0.0",
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Bob",
      "role": "user"
    }
  ],
  "settings": {
    "theme": "light",
    "notifications": true
  }
}`,
  right: `{
  "name": "Modified Document",
  "version": "1.0.1",
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "role": "admin"
    },
    {
      "id": 2,
      "name": "Bob",
      "role": "editor"
    },
    {
      "id": 3,
      "name": "Charlie",
      "role": "user"
    }
  ],
  "settings": {
    "theme": "dark",
    "notifications": true,
    "language": "en"
  }
}`,
};

export const DEFAULT_VALIDATOR_CONTENT = {
  JSON: `{
  "message": "Welcome to the Validator!",
  "features": [
    "JSON validation",
    "XML validation",
    "Syntax highlighting",
    "Error detection"
  ],
  "tip": "Try modifying this JSON to see validation in action"
}`,
  XML: `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <message>Welcome to the Validator!</message>
  <features>
    <feature>JSON validation</feature>
    <feature>XML validation</feature>
    <feature>Syntax highlighting</feature>
    <feature>Error detection</feature>
  </features>
  <tip>Try modifying this XML to see validation in action</tip>
</document>`,
};

