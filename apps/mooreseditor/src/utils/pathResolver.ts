/**
 * Resolves a path string to get the actual value from data
 * Supports various path formats:
 * - ./property - same level property
 * - /root/path - absolute path from root
 * - ../property - parent level property
 * - /path/array[0]/prop - specific array index
 * - /path/array[*]/prop - current array element
 */
export function resolvePath(
  path: string,
  currentPath: string[],
  rootData: any,
  arrayIndices?: Map<string, number>
): any {
  
  // Handle relative path starting with ./
  if (path.startsWith('./')) {
    const propertyName = path.slice(2);
    
    // Get the current object's data
    const currentData = getDataAtPath(currentPath.slice(0, -1), rootData, arrayIndices);
    
    return currentData?.[propertyName];
  }

  // Handle parent path starting with ../
  if (path.startsWith('../')) {
    let upLevels = 0;
    let remainingPath = path;
    
    // Count how many levels to go up
    while (remainingPath.startsWith('../')) {
      upLevels++;
      remainingPath = remainingPath.slice(3);
    }
    
    // Go up the specified number of levels
    const targetPath = currentPath.slice(0, -upLevels);
    
    // If there's a remaining path, resolve it
    if (remainingPath) {
      const targetData = getDataAtPath(targetPath, rootData, arrayIndices);
      return getValueByPath(targetData, remainingPath.split('/'), arrayIndices, [...targetPath]);
    }
    
    // Otherwise return the data at the target level
    return getDataAtPath(targetPath, rootData, arrayIndices);
  }

  // Handle absolute path starting with /
  if (path.startsWith('/')) {
    const pathParts = path.slice(1).split('/').filter(Boolean);
    return getValueByPath(rootData, pathParts, arrayIndices, []);
  }

  // Handle simple property name (same as ./)
  const parentData = getDataAtPath(currentPath.slice(0, -1), rootData, arrayIndices);
  return parentData?.[path];
}

/**
 * Get data at a specific path
 */
function getDataAtPath(
  path: string[],
  rootData: any,
  arrayIndices?: Map<string, number>
): any {
  let current = rootData;
  const fullPath: string[] = [];

  for (const part of path) {
    if (!current) return undefined;

    // Handle array notation
    const arrayMatch = part.match(/^(.+)\[(\d+|\*|@)\]$/);
    if (arrayMatch) {
      const [, arrayName, indexPart] = arrayMatch;
      current = current[arrayName];
      
      if (!Array.isArray(current)) return undefined;
      
      fullPath.push(arrayName);
      const index = indexPart === '@' 
        ? arrayIndices?.get(fullPath.join('/')) ?? 0
        : indexPart === '*' 
          ? arrayIndices?.get(fullPath.join('/')) ?? 0  // Keep for backward compatibility
          : parseInt(indexPart, 10);
        
      current = current[index];
    } else {
      // Check if the part is a numeric string (array index)
      const numericIndex = parseInt(part, 10);
      if (!isNaN(numericIndex) && Array.isArray(current)) {
        // This is an array index
        current = current[numericIndex];
      } else {
        // This is an object key
        current = current[part];
      }
      fullPath.push(part);
    }
  }

  return current;
}

/**
 * Get value by traversing path parts
 */
function getValueByPath(
  data: any,
  pathParts: string[],
  arrayIndices?: Map<string, number>,
  basePath: string[] = []
): any {
  let current = data;
  const fullPath = [...basePath];

  for (const part of pathParts) {
    if (!current) return undefined;

    // Handle array notation
    const arrayMatch = part.match(/^(.+)\[(\d+|\*|@)\]$/);
    if (arrayMatch) {
      const [, arrayName, indexPart] = arrayMatch;
      current = current[arrayName];
      
      if (!Array.isArray(current)) return undefined;
      
      fullPath.push(arrayName);
      const index = indexPart === '@' 
        ? arrayIndices?.get(fullPath.join('/')) ?? 0
        : indexPart === '*' 
          ? arrayIndices?.get(fullPath.join('/')) ?? 0  // Keep for backward compatibility
          : parseInt(indexPart, 10);
        
      current = current[index];
    } else {
      // Check if the part is a numeric string (array index)
      const numericIndex = parseInt(part, 10);
      if (!isNaN(numericIndex) && Array.isArray(current)) {
        // This is an array index
        current = current[numericIndex];
      } else {
        // This is an object key
        current = current[part];
      }
      fullPath.push(part);
    }
  }

  return current;
}