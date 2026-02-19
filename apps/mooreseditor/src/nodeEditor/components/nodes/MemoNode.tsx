import { memo, useCallback } from "react";

import { NodeResizer } from "@xyflow/react";

import { useNodeEditorContext } from "../../context/NodeEditorContext";
import { getReadableTextColor, normalizeNoteColor } from "../../utils/noteColor";

import type { NodeProps } from "@xyflow/react";

const MemoNode = memo(({ id, data, selected }: NodeProps) => {
  const { dispatch } = useNodeEditorContext();
  const backgroundColor = normalizeNoteColor(data.color);
  const textColor = getReadableTextColor(backgroundColor);
  const memoText = typeof data.text === "string" ? data.text : "";

  const handleResizeEnd = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      dispatch({
        type: "UPDATE_NODE_DATA",
        nodeId: id,
        data: {
          ...(data as Record<string, unknown>),
          text: memoText,
          color: backgroundColor,
          width: params.width,
          height: params.height,
        },
      });
    },
    [id, data, memoText, backgroundColor, dispatch],
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
          background: backgroundColor,
          color: textColor,
          border: selected
            ? `2px solid ${textColor === "#fff" ? "#fff" : "#333"}`
            : `2px solid ${textColor === "#fff" ? "#555" : "#E8E0A0"}`,
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
        <div>{memoText || "(empty)"}</div>
      </div>
    </>
  );
});

MemoNode.displayName = "MemoNode";

export default MemoNode;
