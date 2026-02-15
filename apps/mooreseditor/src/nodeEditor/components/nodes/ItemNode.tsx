import { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import { nodeSourceHandleStyle, nodeTargetHandleStyle } from "./handleStyles";

import type { NodeProps } from "@xyflow/react";

const ItemNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "8px 16px",
        borderRadius: 8,
        background: "#6495ED",
        color: "#fff",
        border: selected ? "2px solid #fff" : "2px solid transparent",
        minWidth: 120,
        textAlign: "center",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      <Handle type="target" position={Position.Left} style={nodeTargetHandleStyle} />
      <div>{(data.displayName as string) || "Item"}</div>
      <Handle type="source" position={Position.Right} style={nodeSourceHandleStyle} />
    </div>
  );
});

ItemNode.displayName = "ItemNode";

export default ItemNode;
