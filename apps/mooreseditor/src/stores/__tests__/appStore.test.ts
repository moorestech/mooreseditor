import { describe, expect, it, beforeEach } from "vitest";

import { useAppStore } from "../appStore";

describe("appStore", () => {
  beforeEach(() => {
    useAppStore.getState().reset();
  });

  it("starts in editor mode with node editor not mounted", () => {
    const state = useAppStore.getState();
    expect(state.mode).toBe("editor");
    expect(state.isNodeEditorMounted).toBe(false);
    expect(state.isSaving).toBe(false);
  });

  it("setMode to node also mounts node editor", () => {
    useAppStore.getState().setMode("node");

    const state = useAppStore.getState();
    expect(state.mode).toBe("node");
    expect(state.isNodeEditorMounted).toBe(true);
  });

  it("setMode back to editor keeps node editor mounted", () => {
    useAppStore.getState().setMode("node");
    useAppStore.getState().setMode("editor");

    const state = useAppStore.getState();
    expect(state.mode).toBe("editor");
    expect(state.isNodeEditorMounted).toBe(true);
  });

  it("mountNodeEditor sets isNodeEditorMounted", () => {
    useAppStore.getState().mountNodeEditor();
    expect(useAppStore.getState().isNodeEditorMounted).toBe(true);
  });

  it("reset restores initial state", () => {
    useAppStore.getState().setMode("node");
    useAppStore.getState().reset();

    const state = useAppStore.getState();
    expect(state.mode).toBe("editor");
    expect(state.isNodeEditorMounted).toBe(false);
    expect(state.isSaving).toBe(false);
  });
});
