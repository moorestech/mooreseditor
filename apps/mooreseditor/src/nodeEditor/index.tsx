import { forwardRef, useCallback, useImperativeHandle, useMemo } from "react";

import { ReactFlowProvider } from "@xyflow/react";

import NodeEditorApp from "./NodeEditorApp";
import {
  NodeEditorProvider,
  useNodeEditorContext,
} from "./context/NodeEditorContext";
import { useNodeExport } from "./hooks/useNodeExport";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { NodeEditorViewProps } from "./types/props";

export interface NodeEditorHandle {
  save: () => void;
}

const NodeEditorInner = forwardRef<NodeEditorHandle, NodeEditorViewProps>(
  (props, ref) => {
    const { state } = useNodeEditorContext();
    const schemaMetas = useMemo(
      () => buildSchemaMetaMap(props.schemas),
      [props.schemas],
    );
    const { exportAndSave, isDirty } = useNodeExport(props, schemaMetas);

    const save = useCallback(() => {
      if (!isDirty && state.nodes.length === 0) return;
      exportAndSave();
    }, [isDirty, state.nodes.length, exportAndSave]);

    useImperativeHandle(
      ref,
      () => ({
        save,
      }),
      [save],
    );

    return <NodeEditorApp {...props} />;
  },
);

NodeEditorInner.displayName = "NodeEditorInner";

const NodeEditorView = forwardRef<NodeEditorHandle, NodeEditorViewProps>(
  (props, ref) => {
    return (
      <ReactFlowProvider>
        <NodeEditorProvider>
          <NodeEditorInner ref={ref} {...props} />
        </NodeEditorProvider>
      </ReactFlowProvider>
    );
  },
);

NodeEditorView.displayName = "NodeEditorView";

export default NodeEditorView;
