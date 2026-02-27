import { describe, expect, it, beforeEach } from "vitest";

import { useProjectStore } from "../projectStore";

describe("projectStore", () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
  });

  it("starts with null directories and empty menuToFileMap", () => {
    const state = useProjectStore.getState();
    expect(state.projectDir).toBeNull();
    expect(state.schemaDir).toBeNull();
    expect(state.masterDir).toBeNull();
    expect(state.menuToFileMap).toEqual({});
    expect(state.loading).toBe(false);
  });

  it("setProjectConfig sets all project paths", () => {
    useProjectStore.getState().setProjectConfig({
      projectDir: "/home/user/project",
      schemaDir: "/home/user/project/schema",
      masterDir: "/home/user/project/master",
      menuToFileMap: { items: "items.yml", blocks: "blocks.yml" },
    });

    const state = useProjectStore.getState();
    expect(state.projectDir).toBe("/home/user/project");
    expect(state.schemaDir).toBe("/home/user/project/schema");
    expect(state.masterDir).toBe("/home/user/project/master");
    expect(state.menuToFileMap).toEqual({
      items: "items.yml",
      blocks: "blocks.yml",
    });
  });

  it("reset restores initial state", () => {
    useProjectStore.getState().setProjectConfig({
      projectDir: "/some/path",
      schemaDir: "/some/path/schema",
      masterDir: "/some/path/master",
      menuToFileMap: { test: "test.yml" },
    });

    useProjectStore.getState().reset();

    const state = useProjectStore.getState();
    expect(state.projectDir).toBeNull();
    expect(state.menuToFileMap).toEqual({});
  });
});
