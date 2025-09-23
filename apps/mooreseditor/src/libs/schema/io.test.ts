// AI Generated Test Code
import { describe, it, expect } from 'vitest'
import { loadYamlString } from './io'

describe('io', () => {
  describe('loadYamlString', () => {
    it('should parse valid YAML string', () => {
      const yamlString = `
name: test
value: 123
enabled: true
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        name: 'test',
        value: 123,
        enabled: true
      })
    })

    it('should parse YAML with arrays', () => {
      const yamlString = `
items:
  - apple
  - banana
  - orange
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        items: ['apple', 'banana', 'orange']
      })
    })

    it('should parse nested YAML objects', () => {
      const yamlString = `
user:
  name: John
  age: 30
  address:
    street: Main St
    city: New York
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        user: {
          name: 'John',
          age: 30,
          address: {
            street: 'Main St',
            city: 'New York'
          }
        }
      })
    })

    it('should parse empty YAML', () => {
      const yamlString = ''
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toBeNull()
    })

    it('should parse YAML with schema-like structure', () => {
      const yamlString = `
type: object
properties:
  - key: name
    type: string
  - key: age
    type: integer
    min: 0
    max: 120
  - key: tags
    type: array
    items:
      type: string
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        type: 'object',
        properties: [
          { key: 'name', type: 'string' },
          { key: 'age', type: 'integer', min: 0, max: 120 },
          { 
            key: 'tags', 
            type: 'array',
            items: { type: 'string' }
          }
        ]
      })
    })

    it('should parse YAML with null values', () => {
      const yamlString = `
name: test
value: null
optional: ~
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        name: 'test',
        value: null,
        optional: null
      })
    })

    it('should parse YAML with boolean values', () => {
      const yamlString = `
yes: true
no: false
on: "on"
off: "off"
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        yes: true,
        no: false,
        on: "on",
        off: "off"
      })
    })

    it('should parse YAML with numbers', () => {
      const yamlString = `
integer: 42
float: 3.14
negative: -10
scientific: 1.23e-4
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed).toEqual({
        integer: 42,
        float: 3.14,
        negative: -10,
        scientific: 0.000123
      })
    })

    it('should parse YAML with multiline strings', () => {
      const yamlString = `
description: |
  This is a
  multiline string
  with preserved newlines
folded: >
  This is a folded
  string that will
  be a single line
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed.description).toContain('multiline string')
      expect(parsed.description).toContain('\n')
      // The yaml library preserves a single newline at the end of folded strings
      expect(parsed.folded.trim()).not.toContain('\n')
    })

    it('should parse YAML with references', () => {
      const yamlString = `
default: &default_settings
  timeout: 30
  retries: 3

server1:
  <<: *default_settings
  host: server1.com

server2:
  <<: *default_settings
  host: server2.com
  timeout: 60
`
      const parsed = loadYamlString(yamlString)
      
      // The YAML library preserves the merge key as a literal key
      // and resolves the reference, but doesn't perform the merge
      expect(parsed.server1.host).toBe('server1.com')
      expect(parsed.server1['<<']).toEqual({
        timeout: 30,
        retries: 3
      })
      
      expect(parsed.server2.host).toBe('server2.com')
      expect(parsed.server2.timeout).toBe(60)
      expect(parsed.server2['<<']).toEqual({
        timeout: 30,
        retries: 3
      })
      
      // The default anchor is also preserved
      expect(parsed.default).toEqual({
        timeout: 30,
        retries: 3
      })
    })

    it('should parse YAML with inconsistent indentation', () => {
      // This YAML is actually valid - it's parsed as an array with two items
      const yamlString = `
invalid:
  - item1
    item2
`
      const parsed = loadYamlString(yamlString)
      // The parser treats this as an array with first item being "item1 item2"
      expect(Array.isArray(parsed.invalid)).toBe(true)
    })

    it('should parse complex schema definition', () => {
      const yamlString = `
id: items
type: array
items:
  type: object
  properties:
    - key: id
      type: uuid
    - key: name
      type: string
      default: ""
    - key: stackSize
      type: integer
      min: 1
      max: 999
    - key: category
      type: enum
      options:
        - weapon
        - armor
        - consumable
    - key: position
      type: vector3
      default: [0, 0, 0]
`
      const parsed = loadYamlString(yamlString)
      
      expect(parsed.id).toBe('items')
      expect(parsed.type).toBe('array')
      expect(parsed.items.type).toBe('object')
      expect(parsed.items.properties).toHaveLength(5)
      expect(parsed.items.properties[0]).toEqual({ key: 'id', type: 'uuid' })
      expect(parsed.items.properties[3].options).toEqual(['weapon', 'armor', 'consumable'])
    })
  })
})