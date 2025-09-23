import { z } from 'zod';

import type { Schema, ValueSchema, ArraySchema, ObjectSchema } from '../libs/schema/types';
import type { ZodType } from 'zod';

export function schemaToZod(schema: Schema): ZodType<any> {
  // SwitchSchemaの場合は、全てのケースのスキーマをunionで結合
  if ('switch' in schema) {
    const caseSchemas = schema.cases?.map(c => schemaToZod(c)) || [];
    if (caseSchemas.length === 0) return z.any();
    if (caseSchemas.length === 1) return caseSchemas[0];
    return z.union(caseSchemas as [ZodType, ZodType, ...ZodType[]]);
  }

  // ValueSchemaの場合
  if (!('type' in schema)) {
    return z.any();
  }

  const valueSchema = schema as ValueSchema;

  switch (valueSchema.type) {
    case 'string': {
      const stringSchema = z.string();
      if (valueSchema.optional === false) {
        return stringSchema;
      }
      return stringSchema.optional();
    }

    case 'uuid':
      return z.string().uuid().optional();

    case 'enum': {
      const enumSchema = valueSchema as any;
      if (enumSchema.options && enumSchema.options.length > 0) {
        // Create enum from options
        const enumValues = enumSchema.options as [string, ...string[]];
        if (valueSchema.optional === false) {
          return z.enum(enumValues);
        }
        return z.enum(enumValues).optional();
      }
      return z.string().optional();
    }

    case 'integer': {
      let intSchema = z.number().int();
      if (valueSchema.min !== undefined) intSchema = intSchema.min(valueSchema.min);
      if (valueSchema.max !== undefined) intSchema = intSchema.max(valueSchema.max);
      return intSchema.optional();
    }

    case 'number': {
      let numSchema = z.number();
      if (valueSchema.min !== undefined) numSchema = numSchema.min(valueSchema.min);
      if (valueSchema.max !== undefined) numSchema = numSchema.max(valueSchema.max);
      return numSchema.optional();
    }

    case 'boolean':
      return z.boolean().optional();

    case 'vector2':
    case 'vector2Int':
      return z.object({
        x: z.number(),
        y: z.number()
      }).optional();

    case 'vector3':
    case 'vector3Int':
      return z.object({
        x: z.number(),
        y: z.number(),
        z: z.number()
      }).optional();

    case 'vector4':
    case 'vector4Int':
      return z.object({
        x: z.number(),
        y: z.number(),
        z: z.number(),
        w: z.number()
      }).optional();

    case 'array': {
      const arraySchema = valueSchema as ArraySchema;
      if (arraySchema.items) {
        return z.array(schemaToZod(arraySchema.items)).optional();
      }
      return z.array(z.any()).optional();
    }

    case 'object': {
      const objectSchema = valueSchema as ObjectSchema;
      if (objectSchema.properties) {
        const shape: Record<string, ZodType> = {};
        objectSchema.properties.forEach(prop => {
          const { key, ...propSchema } = prop;
          shape[key] = schemaToZod(propSchema as Schema);
        });
        return z.object(shape).optional();
      }
      return z.object({}).optional();
    }

    default:
      return z.any();
  }
}