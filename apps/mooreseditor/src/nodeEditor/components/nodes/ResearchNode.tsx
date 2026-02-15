import { memo } from "react";

import { Handle, Position } from "@xyflow/react";

import { nodeSourceHandleStyle, nodeTargetHandleStyle } from "./handleStyles";

import type { NodeProps } from "@xyflow/react";

const ResearchNode = memo(({ data, selected }: NodeProps) => {
  const consumeLabels = Array.isArray(data.consumeLabels)
    ? data.consumeLabels.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : [];
  const visibleConsumeLabels = consumeLabels.slice(0, 2);
  const hiddenConsumeCount = consumeLabels.length - visibleConsumeLabels.length;

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
      <Handle type="target" position={Position.Left} style={nodeTargetHandleStyle} />
      <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>
        Research
      </div>
      <div>{(data.displayName as string) || "Research"}</div>
      {visibleConsumeLabels.length > 0 ? (
        <div
          style={{
            marginTop: 6,
            paddingTop: 6,
            borderTop: "1px solid rgba(0, 0, 0, 0.15)",
            fontSize: 10,
            fontWeight: 500,
            textAlign: "left",
            lineHeight: 1.3,
          }}
        >
          <div style={{ opacity: 0.75, marginBottom: 2 }}>Consume</div>
          {visibleConsumeLabels.map((label) => (
            <div key={label}>{label}</div>
          ))}
          {hiddenConsumeCount > 0 ? (
            <div style={{ opacity: 0.7 }}>+{hiddenConsumeCount} more</div>
          ) : null}
        </div>
      ) : null}
      <Handle type="source" position={Position.Right} style={nodeSourceHandleStyle} />
    </div>
  );
});

ResearchNode.displayName = "ResearchNode";

export default ResearchNode;
