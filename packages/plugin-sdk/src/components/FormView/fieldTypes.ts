import type {
  ArraySchema,
  Column,
  ObjectSchema,
  PrimitiveSchema,
  Schema,
} from "../../schema";

export interface RuntimeSwitchCaseSchema {
  when: string | number | boolean;
  type: string;
}

export interface RuntimeSwitchSchema {
  switch: string;
  cases: RuntimeSwitchCaseSchema[];
  optional?: boolean;
}

export type RuntimeFieldSchema =
  | Schema
  | RuntimeSwitchSchema
  | RuntimeSwitchCaseSchema;

export interface FieldProps {
  label: string;
  schema: RuntimeFieldSchema;
  data: any;
  jsonData?: Column[];
  onDataChange: (value: any) => void;
  onObjectArrayClick?: (path: string[], schema: Schema) => void;
  path: string[];
  parentData?: any;
  rootData?: any;
  arrayIndices?: Map<string, number>;
}

type SchemaFieldProps<TSchema extends RuntimeFieldSchema> = Omit<
  FieldProps,
  "schema"
> & { schema: TSchema };

export type SwitchFieldProps = SchemaFieldProps<RuntimeSwitchSchema>;
export type ObjectFieldProps = SchemaFieldProps<ObjectSchema>;
export type SchemaArrayFieldProps = SchemaFieldProps<ArraySchema>;
export type PrimitiveFieldProps = SchemaFieldProps<PrimitiveSchema>;
