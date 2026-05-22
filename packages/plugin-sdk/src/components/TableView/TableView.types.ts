import type { Column } from "../../schema";
import type { ArraySchema } from "../../schema";

export interface TableViewProps {
  schema: ArraySchema;
  data: any[];
  jsonData?: Column[];
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
  jsonData?: Column[];
}

export interface EditableCellProps extends ColumnDisplayProps {
  onStartEdit: () => void;
}
