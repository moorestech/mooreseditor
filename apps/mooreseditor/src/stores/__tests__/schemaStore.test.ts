import { describe, expect, it, beforeEach } from "vitest";

import { useSchemaStore } from "../schemaStore";

import type { Schema } from "../../domain/schema/types";

describe("schemaStore", () => {
  beforeEach(() => {
    useSchemaStore.getState().reset();
  });

  it("starts with empty schemas and not loading", () => {
    const state = useSchemaStore.getState();
    expect(state.schemas).toEqual({});
    expect(state.loading).toBe(false);
  });

  it("setSchema stores a schema by name", () => {
    const schema: Schema = { type: "object", properties: [] };
    useSchemaStore.getState().setSchema("items", schema);

    expect(useSchemaStore.getState().schemas["items"]).toEqual(schema);
  });

  it("setSchema preserves existing schemas", () => {
    const schema1: Schema = { type: "object", properties: [] };
    const schema2: Schema = { type: "array", items: { type: "string" } };

    useSchemaStore.getState().setSchema("items", schema1);
    useSchemaStore.getState().setSchema("blocks", schema2);

    const schemas = useSchemaStore.getState().schemas;
    expect(Object.keys(schemas)).toHaveLength(2);
    expect(schemas["items"]).toEqual(schema1);
    expect(schemas["blocks"]).toEqual(schema2);
  });

  it("setSchema overwrites existing schema with same name", () => {
    const schema1: Schema = { type: "object", properties: [] };
    const schema2: Schema = { type: "string" };

    useSchemaStore.getState().setSchema("items", schema1);
    useSchemaStore.getState().setSchema("items", schema2);

    expect(useSchemaStore.getState().schemas["items"]).toEqual(schema2);
  });

  it("reset clears all schemas", () => {
    useSchemaStore.getState().setSchema("items", { type: "string" });
    useSchemaStore.getState().reset();

    expect(useSchemaStore.getState().schemas).toEqual({});
    expect(useSchemaStore.getState().loading).toBe(false);
  });
});
