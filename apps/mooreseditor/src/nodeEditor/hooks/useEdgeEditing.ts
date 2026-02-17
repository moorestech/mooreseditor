import { useCallback, useMemo, useState } from "react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { normalizeRecipeRefsFromEdgeData } from "../utils/recipeEdge";

import type { ConnectionDecision } from "../types/connection";
import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Connection,
} from "@xyflow/react";

interface UseEdgeEditingParams {
  resolvedNodes: ReactFlowNode[];
  pendingConnection: Connection | null;
  confirmConnection: (decision: ConnectionDecision) => void;
  cancelConnection: () => void;
  onMarkDirty: () => void;
}

export function useEdgeEditing({
  resolvedNodes,
  pendingConnection,
  confirmConnection,
  cancelConnection,
  onMarkDirty,
}: UseEdgeEditingParams) {
  const { state, dispatch } = useNodeEditorContext();
  const [editingEdge, setEditingEdge] = useState<ReactFlowEdge | null>(null);

  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: ReactFlowEdge) => {
      if (edge.type === "recipe") {
        setEditingEdge(edge);
      }
    },
    [],
  );

  const handleRequestEditEdge = useCallback(
    (edgeId: string) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (edge?.type === "recipe") {
        setEditingEdge(edge);
      }
    },
    [state.edges],
  );

  const handleEdgeEditConfirm = useCallback(
    (decision: ConnectionDecision) => {
      if (!editingEdge) return;

      if (decision.edgeType === "recipe" && decision.recipeRefs.length > 0) {
        const updatedEdges = state.edges.map((e) =>
          e.id === editingEdge.id
            ? {
                ...e,
                type: "recipe",
                data: {
                  edgeType: "recipe",
                  recipeRefs: decision.recipeRefs,
                },
              }
            : e,
        );
        dispatch({ type: "SET_EDGES", edges: updatedEdges });
      }

      setEditingEdge(null);
      onMarkDirty();
    },
    [editingEdge, state.edges, dispatch, onMarkDirty],
  );

  // --- Dialog state ---
  const isEdgeDialogOpen = pendingConnection !== null || editingEdge !== null;

  const dialogSourceNode = useMemo(() => {
    const sourceId = editingEdge?.source ?? pendingConnection?.source;
    return sourceId
      ? resolvedNodes.find((n) => n.id === sourceId) ?? null
      : null;
  }, [editingEdge, pendingConnection, resolvedNodes]);

  const dialogTargetNode = useMemo(() => {
    const targetId = editingEdge?.target ?? pendingConnection?.target;
    return targetId
      ? resolvedNodes.find((n) => n.id === targetId) ?? null
      : null;
  }, [editingEdge, pendingConnection, resolvedNodes]);

  const dialogInitialRecipeRefs = editingEdge
    ? normalizeRecipeRefsFromEdgeData(editingEdge.data)
    : undefined;

  const handleDialogConfirm = useCallback(
    (decision: ConnectionDecision) => {
      if (editingEdge) {
        handleEdgeEditConfirm(decision);
      } else {
        confirmConnection(decision);
      }
    },
    [editingEdge, handleEdgeEditConfirm, confirmConnection],
  );

  const handleDialogCancel = useCallback(() => {
    if (editingEdge) {
      setEditingEdge(null);
    } else {
      cancelConnection();
    }
  }, [editingEdge, cancelConnection]);

  return {
    editingEdge,
    handleEdgeDoubleClick,
    handleRequestEditEdge,
    isEdgeDialogOpen,
    dialogSourceNode,
    dialogTargetNode,
    dialogInitialRecipeRefs,
    handleDialogConfirm,
    handleDialogCancel,
  };
}
