import { findSchemaIdForNodeType } from "./nodeTypeSchema";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type { Node as ReactFlowNode } from "@xyflow/react";

// 研究解放の対象種別。ノードtypeと1:1対応
// Unlockable target kinds, mapped 1:1 from node types
export type UnlockKind = "item" | "block" | "train";

export interface ResearchUnlocks {
  unlockItemGuids: string[];
  unlockBlockGuids: string[];
  unlockTrainCarGuids: string[];
}

// 種別→clearedActionsのaction型/パラメータキー対応
// Kind → clearedActions action type / param key mapping
export const UNLOCK_ACTION_SPECS: ReadonlyArray<{
  kind: UnlockKind;
  gameActionType: string;
  paramKey: keyof ResearchUnlocks;
}> = [
  {
    kind: "item",
    gameActionType: "unlockItemRecipeView",
    paramKey: "unlockItemGuids",
  },
  { kind: "block", gameActionType: "unlockBlock", paramKey: "unlockBlockGuids" },
  {
    kind: "train",
    gameActionType: "unlockTrainCar",
    paramKey: "unlockTrainCarGuids",
  },
];

export const UNLOCK_LIST_KEY = Object.fromEntries(
  UNLOCK_ACTION_SPECS.map((spec) => [spec.kind, spec.paramKey]),
) as Record<UnlockKind, keyof ResearchUnlocks>;

export const UNLOCKABLE_NODE_TYPES: ReadonlySet<string> = new Set(
  UNLOCK_ACTION_SPECS.map((spec) => spec.kind),
);

export function createEmptyResearchUnlocks(): ResearchUnlocks {
  return {
    unlockItemGuids: [],
    unlockBlockGuids: [],
    unlockTrainCarGuids: [],
  };
}

/**
 * 種別ごとの有効GUID集合。カラム未ロードの種別はエントリ自体を作らない
 * Valid GUID sets per kind; kinds without a loaded column get no entry
 */
export function buildUnlockGuidIndex(
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): Map<UnlockKind, Set<string>> {
  const index = new Map<UnlockKind, Set<string>>();
  for (const spec of UNLOCK_ACTION_SPECS) {
    const schemaId = findSchemaIdForNodeType(spec.kind, schemaMetas);
    if (!schemaId) continue;
    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField) continue;
    const column = jsonData.find((c) => c.title === schemaId);
    const rows = column?.data?.[meta.dataArrayPath];
    if (!Array.isArray(rows)) continue;

    const guids = new Set<string>();
    for (const row of rows) {
      if (!row || typeof row !== "object") continue;
      const guid = (row as Record<string, unknown>)[meta.guidField];
      if (typeof guid === "string" && guid.length > 0) guids.add(guid);
    }
    index.set(spec.kind, guids);
  }
  return index;
}

/**
 * danglingなmasterGuidはnull（unlockへ絶対に注入しない）
 * Returns null for dangling masterGuids (never injected into unlocks)
 */
export function resolveUnlockRef(
  node: ReactFlowNode,
  guidIndex: Map<UnlockKind, Set<string>>,
): { kind: UnlockKind; guid: string } | null {
  if (!node.type || !UNLOCKABLE_NODE_TYPES.has(node.type)) return null;
  const kind = node.type as UnlockKind;
  const guids = guidIndex.get(kind);
  if (!guids) return null;
  const guid = node.data.masterGuid;
  if (typeof guid !== "string" || !guids.has(guid)) return null;
  return { kind, guid };
}
