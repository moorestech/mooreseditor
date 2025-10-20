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

  it("preserves switch case object fields when validating array rows", () => {
    const schema: Schema = {
      type: "object",
      properties: [
        {
          key: "blockType",
          type: "enum",
          options: ["Block", "ElectricMachine"],
        },
        {
          key: "blockParam",
          switch: "./blockType",
          cases: [
            {
              when: "Block",
              type: "object",
              properties: [],
            },
            {
              when: "ElectricMachine",
              type: "object",
              properties: [
                {
                  key: "requiredPower",
                  type: "number",
                },
              ],
            },
          ],
        },
      ],
    };

    const row = {
      blockType: "ElectricMachine",
      blockParam: {
        requiredPower: 5,
      },
    };

    const zodSchema = schemaToZod(schema);
    const result = zodSchema.safeParse(row);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.blockParam).toEqual(row.blockParam);
    }
  });
});
