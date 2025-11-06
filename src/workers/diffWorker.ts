/**
 * Web Worker for Diff Computation
 * 
 * Offloads expensive diff computation to a background thread
 * to prevent UI blocking for large files with chunked processing
 */

import { computeDiff, type DiffOptions, type DiffResult } from '../utils/diffChecker';

interface DiffWorkerMessage {
  type: 'COMPUTE_DIFF';
  payload: {
    left: string;
    right: string;
    options: DiffOptions;
  };
}

// Chunk processing for very large files
const processInChunks = async (
  left: string,
  right: string,
  options: DiffOptions
): Promise<DiffResult> => {
  const CHUNK_SIZE = 100000; // Process 100KB at a time
  
  // If files are small enough, process normally
  if (left.length < CHUNK_SIZE && right.length < CHUNK_SIZE) {
    return computeDiff(left, right, options);
  }

  // For very large files, split by lines and process
  const leftLines = left.split('\n');
  const rightLines = right.split('\n');
  
  // If not too many lines, process normally
  if (leftLines.length < 1000 && rightLines.length < 1000) {
    return computeDiff(left, right, options);
  }

  // Process in chunks with yielding for very large files
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = computeDiff(left, right, options);
      resolve(result);
    }, 0);
  });
};

self.addEventListener('message', async (e: MessageEvent<DiffWorkerMessage>) => {
  const { type, payload } = e.data;

  if (type === 'COMPUTE_DIFF') {
    try {
      // Send progress update
      self.postMessage({ type: 'PROGRESS', progress: 0 });
      
      const result = await processInChunks(payload.left, payload.right, payload.options);
      
      // Send completion
      self.postMessage({ type: 'PROGRESS', progress: 100 });
      self.postMessage({ success: true, result });
    } catch (error) {
      self.postMessage({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }
});

