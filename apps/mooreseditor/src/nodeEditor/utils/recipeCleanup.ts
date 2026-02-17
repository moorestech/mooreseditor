import {
  RECIPE_SCHEMA_MAP,
  normalizeRecipeRefsFromEdgeData,
} from "./recipeEdge";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { Edge as ReactFlowEdge } from "@xyflow/react";

/**
 * Remove recipe records from jsonData for the given edges.
 * Only removes recipes that are not referenced by any other remaining edge.
 */
export function removeRecipesFromJsonData(
  edgesToRemove: ReactFlowEdge[],
  allEdges: ReactFlowEdge[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): Column[] {
  const refsToRemove = edgesToRemove.flatMap((e) =>
    normalizeRecipeRefsFromEdgeData(e.data),
  );
  if (refsToRemove.length === 0) return jsonData;

  // Collect recipe refs still in use by other edges
  const removingIds = new Set(edgesToRemove.map((e) => e.id));
  const refsStillInUse = new Set<string>();
  for (const edge of allEdges) {
    if (removingIds.has(edge.id)) continue;
    for (const ref of normalizeRecipeRefsFromEdgeData(edge.data)) {
      refsStillInUse.add(`${ref.edgeType}:${ref.masterGuid}`);
    }
  }

  const refsToActuallyRemove = refsToRemove.filter(
    (ref) => !refsStillInUse.has(`${ref.edgeType}:${ref.masterGuid}`),
  );
  if (refsToActuallyRemove.length === 0) return jsonData;

  let result = [...jsonData];
  for (const ref of refsToActuallyRemove) {
    const schemaId = RECIPE_SCHEMA_MAP[ref.edgeType];
    const schemaMeta = schemaMetas.get(schemaId);
    if (!schemaMeta?.guidField) continue;

    const colIndex = result.findIndex((col) => col.title === schemaId);
    if (colIndex === -1) continue;

    const col = result[colIndex];
    const rows = Array.isArray(col.data?.[schemaMeta.dataArrayPath])
      ? (col.data[schemaMeta.dataArrayPath] as Record<string, unknown>[])
      : [];
    const filteredRows = rows.filter(
      (row) =>
        row &&
        typeof row === "object" &&
        (row as Record<string, unknown>)[schemaMeta.guidField!] !==
          ref.masterGuid,
    );

    result = [...result];
    result[colIndex] = {
      ...col,
      data: { ...col.data, [schemaMeta.dataArrayPath]: filteredRows },
    };
  }

  return result;
}
