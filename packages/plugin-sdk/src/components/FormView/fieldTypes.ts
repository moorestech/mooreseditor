import type {
  ArraySchema,
  Column,
  ObjectSchema,
  PrimitiveSchema,
  Schema,
  SwitchSchema,
} from "../../schema";

export interface FieldProps {
  label: string;
  schema: Schema;
  data: any;
  jsonData?: Column[];
  onDataChange: (value: any) => void;
  onObjectArrayClick?: (path: string[], schema: Schema) => void;
  path: string[];
  parentData?: any;
  rootData?: any;
  arrayIndices?: Map<string, number>;
}

type SchemaFieldProps<TSchema extends Schema> = Omit<FieldProps, "schema"> & {
  schema: TSchema;
};

export type SwitchFieldProps = SchemaFieldProps<SwitchSchema>;
export type ObjectFieldProps = SchemaFieldProps<ObjectSchema>;
export type SchemaArrayFieldProps = SchemaFieldProps<ArraySchema>;
export type PrimitiveFieldProps = SchemaFieldProps<PrimitiveSchema>;
