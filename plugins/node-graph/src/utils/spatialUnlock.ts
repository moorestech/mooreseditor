import {
  createEmptyResearchUnlocks,
  resolveUnlockRef,
  UNLOCK_LIST_KEY,
} from "./unlockTargets";

import type { ResearchUnlocks, UnlockKind } from "./unlockTargets";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * Calculate which items/blocks/train cars are spatially unlocked by each
 * research node.
 *
 * Uses a two-pass bounding-box algorithm:
 *
 * Pass 1 (Right zone / Bounding box):
 *   For each node, find the nearest research (by Manhattan distance)
 *   where R.x < node.x AND R.y <= node.y. This handles cases where
 *   research nodes at similar x but different y levels compete.
 *
 * Pass 2 (Below zone):
 *   For nodes not assigned in Pass 1, find the nearest research node
 *   (by Manhattan distance) where R.x >= node.x AND R.y < node.y.
 *   This handles nodes placed to the left of and below a research node.
 *
 * Node types are routed to separate unlock lists (item → unlockItemGuids,
 * block → unlockBlockGuids, train → unlockTrainCarGuids). Nodes whose
 * masterGuid is missing from the guid index (dangling refs or unloaded
 * master columns) are excluded entirely.
 *
 * Returns: Map<researchMasterGuid, ResearchUnlocks>
 */
export function calculateResearchUnlocks(
  researchNodes: ReactFlowNode[],
  unlockableNodes: ReactFlowNode[],
  guidIndex: Map<UnlockKind, Set<string>>,
): Map<string, ResearchUnlocks> {
  const result = new Map<string, ResearchUnlocks>();

  // Initialize result map with empty unlocks for all research nodes
  for (const r of researchNodes) {
    result.set(r.data.masterGuid as string, createEmptyResearchUnlocks());
  }

  // 種別に応じたリストへ振り分け。dangling参照はここで弾かれる
  // Route into per-kind list; dangling refs are rejected here
  const assignToResearch = (
    research: ReactFlowNode,
    node: ReactFlowNode,
  ): boolean => {
    const ref = resolveUnlockRef(node, guidIndex);
    if (!ref) return false;
    const unlocks = result.get(research.data.masterGuid as string)!;
    const list = unlocks[UNLOCK_LIST_KEY[ref.kind]];
    if (!list.includes(ref.guid)) {
      list.push(ref.guid);
    }
    return true;
  };

  // Track which nodes have been assigned in Pass 1
  const assignedNodeIds = new Set<string>();

  // Pass 1: Bounding-box (right zone) assignment
  // For each node, find the nearest research (by Manhattan distance) where R.x < node.x AND R.y <= node.y
  for (const node of unlockableNodes) {
    let bestResearch: ReactFlowNode | null = null;
    let bestDist = Infinity;

    for (const r of researchNodes) {
      if (r.position.x < node.position.x && r.position.y <= node.position.y) {
        const dist =
          Math.abs(node.position.x - r.position.x) +
          Math.abs(node.position.y - r.position.y);
        if (dist < bestDist) {
          bestDist = dist;
          bestResearch = r;
        }
      }
    }

    if (bestResearch && assignToResearch(bestResearch, node)) {
      assignedNodeIds.add(node.id);
    }
  }

  // Pass 2: Below-zone assignment for unassigned nodes
  // For each unassigned node, find nearest research where R.x >= node.x AND R.y < node.y
  // Nodes to the LEFT of all research nodes are skipped (they belong to no spatial zone)
  const minResearchX =
    researchNodes.length > 0
      ? Math.min(...researchNodes.map((r) => r.position.x))
      : 0;
  for (const node of unlockableNodes) {
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
      assignToResearch(nearestResearch, node);
    }
  }

  return result;
}
