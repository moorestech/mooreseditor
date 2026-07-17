import { updateClearedActions } from "./exportToMasterHelpers";
import { findSchemaIdForNodeType } from "./nodeTypeSchema";
import { createEmptyResearchUnlocks } from "./unlockTargets";

import type { SchemaMeta } from "./schemaMeta";
import type { ResearchUnlocks, UnlockKind } from "./unlockTargets";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

export function buildResearchDependencyMap(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
): Map<string, string[]> {
  const dependencySets = new Map<string, Set<string>>();

  for (const edge of edges) {
    if (edge.data?.edgeType !== "dependency") continue;

    const sourceNode = nodes.find((node) => node.id === edge.source);
    const targetNode = nodes.find((node) => node.id === edge.target);
    if (sourceNode?.type !== "research" || targetNode?.type !== "research") {
      continue;
    }

    const sourceGuid = sourceNode.data.masterGuid as string;
    const targetGuid = targetNode.data.masterGuid as string;
    if (sourceGuid === targetGuid) continue;

    const existing = dependencySets.get(targetGuid) ?? new Set<string>();
    existing.add(sourceGuid);
    dependencySets.set(targetGuid, existing);
  }

  const dependencyMap = new Map<string, string[]>();
  for (const [targetGuid, sourceGuids] of dependencySets) {
    dependencyMap.set(targetGuid, [...sourceGuids]);
  }
  return dependencyMap;
}

export function patchResearchColumn(
  columns: Column[],
  researchNodes: ReactFlowNode[],
  dependencyMap: Map<string, string[]>,
  unlockMap: Map<string, ResearchUnlocks>,
  schemaMetas: Map<string, SchemaMeta>,
  activeKinds: ReadonlySet<UnlockKind>,
): Column[] {
  const researchSchemaId = findSchemaIdForNodeType("research", schemaMetas);
  if (!researchSchemaId) return columns;

  const researchMeta = schemaMetas.get(researchSchemaId);
  if (!researchMeta) return columns;

  const researchColumnIndex = columns.findIndex(
    (col) => col.title === researchSchemaId,
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
    record.prevResearchNodeGuids = dependencyMap.get(masterGuid) ?? [];

    const unlocks = unlockMap.get(masterGuid) ?? createEmptyResearchUnlocks();
    record.clearedActions = updateClearedActions(
      record.clearedActions || [],
      unlocks,
      activeKinds,
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
