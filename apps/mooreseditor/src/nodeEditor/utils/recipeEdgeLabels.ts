import {
  BLOCK_KEY_RE,
  COUNT_KEY_RE,
  INPUT_KEY_RE,
  OUTPUT_KEY_RE,
  RECIPE_SCHEMA_MAP,
  shortGuid,
} from "./recipeEdgeConstants";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "../../hooks/useJson";
import type {
  ObjectPropertySchema,
  ObjectSchema,
} from "../../libs/schema/types";
import type { RecipeReference } from "../types/nodeGraph";

export function buildSchemaRecordIndex(
  schemaId: string,
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): Map<string, Record<string, unknown>> {
  const index = new Map<string, Record<string, unknown>>();
  const meta = schemaMetas.get(schemaId);
  if (!meta?.guidField) return index;

  const column = jsonData.find((entry) => entry.title === schemaId);
  const rows = column?.data?.[meta.dataArrayPath];
  if (!Array.isArray(rows)) return index;

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const guid = (row as Record<string, unknown>)[meta.guidField];
    if (typeof guid === "string" && guid.length > 0) {
      index.set(guid, row as Record<string, unknown>);
    }
  }

  return index;
}

export function buildForeignNameResolver(
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

function toCountSuffix(value: unknown): string {
  return typeof value === "number" ? ` ${value}` : "";
}

function findCountField(row: Record<string, unknown>): unknown {
  for (const [key, value] of Object.entries(row)) {
    if (COUNT_KEY_RE.test(key) && typeof value === "number") {
      return value;
    }
  }
  return undefined;
}

function buildArrayIngredientLabels(
  key: string,
  property: ObjectPropertySchema,
  record: Record<string, unknown>,
  resolveForeignName: (schemaId: string, guid: string) => string | null,
): string[] {
  if (!("type" in property) || property.type !== "array") return [];
  if (
    !("items" in property) ||
    !property.items ||
    property.items.type !== "object"
  )
    return [];

  const rows = record[key];
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
      const count = findCountField(obj);
      return `${label}${toCountSuffix(count)}`;
    })
    .filter((value): value is string => value !== null);
}

export function buildSingleRecipeSummary(
  recipeRef: RecipeReference,
  recipeRecords: Map<string, Map<string, Record<string, unknown>>>,
  schemaMetas: Map<string, SchemaMeta>,
  resolveForeignName: (schemaId: string, guid: string) => string | null,
): string {
  const schemaId = RECIPE_SCHEMA_MAP[recipeRef.edgeType];
  const meta = schemaMetas.get(schemaId);
  const record = recipeRecords.get(schemaId)?.get(recipeRef.masterGuid);

  if (!meta?.elementSchema || !record) {
    const typeLabel =
      recipeRef.edgeType === "craftRecipe" ? "Craft" : "Machine";
    return `${typeLabel}:${shortGuid(recipeRef.masterGuid)}`;
  }

  const outputs: string[] = [];
  const inputs: string[] = [];
  let blockLabel: string | null = null;

  for (const property of meta.elementSchema.properties ?? []) {
    if (!("type" in property)) continue;

    if (
      property.type === "uuid" &&
      "foreignKey" in property &&
      property.foreignKey
    ) {
      const guid = record[property.key];
      if (typeof guid !== "string" || guid.length === 0) continue;
      const label =
        resolveForeignName(property.foreignKey.schemaId, guid) ??
        shortGuid(guid);

      if (OUTPUT_KEY_RE.test(property.key)) {
        const countValue = findCountField(record);
        outputs.push(`${label}${toCountSuffix(countValue)}`);
      } else if (BLOCK_KEY_RE.test(property.key)) {
        blockLabel = label;
      }
      continue;
    }

    if (property.type !== "array") continue;
    const entries = buildArrayIngredientLabels(
      property.key,
      property,
      record,
      resolveForeignName,
    );
    if (entries.length === 0) continue;

    if (OUTPUT_KEY_RE.test(property.key)) {
      outputs.push(...entries);
    } else if (INPUT_KEY_RE.test(property.key)) {
      inputs.push(...entries);
    }
  }

  if (inputs.length === 0 && outputs.length === 0) {
    const name = meta.nameField ? record[meta.nameField] : undefined;
    if (typeof name === "string" && name.length > 0) {
      return name;
    }
    if (blockLabel) {
      return blockLabel;
    }
    return shortGuid(recipeRef.masterGuid);
  }

  const lines: string[] = [];
  if (blockLabel) {
    lines.push(blockLabel);
  }
  lines.push(...inputs);
  lines.push("↓");
  lines.push(...outputs);
  return lines.join("\n");
}

export function buildRecipeEdgeLabels(
  recipeRefs: RecipeReference[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): string[] {
  const resolveForeignName = buildForeignNameResolver(jsonData, schemaMetas);
  const recipeRecords = new Map<string, Map<string, Record<string, unknown>>>();

  for (const schemaId of Object.values(RECIPE_SCHEMA_MAP)) {
    recipeRecords.set(
      schemaId,
      buildSchemaRecordIndex(schemaId, jsonData, schemaMetas),
    );
  }

  return recipeRefs.map((ref) =>
    buildSingleRecipeSummary(
      ref,
      recipeRecords,
      schemaMetas,
      resolveForeignName,
    ),
  );
}
