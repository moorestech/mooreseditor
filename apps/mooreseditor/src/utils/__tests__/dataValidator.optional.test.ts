import { describe, it, expect } from "vitest";

import { validateAndFillMissingFields } from "../dataValidator";

import type { ObjectSchema } from "../../libs/schema/types";

describe("dataValidator - optional field preservation", () => {
  it("should preserve optional object fields with existing data", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "name",
          type: "string",
        },
        {
          key: "overrideVerticalBlock",
          type: "object",
          optional: true,
          properties: [
            {
              key: "upBlockGuid",
              type: "uuid",
              optional: true,
            },
            {
              key: "downBlockGuid",
              type: "uuid",
              optional: true,
            },
            {
              key: "horizontalBlockGuid",
              type: "uuid",
              optional: true,
            },
          ],
        },
      ],
    };

    const existingData = {
      name: "直線歯車ベルトコンベア",
      overrideVerticalBlock: {
        upBlockGuid: "11c8a7c9-b4c9-41c6-b52e-4f7b78d7e51d",
        downBlockGuid: "c568f762-ee82-4e5f-8c80-0d70e3cbd8a2",
        horizontalBlockGuid: "67255c7b-135d-4c46-95e8-fcf01f151580",
      },
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    console.log("Result data:", JSON.stringify(data, null, 2));
    console.log("Added fields:", addedFields);

    // Optional field with data should be preserved
    expect(data.overrideVerticalBlock).toBeDefined();
    expect(data.overrideVerticalBlock.upBlockGuid).toBe(
      "11c8a7c9-b4c9-41c6-b52e-4f7b78d7e51d",
    );
    expect(data.overrideVerticalBlock.downBlockGuid).toBe(
      "c568f762-ee82-4e5f-8c80-0d70e3cbd8a2",
    );
    expect(data.overrideVerticalBlock.horizontalBlockGuid).toBe(
      "67255c7b-135d-4c46-95e8-fcf01f151580",
    );

    // No fields should be added since everything was already present
    expect(addedFields).toHaveLength(0);
  });

  it("should not add optional object fields when they don't exist", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "name",
          type: "string",
        },
        {
          key: "overrideVerticalBlock",
          type: "object",
          optional: true,
          properties: [
            {
              key: "upBlockGuid",
              type: "uuid",
              optional: true,
            },
          ],
        },
      ],
    };

    const existingData = {
      name: "Test Block",
      // overrideVerticalBlock is not present
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    // Optional field should not be added
    expect(data.overrideVerticalBlock).toBeUndefined();
    expect(addedFields).toHaveLength(0);
  });

  it("should preserve empty optional object fields", () => {
    const schema: ObjectSchema = {
      type: "object",
      properties: [
        {
          key: "name",
          type: "string",
        },
        {
          key: "overrideVerticalBlock",
          type: "object",
          optional: true,
          properties: [
            {
              key: "upBlockGuid",
              type: "uuid",
              optional: true,
            },
          ],
        },
      ],
    };

    const existingData = {
      name: "Test Block",
      overrideVerticalBlock: {},
    };

    const { data, addedFields } = validateAndFillMissingFields(
      existingData,
      schema,
    );

    // Empty optional object should be preserved
    expect(data.overrideVerticalBlock).toBeDefined();
    expect(data.overrideVerticalBlock).toEqual({});
    expect(addedFields).toHaveLength(0);
  });
});