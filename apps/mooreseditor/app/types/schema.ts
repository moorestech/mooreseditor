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

export type Properties = {
  required: Array<string>;
  properties: Record<string, Schema>;
}

export interface ObjectSchema {
  type: 'object';
  properties: Properties;
}

export interface StringSchema {
  type: 'string';
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

