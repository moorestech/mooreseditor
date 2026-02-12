import { useCallback, useState } from "react";

import { MarkerType } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import {
  createItemNode,
  createBlockNode,
  createResearchNode,
  createNoteNode,
} from "../utils/nodeFactory";

import type { ConnectionDecision } from "../types/connection";
import type { Connection } from "@xyflow/react";

export function useNodeOperations() {
  const { state, dispatch } = useNodeEditorContext();
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null);

  const addNode = useCallback(
    (
      type: "item" | "block" | "research" | "note",
      masterGuid?: string,
      displayName?: string,
    ) => {
      // Place new nodes near the center of the current viewport
      const centerX = -state.viewport.x / state.viewport.zoom + 400;
      const centerY = -state.viewport.y / state.viewport.zoom + 300;
      const position = {
        x: centerX + Math.random() * 100 - 50,
        y: centerY + Math.random() * 100 - 50,
      };

      let newNode;
      switch (type) {
        case "item":
          newNode = createItemNode(masterGuid!, position, displayName);
          break;
        case "block":
          newNode = createBlockNode(masterGuid!, position, displayName);
          break;
        case "research":
          newNode = createResearchNode(masterGuid!, position, displayName);
          break;
        case "note":
          newNode = createNoteNode(position);
          break;
      }

      dispatch({ type: "SET_NODES", nodes: [...state.nodes, newNode] });
    },
    [state.nodes, state.viewport, dispatch],
  );

  const deleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(
      state.nodes.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      state.edges.filter((e) => e.selected).map((e) => e.id),
    );

    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

    // Remove selected nodes and any edges connected to them
    const newNodes = state.nodes.filter((n) => !selectedNodeIds.has(n.id));
    const newEdges = state.edges.filter(
      (e) =>
        !selectedEdgeIds.has(e.id) &&
        !selectedNodeIds.has(e.source) &&
        !selectedNodeIds.has(e.target),
    );

    dispatch({ type: "SET_NODES", nodes: newNodes });
    dispatch({ type: "SET_EDGES", edges: newEdges });
    dispatch({ type: "SET_SELECTED_NODE", nodeId: null });
  }, [state.nodes, state.edges, dispatch]);

  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) {
        return;
      }
      setPendingConnection(connection);
    },
    [],
  );

  const confirmConnection = useCallback(
    (decision: ConnectionDecision) => {
      if (!pendingConnection) return;
      if (decision.edgeType === "recipe" && decision.recipeRefs.length === 0) {
        return;
      }
      if (!pendingConnection.source || !pendingConnection.target) {
        return;
      }

      const isRecipe =
        decision.edgeType === "recipe" && decision.recipeRefs.length > 0;
      const newEdge = {
        id: `edge-${Date.now()}`,
        source: pendingConnection.source,
        target: pendingConnection.target,
        type: isRecipe ? "recipe" : "arrow",
        data: {
          edgeType: isRecipe ? "recipe" : decision.edgeType,
          ...(isRecipe ? { recipeRefs: decision.recipeRefs } : {}),
        },
        ...(isRecipe ? {} : { markerEnd: { type: MarkerType.ArrowClosed } }),
      };
      dispatch({ type: "SET_EDGES", edges: [...state.edges, newEdge] });
      setPendingConnection(null);
    },
    [pendingConnection, state.edges, dispatch],
  );

  const cancelConnection = useCallback(() => {
    setPendingConnection(null);
  }, []);

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      dispatch({ type: "UPDATE_NODE_DATA", nodeId, data });
    },
    [dispatch],
  );

  const hasSelection =
    state.nodes.some((n) => n.selected) ||
    state.edges.some((e) => e.selected);

  return {
    addNode,
    deleteSelected,
    onConnect,
    updateNodeData,
    hasSelection,
    pendingConnection,
    confirmConnection,
    cancelConnection,
  };
}
