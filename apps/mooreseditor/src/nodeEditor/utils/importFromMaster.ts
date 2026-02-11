import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { Node as ReactFlowNode } from "@xyflow/react";


/**
 * Import research nodes from master data, using UIPosition for positioning.
 * This generates an initial graph from existing master data.
 */
export function importResearchFromMaster(
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowNode[] {
  const nodes: ReactFlowNode[] = [];
  const researchMeta = schemaMetas.get("research");
  if (!researchMeta?.guidField) return nodes;

  const researchColumn = jsonData.find((c) => c.title === "research");
  const dataArray = researchColumn?.data?.[researchMeta.dataArrayPath];
  if (!Array.isArray(dataArray)) return nodes;

  for (const record of dataArray) {
    const guid = record[researchMeta.guidField];
    if (!guid) continue;

    // Use UIPosition from graphViewSettings if available
    const uiPos = record.graphViewSettings?.UIPosition;
    const position = {
      x: Array.isArray(uiPos) ? uiPos[0] : 0,
      y: Array.isArray(uiPos) ? uiPos[1] : 0,
    };

    const displayName = researchMeta.nameField
      ? record[researchMeta.nameField]
      : guid;

    nodes.push({
      id: `research-${guid}`,
      type: "research",
      position,
      data: {
        masterGuid: guid,
        displayName: displayName || guid,
      },
    });
  }

  return nodes;
}
