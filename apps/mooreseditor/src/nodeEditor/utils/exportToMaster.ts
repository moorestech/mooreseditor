
import { validateGraph } from "./graphValidator";
import { calculateUnlockedItems } from "./spatialUnlock";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { NodeGraphFile } from "../types/nodeGraph";
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

/**
 * Update clearedActions: upsert unlockItemRecipeView only, preserve all other action types.
 */
function updateClearedActions(
  existingActions: any[],
  unlockItemGuids: string[],
): any[] {
  // 1. Preserve all actions except unlockItemRecipeView
  const preserved = existingActions.filter(
    (a: any) => a.challengeActionType !== "unlockItemRecipeView",
  );

  // 2. Upsert unlockItemRecipeView
  preserved.push({
    challengeActionType: "unlockItemRecipeView",
    challengeActionParam: {
      unlockItemGuids: unlockItemGuids,
    },
  });

  return preserved;
}

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
  // 1. Validate and clean edges
  const { cleanedEdges, warnings } = validateGraph(nodes, edges);
  if (warnings.length > 0) {
    console.warn("Graph validation warnings:", warnings);
  }

  // 2. Separate node types
  const researchNodes = nodes.filter((n) => n.type === "research");
  const itemBlockNodes = nodes.filter(
    (n) => n.type === "item" || n.type === "block",
  );

  // 3. Calculate spatial unlocks
  const unlockMap = calculateUnlockedItems(
    researchNodes,
    itemBlockNodes,
    jsonData,
    schemaMetas,
  );

  // 4. Build dependency map from edges (research → research dependencies)
  const dependencyMap = new Map<string, string[]>();
  for (const edge of cleanedEdges) {
    if (edge.data?.edgeType === "dependency") {
      const sourceNode = nodes.find((n) => n.id === edge.source);
      const targetNode = nodes.find((n) => n.id === edge.target);
      if (
        sourceNode?.type === "research" &&
        targetNode?.type === "research"
      ) {
        // target depends on source → target.prevResearchNodeGuids includes source
        const targetGuid = targetNode.data.masterGuid as string;
        const sourceGuid = sourceNode.data.masterGuid as string;
        const existing = dependencyMap.get(targetGuid) || [];
        existing.push(sourceGuid);
        dependencyMap.set(targetGuid, existing);
      }
    }
  }

  // 5. Patch research data
  const researchMeta = schemaMetas.get("research");
  const updatedColumns = [...jsonData];

  if (researchMeta) {
    const researchColIdx = updatedColumns.findIndex(
      (c) => c.title === "research",
    );
    if (researchColIdx !== -1) {
      const col = { ...updatedColumns[researchColIdx] };
      const dataArray = [
        ...(col.data?.[researchMeta.dataArrayPath] || []),
      ];

      for (const rNode of researchNodes) {
        const masterGuid = rNode.data.masterGuid as string;
        const recordIdx = dataArray.findIndex(
          (r: any) =>
            researchMeta.guidField &&
            r[researchMeta.guidField] === masterGuid,
        );
        if (recordIdx === -1) continue;

        const record = { ...dataArray[recordIdx] };

        // Patch prevResearchNodeGuids
        const deps = dependencyMap.get(masterGuid);
        if (deps) {
          record.prevResearchNodeGuids = deps;
        }

        // Patch graphViewSettings.UIPosition from node position
        if (record.graphViewSettings) {
          record.graphViewSettings = {
            ...record.graphViewSettings,
            UIPosition: [rNode.position.x, rNode.position.y],
          };
        } else {
          record.graphViewSettings = {
            UIPosition: [rNode.position.x, rNode.position.y],
            UIScale: [1, 1, 1],
            IconItem: "",
          };
        }

        // Patch clearedActions (upsert unlockItemRecipeView only)
        const unlockGuids = unlockMap.get(masterGuid) || [];
        record.clearedActions = updateClearedActions(
          record.clearedActions || [],
          unlockGuids,
        );

        dataArray[recordIdx] = record;
      }

      col.data = { ...col.data, [researchMeta.dataArrayPath]: dataArray };
      updatedColumns[researchColIdx] = col;
    }
  }

  // 6. Build nodeGraph file
  const nodeGraphFile: NodeGraphFile = {
    version: 1,
    viewport,
    nodes: nodes.map((n) => {
      const base = { id: n.id, position: n.position };
      if (n.type === "note") {
        return { ...base, type: "note" as const, text: (n.data.text as string) || "" };
      }
      return {
        ...base,
        type: n.type as "item" | "block" | "research",
        masterGuid: n.data.masterGuid as string,
      };
    }),
    edges: cleanedEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      ...(e.data?.edgeType === "craftRecipe" || e.data?.edgeType === "machineRecipe"
        ? { edgeType: e.data.edgeType, masterGuid: e.data.masterGuid as string }
        : { edgeType: (e.data?.edgeType as "dependency" | "visual") || "visual" }),
    })),
  };

  return { updatedColumns, nodeGraphFile };
}
