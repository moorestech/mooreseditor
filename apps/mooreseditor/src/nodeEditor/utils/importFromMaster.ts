import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type { Node as ReactFlowNode } from "@xyflow/react";

/**
 * Import research nodes from master data.
 * This generates an initial graph from existing master data.
 * Node positions default to (0,0) and are managed exclusively by nodeGraph.v1.json.
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

    const position = { x: 0, y: 0 };

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
