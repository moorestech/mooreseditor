import { useCallback } from "react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { removeRecipesFromJsonData } from "../utils/recipeCleanup";

import type { SchemaMeta } from "../utils/schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";

interface UseDeleteHandlerParams {
  schemaMetas: Map<string, SchemaMeta>;
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  deleteSelected: () => void;
}

export function useDeleteHandler({
  schemaMetas,
  setJsonData,
  deleteSelected,
}: UseDeleteHandlerParams) {
  const { state } = useNodeEditorContext();

  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(
      state.nodes.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      state.edges.filter((e) => e.selected).map((e) => e.id),
    );

    const edgesToRemove = state.edges.filter(
      (e) =>
        selectedEdgeIds.has(e.id) ||
        selectedNodeIds.has(e.source) ||
        selectedNodeIds.has(e.target),
    );

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

    deleteSelected();
  }, [state.nodes, state.edges, deleteSelected, setJsonData, schemaMetas]);

  return { handleDeleteSelected };
}
