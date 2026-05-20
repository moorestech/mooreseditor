import { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";

import { useReactFlow } from "@xyflow/react";

import NodeEditorApp from "./NodeEditorApp";
import { useNodeEditorContext } from "./context/NodeEditorContext";
import { useNodeExport } from "./hooks/useNodeExport";
import { getReactFlowNodeIdFromSearchMatch } from "./searchFocus";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { NodeEditorViewProps } from "./types/props";

export interface NodeEditorHandle {
  save: () => void;
  focusSearchMatch: (element: Element | null) => boolean;
}

const NodeEditorInner = forwardRef<NodeEditorHandle, NodeEditorViewProps>(
  (props, ref) => {
    const { state, dispatch } = useNodeEditorContext();
    const { fitView } = useReactFlow();
    const schemaMetas = useMemo(
      () => buildSchemaMetaMap(props.schemas),
      [props.schemas],
    );
    const { exportAndSave, isDirty } = useNodeExport(props, schemaMetas);

    const save = useCallback(() => {
      if (!isDirty && state.nodes.length === 0) return;
      exportAndSave();
    }, [isDirty, state.nodes.length, exportAndSave]);

    const focusSearchMatch = useCallback(
      (element: Element | null) => {
        const nodeId = getReactFlowNodeIdFromSearchMatch(element);
        if (!nodeId) {
          return false;
        }

        dispatch({ type: "SET_SELECTED_NODE", nodeId });
        void fitView({
          nodes: [{ id: nodeId }],
          padding: 0.4,
          duration: 250,
          maxZoom: 1.1,
        });
        return true;
      },
      [dispatch, fitView],
    );

    useImperativeHandle(
      ref,
      () => ({
        save,
        focusSearchMatch,
      }),
      [focusSearchMatch, save],
    );

    return <NodeEditorApp {...props} />;
  },
);

NodeEditorInner.displayName = "NodeEditorInner";

export default NodeEditorInner;
