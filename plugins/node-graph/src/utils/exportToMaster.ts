import { buildNodeGraphFile } from "./exportToMasterHelpers";
import {
  buildResearchDependencyMap,
  patchResearchColumn,
} from "./exportToMasterResearchPatch";
import { validateGraph } from "./graphValidator";
import { calculateUnlockedItems } from "./spatialUnlock";

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
  const itemBlockNodes = nodes.filter(
    (node) => node.type === "item" || node.type === "block",
  );

  const unlockMap = calculateUnlockedItems(
    researchNodes,
    itemBlockNodes,
    jsonData,
    schemaMetas,
  );
  const dependencyMap = buildResearchDependencyMap(nodes, cleanedEdges);
  const updatedColumns = patchResearchColumn(
    [...jsonData],
    researchNodes,
    dependencyMap,
    unlockMap,
    schemaMetas,
  );

  const nodeGraphFile = buildNodeGraphFile(nodes, cleanedEdges, viewport);
  return { updatedColumns, nodeGraphFile };
}
