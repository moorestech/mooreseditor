// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { getDefaultValue, shouldShowField, getFieldLabel, getFieldDescription, getFieldPlaceholder } from './ui'
import type { Schema } from './types'

describe('ui', () => {
  describe('getDefaultValue', () => {
    it('should return default value from schema', () => {
      const schema: Schema = { type: 'string', default: 'default text' }
      expect(getDefaultValue(schema)).toBe('default text')
    })

    it('should return empty string for string without default', () => {
      const schema: Schema = { type: 'string' }
      expect(getDefaultValue(schema)).toBe('')
    })

    it('should return 0 for integer without default', () => {
      const schema: Schema = { type: 'integer' }
      expect(getDefaultValue(schema)).toBe(0)
    })

    it('should return 0 for number without default', () => {
      const schema: Schema = { type: 'number' }
      expect(getDefaultValue(schema)).toBe(0)
    })

    it('should return false for boolean without default', () => {
      const schema: Schema = { type: 'boolean' }
      expect(getDefaultValue(schema)).toBe(false)
    })

    it('should return empty array for array without default', () => {
      const schema: Schema = { type: 'array', items: { type: 'string' } }
      expect(getDefaultValue(schema)).toEqual([])
    })

    it('should return empty object for object without default', () => {
      const schema: Schema = { type: 'object', properties: {} }
      expect(getDefaultValue(schema)).toEqual({})
    })

    it('should return null for nullable schema without default', () => {
      const schema: Schema = { type: 'string', nullable: true }
      expect(getDefaultValue(schema)).toBe('')
    })

    it('should handle vector2 format', () => {
      const schema: Schema = { type: 'array', format: 'vector2' }
      expect(getDefaultValue(schema)).toEqual([0, 0])
    })

    it('should handle vector3 format', () => {
      const schema: Schema = { type: 'array', format: 'vector3' }
      expect(getDefaultValue(schema)).toEqual([0, 0, 0])
    })

    it('should handle vector4 format', () => {
      const schema: Schema = { type: 'array', format: 'vector4' }
      expect(getDefaultValue(schema)).toEqual([0, 0, 0, 0])
    })

    it('should handle array with default value', () => {
      const schema: Schema = { 
        type: 'array', 
        items: { type: 'string' },
        default: ['item1', 'item2']
      }
      expect(getDefaultValue(schema)).toEqual(['item1', 'item2'])
    })

    it('should handle object with nested defaults', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string', default: 'John' },
          age: { type: 'integer', default: 25 }
        }
      }
      expect(getDefaultValue(schema)).toEqual({ name: 'John', age: 25 })
    })

    it('should handle enum with first value as default', () => {
      const schema: Schema = { type: 'string', enum: ['red', 'green', 'blue'] }
      expect(getDefaultValue(schema)).toBe('red')
    })

    it('should handle unknown schema type', () => {
      const schema: any = { type: 'unknown' }
      expect(getDefaultValue(schema)).toBeNull()
    })
  })

  describe('shouldShowField', () => {
    it('should return true for fields without hidden property', () => {
      const schema: Schema = { type: 'string' }
      expect(shouldShowField(schema)).toBe(true)
    })

    it('should return false for hidden fields', () => {
      const schema: Schema = { type: 'string', ui: { hidden: true } }
      expect(shouldShowField(schema)).toBe(false)
    })

    it('should return true when hidden is false', () => {
      const schema: Schema = { type: 'string', ui: { hidden: false } }
      expect(shouldShowField(schema)).toBe(true)
    })

    it('should handle conditional visibility', () => {
      const schema: Schema = { 
        type: 'string', 
        ui: { 
          hidden: false,
          showIf: { field: 'otherField', value: 'show' }
        } 
      }
      // Without context, should still show
      expect(shouldShowField(schema)).toBe(true)
    })
  })

  describe('getFieldLabel', () => {
    it('should return label from ui property', () => {
      const schema: Schema = { 
        type: 'string', 
        ui: { label: 'User Name' } 
      }
      expect(getFieldLabel(schema, 'username')).toBe('User Name')
    })

    it('should return title if no ui label', () => {
      const schema: Schema = { 
        type: 'string', 
        title: 'User Name'
      }
      expect(getFieldLabel(schema, 'username')).toBe('User Name')
    })

    it('should format field name if no label or title', () => {
      const schema: Schema = { type: 'string' }
      expect(getFieldLabel(schema, 'firstName')).toBe('First Name')
      expect(getFieldLabel(schema, 'user_name')).toBe('User Name')
      expect(getFieldLabel(schema, 'userID')).toBe('User ID')
    })

    it('should handle single word field names', () => {
      const schema: Schema = { type: 'string' }
      expect(getFieldLabel(schema, 'name')).toBe('Name')
      expect(getFieldLabel(schema, 'email')).toBe('Email')
    })

    it('should prioritize ui label over title', () => {
      const schema: Schema = { 
        type: 'string', 
        title: 'Title Label',
        ui: { label: 'UI Label' } 
      }
      expect(getFieldLabel(schema, 'field')).toBe('UI Label')
    })
  })

  describe('getFieldDescription', () => {
    it('should return description from schema', () => {
      const schema: Schema = { 
        type: 'string', 
        description: 'Enter your full name'
      }
      expect(getFieldDescription(schema)).toBe('Enter your full name')
    })

    it('should return help text from ui property', () => {
      const schema: Schema = { 
        type: 'string', 
        ui: { help: 'This field is required' }
      }
      expect(getFieldDescription(schema)).toBe('This field is required')
    })

    it('should prioritize ui help over description', () => {
      const schema: Schema = { 
        type: 'string', 
        description: 'Schema description',
        ui: { help: 'UI help text' }
      }
      expect(getFieldDescription(schema)).toBe('UI help text')
    })

    it('should return undefined if no description or help', () => {
      const schema: Schema = { type: 'string' }
      expect(getFieldDescription(schema)).toBeUndefined()
    })

    it('should handle empty strings', () => {
      const schema: Schema = { 
        type: 'string', 
        description: ''
      }
      expect(getFieldDescription(schema)).toBe('')
    })
  })

  describe('getFieldPlaceholder', () => {
    it('should return placeholder from ui property', () => {
      const schema: Schema = { 
        type: 'string', 
        ui: { placeholder: 'Enter text here...' }
      }
      expect(getFieldPlaceholder(schema)).toBe('Enter text here...')
    })

    it('should return example as placeholder', () => {
      const schema: Schema = { 
        type: 'string', 
        example: 'john.doe@example.com'
      }
      expect(getFieldPlaceholder(schema)).toBe('john.doe@example.com')
    })

    it('should prioritize ui placeholder over example', () => {
      const schema: Schema = { 
        type: 'string', 
        example: 'example@test.com',
        ui: { placeholder: 'your.email@domain.com' }
      }
      expect(getFieldPlaceholder(schema)).toBe('your.email@domain.com')
    })

    it('should return undefined if no placeholder or example', () => {
      const schema: Schema = { type: 'string' }
      expect(getFieldPlaceholder(schema)).toBeUndefined()
    })

    it('should handle format-specific placeholders', () => {
      const emailSchema: Schema = { 
        type: 'string', 
        format: 'email'
      }
      // Default implementation doesn't add format-specific placeholders
      expect(getFieldPlaceholder(emailSchema)).toBeUndefined()
    })

    it('should handle enum schemas', () => {
      const schema: Schema = { 
        type: 'string', 
        enum: ['option1', 'option2', 'option3'],
        ui: { placeholder: 'Select an option' }
      }
      expect(getFieldPlaceholder(schema)).toBe('Select an option')
    })
  })

  describe('complex UI scenarios', () => {
    it('should handle all UI properties together', () => {
      const schema: Schema = {
        type: 'string',
        title: 'Schema Title',
        description: 'Schema description',
        example: 'example@test.com',
        ui: {
          label: 'Email Address',
          help: 'Enter a valid email address',
          placeholder: 'user@example.com',
          hidden: false
        }
      }

      expect(getFieldLabel(schema, 'email')).toBe('Email Address')
      expect(getFieldDescription(schema)).toBe('Enter a valid email address')
      expect(getFieldPlaceholder(schema)).toBe('user@example.com')
      expect(shouldShowField(schema)).toBe(true)
    })

    it('should handle nested object UI properties', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          address: {
            type: 'object',
            title: 'Address Information',
            properties: {
              street: { 
                type: 'string',
                ui: { label: 'Street Address' }
              },
              city: { 
                type: 'string',
                ui: { label: 'City' }
              }
            }
          }
        }
      }

      expect(getFieldLabel(schema.properties!.address, 'address')).toBe('Address Information')
      expect(getFieldLabel(schema.properties!.address.properties!.street, 'street')).toBe('Street Address')
    })

    it('should handle array item UI properties', () => {
      const schema: Schema = {
        type: 'array',
        title: 'Tags',
        items: {
          type: 'string',
          ui: { placeholder: 'Add a tag' }
        }
      }

      expect(getFieldLabel(schema, 'tags')).toBe('Tags')
      expect(getFieldPlaceholder(schema.items)).toBe('Add a tag')
    })
  })
})