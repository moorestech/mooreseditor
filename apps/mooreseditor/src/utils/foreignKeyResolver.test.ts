import { describe, it, expect } from 'vitest';
import { ForeignKeyResolver, validateForeignKeyPath } from './foreignKeyResolver';

// Test data
const testData = {
  data: [
    {
      itemGuid: 'item-001',
      name: 'Iron Ore',
      category: 'resource'
    },
    {
      itemGuid: 'item-002',
      name: 'Copper Wire',
      category: 'component'
    },
    {
      itemGuid: 'item-003',
      name: 'Steel Plate',
      category: 'material'
    }
  ]
};

describe('ForeignKeyResolver', () => {
  describe('getAllOptions', () => {
    it('should expand [*] patterns and return all options', () => {
      const resolver = new ForeignKeyResolver(testData, {
        schemaId: 'items',
        foreignKeyIdPath: '/data/[*]/itemGuid',
        displayElementPath: '/data/[*]/name'
      });

      const options = resolver.getAllOptions();
      
      expect(options).toHaveLength(3);
      expect(options[0]).toEqual({
        id: 'item-001',
        display: 'Iron Ore',
        path: '/data/0/itemGuid',
        indices: new Map([['data', 0]])
      });
      expect(options[1]).toEqual({
        id: 'item-002',
        display: 'Copper Wire',
        path: '/data/1/itemGuid',
        indices: new Map([['data', 1]])
      });
      expect(options[2]).toEqual({
        id: 'item-003',
        display: 'Steel Plate',
        path: '/data/2/itemGuid',
        indices: new Map([['data', 2]])
      });
    });

    it('should handle nested array patterns', () => {
      const nestedData = {
        categories: [
          {
            name: 'Resources',
            items: [
              { id: 'r1', label: 'Wood' },
              { id: 'r2', label: 'Stone' }
            ]
          },
          {
            name: 'Tools',
            items: [
              { id: 't1', label: 'Hammer' },
              { id: 't2', label: 'Saw' }
            ]
          }
        ]
      };

      const resolver = new ForeignKeyResolver(nestedData, {
        schemaId: 'nested',
        foreignKeyIdPath: '/categories/[*]/items/[*]/id',
        displayElementPath: '/categories/[*]/items/[*]/label'
      });

      const options = resolver.getAllOptions();
      
      expect(options).toHaveLength(4);
      expect(options.map(o => o.display)).toEqual(['Wood', 'Stone', 'Hammer', 'Saw']);
    });
  });

  describe('getDisplayByForeignKey', () => {
    it('should return display value for given ID', () => {
      const resolver = new ForeignKeyResolver(testData, {
        schemaId: 'items',
        foreignKeyIdPath: '/data/[*]/itemGuid',
        displayElementPath: '/data/[*]/name'
      });

      expect(resolver.getDisplayByForeignKey('item-002')).toBe('Copper Wire');
      expect(resolver.getDisplayByForeignKey('non-existent')).toBeNull();
    });
  });

  describe('findIndicesByForeignKey', () => {
    it('should return indices for given ID', () => {
      const resolver = new ForeignKeyResolver(testData, {
        schemaId: 'items',
        foreignKeyIdPath: '/data/[*]/itemGuid',
        displayElementPath: '/data/[*]/name'
      });

      const indices = resolver.findIndicesByForeignKey('item-002');
      expect(indices).toEqual(new Map([['data', 1]]));
    });
  });
});

describe('validateForeignKeyPath', () => {
  it('should validate correct paths', () => {
    expect(validateForeignKeyPath('/data/[*]/id')).toEqual({ valid: true });
    expect(validateForeignKeyPath('/items/[*]/name')).toEqual({ valid: true });
    expect(validateForeignKeyPath('/nested/[*]/items/[*]/value')).toEqual({ valid: true });
  });

  it('should reject invalid paths', () => {
    expect(validateForeignKeyPath('')).toEqual({ 
      valid: false, 
      error: 'Path cannot be empty' 
    });
    
    expect(validateForeignKeyPath('data/[*]/id')).toEqual({ 
      valid: false, 
      error: 'Foreign key paths must be absolute (start with /)' 
    });
    
    expect(validateForeignKeyPath('/data/[]/id')).toEqual({ 
      valid: false, 
      error: 'Invalid array notation in segment: []. Use format: name[*]' 
    });
    
    expect(validateForeignKeyPath('/data/[@]/id')).toEqual({ 
      valid: false, 
      error: 'Invalid array notation in segment: [@]. Use format: name[*]' 
    });
  });
});