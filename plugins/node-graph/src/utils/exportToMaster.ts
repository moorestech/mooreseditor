import { buildNodeGraphFile } from "./exportToMasterHelpers";
import {
  buildResearchDependencyMap,
  patchResearchColumn,
} from "./exportToMasterResearchPatch";
import { validateGraph } from "./graphValidator";
import { calculateResearchUnlocks } from "./spatialUnlock";
import { buildUnlockGuidIndex, UNLOCKABLE_NODE_TYPES } from "./unlockTargets";

import type { SchemaMeta } from "./schemaMeta";
import type { NodeGraphFile } from "../types/nodeGraph";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";

/**
 * Export node graph data to master data (partial patch for research).
 * Returns updated columns with research data patched.
 */
export function exportToMaster(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
  viewport: { x: number; y: number; zoom: number },
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): { updatedColumns: Column[]; nodeGraphFile: NodeGraphFile } {
  const { cleanedEdges, warnings } = validateGraph(nodes, edges);
  if (warnings.length > 0) {
    console.warn("Graph validation warnings:", warnings);
  }

  const researchNodes = nodes.filter((node) => node.type === "research");
  const unlockableNodes = nodes.filter(
    (node) => node.type && UNLOCKABLE_NODE_TYPES.has(node.type),
  );

  // 有効GUID索引を先に構築し、dangling参照と未ロード種別を分離する
  // Build the valid-guid index first to separate dangling refs from unloaded kinds
  const guidIndex = buildUnlockGuidIndex(jsonData, schemaMetas);
  const unlockMap = calculateResearchUnlocks(
    researchNodes,
    unlockableNodes,
    guidIndex,
  );
  const dependencyMap = buildResearchDependencyMap(nodes, cleanedEdges);
  const updatedColumns = patchResearchColumn(
    [...jsonData],
    researchNodes,
    dependencyMap,
    unlockMap,
    schemaMetas,
    new Set(guidIndex.keys()),
  );

  const nodeGraphFile = buildNodeGraphFile(nodes, cleanedEdges, viewport);
  return { updatedColumns, nodeGraphFile };
}
