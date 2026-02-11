import { memo } from "react";

import type { NodeProps } from "@xyflow/react";

const NoteNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "8px 12px",
        borderRadius: 6,
        background: "#FFB6C1",
        color: "#333",
        border: selected ? "2px solid #333" : "2px solid transparent",
        minWidth: 100,
        maxWidth: 200,
        fontSize: 11,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
      }}
    >
      <div style={{ fontSize: 9, opacity: 0.6, marginBottom: 2 }}>Note</div>
      <div>{(data.text as string) || "(empty)"}</div>
    </div>
  );
});

NoteNode.displayName = "NoteNode";

export default NoteNode;
