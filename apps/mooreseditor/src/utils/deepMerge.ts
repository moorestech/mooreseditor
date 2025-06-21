/**
 * Deep merge two objects recursively
 * @param target - The target object to merge into
 * @param source - The source object to merge from
 * @returns The merged object
 */
export function deepMerge(target: any, source: any): any {
  if (!source || typeof source !== 'object') return source;
  if (!target || typeof target !== 'object') return source;
  
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        source[key] && 
        typeof source[key] === 'object' && 
        !Array.isArray(source[key]) &&
        !(source[key] instanceof Date) &&
        source[key].constructor === Object
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}