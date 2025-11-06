/**
 * Worker Factory
 *
 * Isolates Worker creation with import.meta.url
 * This allows for easier mocking in tests
 */

/**
 * Creates a diff worker instance
 * Returns null if worker creation fails (e.g., in test environment)
 */
export const createDiffWorker = (): Worker | null => {
  try {
    if (process.env.NODE_ENV === 'test') {
      return null;
    }

    return new Worker(
      new URL('./diffWorker.ts', import.meta.url),
      { type: 'module' }
    );
  } catch (error) {
    console.warn('Failed to create diff worker:', error);
    return null;
  }
};
