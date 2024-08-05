import { ErrorObject } from "ajv";

export type PrimitiveTypes = |
  number |
  string |
  boolean |
  Array<number>;

export type Schema = ObjectSchema | StringSchema | IntegerSchema | FloatSchema | BooleanSchema | ArraySchema | Combine | Conditional;
export type DataSchema = ObjectSchema | StringSchema | IntegerSchema | FloatSchema | BooleanSchema | ArraySchema;

// oneOfは条件分岐にしか使用しないという前提
export type Combine = {
  oneOf?: Array<Conditional>;
  allOf?: Array<Conditional>;
  anyOf?: Array<Conditional>;
}

export type Conditional = {
  if: ObjectSchema;
  then: DataSchema;
  else: DataSchema;
}

export type Properties = Record<string, Schema & { const: number | string | boolean | null }>

export interface ObjectSchema {
  type: 'object';
  properties: Properties;
  required?: Array<string>;
}

export const isObjectSchema = (schema: Schema): schema is ObjectSchema => {
  return schema instanceof Object && 'type' in schema && schema.type === 'object'
}

export type ObjectArraySchema = {
  type: 'array';
  items: ObjectSchema;
}

export const isObjectArraySchema = (schema: Schema): schema is ObjectArraySchema => {
  if(isArraySchema(schema)){
    const innerSchema = schema.items
    return isObjectSchema(innerSchema)
  }
  return false
}

export interface StringSchema {
  type: 'string';
  autoGenerated?: boolean;
  format?: string;
  foreignKey?: string;
  enum?: Array<string>;
  default?: string;
}

export interface IntegerSchema {
  type: 'integer';
  enum?: Array<number>;
  default?: number;
}

export interface FloatSchema {
  type: 'number';
  enum?: Array<number>;
  default?: number;
}

export interface BooleanSchema {
  type: 'boolean';
  default?: boolean;
}

export interface ArraySchema {
  type: 'array';
  pattern?: string;
  items: Schema;
  default?: Array<any>;
}

export const isArraySchema = (schema: Schema): schema is ArraySchema => {
  return schema instanceof Object && 'type' in schema && schema.type === 'array'
}

export const isPrimitiveSchema = (schema: DataSchema): boolean => {
  if(schema.type === 'object') {
    return false
  }else if(schema.type === 'array'){
    return ['@vector2', '@vector3', '@vector4', '@vector2Int', '@vector3Int', '@vector4Int'].indexOf(schema.pattern) >= 0
  }else if(['if', 'then', 'else'].findIndex(prop => prop in schema) >= 0){
    return false
  }else if(['oneOf', 'allOf', 'anyOf'].findIndex(prop => prop in schema) >= 0){
    return false
  }
  return true
}

export const findPrimitivePropNames = (schema: Schema): Record<string, DataSchema> => {
  if('properties' in schema){
    const entries = Array.from(Object.entries(schema.properties)).filter(([prop, _propSchema]: [string, Schema]) => {
      if(prop == 'required') return false
      const propSchema = schema.properties[prop] as DataSchema
      if(propSchema.type === 'object') {
        return false
      }else if(propSchema.type === 'array'){
        return ['@vector2', '@vector3', '@vector4', '@vector2Int', '@vector3Int', '@vector4Int'].indexOf(propSchema.pattern) >= 0
      }else if(['if', 'then', 'else'].findIndex(prop => prop in propSchema) >= 0){
        return false
      }else if(['oneOf', 'allOf', 'anyOf'].findIndex(prop => prop in propSchema) >= 0){
        return false
      }
      return true
    })
    return Object.fromEntries(entries) as Record<string, DataSchema>
  }
}

export const findNonPrimitivePropNames = <T extends Record<string, unknown>>(schema: Schema, row: T): Record<string, DataSchema> => {
  if('properties' in schema){
    const propNames = Array.from(Object.keys(schema.properties)).filter(prop => {
      if(prop == 'required') return false
      const propSchema = schema.properties[prop] as Schema
      if('type' in propSchema){
        if(propSchema.type === 'object') {
          return true
        }else if(propSchema.type === 'array'){
          return ['@vector2', '@vector3', '@vector4', '@vector2Int', '@vector3Int', '@vector4Int'].indexOf(propSchema.pattern) < 0
        }
      }else if('oneOf' in propSchema){
        const found = propSchema.oneOf.find((condSchema: Conditional) => {
          if(!('if' in condSchema)){
            throw new Error('oneOfの中にはifプロパティを持つ要素が入らなければなりません')
          }
          return Object.keys(condSchema.if.properties).every(prop => {
            const value = row[prop]
            const constValue = condSchema.if.properties[prop].const
            return value === constValue
          })
        })
        return found !== null
      }
      return false
    })
    return Object.fromEntries(propNames.map(propName => [propName, getPropSchema(schema, propName, row)])) as Record<string, DataSchema>
  }
}

//oneOf > ifの入れ子にだけ対応。それ以外は普通に取得
export const getPropSchema = <T extends Record<string, unknown>>(schema: ObjectSchema, prop: string, row: T): DataSchema => {
  const propSchema = schema.properties[prop]
  if('oneOf' in propSchema){
    const found = propSchema.oneOf.find((condSchema: Schema) => {
      if(!('if' in condSchema)){
        throw new Error('oneOfの中にはifプロパティを持つ要素が入らなければなりません')
      }
      return Object.keys(condSchema.if.properties).every(prop => {
        const value = row ? row[prop] : null
        const constValue = condSchema.if.properties[prop].const
        return value === constValue
      })
    })
    return found ? found.then : null
  }else{
    return propSchema as DataSchema
  }
}

export const transformErrors = (errors: Array<ErrorObject>) => {
  const transformedErrors: Record<string, Array<string>> = {};
  for(const error of errors){
    switch(error.keyword){
      case 'required':
        if('missingProperty' in error.params){
          if(!transformedErrors[error.params.missingProperty]) transformedErrors[error.params.missingProperty] = []
          transformedErrors[error.params.missingProperty].push(error.message)
        }
        break;
    }
  }
  return transformedErrors
}
