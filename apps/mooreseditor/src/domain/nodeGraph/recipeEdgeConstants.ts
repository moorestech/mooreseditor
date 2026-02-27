import type { RecipeEdgeType } from "./types";

export const RECIPE_SCHEMA_MAP: Record<RecipeEdgeType, string> = {
  craftRecipe: "craftRecipes",
  machineRecipe: "machineRecipes",
};

export const OUTPUT_KEY_RE = /(output|result|product|target|to)/i;
export const INPUT_KEY_RE = /(input|required|material|consume|source|from)/i;
export const COUNT_KEY_RE = /(count|amount|num|qty)/i;
export const BLOCK_KEY_RE = /(block|machine|device|station|processor)/i;

export function shortGuid(guid: string): string {
  return guid.length > 8 ? guid.slice(0, 8) : guid;
}
