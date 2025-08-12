import { describe, it, expect } from 'vitest';
import { DataInitializer } from './dataInitializer';
import type { ObjectSchema, ArraySchema, StringSchema, IntegerSchema } from '../libs/schema/types';

describe('DataInitializer', () => {
  describe('Simple schemas', () => {
    it('should generate required string field', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: [
          { key: 'name', type: 'string', optional: false },
          { key: 'description', type: 'string', optional: true }
        ]
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        name: ''
      });
      expect(result.description).toBeUndefined();
    });

    it('should generate required integer field', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: [
          { key: 'id', type: 'integer', optional: false },
          { key: 'count', type: 'integer', optional: true }
        ]
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        id: 0
      });
      expect(result.count).toBeUndefined();
    });

    it('should treat undefined optional as required', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: [
          { key: 'name', type: 'string' }, // optionalが未定義
          { key: 'age', type: 'integer', optional: true }
        ]
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        name: ''
      });
      expect(result.age).toBeUndefined();
    });
  });

  describe('Nested objects', () => {
    it('should generate required fields in nested objects', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: [
          { key: 'id', type: 'integer', optional: false },
          { 
            key: 'details', 
            type: 'object',
            optional: false,
            properties: [
              { key: 'category', type: 'string', optional: false },
              { key: 'tags', type: 'array', items: { type: 'string' }, optional: true }
            ]
          },
          { 
            key: 'metadata', 
            type: 'object',
            optional: true,
            properties: [
              { key: 'created', type: 'string' }
            ]
          }
        ]
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        id: 0,
        details: {
          category: ''
        }
      });
      expect(result.metadata).toBeUndefined();
    });
  });

  describe('Arrays', () => {
    it('should generate empty array when minLength is not specified', () => {
      const schema: ArraySchema = {
        type: 'array',
        items: { type: 'string' }
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual([]);
    });

    it('should generate array with required elements when minLength is specified', () => {
      const schema: ArraySchema = {
        type: 'array',
        minLength: 2,
        items: { 
          type: 'object',
          properties: [
            { key: 'name', type: 'string', optional: false },
            { key: 'value', type: 'integer', optional: true }
          ]
        }
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ name: '' });
      expect(result[1]).toEqual({ name: '' });
    });
  });

  describe('AutoIncrement', () => {
    it('should handle autoIncrement for integer fields', () => {
      const schema: ObjectSchema = {
        type: 'object',
        properties: [
          { 
            key: 'id', 
            type: 'integer', 
            optional: false,
            autoIncrement: { direction: 'asc', startWith: 1, step: 1 }
          },
          { key: 'name', type: 'string', optional: false }
        ]
      };
      
      const existingData = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' }
      ];
      
      const initializer = new DataInitializer(existingData);
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        id: 3,
        name: ''
      });
    });
  });

  describe('Circular references', () => {
    it('should handle circular references gracefully', () => {
      const schema: ObjectSchema = {
        type: 'object',
        ref: 'node',
        properties: [
          { key: 'name', type: 'string', optional: false },
          { 
            key: 'children', 
            type: 'array',
            items: {
              type: 'object',
              ref: 'node', // 循環参照
              properties: []
            }
          }
        ]
      };
      
      const initializer = new DataInitializer();
      const result = initializer.createRequiredValue(schema);
      
      expect(result).toEqual({
        name: '',
        children: []
      });
    });
  });
});