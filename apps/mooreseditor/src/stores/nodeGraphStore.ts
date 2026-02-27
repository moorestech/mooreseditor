/**
 * Node graph store — nodes, edges, viewport, selection.
 *
 * Mirrors the existing NodeEditorContext/useReducer but as a Zustand store.
 * The old Context will be replaced when Phase 6 rewires node editor components.
 */

import { create } from "zustand";

import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Viewport,
} from "@xyflow/react";

interface NodeGraphState {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  viewport: Viewport;
  isDirty: boolean;
  selectedNodeId: string | null;
}

interface NodeGraphActions {
  setNodes: (nodes: ReactFlowNode[]) => void;
  setEdges: (edges: ReactFlowEdge[]) => void;
  setViewport: (viewport: Viewport) => void;
  setSelectedNode: (nodeId: string | null) => void;
  updateNodeData: (nodeId: string, data: Record<string, unknown>) => void;
  loadGraph: (
    nodes: ReactFlowNode[],
    edges: ReactFlowEdge[],
    viewport: Viewport,
  ) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

const initialState: NodeGraphState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  selectedNodeId: null,
};

export const useNodeGraphStore = create<NodeGraphState & NodeGraphActions>(
  (set) => ({
    ...initialState,

    setNodes: (nodes) => set({ nodes, isDirty: true }),

    setEdges: (edges) => set({ edges, isDirty: true }),

    setViewport: (viewport) => set({ viewport }),

    setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId }),

    updateNodeData: (nodeId, data) => {
      set((state) => ({
        nodes: state.nodes.map((n) => (n.id === nodeId ? { ...n, data } : n)),
        isDirty: true,
      }));
    },

    loadGraph: (nodes, edges, viewport) => {
      set({ nodes, edges, viewport, isDirty: false });
    },

    setDirty: (dirty) => set({ isDirty: dirty }),

    reset: () => set(initialState),
  }),
);
