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
 * For each research node, find items/blocks in two zones:
 * 1. Right zone: x > research.x, x < nearest research to the right, y >= research.y
 * 2. Below zone: y > research.y, y < nearest research below, x <= research.x
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

  // Sort research nodes by X (ascending), then Y (ascending) for tie-breaking
  const sorted = [...researchNodes].sort((a, b) =>
    a.position.x !== b.position.x
      ? a.position.x - b.position.x
      : a.position.y - b.position.y,
  );

  for (const r of sorted) {
    // Find the nearest research node in the +X direction
    const rightBoundary = sorted
      .filter((s) => s.id !== r.id && s.position.x > r.position.x)
      .sort((a, b) => {
        const distA =
          Math.abs(a.position.x - r.position.x) +
          Math.abs(a.position.y - r.position.y);
        const distB =
          Math.abs(b.position.x - r.position.x) +
          Math.abs(b.position.y - r.position.y);
        return distA - distB;
      })[0];

    const rightX = rightBoundary?.position.x ?? Infinity;

    // Find the nearest research node in the +Y direction
    const bottomBoundary = sorted
      .filter((s) => s.id !== r.id && s.position.y > r.position.y)
      .sort((a, b) => {
        const distA =
          Math.abs(a.position.y - r.position.y) +
          Math.abs(a.position.x - r.position.x);
        const distB =
          Math.abs(b.position.y - r.position.y) +
          Math.abs(b.position.x - r.position.x);
        return distA - distB;
      })[0];

    const bottomY = bottomBoundary?.position.y ?? Infinity;

    const unlocked: string[] = [];
    const seen = new Set<string>();

    for (const node of itemBlockNodes) {
      // Right zone: to the right of R, bounded by next research right
      const inRightZone =
        node.position.x > r.position.x &&
        node.position.x < rightX &&
        node.position.y >= r.position.y;

      // Below zone: below R, bounded by next research below
      const inBelowZone =
        node.position.y > r.position.y &&
        node.position.y < bottomY &&
        node.position.x <= r.position.x;

      if (inRightZone || inBelowZone) {
        const itemGuid = getItemGuidForNode(node, jsonData, schemaMetas);
        if (itemGuid && !seen.has(itemGuid)) {
          seen.add(itemGuid);
          unlocked.push(itemGuid);
        }
      }
    }

    result.set(r.data.masterGuid as string, unlocked);
  }

  return result;
}
