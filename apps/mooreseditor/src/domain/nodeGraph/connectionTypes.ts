import type { RecipeReference } from "./types";

export type ConnectionDecision =
  | { edgeType: "dependency" | "visual" }
  | { edgeType: "recipe"; recipeRefs: RecipeReference[] };
