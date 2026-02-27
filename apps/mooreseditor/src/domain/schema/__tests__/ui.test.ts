import { describe, it, expect } from "vitest";

import { getTableColumns } from "../ui";

import type { ArraySchema } from "../types";

describe("ui", () => {
  describe("getTableColumns", () => {
    it("should return column keys for array of objects", () => {
      const schema: ArraySchema = {
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "id", type: "integer" },
            { key: "name", type: "string" },
            { key: "active", type: "boolean" },
          ],
        },
      };

      const columns = getTableColumns(schema);
      expect(columns).toEqual(["id", "name", "active"]);
    });

    it("should filter out object and array properties", () => {
      const schema: ArraySchema = {
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "id", type: "integer" },
            { key: "name", type: "string" },
            { key: "metadata", type: "object", properties: [] },
            { key: "tags", type: "array", items: { type: "string" } },
          ],
        },
      };

      const columns = getTableColumns(schema);
      expect(columns).toEqual(["id", "name"]);
    });

    it("should throw error for non-object array items", () => {
      const schema: ArraySchema = {
        type: "array",
        items: { type: "string" },
      };

      expect(() => getTableColumns(schema)).toThrow(
        "objectを要素に持たないarrayはテーブル表示できません",
      );
    });

    it("should handle all vector types", () => {
      const schema: ArraySchema = {
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "v2", type: "vector2" },
            { key: "v3", type: "vector3" },
            { key: "v4", type: "vector4" },
            { key: "v2int", type: "vector2Int" },
            { key: "v3int", type: "vector3Int" },
            { key: "v4int", type: "vector4Int" },
          ],
        },
      };

      const columns = getTableColumns(schema);
      expect(columns).toEqual(["v2", "v3", "v4", "v2int", "v3int", "v4int"]);
    });
  });
});
