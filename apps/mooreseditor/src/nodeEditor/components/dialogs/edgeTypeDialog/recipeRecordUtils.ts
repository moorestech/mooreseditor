import { createInitialValue } from "../../../../utils/createInitialValue";
import {
  RECIPE_SCHEMA_MAP,
  buildForeignNameResolver,
  buildSchemaRecordIndex,
  buildSingleRecipeSummary,
} from "../../../utils/recipeEdge";
import {
  OUTPUT_KEY_RE,
  INPUT_KEY_RE,
} from "../../../utils/recipeEdgeConstants";

import type {
  EditableRecipe,
  RecipeOptionsByType,
  UuidForeignKeyProperty,
} from "./types";
import type { NodeSchemaRef } from "./types";
import type { Column } from "../../../../hooks/useJson";
import type { ObjectSchema } from "../../../../libs/schema/types";
import type { RecipeEdgeType, RecipeReference } from "../../../types/nodeGraph";
import type { SchemaMeta } from "../../../utils/schemaMeta";

function pickGuidForForeignKey(
  propertyKey: string,
  foreignSchemaId: string,
  sourceRef: NodeSchemaRef,
  targetRef: NodeSchemaRef,
): string | null {
  const sourceMatch =
    sourceRef.schemaId === foreignSchemaId ? sourceRef.guid : null;
  const targetMatch =
    targetRef.schemaId === foreignSchemaId ? targetRef.guid : null;

  if (sourceMatch && !targetMatch) return sourceMatch;
  if (targetMatch && !sourceMatch) return targetMatch;
  if (!sourceMatch && !targetMatch) return null;

  if (OUTPUT_KEY_RE.test(propertyKey)) return targetMatch ?? sourceMatch;
  if (INPUT_KEY_RE.test(propertyKey)) return sourceMatch ?? targetMatch;
  return sourceMatch ?? targetMatch;
}

export function hydrateRecipeRecord(
  record: Record<string, unknown>,
  elementSchema: ObjectSchema,
  sourceRef: NodeSchemaRef,
  targetRef: NodeSchemaRef,
): Record<string, unknown> {
  const next = { ...record };

  for (const property of elementSchema.properties ?? []) {
    if (!("type" in property)) continue;

    if (
      property.type === "uuid" &&
      "foreignKey" in property &&
      property.foreignKey
    ) {
      const current = next[property.key];
      if (typeof current === "string" && current.length > 0) continue;

      const guid = pickGuidForForeignKey(
        property.key,
        property.foreignKey.schemaId,
        sourceRef,
        targetRef,
      );
      if (guid) next[property.key] = guid;
      continue;
    }

    if (property.type !== "array" || property.items.type !== "object") continue;

    const current = next[property.key];
    if (Array.isArray(current) && current.length > 0) continue;

    const itemSchema = property.items as ObjectSchema;
    const fkProps = (itemSchema.properties ?? []).filter(
      (entry): entry is UuidForeignKeyProperty =>
        "type" in entry &&
        entry.type === "uuid" &&
        "foreignKey" in entry &&
        !!entry.foreignKey,
    );
    if (fkProps.length === 0) continue;

    const candidate = fkProps.find(
      (fkProp) =>
        !!pickGuidForForeignKey(
          `${property.key}.${fkProp.key}`,
          fkProp.foreignKey.schemaId,
          sourceRef,
          targetRef,
        ),
    );
    if (!candidate) continue;

    const guid = pickGuidForForeignKey(
      `${property.key}.${candidate.key}`,
      candidate.foreignKey.schemaId,
      sourceRef,
      targetRef,
    );
    if (!guid) continue;

    const itemDefaults = createInitialValue(itemSchema) as Record<
      string,
      unknown
    >;
    next[property.key] = [{ ...itemDefaults, [candidate.key]: guid }];
  }

  return next;
}

export function buildRecipeOptions(
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): RecipeOptionsByType {
  const optionsByType: RecipeOptionsByType = {
    craftRecipe: [],
    machineRecipe: [],
  };

  const resolveForeignName = buildForeignNameResolver(jsonData, schemaMetas);
  const recipeRecords = new Map<string, Map<string, Record<string, unknown>>>();
  for (const schemaId of Object.values(RECIPE_SCHEMA_MAP)) {
    recipeRecords.set(
      schemaId,
      buildSchemaRecordIndex(schemaId, jsonData, schemaMetas),
    );
  }

  (
    Object.entries(RECIPE_SCHEMA_MAP) as Array<[RecipeEdgeType, string]>
  ).forEach(([recipeType, schemaId]) => {
    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField) return;

    const column = jsonData.find((entry) => entry.title === schemaId);
    const rows = column?.data?.[meta.dataArrayPath];
    if (!Array.isArray(rows)) return;

    optionsByType[recipeType] = rows
      .map((row) => {
        if (!row || typeof row !== "object") return null;

        const record = row as Record<string, unknown>;
        const guid = record[meta.guidField];
        if (typeof guid !== "string" || guid.length === 0) return null;

        const label = buildSingleRecipeSummary(
          { edgeType: recipeType, masterGuid: guid },
          recipeRecords,
          schemaMetas,
          resolveForeignName,
          "→",
        );
        return { value: guid, label };
      })
      .filter(
        (option): option is { value: string; label: string } => option !== null,
      );
  });

  return optionsByType;
}

export function buildEditableRecipes(
  recipeRefs: RecipeReference[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): EditableRecipe[] {
  const resolveForeignName = buildForeignNameResolver(jsonData, schemaMetas);
  const recipeRecords = new Map<string, Map<string, Record<string, unknown>>>();
  for (const schemaId of Object.values(RECIPE_SCHEMA_MAP)) {
    recipeRecords.set(
      schemaId,
      buildSchemaRecordIndex(schemaId, jsonData, schemaMetas),
    );
  }

  return recipeRefs
    .map((ref) => {
      const schemaId = RECIPE_SCHEMA_MAP[ref.edgeType];
      const schemaMeta = schemaMetas.get(schemaId);
      if (!schemaMeta?.guidField) return null;

      const column = jsonData.find((entry) => entry.title === schemaId);
      const rows = column?.data?.[schemaMeta.dataArrayPath];
      if (!Array.isArray(rows)) return null;

      const record = rows.find(
        (row) =>
          row &&
          typeof row === "object" &&
          (row as Record<string, unknown>)[schemaMeta.guidField!] ===
            ref.masterGuid,
      ) as Record<string, unknown> | undefined;
      if (!record) return null;

      const typeLabel = ref.edgeType === "craftRecipe" ? "Craft" : "Machine";
      const summary = buildSingleRecipeSummary(
        ref,
        recipeRecords,
        schemaMetas,
        resolveForeignName,
        "→",
      );

      return {
        key: `${ref.edgeType}:${ref.masterGuid}`,
        recipeType: ref.edgeType,
        recipeGuid: ref.masterGuid,
        schemaId,
        schemaMeta,
        record,
        label: `${typeLabel}: ${summary}`,
      };
    })
    .filter((entry): entry is EditableRecipe => entry !== null);
}
