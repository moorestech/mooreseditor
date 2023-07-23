export type BlockParamType = string | number | boolean;
export type BlockParamArrayType = string[] | number[] | boolean[];

export type BlockParamValueType = |
  BlockParamType |
  BlockParamArrayType |
  BlockParamsType[]

export type BlockParamsType = {
  [paramName: string]: BlockParamValueType
};


export type BlockParamIntSchemaType = {
  type: 'int',
  defaultValue: number,
}
export type BlockParamFloatSchemaType = {
  type: 'float',
  defaultValue: number,
}
export type BlockParamStringSchemaType = {
  type: 'string',
  defaultValue: string,
}
export type BlockParamBooleanSchemaType = {
  type: 'bool',
  defaultValue: boolean,
}
export type BlockParamIntArraySchemaType = {
  type: 'array',
  arrayType: "int",
  addDefaultValue: number,
  defaultValue: number[],
}
export type BlockParamFloatArraySchemaType = {
  type: 'array',
  arrayType: "float",
  addDefaultValue: number,
  defaultValue: number[],
}
export type BlockParamStringArraySchemaType = {
  type: 'array',
  arrayType: "string",
  addDefaultValue: string,
  defaultValue: string[],
}
export type BlockParamBooleanArraySchemaType = {
  type: 'array',
  arrayType: "bool",
  addDefaultValue: boolean,
  defaultValue: boolean[],
}
export type BlockParamPrimitiveArraySchemaType = |
  BlockParamIntArraySchemaType |
  BlockParamFloatArraySchemaType |
  BlockParamStringArraySchemaType |
  BlockParamBooleanArraySchemaType

export type BlockParamItemType = {
  type: "item",
}

export type BlockParamSchemaType = |
  BlockParamIntSchemaType |
  BlockParamFloatSchemaType |
  BlockParamStringSchemaType |
  BlockParamPrimitiveArraySchemaType |
  BlockParamItemType

export type BlockParamsSchemaType = {
  [name: string]: BlockParamSchemaType | BlockParamsSchemaType
}
