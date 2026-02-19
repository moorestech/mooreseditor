import { useContext } from "react";

import { BaseEdge, EdgeLabelRenderer, getBezierPath } from "@xyflow/react";

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
        (label): label is string =>
          typeof label === "string" && label.length > 0,
      )
    : [];

  const fallbackLabel = (() => {
    const recipeRefs = Array.isArray(edgeData.recipeRefs)
      ? edgeData.recipeRefs
      : [];
    if (recipeRefs.length > 0) {
      return `${recipeRefs.length} recipe${recipeRefs.length > 1 ? "s" : ""}`;
    }
    if (edgeData.edgeType === "craftRecipe") return "Craft";
    if (edgeData.edgeType === "machineRecipe") return "Machine";
    return "Recipe";
  })();
  const displayBlocks = recipeLabels.length > 0 ? recipeLabels : [fallbackLabel];

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
            gap: 3,
          }}
          className="nodrag nopan"
          title={displayBlocks.join("\n---\n")}
          onDoubleClick={handleDoubleClick}
        >
          {displayBlocks.map((block, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {i > 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    color: "#666",
                    lineHeight: 1.1,
                  }}
                >
                  ---
                </div>
              ) : null}
              <div
                style={{
                  whiteSpace: "pre-line",
                  lineHeight: 1.3,
                }}
              >
                {block}
              </div>
            </div>
          ))}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
