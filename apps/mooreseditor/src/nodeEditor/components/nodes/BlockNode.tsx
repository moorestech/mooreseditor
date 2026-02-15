import { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import { nodeSourceHandleStyle, nodeTargetHandleStyle } from "./handleStyles";

import type { NodeProps } from "@xyflow/react";

const BlockNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        background: "#90EE90",
        color: "#333",
        border: selected ? "2px solid #333" : "2px solid transparent",
        minWidth: 120,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Handle type="target" position={Position.Left} style={nodeTargetHandleStyle} />
      <div>{(data.displayName as string) || "Block"}</div>
      <Handle type="source" position={Position.Right} style={nodeSourceHandleStyle} />
    </div>
  );
});

BlockNode.displayName = "BlockNode";

export default BlockNode;
