/**
 * File Download Utility
 * 
 * Provides functionality to download content as files with proper MIME types
 */

export interface DownloadOptions {
  content: string;
  filename: string;
  mimeType: string;
}

/**
 * Download content as a file
 */
export const downloadFile = ({ content, filename, mimeType }: DownloadOptions): void => {
  try {
    // Create blob with appropriate MIME type
    const blob = new Blob([content], { type: mimeType });
    
    // Create temporary download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Download failed:', error);
    throw new Error('Failed to download file');
  }
};

/**
 * Get MIME type and extension for format type
 */
export const getFileTypeInfo = (type: 'JSON' | 'XML') => {
  switch (type) {
    case 'JSON':
      return {
        mimeType: 'application/json',
        extension: 'json',
      };
    case 'XML':
      return {
        mimeType: 'application/xml',
        extension: 'xml',
      };
    default:
      return {
        mimeType: 'text/plain',
        extension: 'txt',
      };
  }
};

