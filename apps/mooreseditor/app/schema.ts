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
  isDefaultOpen?: boolean;
}

export const isObjectSchema = (schema: Schema): schema is ObjectSchema => {
  return schema instanceof Object && 'type' in schema && schema.type === 'object'
}

export const isDefaultOpen = (schema: Schema): boolean => {
  if (isObjectSchema(schema)) {
    return schema.isDefaultOpen ?? false
  }

  if (isArraySchema(schema)) {
    return schema.isDefaultOpen ?? false
  }

    return false
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
  isDefaultOpen?: boolean;
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

/**
 * スキーマ定義に基づいてデータ内の空のオブジェクト/配列を補完する関数
 * @param schema スキーマ定義
 * @param data 対象データ
 * @returns 補完後のデータ
 */
export const ensureEmptyStructures = (schema: Schema, data: any): any => {
  if (isObjectSchema(schema)) {
    // データが null や undefined の場合は空オブジェクトを返す
    if (data === null || data === undefined) {
      data = {};
    }
    // データがオブジェクトでない場合はそのまま返す（エラー処理は別途検討）
    if (typeof data !== 'object' || Array.isArray(data)) {
      console.warn("Schema is object, but data is not an object:", data);
      return data; // もしくは {} を返すか、エラーを投げるか
    }

    const result: Record<string, any> = { ...data }; // 元のデータをコピー

    for (const propName in schema.properties) {
      // getPropSchema を使って、条件分岐 (oneOf) も考慮したプロパティスキーマを取得
      // row データとして現在の result を渡す
      const propSchema = getPropSchema(schema, propName, result);

      // propSchema が null (oneOf で条件に合致しなかった場合など) はスキップ
      if (!propSchema) continue;

      const dataValue = result[propName];

      if (isObjectSchema(propSchema)) {
        // プロパティがオブジェクト型の場合
        if (dataValue === null || dataValue === undefined) {
          // データが存在しなければ空オブジェクトで補完
          result[propName] = {};
        } else {
          // データが存在すれば再帰的に処理
          result[propName] = ensureEmptyStructures(propSchema, dataValue);
        }
      } else if (isArraySchema(propSchema) && !isObjectArraySchema(propSchema) && !propSchema.pattern?.startsWith('@vector')) {
        // プロパティがプリミティブ配列型の場合 (Vector以外)
        if (dataValue === null || dataValue === undefined) {
          // データが存在しなければ空配列で補完
          result[propName] = [];
        }
        // 配列の中身はプリミティブなので再帰処理は不要
        // (もし配列の要素がオブジェクト/配列の場合は isObjectArraySchema で処理される)
      } else if (isObjectArraySchema(propSchema)) {
         // プロパティがオブジェクト配列型の場合
         if (dataValue === null || dataValue === undefined) {
           // データが存在しなければ空配列で補完
           result[propName] = [];
         } else if (Array.isArray(dataValue)) {
           // データが配列なら、各要素を再帰的に処理
           result[propName] = dataValue.map(item => ensureEmptyStructures(propSchema.items, item));
         }
         // データが配列でない場合はそのまま（エラー処理は別途検討）
      }
      // プリミティブ型や Vector 型の場合は、データが存在すればそのまま result に含まれているので何もしない
      // データが存在しない場合も、ここでは補完しない (デフォルト値の補完は別の責務)
    }
    return result;

  } else if (isArraySchema(schema) && !isObjectArraySchema(schema) && !schema.pattern?.startsWith('@vector')) {
    // スキーマがプリミティブ配列型の場合 (Vector以外)
    // データが null や undefined の場合は空配列を返す
    if (data === null || data === undefined) {
      return [];
    }
    // データが配列でない場合はそのまま返す
    if (!Array.isArray(data)) {
      console.warn("Schema is array, but data is not an array:", data);
      return data;
    }
    // 中身はプリミティブなのでそのまま返す
    return data;

  } else if (isObjectArraySchema(schema)) {
    // スキーマがオブジェクト配列型の場合
    // データが null や undefined の場合は空配列を返す
    if (data === null || data === undefined) {
      return [];
    }
    // データが配列でない場合はそのまま返す
    if (!Array.isArray(data)) {
      console.warn("Schema is object array, but data is not an array:", data);
      return data;
    }
    // 各要素を再帰的に処理
    return data.map(item => ensureEmptyStructures(schema.items, item));
  }

  // オブジェクト型、配列型以外はデータをそのまま返す
  return data;
};
