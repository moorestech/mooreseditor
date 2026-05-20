import type { RecipeReference } from "./nodeGraph";

export type ConnectionDecision =
  | { edgeType: "dependency" | "visual" }
  | { edgeType: "recipe"; recipeRefs: RecipeReference[] };
