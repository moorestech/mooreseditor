import type { EditableRecipe } from "./types";
import type { RecipeReference } from "../../../types/nodeGraph";
import type { SchemaMeta } from "../../../utils/schemaMeta";
import type { Column } from "@mooreseditor/plugin-sdk";

export function buildSelectedRecipeRefs(
  craftRecipeGuids: string[],
  machineRecipeGuids: string[],
): RecipeReference[] {
  const refs: RecipeReference[] = [
    ...craftRecipeGuids.map((masterGuid) => ({
      edgeType: "craftRecipe" as const,
      masterGuid,
    })),
    ...machineRecipeGuids.map((masterGuid) => ({
      edgeType: "machineRecipe" as const,
      masterGuid,
    })),
  ];

  const seen = new Set<string>();
  return refs.filter((ref) => {
    const key = `${ref.edgeType}:${ref.masterGuid}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function upsertCreatedRecipe(
  prev: Column[],
  schemaId: string,
  schemaMeta: SchemaMeta,
  recipeGuid: string,
  nextRecord: Record<string, unknown>,
): Column[] {
  const index = prev.findIndex((col) => col.title === schemaId);
  if (index === -1) {
    return [
      ...prev,
      {
        title: schemaId,
        data: { [schemaMeta.dataArrayPath]: [nextRecord] },
      },
    ];
  }

  const nextColumns = [...prev];
  const current = nextColumns[index];
  const currentRowsRaw = current.data?.[schemaMeta.dataArrayPath];
  const currentRows = Array.isArray(currentRowsRaw) ? currentRowsRaw : [];
  const rowIndex = currentRows.findIndex(
    (row) =>
      row &&
      typeof row === "object" &&
      (row as Record<string, unknown>)[schemaMeta.guidField!] === recipeGuid,
  );

  const updatedRows = [...currentRows];
  if (rowIndex === -1) {
    updatedRows.push(nextRecord);
  } else {
    updatedRows[rowIndex] = nextRecord;
  }

  nextColumns[index] = {
    ...current,
    data: {
      ...current.data,
      [schemaMeta.dataArrayPath]: updatedRows,
    },
  };
  return nextColumns;
}

export function updateRecipeRecord(
  prev: Column[],
  recipe: EditableRecipe,
  normalizedRecord: Record<string, unknown>,
): Column[] {
  const index = prev.findIndex((col) => col.title === recipe.schemaId);
  if (index === -1) return prev;

  const nextColumns = [...prev];
  const current = nextColumns[index];
  const currentRowsRaw = current.data?.[recipe.schemaMeta.dataArrayPath];
  const currentRows = Array.isArray(currentRowsRaw) ? currentRowsRaw : [];
  const rowIndex = currentRows.findIndex(
    (row) =>
      row &&
      typeof row === "object" &&
      (row as Record<string, unknown>)[recipe.schemaMeta.guidField!] ===
        recipe.recipeGuid,
  );
  if (rowIndex === -1) return prev;

  const updatedRows = [...currentRows];
  updatedRows[rowIndex] = normalizedRecord;
  nextColumns[index] = {
    ...current,
    data: {
      ...current.data,
      [recipe.schemaMeta.dataArrayPath]: updatedRows,
    },
  };
  return nextColumns;
}
