import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * Get the itemGuid for a given node.
 * For item nodes, the masterGuid is the itemGuid directly.
 * For block nodes, look up the blocks master data to find the associated itemGuid.
 */
function getItemGuidForNode(
  node: ReactFlowNode,
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): string | null {
  if (node.type === "item") {
    return node.data.masterGuid as string;
  }
  if (node.type === "block") {
    // Look up blocks master data for this block's itemGuid
    const blocksMeta = schemaMetas.get("blocks");
    if (!blocksMeta) return null;
    const blocksColumn = jsonData.find((c) => c.title === "blocks");
    if (!blocksColumn?.data?.[blocksMeta.dataArrayPath]) return null;
    const record = blocksColumn.data[blocksMeta.dataArrayPath].find(
      (r: any) => r[blocksMeta.guidField!] === node.data.masterGuid,
    );
    // blocks records have an itemGuid field
    return record?.itemGuid ?? null;
  }
  return null;
}

/**
 * Calculate which items/blocks are spatially unlocked by each research node.
 *
 * Each item/block is assigned to the nearest eligible research node by
 * Manhattan distance. An item is eligible for a research node R if it falls
 * in one of two zones:
 * 1. Right zone: item.x > R.x AND item.y >= R.y
 * 2. Below zone: item.y > R.y AND item.x <= R.x
 *
 * Returns: Map<researchMasterGuid, itemGuid[]>
 */
export function calculateUnlockedItems(
  researchNodes: ReactFlowNode[],
  itemBlockNodes: ReactFlowNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): Map<string, string[]> {
  const result = new Map<string, string[]>();

  // Initialize result map with empty arrays for all research nodes
  for (const r of researchNodes) {
    result.set(r.data.masterGuid as string, []);
  }

  // For each item/block node, find the nearest eligible research node
  for (const node of itemBlockNodes) {
    let nearestResearch: ReactFlowNode | null = null;
    let minDist = Infinity;

    for (const r of researchNodes) {
      const isInRightZone =
        node.position.x > r.position.x && node.position.y >= r.position.y;

      const isInBelowZone =
        node.position.y > r.position.y && node.position.x <= r.position.x;

      if (isInRightZone || isInBelowZone) {
        const dist =
          Math.abs(node.position.x - r.position.x) +
          Math.abs(node.position.y - r.position.y);
        if (dist < minDist) {
          minDist = dist;
          nearestResearch = r;
        }
      }
    }

    if (nearestResearch) {
      const itemGuid = getItemGuidForNode(node, jsonData, schemaMetas);
      if (itemGuid) {
        const masterGuid = nearestResearch.data.masterGuid as string;
        const list = result.get(masterGuid)!;
        if (!list.includes(itemGuid)) {
          list.push(itemGuid);
        }
      }
    }
  }

  return result;
}
