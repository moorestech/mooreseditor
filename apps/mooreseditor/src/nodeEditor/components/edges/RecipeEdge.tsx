import { useContext } from "react";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
} from "@xyflow/react";

import { EdgeEditContext } from "../../context/EdgeEditContext";

import type { EdgeProps } from "@xyflow/react";

export default function RecipeEdge({
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
  const requestEditEdge = useContext(EdgeEditContext);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const edgeData = (data || {}) as {
    edgeType?: string;
    recipeRefs?: Array<{ edgeType?: string; masterGuid?: string }>;
    recipeLabels?: string[];
  };
  const recipeLabels = Array.isArray(edgeData.recipeLabels)
    ? edgeData.recipeLabels.filter(
        (label): label is string => typeof label === "string" && label.length > 0,
      )
    : [];

  const fallbackLabel = (() => {
    const recipeRefs = Array.isArray(edgeData.recipeRefs) ? edgeData.recipeRefs : [];
    if (recipeRefs.length > 0) {
      return `${recipeRefs.length} recipe${recipeRefs.length > 1 ? "s" : ""}`;
    }
    if (edgeData.edgeType === "craftRecipe") return "Craft";
    if (edgeData.edgeType === "machineRecipe") return "Machine";
    return "Recipe";
  })();
  const displayLines = recipeLabels.length > 0
    ? recipeLabels.slice(0, 3)
    : [fallbackLabel];
  if (recipeLabels.length > 3) {
    displayLines.push(`+${recipeLabels.length - 3} more`);
  }

  const handleDoubleClick = () => {
    requestEditEdge?.(id);
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? "#ff6b00" : "#f59e0b",
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
            border: "1px solid #f59e0b",
            pointerEvents: "all",
            maxWidth: 280,
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
          className="nodrag nopan"
          title={displayLines.join("\n")}
          onDoubleClick={handleDoubleClick}
        >
          {displayLines.map((line, i) => (
            <div
              key={i}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {line}
            </div>
          ))}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
