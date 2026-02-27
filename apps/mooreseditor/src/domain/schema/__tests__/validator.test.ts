import { describe, it, expect } from "vitest";

import { createSchemaValidator } from "../validator";

import type { SchemaContainer } from "../types";

describe("validator", () => {
  describe("createSchemaValidator", () => {
    it("should validate string schema container", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: { type: "string" },
      };
      const validator = createSchemaValidator(schemaContainer);

      const validData = ["hello", "world"];
      expect(validator.parse(validData)).toEqual(validData);

      expect(() => validator.parse([1, 2, 3])).toThrow();
      expect(() => validator.parse("not an array")).toThrow();
    });

    it("should validate integer schema container", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: { type: "integer" },
      };
      const validator = createSchemaValidator(schemaContainer);

      const validData = [1, 2, 3];
      expect(validator.parse(validData)).toEqual(validData);

      expect(() => validator.parse([1.5, 2.7])).toThrow();
      expect(() => validator.parse(["not", "integers"])).toThrow();
    });

    it("should validate object schema container", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "name", type: "string" },
            { key: "age", type: "integer" },
          ],
        },
      };
      const validator = createSchemaValidator(schemaContainer);

      const validData = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      expect(validator.parse(validData)).toEqual(validData);

      expect(() => validator.parse([{ name: "John", age: "30" }])).toThrow();
    });

    it("should handle object schema with ref", () => {
      const referencedSchema: SchemaContainer = {
        id: "person",
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "name", type: "string" },
            { key: "age", type: "integer" },
          ],
        },
      };

      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: {
          type: "object",
          ref: "person",
        },
      };

      const validator = createSchemaValidator(schemaContainer, [
        referencedSchema,
      ]);

      const validData = [
        { name: "John", age: 30 },
        { name: "Jane", age: 25 },
      ];
      expect(validator.parse(validData)).toEqual(validData);
    });

    it("should throw when referenced schema not found", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: {
          type: "object",
          ref: "nonexistent",
        },
      };

      expect(() => createSchemaValidator(schemaContainer)).toThrow(
        'Referenced schema with id "nonexistent" not found',
      );
    });

    it("should validate schema with optional fields", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: {
          type: "object",
          properties: [
            { key: "required", type: "string" },
            { key: "optional", type: "string", optional: true },
          ],
        },
      };
      const validator = createSchemaValidator(schemaContainer);

      const validData = [
        { required: "value" },
        { required: "value", optional: "optional value" },
      ];
      expect(validator.parse(validData)).toEqual(validData);

      expect(() => validator.parse([{ optional: "value" }])).toThrow();
    });

    it("should validate vector types", () => {
      const vector2Schema: SchemaContainer = {
        id: "test",
        type: "array",
        items: { type: "vector2" },
      };
      const v2 = createSchemaValidator(vector2Schema);
      expect(
        v2.parse([
          [1, 2],
          [3.5, 4.5],
        ]),
      ).toEqual([
        [1, 2],
        [3.5, 4.5],
      ]);
      expect(() => v2.parse([[1]])).toThrow();

      const vector3Schema: SchemaContainer = {
        id: "test",
        type: "array",
        items: { type: "vector3" },
      };
      const v3 = createSchemaValidator(vector3Schema);
      expect(v3.parse([[1, 2, 3]])).toEqual([[1, 2, 3]]);
    });

    it("should allow extra properties with passthrough", () => {
      const schemaContainer: SchemaContainer = {
        id: "test",
        type: "array",
        items: {
          type: "object",
          properties: [{ key: "name", type: "string" }],
        },
      };
      const validator = createSchemaValidator(schemaContainer);

      const validData = [{ name: "John", extra: "property", another: 123 }];
      expect(validator.parse(validData)).toEqual(validData);
    });
  });
});
