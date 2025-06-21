// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { resolvePath } from './pathResolver'

describe('resolvePath', () => {
  const testData = {
    users: [
      { id: 1, name: 'Alice', profile: { age: 25, city: 'Tokyo' } },
      { id: 2, name: 'Bob', profile: { age: 30, city: 'Osaka' } }
    ],
    settings: {
      theme: 'dark',
      language: 'ja',
      nested: {
        deep: {
          value: 'found'
        }
      }
    },
    items: ['apple', 'banana', 'orange'],
    nullValue: null,
    undefinedValue: undefined,
    emptyObject: {},
    emptyArray: []
  }

  describe('absolute paths (starting with /)', () => {
    it('should resolve simple property access', () => {
      const result = resolvePath('/settings/theme', [], testData)
      expect(result).toBe('dark')
    })

    it('should resolve array index access', () => {
      const result = resolvePath('/users/0/name', [], testData)
      expect(result).toBe('Alice')
    })

    it('should resolve nested object access', () => {
      const result = resolvePath('/users/1/profile/city', [], testData)
      expect(result).toBe('Osaka')
    })

    it('should resolve deep nested paths', () => {
      const result = resolvePath('/settings/nested/deep/value', [], testData)
      expect(result).toBe('found')
    })

    it('should return undefined for non-existent paths', () => {
      const result = resolvePath('/settings/nonexistent', [], testData)
      expect(result).toBeUndefined()
    })

    it('should handle array access with string indices', () => {
      const result = resolvePath('/items/1', [], testData)
      expect(result).toBe('banana')
    })

    it('should handle array notation with bracket', () => {
      const result = resolvePath('/items[1]', [], testData)
      expect(result).toBe('banana')
    })

    it('should handle null values in path', () => {
      const result = resolvePath('/nullValue/property', [], testData)
      expect(result).toBeUndefined()
    })

    it('should return empty objects and arrays', () => {
      expect(resolvePath('/emptyObject', [], testData)).toEqual({})
      expect(resolvePath('/emptyArray', [], testData)).toEqual([])
    })

    it('should handle root path', () => {
      const result = resolvePath('/', [], testData)
      expect(result).toEqual(testData)
    })
  })

  describe('relative paths (starting with ./ or ../)', () => {
    it('should resolve same level property with ./', () => {
      // When current path is ['settings', 'theme']
      const result = resolvePath('./language', ['settings', 'theme'], testData)
      expect(result).toBe('ja')
    })

    it('should resolve parent level property with ../', () => {
      // When current path is ['settings', 'nested', 'deep']
      const result = resolvePath('../theme', ['settings', 'nested', 'deep'], testData)
      expect(result).toBeUndefined() // because we go up from deep to nested, theme is not there
      
      // Go up two levels
      const result2 = resolvePath('../../theme', ['settings', 'nested', 'deep'], testData)
      expect(result2).toBe('dark')
    })

    it('should resolve parent reference from array element', () => {
      // When current is users[0]
      const result = resolvePath('../1/name', ['users', '0'], testData)
      expect(result).toBe('Bob')
    })

    it('should handle simple property name (without ./ prefix)', () => {
      // When current path is ['settings']
      const result = resolvePath('theme', ['settings', 'dummy'], testData)
      expect(result).toBe('dark')
    })
  })

  describe('array indices handling', () => {
    it('should handle array with @ notation and array indices map', () => {
      const arrayIndices = new Map([['items', 2]])
      const result = resolvePath('/items[@]', [], testData, arrayIndices)
      expect(result).toBe('orange')
    })

    it('should handle array with * notation (backward compatibility)', () => {
      const arrayIndices = new Map([['items', 1]])
      const result = resolvePath('/items[*]', [], testData, arrayIndices)
      expect(result).toBe('banana')
    })

    it('should handle nested arrays with indices', () => {
      const nestedData = {
        matrix: [
          [{ value: 1 }, { value: 2 }],
          [{ value: 3 }, { value: 4 }]
        ]
      }
      
      const result = resolvePath('/matrix/0/1/value', [], nestedData)
      expect(result).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle empty path', () => {
      const result = resolvePath('', ['settings'], testData)
      expect(result).toBeUndefined()
    })

    it('should handle null or undefined data', () => {
      expect(resolvePath('/test', [], null)).toBeUndefined()
      expect(resolvePath('/test', [], undefined)).toBeUndefined()
    })

    it('should handle accessing properties on primitives', () => {
      const data = { value: 'string' }
      const result = resolvePath('/value/length', [], data)
      expect(result).toBe(6) // 'string'.length
    })

    it('should handle circular references gracefully', () => {
      const circular: any = { a: 1 }
      circular.self = circular
      
      const result = resolvePath('/self/self/a', [], circular)
      expect(result).toBe(1)
    })

    it('should handle invalid array indices', () => {
      const result = resolvePath('/items/10', [], testData)
      expect(result).toBeUndefined()
      
      const result2 = resolvePath('/items/-1', [], testData)
      expect(result2).toBeUndefined()
    })

    it('should handle special property names', () => {
      const data = {
        'special-key': 'value',
        'key.with.dots': 'dotted',
        'key with spaces': 'spaced'
      }
      
      expect(resolvePath('/special-key', [], data)).toBe('value')
      expect(resolvePath('/key.with.dots', [], data)).toBe('dotted')
      expect(resolvePath('/key with spaces', [], data)).toBe('spaced')
    })
  })

  describe('complex scenarios', () => {
    it('should resolve through multiple array levels', () => {
      const complexData = {
        departments: [
          {
            name: 'Engineering',
            teams: [
              { name: 'Frontend', members: ['Alice', 'Bob'] },
              { name: 'Backend', members: ['Charlie', 'David'] }
            ]
          }
        ]
      }
      
      const result = resolvePath('/departments/0/teams/1/members/0', [], complexData)
      expect(result).toBe('Charlie')
    })

    it('should work with mixed array bracket notation', () => {
      const data = {
        items: [
          { values: [10, 20, 30] }
        ]
      }
      
      const result = resolvePath('/items[0]/values/2', [], data)
      expect(result).toBe(30)
    })

    it('should handle function properties', () => {
      const data = {
        fn: () => 'result',
        obj: {
          method: function() { return 'method result' }
        }
      }
      
      const fn = resolvePath('/fn', [], data)
      const method = resolvePath('/obj/method', [], data)
      
      expect(typeof fn).toBe('function')
      expect(typeof method).toBe('function')
    })
  })
})