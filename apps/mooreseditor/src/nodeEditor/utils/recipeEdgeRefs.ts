import type { RecipeReference } from "../types/nodeGraph";

function parseRecipeRef(value: unknown): RecipeReference | null {
  if (!value || typeof value !== "object") return null;

  const ref = value as { edgeType?: unknown; masterGuid?: unknown };
  if (
    (ref.edgeType === "craftRecipe" || ref.edgeType === "machineRecipe") &&
    typeof ref.masterGuid === "string" &&
    ref.masterGuid.length > 0
  ) {
    return { edgeType: ref.edgeType, masterGuid: ref.masterGuid };
  }

  return null;
}

export function normalizeRecipeRefsFromEdgeData(data: unknown): RecipeReference[] {
  if (!data || typeof data !== "object") return [];

  const edgeData = data as {
    edgeType?: unknown;
    masterGuid?: unknown;
    recipeRefs?: unknown;
  };

  if (Array.isArray(edgeData.recipeRefs)) {
    return edgeData.recipeRefs
      .map(parseRecipeRef)
      .filter((ref): ref is RecipeReference => ref !== null);
  }

  if (
    (edgeData.edgeType === "craftRecipe" || edgeData.edgeType === "machineRecipe") &&
    typeof edgeData.masterGuid === "string" &&
    edgeData.masterGuid.length > 0
  ) {
    return [{ edgeType: edgeData.edgeType, masterGuid: edgeData.masterGuid }];
  }

  return [];
}
