import { findSchemaIdForNodeType } from "./nodeTypeSchema";
import { COUNT_KEY_RE, INPUT_KEY_RE, shortGuid } from "./recipeEdgeConstants";
import { buildForeignNameResolver } from "./recipeEdgeLabels";

import type { SchemaMeta } from "./schemaMeta";
import type {
  Column,
  ObjectPropertySchema,
  ObjectSchema,
} from "@moorestech/mooreseditor-plugin-sdk";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

type ForeignNameResolver = (schemaId: string, guid: string) => string | null;

function toCountSuffix(value: unknown): string {
  return typeof value === "number" && value !== 1 ? ` x${value}` : "";
}

function findCountField(row: Record<string, unknown>): unknown {
  for (const [key, value] of Object.entries(row)) {
    if (COUNT_KEY_RE.test(key) && typeof value === "number") {
      return value;
    }
  }
  return undefined;
}

// requiredItems相当のFK配列プロパティから「素材名 xN」行を組み立てる
// Build "material xN" lines from a requiredItems-like FK array property
function buildCostLines(
  property: ObjectPropertySchema,
  record: Record<string, unknown>,
  resolveForeignName: ForeignNameResolver,
): string[] {
  if (!("type" in property) || property.type !== "array") return [];
  if (!INPUT_KEY_RE.test(property.key)) return [];
  if (
    !("items" in property) ||
    !property.items ||
    property.items.type !== "object"
  ) {
    return [];
  }

  const rows = record[property.key];
  if (!Array.isArray(rows)) return [];

  const itemSchema = property.items as ObjectSchema;
  const fkProp = itemSchema.properties?.find(
    (entry) =>
      "type" in entry &&
      entry.type === "uuid" &&
      "foreignKey" in entry &&
      !!entry.foreignKey,
  );
  if (!fkProp || !("foreignKey" in fkProp) || !fkProp.foreignKey) return [];

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const obj = row as Record<string, unknown>;
      const guid = obj[fkProp.key];
      if (typeof guid !== "string" || guid.length === 0) return null;
      const label =
        resolveForeignName(fkProp.foreignKey.schemaId, guid) ?? shortGuid(guid);
      return `${label}${toCountSuffix(findCountField(obj))}`;
    })
    .filter((value): value is string => value !== null);
}

/**
 * ターゲットノード（block/train）のマスタレコードから建設コストラベルを導出
 * Derive a build-cost label from the target node's master record (block/train)
 */
export function buildBuildCostLabel(
  targetNode: ReactFlowNode | undefined,
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
  resolveForeignName: ForeignNameResolver,
): string | null {
  if (!targetNode?.type) return null;
  const masterGuid = targetNode.data?.masterGuid;
  if (typeof masterGuid !== "string" || masterGuid.length === 0) return null;

  const schemaId = findSchemaIdForNodeType(targetNode.type, schemaMetas);
  if (!schemaId) return null;
  const meta = schemaMetas.get(schemaId);
  if (!meta?.guidField || !meta.elementSchema) return null;

  const column = jsonData.find((c) => c.title === schemaId);
  const rows = column?.data?.[meta.dataArrayPath];
  if (!Array.isArray(rows)) return null;

  const record = rows.find(
    (r: any) => r && typeof r === "object" && r[meta.guidField!] === masterGuid,
  );
  if (!record) return null;

  const lines: string[] = [];
  for (const property of meta.elementSchema.properties ?? []) {
    lines.push(
      ...buildCostLines(
        property,
        record as Record<string, unknown>,
        resolveForeignName,
      ),
    );
  }
  return lines.length > 0 ? lines.join("\n") : null;
}

/**
 * buildCostエッジへラベルを焼き込む。変化がないエッジは同一参照を返す
 * Bake labels into buildCost edges; unchanged edges keep the same reference
 */
export function resolveBuildCostEdgeLabels(
  edges: ReactFlowEdge[],
  nodes: ReactFlowNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowEdge[] {
  const resolveForeignName = buildForeignNameResolver(jsonData, schemaMetas);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));

  return edges.map((edge) => {
    if (edge.data?.edgeType !== "buildCost") return edge;

    const label = buildBuildCostLabel(
      nodeById.get(edge.target),
      jsonData,
      schemaMetas,
      resolveForeignName,
    );
    const current =
      typeof edge.data?.buildCostLabel === "string"
        ? edge.data.buildCostLabel
        : undefined;
    const next = label ?? undefined;
    if (current === next) return edge;

    return {
      ...edge,
      data: { ...(edge.data || {}), buildCostLabel: next },
    };
  });
}
