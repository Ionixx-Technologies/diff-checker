/**
 * Mock Worker Factory for Tests
 */

export const createDiffWorker = (): Worker | null => {
  // Return null in tests - worker not needed
  return null;
};
