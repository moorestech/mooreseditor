import { describe, expect, it } from "vitest";

import { validateClipboardData } from "../clipboard";

import type { Schema } from "../../domain/schema/types";

describe("clipboard validateClipboardData", () => {
  const stringSchema: Schema = { type: "string" };
  const numberSchema: Schema = { type: "number" };

  it("validates a matching string value", () => {
    const result = validateClipboardData("hello", stringSchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe("hello");
    }
  });

  it("rejects a number when string is expected", () => {
    const result = validateClipboardData(42, stringSchema);
    expect(result.success).toBe(false);
    expect("error" in result).toBe(true);
    if ("error" in result) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("validates a matching number value", () => {
    const result = validateClipboardData(3.14, numberSchema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(3.14);
    }
  });

  it("rejects a string when number is expected", () => {
    const result = validateClipboardData("not a number", numberSchema);
    expect(result.success).toBe(false);
  });
});
