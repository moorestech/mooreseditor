import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

export function validateGraph(
  nodes: ReactFlowNode[],
  edges: ReactFlowEdge[],
): { cleanedEdges: ReactFlowEdge[]; warnings: string[] } {
  const nodeIds = new Set(nodes.map((n) => n.id));
  const warnings: string[] = [];

  // Remove orphaned edges (source/target node doesn't exist)
  const cleanedEdges = edges.filter((e) => {
    if (!nodeIds.has(e.source) || !nodeIds.has(e.target)) {
      warnings.push(`Orphaned edge removed: ${e.id}`);
      return false;
    }
    return true;
  });

  return { cleanedEdges, warnings };
}
