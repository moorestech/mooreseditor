import { memo, useCallback } from "react";

import { NodeResizer } from "@xyflow/react";

import { useNodeEditorContext } from "../../context/NodeEditorContext";

import type { NodeProps } from "@xyflow/react";

const MemoNode = memo(({ id, data, selected }: NodeProps) => {
  const { dispatch } = useNodeEditorContext();

  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      dispatch({
        type: "UPDATE_NODE_DATA",
        nodeId: id,
        data: { text: data.text, width: params.width, height: params.height },
      });
    },
    [id, data.text, dispatch],
  );

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={120}
        minHeight={80}
        onResizeEnd={handleResizeEnd}
      />
      <div
        style={{
          padding: "8px 12px",
          background: "#FFFACD",
          color: "#333",
          border: selected ? "2px solid #333" : "2px solid #E8E0A0",
          borderRadius: 4,
          width: "100%",
          height: "100%",
          fontSize: 11,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          overflow: "auto",
          boxSizing: "border-box",
        }}
      >
        <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>Memo</div>
        <div>{(data.text as string) || "(empty)"}</div>
      </div>
    </>
  );
});

MemoNode.displayName = "MemoNode";

export default MemoNode;
