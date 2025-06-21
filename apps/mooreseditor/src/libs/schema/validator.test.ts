// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { createValidator, validateData } from './validator'
import { z } from 'zod'
import type { Schema } from './types'

describe('validator', () => {
  describe('createValidator', () => {
    it('should create validator for string schema', () => {
      const schema: Schema = { type: 'string' }
      const validator = createValidator(schema)
      
      expect(validator.parse('test')).toBe('test')
      expect(() => validator.parse(123)).toThrow()
    })

    it('should create validator for integer schema', () => {
      const schema: Schema = { type: 'integer' }
      const validator = createValidator(schema)
      
      expect(validator.parse(42)).toBe(42)
      expect(() => validator.parse(3.14)).toThrow()
      expect(() => validator.parse('42')).toThrow()
    })

    it('should create validator for number schema', () => {
      const schema: Schema = { type: 'number' }
      const validator = createValidator(schema)
      
      expect(validator.parse(3.14)).toBe(3.14)
      expect(validator.parse(42)).toBe(42)
      expect(() => validator.parse('3.14')).toThrow()
    })

    it('should create validator for boolean schema', () => {
      const schema: Schema = { type: 'boolean' }
      const validator = createValidator(schema)
      
      expect(validator.parse(true)).toBe(true)
      expect(validator.parse(false)).toBe(false)
      expect(() => validator.parse('true')).toThrow()
    })

    it('should handle string with enum', () => {
      const schema: Schema = { type: 'string', enum: ['red', 'green', 'blue'] }
      const validator = createValidator(schema)
      
      expect(validator.parse('red')).toBe('red')
      expect(validator.parse('blue')).toBe('blue')
      expect(() => validator.parse('yellow')).toThrow()
    })

    it('should handle string with minLength and maxLength', () => {
      const schema: Schema = { type: 'string', minLength: 3, maxLength: 10 }
      const validator = createValidator(schema)
      
      expect(validator.parse('test')).toBe('test')
      expect(() => validator.parse('ab')).toThrow()
      expect(() => validator.parse('this is too long')).toThrow()
    })

    it('should handle string with pattern', () => {
      const schema: Schema = { type: 'string', pattern: '^[A-Z][a-z]+$' }
      const validator = createValidator(schema)
      
      expect(validator.parse('Hello')).toBe('Hello')
      expect(() => validator.parse('hello')).toThrow()
      expect(() => validator.parse('HELLO')).toThrow()
    })

    it('should handle string with format email', () => {
      const schema: Schema = { type: 'string', format: 'email' }
      const validator = createValidator(schema)
      
      expect(validator.parse('test@example.com')).toBe('test@example.com')
      expect(() => validator.parse('invalid-email')).toThrow()
    })

    it('should handle string with format uuid', () => {
      const schema: Schema = { type: 'string', format: 'uuid' }
      const validator = createValidator(schema)
      
      expect(validator.parse('123e4567-e89b-12d3-a456-426614174000')).toBe('123e4567-e89b-12d3-a456-426614174000')
      expect(() => validator.parse('not-a-uuid')).toThrow()
    })

    it('should handle integer with minimum and maximum', () => {
      const schema: Schema = { type: 'integer', minimum: 0, maximum: 100 }
      const validator = createValidator(schema)
      
      expect(validator.parse(50)).toBe(50)
      expect(validator.parse(0)).toBe(0)
      expect(validator.parse(100)).toBe(100)
      expect(() => validator.parse(-1)).toThrow()
      expect(() => validator.parse(101)).toThrow()
    })

    it('should handle number with minimum and maximum', () => {
      const schema: Schema = { type: 'number', minimum: 0.0, maximum: 1.0 }
      const validator = createValidator(schema)
      
      expect(validator.parse(0.5)).toBe(0.5)
      expect(validator.parse(0.0)).toBe(0.0)
      expect(validator.parse(1.0)).toBe(1.0)
      expect(() => validator.parse(-0.1)).toThrow()
      expect(() => validator.parse(1.1)).toThrow()
    })

    it('should handle array schema', () => {
      const schema: Schema = { 
        type: 'array', 
        items: { type: 'string' } 
      }
      const validator = createValidator(schema)
      
      expect(validator.parse(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
      expect(validator.parse([])).toEqual([])
      expect(() => validator.parse(['a', 1, 'c'])).toThrow()
    })

    it('should handle array with minItems and maxItems', () => {
      const schema: Schema = { 
        type: 'array', 
        items: { type: 'number' },
        minItems: 2,
        maxItems: 5
      }
      const validator = createValidator(schema)
      
      expect(validator.parse([1, 2, 3])).toEqual([1, 2, 3])
      expect(() => validator.parse([1])).toThrow()
      expect(() => validator.parse([1, 2, 3, 4, 5, 6])).toThrow()
    })

    it('should handle array with format vector2', () => {
      const schema: Schema = { type: 'array', format: 'vector2' }
      const validator = createValidator(schema)
      
      expect(validator.parse([1, 2])).toEqual([1, 2])
      expect(() => validator.parse([1, 2, 3])).toThrow()
      expect(() => validator.parse([1])).toThrow()
    })

    it('should handle array with format vector3', () => {
      const schema: Schema = { type: 'array', format: 'vector3' }
      const validator = createValidator(schema)
      
      expect(validator.parse([1, 2, 3])).toEqual([1, 2, 3])
      expect(() => validator.parse([1, 2])).toThrow()
      expect(() => validator.parse([1, 2, 3, 4])).toThrow()
    })

    it('should handle array with format vector4', () => {
      const schema: Schema = { type: 'array', format: 'vector4' }
      const validator = createValidator(schema)
      
      expect(validator.parse([1, 2, 3, 4])).toEqual([1, 2, 3, 4])
      expect(() => validator.parse([1, 2, 3])).toThrow()
      expect(() => validator.parse([1, 2, 3, 4, 5])).toThrow()
    })

    it('should handle object schema', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' }
        },
        required: ['name']
      }
      const validator = createValidator(schema)
      
      expect(validator.parse({ name: 'John', age: 30 })).toEqual({ name: 'John', age: 30 })
      expect(validator.parse({ name: 'Jane' })).toEqual({ name: 'Jane' })
      expect(() => validator.parse({ age: 30 })).toThrow()
    })

    it('should handle nested object schema', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            },
            required: ['name', 'email']
          }
        },
        required: ['user']
      }
      const validator = createValidator(schema)
      
      expect(validator.parse({
        user: { name: 'John', email: 'john@example.com' }
      })).toEqual({
        user: { name: 'John', email: 'john@example.com' }
      })
      
      expect(() => validator.parse({
        user: { name: 'John' }
      })).toThrow()
    })

    it('should handle additionalProperties', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        additionalProperties: false
      }
      const validator = createValidator(schema)
      
      expect(validator.parse({ name: 'John' })).toEqual({ name: 'John' })
      expect(() => validator.parse({ name: 'John', extra: 'field' })).toThrow()
    })

    it('should handle nullable values', () => {
      const schema: Schema = { type: 'string', nullable: true }
      const validator = createValidator(schema)
      
      expect(validator.parse('test')).toBe('test')
      expect(validator.parse(null)).toBe(null)
      expect(() => validator.parse(undefined)).toThrow()
    })

    it('should handle default values', () => {
      const schema: Schema = { type: 'string', default: 'default value' }
      const validator = createValidator(schema)
      
      // Note: Zod doesn't handle defaults in parse, only in schemas with .default()
      expect(validator.parse('test')).toBe('test')
    })

    it('should handle unknown schema type', () => {
      const schema: any = { type: 'unknown' }
      const validator = createValidator(schema)
      
      // Should return z.any() for unknown types
      expect(validator.parse('anything')).toBe('anything')
      expect(validator.parse(123)).toBe(123)
      expect(validator.parse(null)).toBe(null)
    })
  })

  describe('validateData', () => {
    it('should validate data against schema', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' }
        },
        required: ['name']
      }
      
      const validData = { name: 'John', age: 30 }
      const result = validateData(validData, schema)
      
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
      expect(result.error).toBeUndefined()
    })

    it('should return error for invalid data', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          age: { type: 'integer' }
        },
        required: ['name']
      }
      
      const invalidData = { age: '30' } // Missing required name, wrong type for age
      const result = validateData(invalidData, schema)
      
      expect(result.success).toBe(false)
      expect(result.data).toBeUndefined()
      expect(result.error).toBeDefined()
    })

    it('should handle complex validation', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 3, maxLength: 50 },
          email: { type: 'string', format: 'email' },
          age: { type: 'integer', minimum: 18, maximum: 120 },
          tags: { type: 'array', items: { type: 'string' }, minItems: 1 },
          settings: {
            type: 'object',
            properties: {
              theme: { type: 'string', enum: ['light', 'dark'] },
              notifications: { type: 'boolean' }
            },
            required: ['theme']
          }
        },
        required: ['id', 'name', 'email']
      }
      
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        tags: ['user', 'admin'],
        settings: {
          theme: 'dark',
          notifications: true
        }
      }
      
      const result = validateData(validData, schema)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })

    it('should handle array of objects', () => {
      const schema: Schema = {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            name: { type: 'string' }
          },
          required: ['id', 'name']
        }
      }
      
      const validData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ]
      
      const result = validateData(validData, schema)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(validData)
    })
  })
})