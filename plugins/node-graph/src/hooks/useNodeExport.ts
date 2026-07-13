import { useCallback, useRef } from "react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { exportToMaster } from "../utils/exportToMaster";

import type { NodeEditorViewProps } from "../types/props";
import type { SchemaMeta } from "../utils/schemaMeta";

export function useNodeExport(
  props: NodeEditorViewProps,
  schemaMetas: Map<string, SchemaMeta>,
) {
  const { state, dispatch } = useNodeEditorContext();
  const isSavingRef = useRef(false);

  const exportAndSave = useCallback(async () => {
    if (isSavingRef.current) {
      return;
    }

    isSavingRef.current = true;
    const { nodes, edges, viewport } = state;

    try {
      // 1. Export to master (partial patch for research)
      const { updatedColumns, nodeGraphFile } = exportToMaster(
        nodes,
        edges,
        viewport,
        props.jsonData,
        schemaMetas,
      );

      // 2. Request save (columns + nodeGraph)
      await props.onRequestSave(updatedColumns, nodeGraphFile);

      // 3. Update App's jsonData state after save succeeds
      props.setJsonData(updatedColumns);

      // 4. Clear dirty flag on success
      dispatch({ type: "SET_DIRTY", dirty: false });
    } finally {
      isSavingRef.current = false;
    }
  }, [state, props, schemaMetas, dispatch]);

  return { exportAndSave, isDirty: state.isDirty };
}
