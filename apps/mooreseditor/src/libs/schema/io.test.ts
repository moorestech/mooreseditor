// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { parseSchema, stringifySchema, loadSchemaFromString, saveSchemaToString } from './io'
import type { Schema } from './types'

describe('io', () => {
  const sampleSchema: Schema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      age: { type: 'integer', minimum: 0 },
      email: { type: 'string', format: 'email' },
      tags: { 
        type: 'array', 
        items: { type: 'string' } 
      }
    },
    required: ['name', 'email']
  }

  describe('parseSchema', () => {
    it('should parse valid JSON schema string', () => {
      const jsonString = JSON.stringify(sampleSchema)
      const parsed = parseSchema(jsonString)
      
      expect(parsed).toEqual(sampleSchema)
    })

    it('should parse valid YAML schema string', () => {
      const yamlString = `
type: object
properties:
  name:
    type: string
  age:
    type: integer
    minimum: 0
  email:
    type: string
    format: email
  tags:
    type: array
    items:
      type: string
required:
  - name
  - email
`
      const parsed = parseSchema(yamlString)
      
      expect(parsed).toEqual(sampleSchema)
    })

    it('should handle schema with $ref', () => {
      const schemaWithRef = `
type: object
properties:
  user:
    $ref: "#/definitions/User"
definitions:
  User:
    type: object
    properties:
      name:
        type: string
`
      const parsed = parseSchema(schemaWithRef)
      
      expect(parsed.type).toBe('object')
      expect(parsed.properties?.user).toHaveProperty('$ref')
    })

    it('should throw error for invalid JSON', () => {
      const invalidJson = '{ invalid json'
      
      expect(() => parseSchema(invalidJson)).toThrow()
    })

    it('should throw error for invalid YAML', () => {
      const invalidYaml = `
type: object
properties:
  - invalid yaml structure
`
      
      expect(() => parseSchema(invalidYaml)).toThrow()
    })

    it('should parse schema with complex types', () => {
      const complexSchema = `
type: object
properties:
  id:
    type: string
    format: uuid
  position:
    type: array
    format: vector3
  settings:
    type: object
    additionalProperties: false
    properties:
      enabled:
        type: boolean
      value:
        type: number
        minimum: 0
        maximum: 1
`
      const parsed = parseSchema(complexSchema)
      
      expect(parsed.properties?.id.format).toBe('uuid')
      expect(parsed.properties?.position.format).toBe('vector3')
      expect(parsed.properties?.settings.additionalProperties).toBe(false)
    })

    it('should handle empty string', () => {
      expect(() => parseSchema('')).toThrow()
    })

    it('should parse schema with UI properties', () => {
      const schemaWithUI = `
type: object
properties:
  name:
    type: string
    ui:
      label: "Full Name"
      placeholder: "Enter your full name"
      help: "First and last name"
`
      const parsed = parseSchema(schemaWithUI)
      
      expect(parsed.properties?.name.ui).toEqual({
        label: 'Full Name',
        placeholder: 'Enter your full name',
        help: 'First and last name'
      })
    })
  })

  describe('stringifySchema', () => {
    it('should stringify schema to YAML format', () => {
      const yamlString = stringifySchema(sampleSchema)
      
      expect(yamlString).toContain('type: object')
      expect(yamlString).toContain('name:')
      expect(yamlString).toContain('type: string')
      expect(yamlString).toContain('required:')
      expect(yamlString).toContain('- name')
      expect(yamlString).toContain('- email')
    })

    it('should handle nested schemas', () => {
      const nestedSchema: Schema = {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              profile: {
                type: 'object',
                properties: {
                  bio: { type: 'string' }
                }
              }
            }
          }
        }
      }
      
      const yamlString = stringifySchema(nestedSchema)
      
      expect(yamlString).toContain('user:')
      expect(yamlString).toContain('profile:')
      expect(yamlString).toContain('bio:')
    })

    it('should preserve special properties', () => {
      const schemaWithSpecial: Schema = {
        type: 'object',
        $id: 'https://example.com/schema',
        $schema: 'http://json-schema.org/draft-07/schema#',
        properties: {
          ref: { $ref: '#/definitions/Something' }
        }
      }
      
      const yamlString = stringifySchema(schemaWithSpecial)
      
      expect(yamlString).toContain('$id:')
      expect(yamlString).toContain('$schema:')
      expect(yamlString).toContain('$ref:')
    })

    it('should handle arrays properly', () => {
      const arraySchema: Schema = {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 10,
        uniqueItems: true
      }
      
      const yamlString = stringifySchema(arraySchema)
      
      expect(yamlString).toContain('type: array')
      expect(yamlString).toContain('minItems: 1')
      expect(yamlString).toContain('maxItems: 10')
      expect(yamlString).toContain('uniqueItems: true')
    })

    it('should handle enum values', () => {
      const enumSchema: Schema = {
        type: 'string',
        enum: ['red', 'green', 'blue']
      }
      
      const yamlString = stringifySchema(enumSchema)
      
      expect(yamlString).toContain('enum:')
      expect(yamlString).toContain('- red')
      expect(yamlString).toContain('- green')
      expect(yamlString).toContain('- blue')
    })
  })

  describe('loadSchemaFromString', () => {
    it('should load and parse schema', async () => {
      const yamlString = stringifySchema(sampleSchema)
      const loaded = await loadSchemaFromString(yamlString)
      
      expect(loaded).toEqual(sampleSchema)
    })

    it('should handle async loading', async () => {
      const jsonString = JSON.stringify(sampleSchema)
      const loaded = await loadSchemaFromString(jsonString)
      
      expect(loaded).toEqual(sampleSchema)
    })

    it('should reject on invalid schema', async () => {
      const invalidSchema = 'not a valid schema'
      
      await expect(loadSchemaFromString(invalidSchema)).rejects.toThrow()
    })
  })

  describe('saveSchemaToString', () => {
    it('should save schema as YAML string', async () => {
      const saved = await saveSchemaToString(sampleSchema)
      
      expect(saved).toContain('type: object')
      expect(saved).toContain('properties:')
      expect(saved).toContain('required:')
    })

    it('should produce parseable output', async () => {
      const saved = await saveSchemaToString(sampleSchema)
      const parsed = parseSchema(saved)
      
      expect(parsed).toEqual(sampleSchema)
    })

    it('should handle complex schemas', async () => {
      const complexSchema: Schema = {
        type: 'object',
        properties: {
          vector: { type: 'array', format: 'vector3' },
          matrix: { 
            type: 'array', 
            items: { 
              type: 'array', 
              items: { type: 'number' } 
            } 
          },
          config: {
            type: 'object',
            patternProperties: {
              '^[A-Z_]+$': { type: 'string' }
            }
          }
        }
      }
      
      const saved = await saveSchemaToString(complexSchema)
      const parsed = parseSchema(saved)
      
      expect(parsed).toEqual(complexSchema)
    })
  })

  describe('round-trip conversion', () => {
    it('should preserve schema through parse and stringify', () => {
      const original = sampleSchema
      const stringified = stringifySchema(original)
      const parsed = parseSchema(stringified)
      const restringified = stringifySchema(parsed)
      const reparsed = parseSchema(restringified)
      
      expect(reparsed).toEqual(original)
    })

    it('should preserve complex schemas', () => {
      const complexSchema: Schema = {
        type: 'object',
        title: 'Complex Schema',
        description: 'A complex schema for testing',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          age: { type: 'integer', minimum: 0, maximum: 150 },
          score: { type: 'number', multipleOf: 0.1 },
          active: { type: 'boolean', default: true },
          tags: { 
            type: 'array', 
            items: { type: 'string' },
            minItems: 0,
            maxItems: 10
          },
          metadata: {
            type: 'object',
            additionalProperties: { type: 'string' }
          },
          role: {
            type: 'string',
            enum: ['admin', 'user', 'guest']
          }
        },
        required: ['id', 'name'],
        additionalProperties: false
      }
      
      const stringified = stringifySchema(complexSchema)
      const parsed = parseSchema(stringified)
      
      expect(parsed).toEqual(complexSchema)
    })

    it('should handle schemas with foreign key references', () => {
      const schemaWithFK: Schema = {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            foreignKey: {
              table: 'users',
              key: 'id',
              displayFields: ['name', 'email']
            }
          }
        }
      }
      
      const stringified = stringifySchema(schemaWithFK)
      const parsed = parseSchema(stringified)
      
      expect(parsed.properties?.userId.foreignKey).toEqual({
        table: 'users',
        key: 'id',
        displayFields: ['name', 'email']
      })
    })
  })
})