import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

import type { EdgeProps } from "@xyflow/react";

// 建設コスト表示専用エッジ。ラベルはターゲットのrequiredItemsから導出済み
// Build-cost display edge; label is pre-derived from target's requiredItems
export default function BuildCostEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = (data || {}) as { buildCostLabel?: string };
  const label =
    typeof edgeData.buildCostLabel === "string" &&
    edgeData.buildCostLabel.length > 0
      ? edgeData.buildCostLabel
      : "Build Cost";

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#047857" : "#10b981",
          strokeWidth: selected ? 3 : 2,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 10,
            background: "#fff",
            padding: "2px 6px",
            borderRadius: 4,
            border: "1px solid #10b981",
            pointerEvents: "all",
            maxWidth: 280,
            whiteSpace: "pre-line",
            lineHeight: 1.3,
            textAlign: "center",
          }}
          className="nodrag nopan"
          title={label}
        >
          {label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
