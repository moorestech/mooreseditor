import { BaseEdge, getBezierPath } from "@xyflow/react";

import type { EdgeProps } from "@xyflow/react";

export default function DependencyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <BaseEdge
      id={id}
      path={edgePath}
      style={{
        stroke: selected ? "#333" : "#888",
        strokeWidth: selected ? 3 : 2,
      }}
      markerEnd="url(#arrow)"
    />
  );
}
