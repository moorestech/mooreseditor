import { describe, it, expect } from "vitest";

import {
  updateColumnAtPath,
  getValueAtPath,
  type Column,
  type JsonValue,
} from "../types";

describe("updateColumnAtPath", () => {
  const baseColumns: Column[] = [
    { title: "items", data: [{ id: 1, name: "sword" }] },
    {
      title: "blocks",
      data: { size: { x: 10, y: 20 }, label: "block1" },
    },
  ];

  it("returns the original array when schemaTitle not found", () => {
    const result = updateColumnAtPath(baseColumns, "missing", [], "new");
    expect(result).toBe(baseColumns);
  });

  it("replaces root data when path is empty", () => {
    const newData: JsonValue = [{ id: 2, name: "shield" }];
    const result = updateColumnAtPath(baseColumns, "items", [], newData);

    expect(result).not.toBe(baseColumns);
    expect(result[0].data).toEqual(newData);
    // Original untouched
    expect(baseColumns[0].data).toEqual([{ id: 1, name: "sword" }]);
  });

  it("updates a nested value immutably", () => {
    const result = updateColumnAtPath(baseColumns, "blocks", ["size", "x"], 99);

    expect(result).not.toBe(baseColumns);
    expect(result[1].data).toEqual({ size: { x: 99, y: 20 }, label: "block1" });
    // Original untouched
    expect(baseColumns[1].data as Record<string, unknown>).toHaveProperty(
      "size",
      expect.objectContaining({ x: 10 }),
    );
  });

  it("updates array element by index path", () => {
    const result = updateColumnAtPath(
      baseColumns,
      "items",
      ["0", "name"],
      "axe",
    );

    expect(result[0].data).toEqual([{ id: 1, name: "axe" }]);
    // Original untouched
    expect(baseColumns[0].data).toEqual([{ id: 1, name: "sword" }]);
  });

  it("preserves other columns", () => {
    const result = updateColumnAtPath(baseColumns, "items", [], "replaced");
    expect(result[1]).toBe(baseColumns[1]);
  });
});

describe("getValueAtPath", () => {
  const data: JsonValue = {
    a: {
      b: [10, 20, { c: "deep" }],
    },
    d: null,
  };

  it("returns root data for empty path", () => {
    expect(getValueAtPath(data, [])).toBe(data);
  });

  it("navigates into objects", () => {
    expect(getValueAtPath(data, ["a"])).toEqual({
      b: [10, 20, { c: "deep" }],
    });
  });

  it("navigates into arrays by index", () => {
    expect(getValueAtPath(data, ["a", "b", "0"])).toBe(10);
    expect(getValueAtPath(data, ["a", "b", "2", "c"])).toBe("deep");
  });

  it("returns undefined for missing keys", () => {
    expect(getValueAtPath(data, ["missing"])).toBeUndefined();
    expect(getValueAtPath(data, ["a", "missing"])).toBeUndefined();
  });

  it("returns undefined when traversing through a primitive", () => {
    expect(getValueAtPath(data, ["d", "any"])).toBeUndefined();
  });

  it("returns undefined for out-of-bounds array index", () => {
    expect(getValueAtPath(data, ["a", "b", "99"])).toBeUndefined();
  });
});
