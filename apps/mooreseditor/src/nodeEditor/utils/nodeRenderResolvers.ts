import { findSchemaIdForNodeType } from "./nodeTypeSchema";
import {
  buildRecipeEdgeLabels,
  normalizeRecipeRefsFromEdgeData,
} from "./recipeEdge";
import { COUNT_KEY_RE, INPUT_KEY_RE, shortGuid } from "./recipeEdgeConstants";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type {
  ObjectPropertySchema,
  ObjectSchema,
} from "../../libs/schema/types";
import type {
  Edge as ReactFlowEdge,
  Node as ReactFlowNode,
} from "@xyflow/react";

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

function buildForeignNameResolver(
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
) {
  const cache = new Map<string, Map<string, string>>();

  return (schemaId: string, guid: string): string | null => {
    let index = cache.get(schemaId);
    if (!index) {
      index = new Map<string, string>();
      const meta = schemaMetas.get(schemaId);
      if (meta?.guidField) {
        const column = jsonData.find((entry) => entry.title === schemaId);
        const rows = column?.data?.[meta.dataArrayPath];
        if (Array.isArray(rows)) {
          for (const row of rows) {
            if (!row || typeof row !== "object") continue;
            const record = row as Record<string, unknown>;
            const id = record[meta.guidField];
            if (typeof id !== "string" || id.length === 0) continue;
            const rawLabel = meta.nameField ? record[meta.nameField] : id;
            const label =
              typeof rawLabel === "string" && rawLabel.length > 0
                ? rawLabel
                : shortGuid(id);
            index.set(id, label);
          }
        }
      }
      cache.set(schemaId, index);
    }

    return index.get(guid) ?? null;
  };
}

function buildArrayConsumeLabels(
  key: string,
  property: ObjectPropertySchema,
  record: Record<string, unknown>,
  resolveForeignName: (schemaId: string, guid: string) => string | null,
): string[] {
  if (!("type" in property) || property.type !== "array") return [];
  if (!INPUT_KEY_RE.test(key)) return [];
  if (
    !("items" in property) ||
    !property.items ||
    property.items.type !== "object"
  ) {
    return [];
  }

  const rows = record[key];
  if (!Array.isArray(rows)) return [];

  const itemSchema = property.items as ObjectSchema;
  const fkProps = (itemSchema.properties ?? []).filter(
    (entry) =>
      "type" in entry &&
      entry.type === "uuid" &&
      "foreignKey" in entry &&
      !!entry.foreignKey,
  );
  if (fkProps.length === 0) return [];

  return rows
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const obj = row as Record<string, unknown>;

      const labels = fkProps
        .map((fkProp) => {
          if (!("foreignKey" in fkProp) || !fkProp.foreignKey) return null;
          const guid = obj[fkProp.key];
          if (typeof guid !== "string" || guid.length === 0) return null;

          return (
            resolveForeignName(fkProp.foreignKey.schemaId, guid) ??
            shortGuid(guid)
          );
        })
        .filter((value): value is string => value !== null);
      if (labels.length === 0) return null;

      const count = findCountField(obj);
      return `${labels.join(" / ")}${toCountSuffix(count)}`;
    })
    .filter((value): value is string => value !== null);
}

function buildResearchConsumeLabels(
  record: Record<string, unknown>,
  meta: SchemaMeta,
  resolveForeignName: (schemaId: string, guid: string) => string | null,
): string[] {
  if (!meta.elementSchema) return [];

  const consumeLabels: string[] = [];
  for (const property of meta.elementSchema.properties ?? []) {
    consumeLabels.push(
      ...buildArrayConsumeLabels(
        property.key,
        property,
        record,
        resolveForeignName,
      ),
    );
  }
  return consumeLabels;
}

function areStringArraysEqual(a: string[] | undefined, b: string[]): boolean {
  if (!a) return b.length === 0;
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

/**
 * Resolve display names from master data at render time.
 * This ensures names are always up-to-date even if data loads after the graph.
 */
export function resolveDisplayNames(
  nodes: ReactFlowNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowNode[] {
  const resolveForeignName = buildForeignNameResolver(jsonData, schemaMetas);

  return nodes.map((node) => {
    if (node.type === "note" || !node.data.masterGuid) return node;

    const schemaId = findSchemaIdForNodeType(node.type!, schemaMetas);
    if (!schemaId) return node;

    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField) return node;

    const col = jsonData.find((c) => c.title === schemaId);
    const arr = col?.data?.[meta.dataArrayPath];
    if (!Array.isArray(arr)) return node;

    const record = arr.find(
      (r: any) => r[meta.guidField!] === node.data.masterGuid,
    );
    if (!record || typeof record !== "object") return node;

    const nextData: Record<string, unknown> = { ...node.data };
    let hasChanged = false;

    const displayName = meta.nameField ? record[meta.nameField] : undefined;
    if (displayName && displayName !== node.data.displayName) {
      nextData.displayName = displayName;
      hasChanged = true;
    }

    if (node.type === "research") {
      const consumeLabels = buildResearchConsumeLabels(
        record as Record<string, unknown>,
        meta,
        resolveForeignName,
      );
      const currentConsumeLabels = Array.isArray(node.data.consumeLabels)
        ? (node.data.consumeLabels as string[])
        : undefined;
      if (!areStringArraysEqual(currentConsumeLabels, consumeLabels)) {
        nextData.consumeLabels = consumeLabels;
        hasChanged = true;
      }
    }

    return hasChanged ? { ...node, data: nextData } : node;
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
