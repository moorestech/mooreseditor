// AI Generated Test Code
import { describe, it, expect } from "vitest";

import { deepMerge } from "./deepMerge";

// deepMerge(target, source) preserves existing target values and only fills in
// fields that are missing (undefined/null) on the target from the source.
// It is purpose-built for merging existing user data (target) with
// schema-generated defaults (source) without overwriting user data.
describe("deepMerge", () => {
  it("keeps target values and fills missing keys from source", () => {
    const obj1 = { a: 1, b: 2 };
    const obj2 = { b: 3, c: 4 };
    const result = deepMerge(obj1, obj2);

    // b stays 2 (target wins); c is filled from source
    expect(result).toEqual({ a: 1, b: 2, c: 4 });
  });

  it("should deeply merge nested objects", () => {
    const obj1 = {
      user: {
        name: "John",
        settings: {
          theme: "dark",
          language: "en",
        },
      },
    };
    const obj2 = {
      user: {
        settings: {
          language: "ja",
          notifications: true,
        },
      },
    };

    const result = deepMerge(obj1, obj2);

    // theme/language keep the target values; notifications is filled from source
    expect(result).toEqual({
      user: {
        name: "John",
        settings: {
          theme: "dark",
          language: "en",
          notifications: true,
        },
      },
    });
  });

  it("should preserve target arrays instead of replacing them", () => {
    const obj1 = { items: [1, 2, 3] };
    const obj2 = { items: [4, 5] };

    const result = deepMerge(obj1, obj2);

    // existing target array is kept so user data is not wiped
    expect(result).toEqual({ items: [1, 2, 3] });
  });

  it("should handle null and undefined values", () => {
    const obj1 = { a: 1, b: null as any, c: undefined as any };
    const obj2 = { b: 2, c: 3, d: null as any };

    const result = deepMerge(obj1, obj2);

    expect(result).toEqual({ a: 1, b: 2, c: 3, d: null });
  });

  it("should not mutate original objects", () => {
    const obj1 = { a: { b: 1 } };
    const obj2 = { a: { c: 2 } };
    const obj1Copy = JSON.parse(JSON.stringify(obj1));
    const obj2Copy = JSON.parse(JSON.stringify(obj2));

    const result = deepMerge(obj1, obj2);

    expect(obj1).toEqual(obj1Copy);
    expect(obj2).toEqual(obj2Copy);
    expect(result).toEqual({ a: { b: 1, c: 2 } });
  });

  it("should handle empty objects", () => {
    const obj1 = {};
    const obj2 = { a: 1 };

    expect(deepMerge(obj1, obj2)).toEqual({ a: 1 });
    expect(deepMerge(obj2, obj1)).toEqual({ a: 1 });
  });

  it("should handle complex nested structures", () => {
    const obj1 = {
      level1: {
        level2: {
          array: [1, 2],
          value: "old",
        },
      },
      keep: "this",
    };

    const obj2 = {
      level1: {
        level2: {
          array: [3, 4, 5],
          value: "new",
          added: true,
        },
        newLevel2: "added",
      },
    };

    const result = deepMerge(obj1, obj2);

    // target arrays/values are kept; only missing keys (added, newLevel2) are filled
    expect(result).toEqual({
      level1: {
        level2: {
          array: [1, 2],
          value: "old",
          added: true,
        },
        newLevel2: "added",
      },
      keep: "this",
    });
  });

  it("keeps target scalar values regardless of type", () => {
    const obj1 = { a: "string", b: 123, c: true };
    const obj2 = { a: 456, b: false, c: "changed" };

    const result = deepMerge(obj1, obj2);

    // every key already has a defined target value, so the target wins
    expect(result).toEqual({ a: "string", b: 123, c: true });
  });

  it("keeps the target date value", () => {
    const date1 = new Date("2023-01-01");
    const date2 = new Date("2024-01-01");
    const obj1 = { date: date1 };
    const obj2 = { date: date2 };

    const result = deepMerge(obj1, obj2);

    // Date is treated as a scalar; the defined target value is preserved
    expect(result.date).toBe(date1);
  });

  it("should handle multiple merges", () => {
    const obj1 = { a: 1 };
    const obj2 = { b: 2 };
    const obj3 = { c: 3 };

    const result = deepMerge(deepMerge(obj1, obj2), obj3);

    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });
});
