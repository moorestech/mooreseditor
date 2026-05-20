import { forwardRef } from "react";

import { ReactFlowProvider } from "@xyflow/react";

import NodeEditorInner from "./NodeEditorInner";
import { NodeEditorProvider } from "./context/NodeEditorContext";

import type { NodeEditorHandle } from "./NodeEditorInner";
import type { NodeEditorViewProps } from "./types/props";

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

export type { NodeEditorHandle };
export type { NodeGraphFile } from "./types/nodeGraph";
export type { NodeEditorViewProps } from "./types/props";
export default NodeEditorView;
