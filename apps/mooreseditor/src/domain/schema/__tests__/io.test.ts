import { describe, it, expect } from "vitest";

import { loadYamlString } from "../io";

describe("io", () => {
  describe("loadYamlString", () => {
    it("should parse valid YAML string", () => {
      const yamlString = `
name: test
value: 123
enabled: true
`;
      const parsed = loadYamlString(yamlString);

      expect(parsed).toEqual({
        name: "test",
        value: 123,
        enabled: true,
      });
    });

    it("should parse YAML with arrays", () => {
      const yamlString = `
items:
  - apple
  - banana
  - orange
`;
      const parsed = loadYamlString(yamlString);

      expect(parsed).toEqual({
        items: ["apple", "banana", "orange"],
      });
    });

    it("should parse nested YAML objects", () => {
      const yamlString = `
user:
  name: John
  age: 30
  address:
    street: Main St
    city: New York
`;
      const parsed = loadYamlString(yamlString);

      expect(parsed).toEqual({
        user: {
          name: "John",
          age: 30,
          address: {
            street: "Main St",
            city: "New York",
          },
        },
      });
    });

    it("should parse empty YAML", () => {
      const parsed = loadYamlString("");
      expect(parsed).toBeNull();
    });

    it("should parse complex schema definition", () => {
      const yamlString = `
id: items
type: array
items:
  type: object
  properties:
    - key: id
      type: uuid
    - key: name
      type: string
      default: ""
    - key: stackSize
      type: integer
      min: 1
      max: 999
    - key: category
      type: enum
      options:
        - weapon
        - armor
        - consumable
    - key: position
      type: vector3
      default: [0, 0, 0]
`;
      const parsed = loadYamlString(yamlString);

      expect(parsed.id).toBe("items");
      expect(parsed.type).toBe("array");
      expect(parsed.items.type).toBe("object");
      expect(parsed.items.properties).toHaveLength(5);
      expect(parsed.items.properties[0]).toEqual({ key: "id", type: "uuid" });
      expect(parsed.items.properties[3].options).toEqual([
        "weapon",
        "armor",
        "consumable",
      ]);
    });
  });
});
