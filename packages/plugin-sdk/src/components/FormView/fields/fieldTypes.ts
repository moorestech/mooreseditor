import type {
  ArraySchema,
  Column,
  ObjectSchema,
  PrimitiveSchema,
  RuntimeFieldSchema,
  RuntimeSwitchSchema,
  Schema,
} from "../../../schema";

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
