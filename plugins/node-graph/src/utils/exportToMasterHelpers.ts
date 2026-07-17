import { normalizeNoteColor } from "./noteColor";
import { UNLOCK_ACTION_SPECS } from "./unlockTargets";

import type { ResearchUnlocks, UnlockKind } from "./unlockTargets";
import type { RecipeReference, NodeGraphFile } from "../types/nodeGraph";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

/**
 * Update clearedActions: regenerate unlock actions (item/block/train) from the
 * spatial layout, preserve all other action types (giveItem, playSkit, ...).
 * Kinds absent from activeKinds (master column not loaded) keep their existing
 * actions untouched so a partial load can never wipe hand-authored unlocks.
 */
export function updateClearedActions(
  existingActions: any[],
  unlocks: ResearchUnlocks,
  activeKinds: ReadonlySet<UnlockKind>,
): any[] {
  // 管理対象のaction型を一旦除去し、非空のみ再生成する
  // Strip managed action types, then re-emit only non-empty ones
  const managedTypes = new Set(
    UNLOCK_ACTION_SPECS.filter((spec) => activeKinds.has(spec.kind)).map(
      (spec) => spec.gameActionType,
    ),
  );
  const next = existingActions.filter(
    (a: any) => !managedTypes.has(a.gameActionType),
  );
  for (const spec of UNLOCK_ACTION_SPECS) {
    if (!activeKinds.has(spec.kind)) continue;
    const guids = unlocks[spec.paramKey];
    if (guids.length === 0) continue;
    next.push({
      gameActionType: spec.gameActionType,
      gameActionParam: { [spec.paramKey]: guids },
    });
  }
  return next;
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
    const color = normalizeNoteColor(node.data.color);
    return {
      ...base,
      type: "note" as const,
      text: (node.data.text as string) || "",
      color,
      ...(w != null ? { width: w } : {}),
      ...(h != null ? { height: h } : {}),
    };
  }
  if (node.type === "placeholder") {
    return {
      ...base,
      type: "placeholder" as const,
      text: (node.data.text as string) || "",
    };
  }
  return {
    ...base,
    type: node.type as "item" | "block" | "train" | "research",
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
    edgeType:
      (edge.data?.edgeType as "dependency" | "visual" | "buildCost") ||
      "visual",
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
