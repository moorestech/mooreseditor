import { describe, it, expect } from "vitest";

import { validateAndFillMissingFields } from "../dataValidator";

import type { ObjectSchema, SwitchSchema } from "../../libs/schema/types";

describe("dataValidator", () => {
  describe("switch field validation", () => {
    it("should fill missing required fields in switch field", () => {
      // Simplified schema similar to blocks.yml
      const schema: ObjectSchema = {
        type: "object",
        properties: [
          {
            key: "blockType",
            type: "enum",
            options: ["ElectricMachine", "Block"],
          },
          {
            key: "blockParam",
            switch: "./blockType",
            cases: [
              {
                when: "ElectricMachine",
                type: "object",
                properties: [
                  {
                    key: "requiredPower",
                    type: "number",
                    default: 5,
                  },
                  {
                    key: "inputSlotCount",
                    type: "integer",
                    default: 1,
                  },
                ],
              },
              {
                when: "Block",
                type: "object",
                properties: [],
              },
            ],
          } as SwitchSchema,
        ],
      };

      // Test data with missing requiredPower
      const existingData = {
        blockType: "ElectricMachine",
        blockParam: {
          inputSlotCount: 3,
          // requiredPower is missing
        },
      };

      const { data, addedFields } = validateAndFillMissingFields(
        existingData,
        schema,
      );

      console.log("Result data:", JSON.stringify(data, null, 2));
      console.log("Added fields:", addedFields);

      expect(data.blockParam.requiredPower).toBe(5);
      expect(addedFields).toContain("blockParam.requiredPower");
    });

    it("should validate array elements with switch fields", () => {
      // Schema for array of objects with switch fields
      const schema: ObjectSchema = {
        type: "object",
        properties: [
          {
            key: "data",
            type: "array",
            items: {
              type: "object",
              properties: [
                {
                  key: "blockType",
                  type: "enum",
                  options: ["ElectricMachine", "Block"],
                },
                {
                  key: "blockParam",
                  switch: "./blockType",
                  cases: [
                    {
                      when: "ElectricMachine",
                      type: "object",
                      properties: [
                        {
                          key: "requiredPower",
                          type: "number",
                          default: 5,
                        },
                      ],
                    },
                  ],
                } as SwitchSchema,
              ],
            },
          },
        ],
      };

      const existingData = {
        data: [
          {
            blockType: "ElectricMachine",
            blockParam: {
              // requiredPower is missing
            },
          },
        ],
      };

      const { data, addedFields } = validateAndFillMissingFields(
        existingData,
        schema,
      );

      console.log("Array result data:", JSON.stringify(data, null, 2));
      console.log("Array added fields:", addedFields);

      expect(data.data[0].blockParam.requiredPower).toBe(5);
      expect(addedFields).toContain("data[0].blockParam.requiredPower");
    });
  });
});