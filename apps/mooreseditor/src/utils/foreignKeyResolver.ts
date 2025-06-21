import { resolvePath } from './pathResolver';
import type { ForeignKeyConfig } from '../libs/schema/types';

export interface ForeignKeyOption {
  id: any;
  display: string;
  path: string; // For debugging: the actual resolved path
  indices: Map<string, number>; // The array indices used to get this value
}

interface PathResult {
  value: any;
  path: string;
  indices: Map<string, number>;
}

export class ForeignKeyResolver {
  constructor(
    private rootData: any,
    private config: ForeignKeyConfig
  ) {
    console.log('ForeignKeyResolver initialized with:', {
      dataKeys: Object.keys(this.rootData || {}),
      dataType: typeof this.rootData,
      config
    });
  }

  /**
   * Get all available options for the foreign key dropdown
   */
  getAllOptions(): ForeignKeyOption[] {
    console.log('getAllOptions called, expanding paths:', {
      foreignKeyIdPath: this.config.foreignKeyIdPath,
      displayElementPath: this.config.displayElementPath
    });
    
    const idResults = this.expandAllPaths(this.config.foreignKeyIdPath);
    const displayResults = this.expandAllPaths(this.config.displayElementPath);
    
    console.log('Path expansion results:', {
      idResults: idResults.length,
      displayResults: displayResults.length
    });
    
    return this.pairResults(idResults, displayResults);
  }

  /**
   * Get display value for a given foreign key ID
   */
  getDisplayByForeignKey(foreignKeyValue: any): string | null {
    const options = this.getAllOptions();
    const option = options.find(opt => opt.id === foreignKeyValue);
    return option?.display ?? null;
  }

  /**
   * Find the array indices for a given foreign key value
   */
  findIndicesByForeignKey(foreignKeyValue: any): Map<string, number> | null {
    const options = this.getAllOptions();
    const option = options.find(opt => opt.id === foreignKeyValue);
    return option?.indices ?? null;
  }

  /**
   * Expand a path pattern containing [*] to all concrete paths
   * e.g., /data/[*]/itemGuid → [{value: "123", path: "/data/0/itemGuid", indices: Map}]
   */
  private expandAllPaths(pathPattern: string): PathResult[] {
    const results: PathResult[] = [];
    
    console.log('expandAllPaths called with:', pathPattern);
    
    // Handle path splitting with array notation
    // Convert /data/[*]/itemGuid to segments ['data[*]', 'itemGuid']
    // First remove leading slash
    const normalizedPath = pathPattern.startsWith('/') ? pathPattern.slice(1) : pathPattern;
    console.log('Normalized path:', normalizedPath);
    
    // Simple approach: replace [*] pattern to merge it with previous segment
    const mergedPath = normalizedPath.replace(/\/\[\*\]/g, '[*]');
    const segments = mergedPath.split('/');
    
    console.log('Path segments:', segments);
    
    // Recursively expand paths with [*]
    this.expandPathRecursive(
      this.rootData,
      segments,
      0,
      [],
      new Map<string, number>(),
      results
    );
    
    console.log('expandAllPaths results:', results);
    return results;
  }

  /**
   * Recursively expand path segments, handling [*] patterns
   */
  private expandPathRecursive(
    currentData: any,
    segments: string[],
    segmentIndex: number,
    currentPath: string[],
    currentIndices: Map<string, number>,
    results: PathResult[]
  ): void {
    // Base case: reached the end of segments
    if (segmentIndex >= segments.length) {
      results.push({
        value: currentData,
        path: '/' + currentPath.join('/'),
        indices: new Map(currentIndices)
      });
      return;
    }

    const segment = segments[segmentIndex];
    console.log(`Processing segment ${segmentIndex}: "${segment}", current data type:`, typeof currentData);
    
    // Check if this is a property with array notation like data[*]
    const arrayMatch = segment.match(/^(.+)\[\*\]$/);
    if (arrayMatch) {
        const arrayName = arrayMatch[1];
        const arrayData = currentData?.[arrayName];
        
        if (Array.isArray(arrayData)) {
          console.log(`Expanding ${arrayName} array with ${arrayData.length} elements`);
          // Expand all array elements
          arrayData.forEach((item, index) => {
            const newPath = [...currentPath, arrayName, index.toString()];
            const newIndices = new Map(currentIndices);
            newIndices.set(currentPath.concat(arrayName).join('/'), index);
            
            this.expandPathRecursive(
              item,
              segments,
              segmentIndex + 1,
              newPath,
              newIndices,
              results
            );
          });
      } else {
        console.log(`Expected ${arrayName} to be an array but got:`, typeof arrayData);
      }
    } else {
      // Regular property access
      const nextData = currentData?.[segment];
      console.log(`Accessing property "${segment}", got:`, typeof nextData);
      if (nextData !== undefined) {
        this.expandPathRecursive(
          nextData,
          segments,
          segmentIndex + 1,
          [...currentPath, segment],
          currentIndices,
          results
        );
      }
    }
  }

  /**
   * Pair ID results with display results based on matching indices
   */
  private pairResults(idResults: PathResult[], displayResults: PathResult[]): ForeignKeyOption[] {
    const options: ForeignKeyOption[] = [];
    
    // Match results based on their indices
    idResults.forEach(idResult => {
      // Find the display result with matching indices
      const matchingDisplay = displayResults.find(displayResult => 
        this.indicesMatch(idResult.indices, displayResult.indices)
      );
      
      if (matchingDisplay) {
        options.push({
          id: idResult.value,
          display: String(matchingDisplay.value || ''),
          path: idResult.path,
          indices: idResult.indices
        });
      }
    });
    
    return options;
  }

  /**
   * Check if two index maps match
   */
  private indicesMatch(indices1: Map<string, number>, indices2: Map<string, number>): boolean {
    if (indices1.size !== indices2.size) return false;
    
    for (const [key, value] of indices1) {
      if (indices2.get(key) !== value) return false;
    }
    
    return true;
  }
}

/**
 * Convenience function to create a resolver and get all options
 */
export function resolveForeignKeyOptions(
  rootData: any,
  config: ForeignKeyConfig
): ForeignKeyOption[] {
  const resolver = new ForeignKeyResolver(rootData, config);
  return resolver.getAllOptions();
}

/**
 * Validate that a foreign key path is syntactically correct
 */
export function validateForeignKeyPath(path: string): { valid: boolean; error?: string } {
  if (!path) {
    return { valid: false, error: 'Path cannot be empty' };
  }
  
  if (!path.startsWith('/')) {
    return { valid: false, error: 'Foreign key paths must be absolute (start with /)' };
  }
  
  // Check for valid segment patterns
  const segments = path.split('/').filter(Boolean);
  for (const segment of segments) {
    // Check if it's a valid array notation
    if (segment.includes('[')) {
      const arrayMatch = segment.match(/^(.+)\[\*\]$/);
      if (!arrayMatch || !arrayMatch[1]) {
        return { valid: false, error: `Invalid array notation in segment: ${segment}. Use format: name[*]` };
      }
    }
  }
  
  return { valid: true };
}