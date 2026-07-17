// edgeType(永続) → React Flow描画type の唯一の対応表
// Single source of truth for edgeType (persisted) → React Flow render type
export type EdgeRenderType = "recipe" | "buildCost" | "arrow";

export function edgeRenderType(edgeType: string): EdgeRenderType {
  if (
    edgeType === "recipe" ||
    edgeType === "craftRecipe" ||
    edgeType === "machineRecipe"
  ) {
    return "recipe";
  }
  if (edgeType === "buildCost") return "buildCost";
  return "arrow";
}
