// AI Generated Test Code
import { describe, it, expect } from 'vitest'

import { createSchemaValidator } from './validator'

import type { SchemaContainer } from './types'

describe('validator', () => {
  describe('createSchemaValidator', () => {
    it('should validate string schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'string' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      // Should validate actual data according to the schema
      const validData = ['hello', 'world']
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid data
      expect(() => validator.parse([1, 2, 3])).toThrow()
      expect(() => validator.parse('not an array')).toThrow()
    })

    it('should validate integer schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'integer' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [1, 2, 3]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on non-integer data
      expect(() => validator.parse([1.5, 2.7])).toThrow()
      expect(() => validator.parse(['not', 'integers'])).toThrow()
    })

    it('should validate number schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'number' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [1, 2.5, 3.14]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on non-number data
      expect(() => validator.parse(['not', 'numbers'])).toThrow()
    })

    it('should validate boolean schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'boolean' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [true, false, true]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on non-boolean data
      expect(() => validator.parse([1, 0])).toThrow()
    })

    it('should validate enum schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'enum', options: ['red', 'green', 'blue'] }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = ['red', 'blue', 'green']
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid enum values
      expect(() => validator.parse(['red', 'yellow'])).toThrow()
    })

    it('should validate uuid schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'uuid' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = ['550e8400-e29b-41d4-a716-446655440000']
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid UUID
      expect(() => validator.parse(['not-a-uuid'])).toThrow()
    })

    it('should validate vector2 schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'vector2' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [[1, 2], [3.5, 4.5]]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid vector data
      expect(() => validator.parse([[1]])).toThrow()
      expect(() => validator.parse([[1, 2, 3]])).toThrow()
    })

    it('should validate vector3 schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'vector3' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [[1, 2, 3], [4.5, 5.5, 6.5]]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid vector data
      expect(() => validator.parse([[1, 2]])).toThrow()
    })

    it('should validate vector4 schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'vector4' }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [[1, 2, 3, 4], [5.5, 6.5, 7.5, 8.5]]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid vector data
      expect(() => validator.parse([[1, 2, 3]])).toThrow()
    })

    it('should validate object schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'name', type: 'string' },
            { key: 'age', type: 'integer' }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid object data
      expect(() => validator.parse([{ name: 'John', age: '30' }])).toThrow()
    })

    it('should validate nested array schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'integer' }
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [[1, 2], [3, 4], [5, 6]]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on invalid nested array data
      expect(() => validator.parse([[1, 'two']])).toThrow()
    })

    it('should validate schema with optional fields', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'required', type: 'string' },
            { key: 'optional', type: 'string', optional: true }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [
        { required: 'value' },
        { required: 'value', optional: 'optional value' }
      ]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw when required field is missing
      expect(() => validator.parse([{ optional: 'value' }])).toThrow()
    })

    it('should validate schema with default values', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'name', type: 'string', default: 'Unknown' },
            { key: 'age', type: 'integer', default: 0 }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      // Note: Zod's default values work on parse, not on missing fields in existing objects
      const validData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      expect(validator.parse(validData)).toEqual(validData)
    })

    it('should validate integer schema with min and max', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'integer', min: 0, max: 100 }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [0, 50, 100]
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on values outside range
      expect(() => validator.parse([-1])).toThrow()
      expect(() => validator.parse([101])).toThrow()
    })

    it('should validate array schema with minLength and maxLength', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: { type: 'string' },
        minLength: 2,
        maxLength: 4
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = ['a', 'b', 'c']
      expect(validator.parse(validData)).toEqual(validData)
      
      // Should throw on arrays outside length range
      expect(() => validator.parse(['a'])).toThrow()
      expect(() => validator.parse(['a', 'b', 'c', 'd', 'e'])).toThrow()
    })

    it('should validate nested object schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'name', type: 'string' },
            {
              key: 'address',
              type: 'object',
              properties: [
                { key: 'street', type: 'string' },
                { key: 'city', type: 'string' }
              ]
            }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [
        {
          name: 'John',
          address: {
            street: '123 Main St',
            city: 'New York'
          }
        }
      ]
      expect(validator.parse(validData)).toEqual(validData)
    })

    it('should handle object schema with ref', () => {
      const referencedSchema: SchemaContainer = {
        id: 'person',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'name', type: 'string' },
            { key: 'age', type: 'integer' }
          ]
        }
      }
      
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          ref: 'person'
        }
      }
      
      const validator = createSchemaValidator(schemaContainer, [referencedSchema])
      
      const validData = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 }
      ]
      expect(validator.parse(validData)).toEqual(validData)
    })

    it('should validate schema container without referenced schema', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          ref: 'nonexistent'
        }
      }
      
      // Should throw when referenced schema is not found
      expect(() => createSchemaValidator(schemaContainer)).toThrow('Referenced schema with id "nonexistent" not found')
    })

    it('should validate complex nested schema container', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'id', type: 'uuid' },
            { key: 'type', type: 'enum', options: ['user', 'admin'] },
            {
              key: 'profile',
              type: 'object',
              properties: [
                { key: 'name', type: 'string' },
                { key: 'tags', type: 'array', items: { type: 'string' } },
                { key: 'settings', type: 'object', properties: [
                  { key: 'theme', type: 'enum', options: ['light', 'dark'] },
                  { key: 'notifications', type: 'boolean', default: true }
                ]}
              ]
            }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      const validData = [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'admin',
        profile: {
          name: 'John Doe',
          tags: ['developer', 'designer'],
          settings: {
            theme: 'dark',
            notifications: false
          }
        }
      }]
      expect(validator.parse(validData)).toEqual(validData)
    })

    it('should validate vector int type schema containers', () => {
      const vector2IntSchema: SchemaContainer = {
        id: 'test2int',
        type: 'array',
        items: { type: 'vector2Int' }
      }
      const vector2IntValidator = createSchemaValidator(vector2IntSchema)
      expect(vector2IntValidator.parse([[1, 2], [3, 4]])).toEqual([[1, 2], [3, 4]])
      expect(() => vector2IntValidator.parse([[1.5, 2]])).toThrow()

      const vector3IntSchema: SchemaContainer = {
        id: 'test3int',
        type: 'array',
        items: { type: 'vector3Int' }
      }
      const vector3IntValidator = createSchemaValidator(vector3IntSchema)
      expect(vector3IntValidator.parse([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 2, 3], [4, 5, 6]])
      expect(() => vector3IntValidator.parse([[1, 2.5, 3]])).toThrow()

      const vector4IntSchema: SchemaContainer = {
        id: 'test4int',
        type: 'array',
        items: { type: 'vector4Int' }
      }
      const vector4IntValidator = createSchemaValidator(vector4IntSchema)
      expect(vector4IntValidator.parse([[1, 2, 3, 4], [5, 6, 7, 8]])).toEqual([[1, 2, 3, 4], [5, 6, 7, 8]])
      expect(() => vector4IntValidator.parse([[1, 2, 3, 4.5]])).toThrow()
    })

    it('should validate schema with extra properties', () => {
      const schemaContainer: SchemaContainer = {
        id: 'test',
        type: 'array',
        items: {
          type: 'object',
          properties: [
            { key: 'name', type: 'string' }
          ]
        }
      }
      const validator = createSchemaValidator(schemaContainer)
      
      // Should allow extra properties with passthrough
      const validData = [
        { name: 'John', extra: 'property', another: 123 }
      ]
      expect(validator.parse(validData)).toEqual(validData)
    })
  })
})