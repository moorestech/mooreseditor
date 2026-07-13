import { describe, expect, it } from "vitest";

import {
  DataInitializer,
  deepMerge,
  isRuntimeValueSchema,
  schemaToZod,
} from "./index";

describe("plugin-sdk public entry point", () => {
  it("exports DataInitializer with its runtime behavior", () => {
    const initializer = new DataInitializer();

    expect(
      initializer.createRequiredValue({ type: "string", optional: false }),
    ).toBe("");
  });

  it("exports deepMerge with its runtime behavior", () => {
    expect(deepMerge({ retained: true }, { added: true })).toEqual({
      retained: true,
      added: true,
    });
  });

  it("exports schemaToZod with its runtime behavior", () => {
    const validator = schemaToZod({ type: "string", optional: false });

    expect(validator.safeParse("value").success).toBe(true);
    expect(validator.safeParse(1).success).toBe(false);
  });

  it("exports isRuntimeValueSchema with its runtime behavior", () => {
    expect(isRuntimeValueSchema({ type: "string" })).toBe(true);
    expect(isRuntimeValueSchema({ type: "not-a-schema-type" })).toBe(false);
    expect(isRuntimeValueSchema(null)).toBe(false);
  });
});
