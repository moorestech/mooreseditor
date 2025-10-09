import { describe, it, expect } from "vitest";

import { validateAndFillMissingFields } from "./dataValidator";

import type {
  ArraySchema,
  ObjectSchema,
  SwitchSchema,
} from "../libs/schema/types";

describe("validateAndFillMissingFields", () => {
  it("fills missing required fields in objects", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        { key: "id", type: "integer", optional: false },
        { key: "name", type: "string", optional: false },
        { key: "description", type: "string", optional: true },
      ],
    };

    const existingData = { id: 100 };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    expect(data).toEqual({ id: 100, name: "" });
    expect(addedFields).toContain("name");
  });

  it("assigns auto increment values inside arrays", () => {
    const schema: ArraySchema = {
      type: "array",
      items: {
        type: "object",
        properties: [
          {
            key: "id",
            type: "integer",
            optional: false,
            autoIncrement: { direction: "asc", step: 1, startWith: 1 },
          },
          { key: "name", type: "string", optional: false },
        ],
      },
    };

    const existingData = [{ name: "Sword" }];

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    expect(data[0]).toEqual({ id: 1, name: "Sword" });
    expect(addedFields).toContain("[0].id");
  });

  it("fills required fields for matching switch cases", () => {
    const switchSchema: SwitchSchema = {
      switch: "./type",
      cases: [
        {
          when: "weapon",
          type: "object",
          properties: [{ key: "damage", type: "integer", optional: false }],
        },
        {
          when: "armor",
          type: "object",
          properties: [{ key: "defense", type: "integer", optional: false }],
        },
      ],
    };

    const schema: ObjectSchema = {
      type: "object",
      properties: [
        { key: "type", type: "string", optional: false },
        { key: "config", ...switchSchema },
      ],
    };

    const existingData = {
      type: "weapon",
      config: {},
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    expect(data).toEqual({
      type: "weapon",
      config: { damage: 0 },
    });
    expect(addedFields).toContain("config.damage");
  });
});
