import type { Column } from "../../../../hooks/useJson";
import type { ArraySchema } from "../../../../libs/schema/types";
import type { ObjectPropertySchema } from "../../../../libs/schema/types";
import type { ConnectionDecision } from "../../../types/connection";
import type { RecipeEdgeType, RecipeReference } from "../../../types/nodeGraph";
import type { SchemaMeta } from "../../../utils/schemaMeta";
import type { Node as ReactFlowNode } from "@xyflow/react";

export type EdgeDialogMode = "dependency" | "visual" | "recipe";

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

export type UuidForeignKeyProperty = ObjectPropertySchema & {
  type: "uuid";
  foreignKey: { schemaId: string };
};

export type RecipeOption = { value: string; label: string };
export type RecipeOptionsByType = Record<RecipeEdgeType, RecipeOption[]>;
