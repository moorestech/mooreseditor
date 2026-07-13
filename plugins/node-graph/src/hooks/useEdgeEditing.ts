import { useCallback, useMemo, useState } from "react";

import { MarkerType } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { cleanupOrphanedRecipesAfterEdgeUpdate } from "../utils/recipeCleanup";
import { normalizeRecipeRefsFromEdgeData } from "../utils/recipeEdge";

import type { ConnectionDecision } from "../types/connection";
import type { SchemaMeta } from "../utils/schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
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
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemaMetas: Map<string, SchemaMeta>;
}

export function buildEditedEdge(
  edge: ReactFlowEdge,
  decision: ConnectionDecision,
): ReactFlowEdge {
  if (decision.edgeType === "recipe") {
    const { markerEnd: _markerEnd, ...edgeWithoutMarker } = edge;
    return {
      ...edgeWithoutMarker,
      type: "recipe",
      data: {
        edgeType: "recipe",
        recipeRefs: decision.recipeRefs,
      },
    };
  }

  return {
    ...edge,
    type: "arrow",
    data: { edgeType: decision.edgeType },
    markerEnd: { type: MarkerType.ArrowClosed },
  };
}

export function useEdgeEditing({
  resolvedNodes,
  pendingConnection,
  confirmConnection,
  cancelConnection,
  onMarkDirty,
  setJsonData,
  schemaMetas,
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

      const updatedEdges = state.edges.map((e) =>
        e.id === editingEdge.id ? buildEditedEdge(e, decision) : e,
      );
      setJsonData((prev) =>
        cleanupOrphanedRecipesAfterEdgeUpdate(
          editingEdge,
          updatedEdges,
          prev,
          schemaMetas,
        ),
      );
      dispatch({ type: "SET_EDGES", edges: updatedEdges });

      setEditingEdge(null);
      onMarkDirty();
    },
    [editingEdge, state.edges, setJsonData, schemaMetas, dispatch, onMarkDirty],
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

  const dialogInitialRecipeRefs = useMemo(
    () =>
      editingEdge ? normalizeRecipeRefsFromEdgeData(editingEdge.data) : undefined,
    [editingEdge],
  );

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
