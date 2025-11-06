/**
 * XML Normalization Utility
 * 
 * Provides functionality to normalize XML by sorting attributes alphabetically
 * This allows comparing XML documents regardless of attribute order
 */

/**
 * Normalize XML by sorting attributes alphabetically
 * This allows comparing XML documents regardless of attribute order
 */
export const normalizeXMLAttributes = (xmlString: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('Invalid XML');
    }
    
    // Recursively sort attributes in all elements
    const sortAttributes = (node: Element) => {
      if (node.attributes && node.attributes.length > 0) {
        // Extract all attributes
        const attrs: Array<{ name: string; value: string }> = [];
        for (let i = 0; i < node.attributes.length; i++) {
          const attr = node.attributes[i];
          attrs.push({ name: attr.name, value: attr.value });
        }
        
        // Sort by attribute name
        attrs.sort((a, b) => a.name.localeCompare(b.name));
        
        // Remove all attributes
        while (node.attributes.length > 0) {
          node.removeAttribute(node.attributes[0].name);
        }
        
        // Re-add in sorted order
        attrs.forEach(attr => {
          node.setAttribute(attr.name, attr.value);
        });
      }
      
      // Recursively process child elements
      for (let i = 0; i < node.children.length; i++) {
        sortAttributes(node.children[i]);
      }
    };
    
    // Start sorting from root element
    if (xmlDoc.documentElement) {
      sortAttributes(xmlDoc.documentElement);
    }
    
    // Serialize back to string
    const serializer = new XMLSerializer();
    let normalized = serializer.serializeToString(xmlDoc);
    
    // Format for readability
    normalized = normalized
      .replace(/></g, '>\n<')
      .split('\n')
      .map((line, index, arr) => {
        const trimmed = line.trim();
        const depth = arr.slice(0, index).reduce((d, l) => {
          if (l.trim().startsWith('</')) return d - 1;
          if (l.trim().startsWith('<') && 
              !l.trim().startsWith('<?') && 
              !l.trim().endsWith('/>')) return d + 1;
          return d;
        }, 0);
        return '  '.repeat(Math.max(0, depth)) + trimmed;
      })
      .join('\n');
    
    return normalized;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('XML normalization error:', error);
    // Return original if normalization fails
    return xmlString;
  }
};

