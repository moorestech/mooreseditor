import type { RecipeReference, NodeGraphFile } from "../types/nodeGraph";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";

/**
 * Update clearedActions: upsert unlockItemRecipeView only, preserve all other action types.
 */
export function updateClearedActions(
  existingActions: any[],
  unlockItemGuids: string[],
): any[] {
  const preserved = existingActions.filter(
    (a: any) => a.gameActionType !== "unlockItemRecipeView",
  );
  preserved.push({
    gameActionType: "unlockItemRecipeView",
    gameActionParam: {
      unlockItemGuids,
    },
  });
  return preserved;
}

function normalizeRecipeRefs(edge: ReactFlowEdge): RecipeReference[] {
  const data = edge.data as Record<string, unknown> | undefined;
  const recipeRefs = data?.recipeRefs;

  if (Array.isArray(recipeRefs)) {
    return recipeRefs
      .filter((r): r is RecipeReference => typeof r === "object" && r !== null)
      .filter(
        (r) =>
          (r.edgeType === "craftRecipe" || r.edgeType === "machineRecipe") &&
          typeof r.masterGuid === "string" &&
          r.masterGuid.length > 0,
      );
  }

  const legacyEdgeType = data?.edgeType;
  const legacyMasterGuid = data?.masterGuid;
  if (
    (legacyEdgeType === "craftRecipe" || legacyEdgeType === "machineRecipe") &&
    typeof legacyMasterGuid === "string" &&
    legacyMasterGuid.length > 0
  ) {
    return [{ edgeType: legacyEdgeType, masterGuid: legacyMasterGuid }];
  }

  return [];
}

function toSerializableNode(node: ReactFlowNode) {
  const base = { id: node.id, position: node.position };
  if (node.type === "note") {
    const w = node.data.width as number | undefined;
    const h = node.data.height as number | undefined;
    return {
      ...base,
      type: "note" as const,
      text: (node.data.text as string) || "",
      ...(w != null ? { width: w } : {}),
      ...(h != null ? { height: h } : {}),
    };
  }
  return {
    ...base,
    type: node.type as "item" | "block" | "research",
    masterGuid: node.data.masterGuid as string,
  };
}

function toSerializableEdge(edge: ReactFlowEdge) {
  const recipeRefs = normalizeRecipeRefs(edge);
  if (recipeRefs.length > 0) {
    return {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      edgeType: "recipe" as const,
      recipes: recipeRefs,
    };
  }
  return {
    id: edge.id,
    source: edge.source,
    target: edge.target,
    edgeType: ((edge.data?.edgeType as "dependency" | "visual") || "visual"),
  };
}

export function buildNodeGraphFile(
  nodes: ReactFlowNode[],
  cleanedEdges: ReactFlowEdge[],
  viewport: { x: number; y: number; zoom: number },
): NodeGraphFile {
  return {
    version: 1,
    viewport,
    nodes: nodes.map(toSerializableNode),
    edges: cleanedEdges.map(toSerializableEdge),
  };
}
