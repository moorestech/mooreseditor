export type Schema = ObjectSchema | StringSchema | IntegerSchema | FloatSchema | BooleanSchema | ArraySchema | Conditional;
export type DataSchema = ObjectSchema | StringSchema | IntegerSchema | FloatSchema | BooleanSchema | ArraySchema;

export type Combine = {
  oneOf?: Array<Schema>;
  allOf?: Array<Schema>;
  anyOf?: Array<Schema>;
}

export type Conditional = {
  if: Schema;
  then: Schema;
  else: Schema;
}

export type Properties = Record<string, Schema> & {
  required?: Array<string>;
}

export interface ObjectSchema {
  type: 'object';
  properties: Properties;
}

export interface StringSchema {
  type: 'string';
  format: string;
  pattern: string;
  enum?: Array<string>;
}

export interface IntegerSchema {
  type: 'integer';
  enum?: Array<number>;
}

export interface FloatSchema {
  type: 'number';
  enum?: Array<number>;
}

export interface BooleanSchema {
  type: 'boolean';
}

export interface ArraySchema {
  type: 'array';
  pattern: string;
  items: Schema;
}

export const findPrimitivePropNames = (schema: Schema) => {
  if('properties' in schema){
    return Array.from(Object.keys(schema.properties)).filter(prop => {
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
  }
}

export const findNonPrimitivePropNames = <T>(schema: Schema, row: T) => {
  if('properties' in schema){
    return Array.from(Object.keys(schema.properties)).filter(prop => {
      if(prop == 'required') return false
      const propSchema = schema.properties[prop] as DataSchema
      if(propSchema.type === 'object') {
        return true
      }else if(propSchema.type === 'array'){
        return ['@vector2', '@vector3', '@vector4', '@vector2Int', '@vector3Int', '@vector4Int'].indexOf(propSchema.pattern) < 0
      }else if('oneOf' in propSchema){
        const found = propSchema.oneOf.find((condSchema: Schema) => {
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
  }
}

//oneOf > ifの入れ子にだけ対応。それ以外は普通に取得
export const getPropSchema = <T>(schema: Schema, prop: string, row: T) => {
  const propSchema = schema.properties[prop]
  if('oneOf' in propSchema){
    const found = propSchema.oneOf.find(condSchema => {
      if(!('if' in condSchema)){
        throw new Error('oneOfの中にはifプロパティを持つ要素が入らなければなりません')
      }
      return Object.keys(condSchema.if.properties).every(prop => {
        const value = row ? row[prop] : null
        const constValue = condSchema.if.properties[prop].const
        return value === constValue
      })
    })
    return found ? found.then : {}
  }else{
    return propSchema
  }
}
