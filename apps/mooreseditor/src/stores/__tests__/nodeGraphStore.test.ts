import { describe, expect, it, beforeEach } from "vitest";

import { useNodeGraphStore } from "../nodeGraphStore";

describe("nodeGraphStore", () => {
  beforeEach(() => {
    useNodeGraphStore.getState().reset();
  });

  it("starts with empty nodes, edges, and default viewport", () => {
    const state = useNodeGraphStore.getState();
    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.viewport).toEqual({ x: 0, y: 0, zoom: 1 });
    expect(state.isDirty).toBe(false);
    expect(state.selectedNodeId).toBeNull();
  });

  it("setNodes marks dirty", () => {
    const nodes = [{ id: "n1", position: { x: 0, y: 0 }, data: {} }];
    useNodeGraphStore.getState().setNodes(nodes);

    const state = useNodeGraphStore.getState();
    expect(state.nodes).toEqual(nodes);
    expect(state.isDirty).toBe(true);
  });

  it("setEdges marks dirty", () => {
    const edges = [{ id: "e1", source: "n1", target: "n2" }];
    useNodeGraphStore.getState().setEdges(edges);

    const state = useNodeGraphStore.getState();
    expect(state.edges).toEqual(edges);
    expect(state.isDirty).toBe(true);
  });

  it("setViewport does NOT mark dirty", () => {
    useNodeGraphStore.getState().setViewport({ x: 10, y: 20, zoom: 2 });

    const state = useNodeGraphStore.getState();
    expect(state.viewport).toEqual({ x: 10, y: 20, zoom: 2 });
    expect(state.isDirty).toBe(false);
  });

  it("setSelectedNode updates selection", () => {
    useNodeGraphStore.getState().setSelectedNode("n1");
    expect(useNodeGraphStore.getState().selectedNodeId).toBe("n1");

    useNodeGraphStore.getState().setSelectedNode(null);
    expect(useNodeGraphStore.getState().selectedNodeId).toBeNull();
  });

  it("updateNodeData updates a specific node and marks dirty", () => {
    const nodes = [
      { id: "n1", position: { x: 0, y: 0 }, data: { label: "A" } },
      { id: "n2", position: { x: 100, y: 0 }, data: { label: "B" } },
    ];
    useNodeGraphStore.getState().setNodes(nodes);
    useNodeGraphStore.getState().setDirty(false);

    useNodeGraphStore.getState().updateNodeData("n1", { label: "A-updated" });

    const state = useNodeGraphStore.getState();
    expect(state.nodes[0].data).toEqual({ label: "A-updated" });
    expect(state.nodes[1].data).toEqual({ label: "B" });
    expect(state.isDirty).toBe(true);
  });

  it("loadGraph sets nodes/edges/viewport and clears dirty", () => {
    // First make it dirty
    useNodeGraphStore
      .getState()
      .setNodes([{ id: "x", position: { x: 0, y: 0 }, data: {} }]);
    expect(useNodeGraphStore.getState().isDirty).toBe(true);

    const nodes = [{ id: "n1", position: { x: 5, y: 5 }, data: {} }];
    const edges = [{ id: "e1", source: "n1", target: "n2" }];
    const viewport = { x: 50, y: 50, zoom: 1.5 };

    useNodeGraphStore.getState().loadGraph(nodes, edges, viewport);

    const state = useNodeGraphStore.getState();
    expect(state.nodes).toEqual(nodes);
    expect(state.edges).toEqual(edges);
    expect(state.viewport).toEqual(viewport);
    expect(state.isDirty).toBe(false);
  });

  it("reset restores initial state", () => {
    useNodeGraphStore
      .getState()
      .setNodes([{ id: "n1", position: { x: 0, y: 0 }, data: {} }]);
    useNodeGraphStore.getState().setSelectedNode("n1");

    useNodeGraphStore.getState().reset();

    const state = useNodeGraphStore.getState();
    expect(state.nodes).toEqual([]);
    expect(state.edges).toEqual([]);
    expect(state.isDirty).toBe(false);
    expect(state.selectedNodeId).toBeNull();
  });
});
