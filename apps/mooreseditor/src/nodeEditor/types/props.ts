import type { NodeGraphFile } from "./nodeGraph";
import type { Column } from "../../hooks/useJson";
import type { Schema } from "../../libs/schema/types";

export interface NodeEditorViewProps {
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemas: Record<string, Schema>;
  loadSchema: (schemaName: string) => Promise<Schema | null>;
  projectDir: string | null;
  masterDir: string | null;
  onMarkDirty: () => void;
  onRequestSave: (
    columns: Column[],
    nodeGraph: NodeGraphFile | null,
  ) => Promise<void>;
}
