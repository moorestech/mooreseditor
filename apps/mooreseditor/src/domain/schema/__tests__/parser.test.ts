import { describe, it, expect } from "vitest";

import { parseYaml, parseSchemaYaml, resolveRefs } from "../parser";

describe("parser", () => {
  describe("parseYaml", () => {
    it("should parse a YAML string into an object", () => {
      const result = parseYaml("name: test\nvalue: 42");
      expect(result).toEqual({ name: "test", value: 42 });
    });

    it("should return null for empty string", () => {
      expect(parseYaml("")).toBeNull();
    });
  });

  describe("resolveRefs", () => {
    it("should resolve ref properties using definitions", () => {
      const definitions = {
        weapon: {
          type: "object",
          properties: [
            { key: "damage", type: "integer" },
            { key: "range", type: "number" },
          ],
        },
      };

      const schema = {
        type: "object",
        ref: "weapon",
      };

      const resolved = resolveRefs(schema, definitions);
      expect(resolved).toEqual({
        type: "object",
        properties: [
          { key: "damage", type: "integer" },
          { key: "range", type: "number" },
        ],
      });
    });

    it("should resolve nested refs recursively", () => {
      const definitions = {
        stats: {
          type: "object",
          properties: [{ key: "hp", type: "integer" }],
        },
      };

      const schema = {
        type: "object",
        properties: [
          { key: "name", type: "string" },
          { key: "stats", ref: "stats" },
        ],
      };

      const resolved = resolveRefs(schema, definitions);
      expect(resolved.properties[1]).toEqual({
        key: "stats",
        type: "object",
        properties: [{ key: "hp", type: "integer" }],
      });
    });

    it("should leave unknown refs unchanged", () => {
      const schema = {
        type: "object",
        ref: "nonexistent",
      };

      const resolved = resolveRefs(schema, {});
      expect(resolved).toEqual(schema);
    });
  });

  describe("parseSchemaYaml", () => {
    it("should parse YAML and resolve refs in one step", () => {
      const definitions = {
        weapon: {
          type: "object",
          properties: [{ key: "damage", type: "integer" }],
        },
      };

      const yaml = `
type: object
properties:
  - key: item
    ref: weapon
`;

      const result = parseSchemaYaml(yaml, definitions);
      expect((result as any).properties[0]).toEqual({
        key: "item",
        type: "object",
        properties: [{ key: "damage", type: "integer" }],
      });
    });
  });
});
