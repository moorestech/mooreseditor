import { describe, expect, it, beforeEach } from "vitest";

import { useDataStore } from "../dataStore";

describe("dataStore", () => {
  beforeEach(() => {
    useDataStore.getState().reset();
  });

  it("starts with empty columns, not preloading, no unsaved changes", () => {
    const state = useDataStore.getState();
    expect(state.columns).toEqual([]);
    expect(state.isPreloading).toBe(false);
    expect(state.hasUnsavedChanges).toBe(false);
  });

  it("setColumns replaces all columns", () => {
    useDataStore.getState().setColumns([
      { title: "items", data: [{ id: 1 }] },
      { title: "blocks", data: [{ id: 2 }] },
    ]);

    expect(useDataStore.getState().columns).toHaveLength(2);
    expect(useDataStore.getState().columns[0].title).toBe("items");
    expect(useDataStore.getState().columns[1].title).toBe("blocks");
  });

  it("updateColumn updates a specific column by title and marks dirty", () => {
    useDataStore.getState().setColumns([
      { title: "items", data: [{ id: 1 }] },
      { title: "blocks", data: [{ id: 2 }] },
    ]);

    useDataStore.getState().updateColumn("items", [{ id: 1, name: "sword" }]);

    const state = useDataStore.getState();
    expect(state.columns[0].data).toEqual([{ id: 1, name: "sword" }]);
    expect(state.columns[1].data).toEqual([{ id: 2 }]);
    expect(state.hasUnsavedChanges).toBe(true);
  });

  it("updateColumn does not modify columns that don't match", () => {
    useDataStore.getState().setColumns([{ title: "items", data: "original" }]);

    useDataStore.getState().updateColumn("nonexistent", "new data");

    expect(useDataStore.getState().columns[0].data).toBe("original");
  });

  it("markDirty sets hasUnsavedChanges to true", () => {
    expect(useDataStore.getState().hasUnsavedChanges).toBe(false);
    useDataStore.getState().markDirty();
    expect(useDataStore.getState().hasUnsavedChanges).toBe(true);
  });

  it("clearUnsavedChanges sets hasUnsavedChanges to false", () => {
    useDataStore.getState().markDirty();
    useDataStore.getState().clearUnsavedChanges();
    expect(useDataStore.getState().hasUnsavedChanges).toBe(false);
  });

  it("reset restores initial state", () => {
    useDataStore.getState().setColumns([{ title: "items", data: [] }]);
    useDataStore.getState().markDirty();

    useDataStore.getState().reset();

    const state = useDataStore.getState();
    expect(state.columns).toEqual([]);
    expect(state.hasUnsavedChanges).toBe(false);
    expect(state.isPreloading).toBe(false);
  });
});
