import { useCallback, useState } from "react";

import { MarkerType, reconnectEdge } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import {
  createItemNode,
  createBlockNode,
  createResearchNode,
  createNoteNode,
  createPlaceholderNode,
} from "../utils/nodeFactory";

import type { ConnectionDecision } from "../types/connection";
import type { Connection, Edge as ReactFlowEdge } from "@xyflow/react";

let edgeIdCounter = 0;

export function generateEdgeId(): string {
  edgeIdCounter++;
  return `edge-${Date.now()}-${edgeIdCounter}`;
}

export function useNodeOperations() {
  const { state, dispatch } = useNodeEditorContext();
  const [pendingConnection, setPendingConnection] = useState<Connection | null>(
    null,
  );

  const addNode = useCallback(
    (
      type: "item" | "block" | "research" | "note" | "placeholder",
      masterGuid?: string,
      displayName?: string,
      targetPosition?: { x: number; y: number },
    ) => {
      if (type !== "note" && type !== "placeholder" && !masterGuid) {
        return;
      }

      // Use provided position or place near the center of the current viewport
      const position = targetPosition ?? {
        x:
          -state.viewport.x / state.viewport.zoom +
          400 +
          Math.random() * 100 -
          50,
        y:
          -state.viewport.y / state.viewport.zoom +
          300 +
          Math.random() * 100 -
          50,
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
        case "placeholder":
          newNode = createPlaceholderNode(position);
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

      const sourceNode = state.nodes.find(
        (node) => node.id === connection.source,
      );
      const targetNode = state.nodes.find(
        (node) => node.id === connection.target,
      );
      const isResearchToResearch =
        sourceNode?.type === "research" && targetNode?.type === "research";

      if (isResearchToResearch) {
        const newEdge = {
          id: generateEdgeId(),
          source: connection.source,
          target: connection.target,
          type: "arrow",
          data: { edgeType: "dependency" },
          markerEnd: { type: MarkerType.ArrowClosed },
        };
        dispatch({ type: "SET_EDGES", edges: [...state.edges, newEdge] });
        return;
      }

      setPendingConnection(connection);
    },
    [state.nodes, state.edges, dispatch],
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
        id: generateEdgeId(),
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

  const onReconnect = useCallback(
    (oldEdge: ReactFlowEdge, newConnection: Connection) => {
      if (!newConnection.source || !newConnection.target) {
        return false;
      }

      const nextSourceHandle = newConnection.sourceHandle ?? null;
      const nextTargetHandle = newConnection.targetHandle ?? null;
      const isConnectionUnchanged =
        oldEdge.source === newConnection.source &&
        oldEdge.target === newConnection.target &&
        (oldEdge.sourceHandle ?? null) === nextSourceHandle &&
        (oldEdge.targetHandle ?? null) === nextTargetHandle;

      if (isConnectionUnchanged) {
        return false;
      }

      const updatedEdges = reconnectEdge(
        oldEdge,
        {
          ...newConnection,
          sourceHandle: nextSourceHandle,
          targetHandle: nextTargetHandle,
        },
        state.edges,
        { shouldReplaceId: false },
      );

      dispatch({ type: "SET_EDGES", edges: updatedEdges });
      return true;
    },
    [state.edges, dispatch],
  );

  const updateNodeData = useCallback(
    (nodeId: string, data: Record<string, unknown>) => {
      dispatch({ type: "UPDATE_NODE_DATA", nodeId, data });
    },
    [dispatch],
  );

  const hasSelection =
    state.nodes.some((n) => n.selected) || state.edges.some((e) => e.selected);

  return {
    addNode,
    deleteSelected,
    onConnect,
    onReconnect,
    updateNodeData,
    hasSelection,
    pendingConnection,
    confirmConnection,
    cancelConnection,
  };
}
