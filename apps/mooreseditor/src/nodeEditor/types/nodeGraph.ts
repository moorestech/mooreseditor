export interface NodeGraphFile {
  version: 1;
  viewport: { x: number; y: number; zoom: number };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export type GraphNode =
  | ItemGraphNode
  | BlockGraphNode
  | ResearchGraphNode
  | NoteGraphNode
  | PlaceholderGraphNode;

interface BaseGraphNode {
  id: string;
  position: { x: number; y: number };
}
export interface ItemGraphNode extends BaseGraphNode {
  type: "item";
  masterGuid: string;
}
export interface BlockGraphNode extends BaseGraphNode {
  type: "block";
  masterGuid: string;
}
export interface ResearchGraphNode extends BaseGraphNode {
  type: "research";
  masterGuid: string;
}
export interface NoteGraphNode extends BaseGraphNode {
  type: "note";
  text: string;
  width?: number;
  height?: number;
}
export interface PlaceholderGraphNode extends BaseGraphNode {
  type: "placeholder";
  text: string;
}

// --- Edges ---
// edgeType: domain type (for persistence)
// type: React Flow rendering component key (runtime only, not persisted)
export type GraphEdge =
  | RecipeCollectionGraphEdge
  | CraftRecipeGraphEdge
  | MachineRecipeGraphEdge
  | DependencyGraphEdge
  | VisualGraphEdge;

export type RecipeEdgeType = "craftRecipe" | "machineRecipe";

export interface RecipeReference {
  edgeType: RecipeEdgeType;
  masterGuid: string;
}

interface BaseGraphEdge {
  id: string;
  source: string;
  target: string;
}
export interface CraftRecipeGraphEdge extends BaseGraphEdge {
  edgeType: "craftRecipe";
  masterGuid: string;
}
export interface MachineRecipeGraphEdge extends BaseGraphEdge {
  edgeType: "machineRecipe";
  masterGuid: string;
}
export interface RecipeCollectionGraphEdge extends BaseGraphEdge {
  edgeType: "recipe";
  recipes: RecipeReference[];
}
export interface DependencyGraphEdge extends BaseGraphEdge {
  edgeType: "dependency";
}
export interface VisualGraphEdge extends BaseGraphEdge {
  edgeType: "visual";
}

// React Flow conversion:
// edgeType → type mapping
// "recipe"                            → type: "recipe"  (RecipeEdge)
// "craftRecipe" | "machineRecipe" → type: "recipe"  (RecipeEdge)
// "dependency" | "visual"         → type: "arrow"    (DependencyEdge)
