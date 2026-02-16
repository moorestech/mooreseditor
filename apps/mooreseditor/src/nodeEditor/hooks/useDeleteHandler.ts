import { useCallback, useEffect } from "react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { removeRecipesFromJsonData } from "../utils/recipeCleanup";

import type { Column } from "../../hooks/useJson";
import type { SchemaMeta } from "../utils/schemaMeta";

interface UseDeleteHandlerParams {
  schemaMetas: Map<string, SchemaMeta>;
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  deleteSelected: () => void;
  hasSelection: boolean;
  isDialogOpen: boolean;
}

export function useDeleteHandler({
  schemaMetas,
  setJsonData,
  deleteSelected,
  hasSelection,
  isDialogOpen,
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
        removeRecipesFromJsonData(edgesToRemove, state.edges, prev, schemaMetas),
      );
    }

    deleteSelected();
  }, [state.nodes, state.edges, deleteSelected, setJsonData, schemaMetas]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isDialogOpen) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (event.key === "Delete" || event.key === "Backspace") {
        if (hasSelection) {
          event.preventDefault();
          handleDeleteSelected();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDialogOpen, hasSelection, handleDeleteSelected]);

  return { handleDeleteSelected };
}
