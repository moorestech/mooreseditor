import { findSchemaIdForNodeType } from "./nodeTypeSchema";
import {
  buildRecipeEdgeLabels,
  normalizeRecipeRefsFromEdgeData,
} from "./recipeEdge";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { Edge as ReactFlowEdge, Node as ReactFlowNode } from "@xyflow/react";

/**
 * Resolve display names from master data at render time.
 * This ensures names are always up-to-date even if data loads after the graph.
 */
export function resolveDisplayNames(
  nodes: ReactFlowNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowNode[] {
  return nodes.map((node) => {
    if (node.type === "note" || !node.data.masterGuid) return node;

    const schemaId = findSchemaIdForNodeType(node.type!, schemaMetas);
    if (!schemaId) return node;

    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField || !meta?.nameField) return node;

    const col = jsonData.find((c) => c.title === schemaId);
    const arr = col?.data?.[meta.dataArrayPath];
    if (!Array.isArray(arr)) return node;

    const record = arr.find(
      (r: any) => r[meta.guidField!] === node.data.masterGuid,
    );
    if (!record) return node;

    const displayName = record[meta.nameField!];
    if (!displayName || displayName === node.data.displayName) return node;

    return { ...node, data: { ...node.data, displayName } };
  });
}

export function resolveEdgeRecipeLabels(
  edges: ReactFlowEdge[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowEdge[] {
  return edges.map((edge) => {
    const recipeRefs = normalizeRecipeRefsFromEdgeData(edge.data);
    if (recipeRefs.length === 0) return edge;

    const labels = buildRecipeEdgeLabels(recipeRefs, jsonData, schemaMetas);
    return {
      ...edge,
      type: "recipe",
      data: {
        ...(edge.data || {}),
        edgeType: "recipe",
        recipeRefs,
        recipeLabels: labels,
      },
    };
  });
}
