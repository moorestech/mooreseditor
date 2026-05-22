import { useCallback } from "react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import { exportToMaster } from "../utils/exportToMaster";

import type { NodeEditorViewProps } from "../types/props";
import type { SchemaMeta } from "../utils/schemaMeta";

export function useNodeExport(
  props: NodeEditorViewProps,
  schemaMetas: Map<string, SchemaMeta>,
) {
  const { state, dispatch } = useNodeEditorContext();

  const exportAndSave = useCallback(async () => {
    const { nodes, edges, viewport } = state;

    // 1. Export to master (partial patch for research)
    const { updatedColumns, nodeGraphFile } = exportToMaster(
      nodes,
      edges,
      viewport,
      props.jsonData,
      schemaMetas,
    );

    // 2. Update App's jsonData state
    props.setJsonData(updatedColumns);

    // 3. Request save (columns + nodeGraph)
    await props.onRequestSave(updatedColumns, nodeGraphFile);

    // 4. Clear dirty flag on success
    dispatch({ type: "SET_DIRTY", dirty: false });
  }, [state, props, schemaMetas, dispatch]);

  return { exportAndSave, isDirty: state.isDirty };
}
