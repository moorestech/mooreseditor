import { describe, expect, it } from "vitest";

import { cleanupOrphanedRecipesAfterEdgeUpdate } from "./recipeCleanup";

import type { SchemaMeta } from "./schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type { Edge as ReactFlowEdge } from "@xyflow/react";

function craftRecipeMeta(): SchemaMeta {
  return {
    schemaId: "craftRecipes",
    guidField: "craftRecipeGuid",
    nameField: "craftRecipeName",
    dataArrayPath: "data",
    elementSchema: null,
  };
}

function recipeEdge(id: string, recipeGuids: string[]): ReactFlowEdge {
  return {
    id,
    source: "source",
    target: "target",
    type: "recipe",
    data: {
      edgeType: "recipe",
      recipeRefs: recipeGuids.map((masterGuid) => ({
        edgeType: "craftRecipe" as const,
        masterGuid,
      })),
    },
  };
}

function columnsWithRecipes(...recipeGuids: string[]): Column[] {
  return [
    {
      title: "craftRecipes",
      data: {
        data: recipeGuids.map((guid) => ({
          craftRecipeGuid: guid,
          craftRecipeName: guid,
        })),
      },
    },
  ];
}

function recipeGuids(columns: Column[]): string[] {
  return columns[0].data.data.map(
    (row: Record<string, unknown>) => row.craftRecipeGuid as string,
  );
}

const schemaMetas = new Map([["craftRecipes", craftRecipeMeta()]]);

describe("cleanupOrphanedRecipesAfterEdgeUpdate", () => {
  it("does not remove a recipe reference kept by the updated edge", () => {
    const previousEdge = recipeEdge("edge-1", ["recipe-a", "recipe-b"]);
    const updatedEdges = [recipeEdge("edge-1", ["recipe-a"])];
    const result = cleanupOrphanedRecipesAfterEdgeUpdate(
      previousEdge,
      updatedEdges,
      columnsWithRecipes("recipe-a", "recipe-b"),
      schemaMetas,
    );

    expect(recipeGuids(result)).toEqual(["recipe-a"]);
  });

  it("removes a detached recipe reference when no updated edge references it", () => {
    const previousEdge = recipeEdge("edge-1", ["recipe-a", "recipe-b"]);
    const updatedEdges = [recipeEdge("edge-1", ["recipe-a"])];
    const result = cleanupOrphanedRecipesAfterEdgeUpdate(
      previousEdge,
      updatedEdges,
      columnsWithRecipes("recipe-a", "recipe-b"),
      schemaMetas,
    );

    expect(recipeGuids(result)).not.toContain("recipe-b");
  });

  it("does not remove a detached recipe reference when another edge still references it", () => {
    const previousEdge = recipeEdge("edge-1", ["recipe-a", "recipe-b"]);
    const updatedEdges = [
      recipeEdge("edge-1", ["recipe-a"]),
      recipeEdge("edge-2", ["recipe-b"]),
    ];
    const result = cleanupOrphanedRecipesAfterEdgeUpdate(
      previousEdge,
      updatedEdges,
      columnsWithRecipes("recipe-a", "recipe-b"),
      schemaMetas,
    );

    expect(recipeGuids(result)).toEqual(["recipe-a", "recipe-b"]);
  });
});
