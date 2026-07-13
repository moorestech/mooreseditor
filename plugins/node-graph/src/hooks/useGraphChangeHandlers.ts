import { useCallback } from "react";

import { applyNodeChanges, applyEdgeChanges } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { removeRecipesFromJsonData } from "../utils/recipeCleanup";

import type { SchemaMeta } from "../utils/schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";
import type {
  OnNodesChange,
  OnEdgesChange,
  NodeChange,
  EdgeChange,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";

interface UseGraphChangeHandlersParams {
  schemaMetas: Map<string, SchemaMeta>;
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  onMarkDirty: () => void;
}

// Selection changes and React Flow's mount-time dimension measurements do not
// affect persisted data; only user-driven resizes (resizing/setAttributes) and
// structural or position changes should mark the graph dirty.
function isSelectionOnlyChange(changes: (NodeChange | EdgeChange)[]): boolean {
  return (
    changes.length > 0 &&
    changes.every(
      (change) =>
        change.type === "select" ||
        (change.type === "dimensions" &&
          !change.resizing &&
          !change.setAttributes),
    )
  );
}

export function useGraphChangeHandlers({
  schemaMetas,
  setJsonData,
  onMarkDirty,
}: UseGraphChangeHandlersParams) {
  const { state, dispatch } = useNodeEditorContext();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, state.nodes);
      const shouldMarkDirty = !isSelectionOnlyChange(changes);
      dispatch({
        type: "SET_NODES",
        nodes: newNodes,
        markDirty: shouldMarkDirty,
      });
      if (shouldMarkDirty) {
        onMarkDirty();
      }
    },
    [state.nodes, dispatch, onMarkDirty],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const removeChanges = changes.filter((c) => c.type === "remove");
      if (removeChanges.length > 0) {
        const edgesToRemove = removeChanges
          .map((c) => state.edges.find((e) => e.id === c.id))
          .filter((e): e is ReactFlowEdge => e != null);
        if (edgesToRemove.length > 0) {
          setJsonData((prev) =>
            removeRecipesFromJsonData(
              edgesToRemove,
              state.edges,
              prev,
              schemaMetas,
            ),
          );
        }
      }

      const newEdges = applyEdgeChanges(changes, state.edges);
      const shouldMarkDirty = !isSelectionOnlyChange(changes);
      dispatch({
        type: "SET_EDGES",
        edges: newEdges,
        markDirty: shouldMarkDirty,
      });
      if (shouldMarkDirty) {
        onMarkDirty();
      }
    },
    [state.edges, dispatch, setJsonData, onMarkDirty, schemaMetas],
  );

  const handleNodeSelect = useCallback(
    (node: ReactFlowNode | null) => {
      dispatch({ type: "SET_SELECTED_NODE", nodeId: node?.id ?? null });
    },
    [dispatch],
  );

  const handleViewportChange = useCallback(
    (viewport: { x: number; y: number; zoom: number }) => {
      dispatch({ type: "SET_VIEWPORT", viewport });
    },
    [dispatch],
  );

  const handleMarkDirty = useCallback(() => {
    onMarkDirty();
    dispatch({ type: "SET_DIRTY", dirty: true });
  }, [onMarkDirty, dispatch]);

  return {
    onNodesChange,
    onEdgesChange,
    handleNodeSelect,
    handleViewportChange,
    handleMarkDirty,
  };
}
