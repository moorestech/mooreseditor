// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { getTableColumns } from './ui'
import type { ArraySchema, ObjectSchema } from './types'

describe('ui', () => {
  describe('getTableColumns', () => {
    it('should return column keys for array of objects', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'integer' },
            { key: 'name', type: 'string' },
            { key: 'active', type: 'boolean' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'name', 'active'])
    })

    it('should filter out object properties', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'integer' },
            { key: 'name', type: 'string' },
            { key: 'metadata', type: 'object', properties: [] }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'name'])
    })

    it('should filter out array properties', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'integer' },
            { key: 'tags', type: 'array', items: { type: 'string' } },
            { key: 'title', type: 'string' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'title'])
    })

    it('should handle empty properties', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: []
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual([])
    })

    it('should filter out switch properties', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'integer' },
            { 
              key: 'dynamic',
              switch: 'type',
              cases: []
            } as any,
            { key: 'name', type: 'string' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'name'])
    })

    it('should throw error for non-object array items', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'string'
        }
      }
      
      expect(() => getTableColumns(schema)).toThrow('objectを要素に持たないarrayはテーブル表示できません')
    })

    it('should handle all primitive types', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'string', type: 'string' },
            { key: 'integer', type: 'integer' },
            { key: 'number', type: 'number' },
            { key: 'boolean', type: 'boolean' },
            { key: 'uuid', type: 'uuid' },
            { key: 'enum', type: 'enum', options: ['a', 'b'] },
            { key: 'vector2', type: 'vector2' },
            { key: 'vector3', type: 'vector3' },
            { key: 'vector4', type: 'vector4' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual([
        'string', 'integer', 'number', 'boolean', 
        'uuid', 'enum', 'vector2', 'vector3', 'vector4'
      ])
    })

    it('should handle mixed properties correctly', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'uuid' },
            { key: 'data', type: 'object', properties: [] },
            { key: 'name', type: 'string' },
            { key: 'items', type: 'array', items: { type: 'string' } },
            { key: 'count', type: 'integer' },
            { key: 'settings', type: 'object', properties: [] },
            { key: 'active', type: 'boolean' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'name', 'count', 'active'])
    })

    it('should handle object with ref property', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'string' },
            { key: 'ref', type: 'object', ref: 'someRef' } as any,
            { key: 'value', type: 'number' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['id', 'value'])
    })

    it('should handle all vector types', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'v2', type: 'vector2' },
            { key: 'v3', type: 'vector3' },
            { key: 'v4', type: 'vector4' },
            { key: 'v2int', type: 'vector2Int' },
            { key: 'v3int', type: 'vector3Int' },
            { key: 'v4int', type: 'vector4Int' }
          ]
        }
      }
      
      const columns = getTableColumns(schema)
      expect(columns).toEqual(['v2', 'v3', 'v4', 'v2int', 'v3int', 'v4int'])
    })
  })
})