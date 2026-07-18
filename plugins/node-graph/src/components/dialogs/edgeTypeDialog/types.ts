import type { ConnectionDecision } from "../../../types/connection";
import type { RecipeEdgeType, RecipeReference } from "../../../types/nodeGraph";
import type { SchemaMeta } from "../../../utils/schemaMeta";
import type {
  Column,
  ArraySchema,
  ObjectPropertySchema,
} from "@moorestech/mooreseditor-plugin-sdk";
import type { Node as ReactFlowNode } from "@xyflow/react";

export type EdgeDialogMode = "dependency" | "visual" | "recipe" | "buildCost";

export interface EdgeTypeDialogProps {
  opened: boolean;
  onConfirm: (decision: ConnectionDecision) => void;
  onCancel: () => void;
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemaMetas: Map<string, SchemaMeta>;
  sourceNode: ReactFlowNode | null;
  targetNode: ReactFlowNode | null;
  onMarkDirty: () => void;
  initialRecipeRefs?: RecipeReference[];
  initialMode?: EdgeDialogMode;
}

export interface NodeSchemaRef {
  schemaId: string | null;
  guid: string | null;
}

export interface EditableRecipe {
  key: string;
  recipeType: RecipeEdgeType;
  recipeGuid: string;
  schemaId: string;
  schemaMeta: SchemaMeta;
  record: Record<string, unknown>;
  label: string;
}

export interface ObjectArrayEditorState {
  path: string[];
  schema: ArraySchema;
}

// buildCost編集のCancel復元用スナップショット
// Snapshot for restoring build-cost edits on cancel
export interface CostSnapshot {
  schemaId: string;
  dataArrayPath: string;
  guidField: string;
  guid: string;
  propertyKey: string;
  original: unknown;
}

export type UuidForeignKeyProperty = ObjectPropertySchema & {
  type: "uuid";
  foreignKey: { schemaId: string };
};

export type RecipeOption = { value: string; label: string };
export type RecipeOptionsByType = Record<RecipeEdgeType, RecipeOption[]>;
