import { describe, expect, it, beforeEach } from "vitest";

import { useEditorStore } from "../editorStore";

import type { NestedView } from "../editorStore";

describe("editorStore", () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
  });

  it("starts with null selectedSchema and empty nestedViews", () => {
    const state = useEditorStore.getState();
    expect(state.selectedSchema).toBeNull();
    expect(state.nestedViews).toEqual([]);
  });

  it("selectSchema sets the selected schema", () => {
    useEditorStore.getState().selectSchema("items");
    expect(useEditorStore.getState().selectedSchema).toBe("items");
  });

  it("selectSchema(null) clears selection", () => {
    useEditorStore.getState().selectSchema("items");
    useEditorStore.getState().selectSchema(null);
    expect(useEditorStore.getState().selectedSchema).toBeNull();
  });

  it("pushNestedView adds a view to the stack", () => {
    const view: NestedView = {
      type: "form",
      schema: { type: "object" },
      data: {},
      path: ["data", "0"],
    };

    useEditorStore.getState().pushNestedView(view);
    expect(useEditorStore.getState().nestedViews).toHaveLength(1);
    expect(useEditorStore.getState().nestedViews[0]).toEqual(view);
  });

  it("popNestedView removes the last view", () => {
    const view1: NestedView = {
      type: "form",
      schema: {},
      data: {},
      path: ["a"],
    };
    const view2: NestedView = {
      type: "table",
      schema: {},
      data: [],
      path: ["b"],
    };

    useEditorStore.getState().pushNestedView(view1);
    useEditorStore.getState().pushNestedView(view2);
    expect(useEditorStore.getState().nestedViews).toHaveLength(2);

    useEditorStore.getState().popNestedView();
    expect(useEditorStore.getState().nestedViews).toHaveLength(1);
    expect(useEditorStore.getState().nestedViews[0]).toEqual(view1);
  });

  it("popNestedView on empty stack stays empty", () => {
    useEditorStore.getState().popNestedView();
    expect(useEditorStore.getState().nestedViews).toEqual([]);
  });

  it("reset restores initial state", () => {
    useEditorStore.getState().selectSchema("blocks");
    useEditorStore.getState().pushNestedView({
      type: "form",
      schema: {},
      data: {},
      path: [],
    });

    useEditorStore.getState().reset();
    expect(useEditorStore.getState().selectedSchema).toBeNull();
    expect(useEditorStore.getState().nestedViews).toEqual([]);
  });
});
