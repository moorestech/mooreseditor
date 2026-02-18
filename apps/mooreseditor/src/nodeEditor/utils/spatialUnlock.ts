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
 * Uses a two-pass bounding-box algorithm:
 *
 * Pass 1 (Right zone / Bounding box):
 *   For each item, find the research with the largest R.x where
 *   R.x < item.x AND R.y <= item.y. This creates implicit "columns"
 *   bounded by consecutive research nodes on the x-axis.
 *
 * Pass 2 (Below zone):
 *   For items not assigned in Pass 1, find the nearest research node
 *   (by Manhattan distance) where R.x >= item.x AND R.y < item.y.
 *   This handles items placed to the left of and below a research node.
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

  // Track which items have been assigned in Pass 1
  const assignedNodeIds = new Set<string>();

  // Pass 1: Bounding-box (right zone) assignment
  // For each item, find the research with max R.x where R.x < item.x AND R.y <= item.y
  for (const node of itemBlockNodes) {
    let bestResearch: ReactFlowNode | null = null;

    for (const r of researchNodes) {
      if (r.position.x < node.position.x && r.position.y <= node.position.y) {
        if (
          !bestResearch ||
          r.position.x > bestResearch.position.x ||
          (r.position.x === bestResearch.position.x &&
            r.position.y > bestResearch.position.y)
        ) {
          bestResearch = r;
        }
      }
    }

    if (bestResearch) {
      const itemGuid = getItemGuidForNode(node, jsonData, schemaMetas);
      if (itemGuid) {
        const masterGuid = bestResearch.data.masterGuid as string;
        const list = result.get(masterGuid)!;
        if (!list.includes(itemGuid)) {
          list.push(itemGuid);
        }
        assignedNodeIds.add(node.id);
      }
    }
  }

  // Pass 2: Below-zone assignment for unassigned items
  // For each unassigned item, find nearest research where R.x >= item.x AND R.y < item.y
  // Items to the LEFT of all research nodes are skipped (they belong to no spatial zone)
  const minResearchX =
    researchNodes.length > 0
      ? Math.min(...researchNodes.map((r) => r.position.x))
      : 0;
  for (const node of itemBlockNodes) {
    if (assignedNodeIds.has(node.id)) continue;
    if (node.position.x < minResearchX) continue;

    let nearestResearch: ReactFlowNode | null = null;
    let minDist = Infinity;

    for (const r of researchNodes) {
      if (r.position.x >= node.position.x && r.position.y < node.position.y) {
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
