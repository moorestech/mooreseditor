import type { RecipeReference } from "./nodeGraph";

export type ConnectionDecision =
  | { edgeType: "dependency" | "visual" | "buildCost" }
  | { edgeType: "recipe"; recipeRefs: RecipeReference[] };
