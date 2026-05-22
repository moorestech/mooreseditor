import { updateClearedActions } from "./exportToMasterHelpers";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@mooreseditor/plugin-sdk";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

export function buildResearchDependencyMap(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
): Map<string, string[]> {
  const dependencyMap = new Map<string, string[]>();

  for (const edge of edges) {
    if (edge.data?.edgeType !== "dependency") continue;

    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    if (sourceNode?.type !== "research" || targetNode?.type !== "research") {
      continue;
    }

    const sourceGuid = sourceNode.data.masterGuid as string;
    const targetGuid = targetNode.data.masterGuid as string;
    const existing = dependencyMap.get(targetGuid) ?? [];
    dependencyMap.set(targetGuid, [...existing, sourceGuid]);
  }

  return dependencyMap;
}

export function patchResearchColumn(
  columns: Column[],
  researchNodes: ReactFlowNode[],
  dependencyMap: Map<string, string[]>,
  unlockMap: Map<string, string[]>,
  schemaMetas: Map<string, SchemaMeta>,
): Column[] {
  const researchMeta = schemaMetas.get("research");
  if (!researchMeta) return columns;

  const researchColumnIndex = columns.findIndex(
    (col) => col.title === "research",
  );
  if (researchColumnIndex === -1) return columns;

  const nextColumns = [...columns];
  const currentColumn = { ...nextColumns[researchColumnIndex] };
  const dataArray = [
    ...(currentColumn.data?.[researchMeta.dataArrayPath] || []),
  ];

  for (const node of researchNodes) {
    const masterGuid = node.data.masterGuid as string;
    const recordIndex = dataArray.findIndex(
      (record: any) =>
        researchMeta.guidField && record[researchMeta.guidField] === masterGuid,
    );
    if (recordIndex === -1) continue;

    const record = { ...dataArray[recordIndex] };
    const dependencies = dependencyMap.get(masterGuid);
    if (dependencies) {
      record.prevResearchNodeGuids = dependencies;
    }

    const unlockGuids = unlockMap.get(masterGuid) ?? [];
    record.clearedActions = updateClearedActions(
      record.clearedActions || [],
      unlockGuids,
    );

    dataArray[recordIndex] = record;
  }

  currentColumn.data = {
    ...currentColumn.data,
    [researchMeta.dataArrayPath]: dataArray,
  };
  nextColumns[researchColumnIndex] = currentColumn;

  return nextColumns;
}
