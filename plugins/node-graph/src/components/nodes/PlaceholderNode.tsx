import { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import { nodeSourceHandleStyle, nodeTargetHandleStyle } from "./handleStyles";

import type { NodeProps } from "@xyflow/react";

const PlaceholderNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "4px 8px",
        borderRadius: 4,
        background: "#B0B0B0",
        color: "#fff",
        border: selected ? "2px solid #000" : "2px solid transparent",
        minWidth: 60,
        textAlign: "center",
        fontSize: 6,
        fontWeight: 500,
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={nodeTargetHandleStyle}
      />
      <div>{(data.text as string) || "placeholder"}</div>
      <Handle
        type="source"
        position={Position.Right}
        style={nodeSourceHandleStyle}
      />
    </div>
  );
});

PlaceholderNode.displayName = "PlaceholderNode";

export default PlaceholderNode;
