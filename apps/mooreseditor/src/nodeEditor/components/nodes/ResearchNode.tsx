import { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import type { NodeProps } from "@xyflow/react";

const ResearchNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div
      style={{
        padding: "10px 20px",
        borderRadius: 8,
        background: "#87CEEB",
        color: "#333",
        border: selected ? "2px solid #333" : "2px solid transparent",
        minWidth: 140,
        textAlign: "center",
        fontSize: 13,
        fontWeight: 600,
      }}
    >
      <Handle type="target" position={Position.Left} />
      <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>
        Research
      </div>
      <div>{(data.displayName as string) || "Research"}</div>
      <Handle type="source" position={Position.Right} />
    </div>
  );
});

ResearchNode.displayName = "ResearchNode";

export default ResearchNode;
