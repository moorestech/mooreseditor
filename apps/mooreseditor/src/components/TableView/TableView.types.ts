import type { ArraySchema, ValueSchema } from "../../libs/schema/types";

export interface TableViewProps {
  schema: ArraySchema;
  data: any[];
  onDataChange?: (newData: any[]) => void;
  onRowSelect?: (rowIndex: number) => void;
}

export interface EditingCell {
  row: number;
  column: string;
}

export interface CellEditProps {
  value: any;
  onSave: (value: any) => void;
  onCancel: () => void;
}

export interface ColumnDisplayProps {
  column: any;
  value: any;
}

export interface EditableCellProps extends ColumnDisplayProps {
  onStartEdit: () => void;
}