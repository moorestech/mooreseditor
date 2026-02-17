import type { GraphEdge, RecipeReference } from "../types/nodeGraph";

/**
 * Type-safe extraction of recipe refs from a persistent GraphEdge.
 * Use this when loading from nodeGraph.v1.json (where the type is known).
 */
export function extractRecipeRefsFromGraphEdge(ge: GraphEdge): RecipeReference[] {
  if (ge.edgeType === "recipe") return ge.recipes;
  if (ge.edgeType === "craftRecipe" || ge.edgeType === "machineRecipe") {
    return [{ edgeType: ge.edgeType, masterGuid: ge.masterGuid }];
  }
  return [];
}

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
    recipes?: unknown;
    recipeRefs?: unknown;
  };

  const refsArray = edgeData.recipes ?? edgeData.recipeRefs;
  if (Array.isArray(refsArray)) {
    return refsArray
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
