/**
 * Jest Setup File
 * Polyfills and global setup for tests
 */

// Import jest-dom matchers
require('@testing-library/jest-dom');

// Polyfill for TextEncoder/TextDecoder (needed for Node < 18)
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = require('util').TextEncoder;
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = require('util').TextDecoder;
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock navigator.clipboard (must be configurable for userEvent)
Object.defineProperty(navigator, 'clipboard', {
  writable: true,
  configurable: true,
  value: {
    readText: jest.fn(),
    writeText: jest.fn(),
  },
});

// Mock alert
global.alert = jest.fn();

