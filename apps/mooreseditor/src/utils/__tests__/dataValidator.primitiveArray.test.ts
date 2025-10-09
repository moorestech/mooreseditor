import { describe, it, expect } from "vitest";

import { validateAndFillMissingFields } from "../dataValidator";

import type { ObjectSchema } from "../../libs/schema/types";

describe("dataValidator - primitive array preservation", () => {
  it("should preserve primitive number array values", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "hp",
          type: "integer",
          default: 100,
        },
        {
          key: "earnItemHps",
          type: "array",
          default: [0],
          items: {
            type: "integer",
          },
        },
      ],
    };

    const existingData = {
      hp: 30,
      earnItemHps: [0, 10, 20],
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    console.log("Result data:", JSON.stringify(data, null, 2));
    console.log("Added fields:", addedFields);

    // Primitive array values should be preserved
    expect(data.earnItemHps).toEqual([0, 10, 20]);
    expect(data.hp).toBe(30);
    expect(addedFields).toHaveLength(0);
  });

  it("should preserve string array values", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "tags",
          type: "array",
          items: {
            type: "string",
          },
        },
      ],
    };

    const existingData = {
      tags: ["forest", "resource", "renewable"],
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    expect(data.tags).toEqual(["forest", "resource", "renewable"]);
    expect(addedFields).toHaveLength(0);
  });

  it("should validate object arrays but not primitive arrays", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "primitiveArray",
          type: "array",
          items: {
            type: "number",
          },
        },
        {
          key: "objectArray",
          type: "array",
          items: {
            type: "object",
            properties: [
              {
                key: "id",
                type: "integer",
              },
              {
                key: "value",
                type: "number",
                default: 100,
              },
            ],
          },
        },
      ],
    };

    const existingData = {
      primitiveArray: [5, 10, 15],
      objectArray: [
        {
          id: 1,
          // value is missing
        },
      ],
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    console.log("Mixed array result:", JSON.stringify(data, null, 2));
    console.log("Mixed array added fields:", addedFields);

    // Primitive array should be preserved
    expect(data.primitiveArray).toEqual([5, 10, 15]);

    // Object array should be validated and filled
    expect(data.objectArray[0].value).toBe(100);
    expect(addedFields).toContain("objectArray[0].value");
  });
});