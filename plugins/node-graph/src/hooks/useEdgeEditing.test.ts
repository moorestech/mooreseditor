import { MarkerType } from "@xyflow/react";
import { describe, expect, it } from "vitest";

import { buildEditedEdge } from "./useEdgeEditing";

import type { Edge as ReactFlowEdge } from "@xyflow/react";

function baseRecipeEdge(): ReactFlowEdge {
  return {
    id: "edge-1",
    source: "source",
    target: "target",
    type: "recipe",
    data: {
      edgeType: "recipe",
      recipeRefs: [{ edgeType: "craftRecipe", masterGuid: "old-guid" }],
    },
  };
}

describe("buildEditedEdge", () => {
  it("builds a recipe edge with the same shape as new recipe connections", () => {
    const result = buildEditedEdge(baseRecipeEdge(), {
      edgeType: "recipe",
      recipeRefs: [{ edgeType: "machineRecipe", masterGuid: "new-guid" }],
    });

    expect(result).toEqual({
      id: "edge-1",
      source: "source",
      target: "target",
      type: "recipe",
      data: {
        edgeType: "recipe",
        recipeRefs: [{ edgeType: "machineRecipe", masterGuid: "new-guid" }],
      },
    });
  });

  it("builds a dependency edge with the same shape as new dependency connections", () => {
    const result = buildEditedEdge(baseRecipeEdge(), {
      edgeType: "dependency",
    });

    expect(result).toEqual({
      id: "edge-1",
      source: "source",
      target: "target",
      type: "arrow",
      data: { edgeType: "dependency" },
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });

  it("builds a visual edge with the same shape as new visual connections", () => {
    const result = buildEditedEdge(baseRecipeEdge(), {
      edgeType: "visual",
    });

    expect(result).toEqual({
      id: "edge-1",
      source: "source",
      target: "target",
      type: "arrow",
      data: { edgeType: "visual" },
      markerEnd: { type: MarkerType.ArrowClosed },
    });
  });
});
