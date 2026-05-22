import { describe, expect, it } from "vitest";

import { findSchemaIdForNodeType } from "./nodeTypeSchema";

import type { SchemaMeta } from "./schemaMeta";

function meta(schemaId: string): SchemaMeta {
  return {
    schemaId,
    guidField: `${schemaId}Guid`,
    nameField: `${schemaId}Name`,
    dataArrayPath: "data",
    elementSchema: null,
  };
}

describe("findSchemaIdForNodeType", () => {
  it("uses an exact schema id before plural fallback", () => {
    const metas = new Map([
      ["item", meta("item")],
      ["items", meta("items")],
    ]);

    expect(findSchemaIdForNodeType("item", metas)).toBe("item");
  });

  it("falls back to plural schema id", () => {
    const metas = new Map([["items", meta("items")]]);

    expect(findSchemaIdForNodeType("item", metas)).toBe("items");
  });

  it("supports arbitrary node types when a matching schema exists", () => {
    const metas = new Map([["quests", meta("quests")]]);

    expect(findSchemaIdForNodeType("quest", metas)).toBe("quests");
  });
});
