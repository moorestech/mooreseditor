import { describe, expect, it } from "vitest";

import { schemaToZod } from "./schemaToZod";

import type { Schema } from "../libs/schema/types";

describe("schemaToZod - uuid schema", () => {
  it("allows empty string values for optional UUID fields", () => {
    const schema: Schema = { type: "uuid", optional: true };

    const zodSchema = schemaToZod(schema);

    expect(zodSchema.safeParse("").success).toBe(true);
  });

  it("rejects empty string values when UUID field is required", () => {
    const schema: Schema = { type: "uuid", optional: false };

    const zodSchema = schemaToZod(schema);

    expect(zodSchema.safeParse("").success).toBe(false);
  });
});
