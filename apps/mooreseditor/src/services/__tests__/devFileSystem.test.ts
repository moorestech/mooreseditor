import { describe, expect, it } from "vitest";

import {
  getSampleSchemaList,
  getSampleRefSchemaList,
  getAllSampleSchemaMap,
} from "../devFileSystem";

describe("devFileSystem", () => {
  it("getSampleSchemaList returns non-empty array of strings", () => {
    const list = getSampleSchemaList();
    expect(list.length).toBeGreaterThan(0);
    for (const item of list) {
      expect(typeof item).toBe("string");
    }
  });

  it("getSampleSchemaList includes 'items'", () => {
    expect(getSampleSchemaList()).toContain("items");
  });

  it("getSampleRefSchemaList returns non-empty array", () => {
    const list = getSampleRefSchemaList();
    expect(list.length).toBeGreaterThan(0);
  });

  it("getAllSampleSchemaMap combines main and ref schemas", () => {
    const map = getAllSampleSchemaMap();
    const mainList = getSampleSchemaList();
    const refList = getSampleRefSchemaList();

    expect(map.size).toBe(mainList.length + refList.length);

    // Main schemas are keyed by name
    for (const name of mainList) {
      expect(map.get(name)).toBe(name);
    }

    // Ref schemas are keyed with "ref/" prefix
    for (const name of refList) {
      expect(map.get(`ref/${name}`)).toBe(name);
    }
  });
});
