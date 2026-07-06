import type { NodeGraphFile } from "../types/nodeGraph";

function requiresMasterGuid(type: unknown): boolean {
  return type === "item" || type === "block" || type === "research";
}

export function validateAndMigrate(data: unknown): NodeGraphFile | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as any;

  // version check
  if (obj.version === undefined || obj.version === 1) {
    // v1: current format. Basic validation
    if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) return null;

    // Validate required node fields
    const validNodes = obj.nodes.filter((n: any) => {
      const hasBaseFields =
        n.id &&
        n.type &&
        n.position?.x !== undefined &&
        n.position?.y !== undefined;
      if (!hasBaseFields) {
        console.warn("Skipping invalid nodeGraph node:", n);
        return false;
      }

      if (
        requiresMasterGuid(n.type) &&
        (typeof n.masterGuid !== "string" || n.masterGuid.length === 0)
      ) {
        console.warn("Skipping nodeGraph node with invalid masterGuid:", n);
        return false;
      }

      return true;
    });
    const validNodeIds = new Set(validNodes.map((n: any) => n.id));

    // Validate required edge fields and normalize recipe edge payload
    const validEdges = obj.edges
      .filter((e: any) => e.id && e.source && e.target && e.edgeType)
      .filter((e: any) => {
        const hasValidEndpoints =
          validNodeIds.has(e.source) && validNodeIds.has(e.target);
        if (!hasValidEndpoints) {
          console.warn("Skipping nodeGraph edge with invalid endpoint:", e);
        }
        return hasValidEndpoints;
      })
      .map((e: any) => {
        if (e.edgeType === "recipe") {
          const recipes = Array.isArray(e.recipes)
            ? e.recipes.filter(
                (r: any) =>
                  (r?.edgeType === "craftRecipe" ||
                    r?.edgeType === "machineRecipe") &&
                  typeof r?.masterGuid === "string" &&
                  r.masterGuid.length > 0,
              )
            : [];
          return { ...e, recipes };
        }
        return e;
      });

    return {
      version: 1,
      viewport: obj.viewport ?? { x: 0, y: 0, zoom: 1 },
      nodes: validNodes,
      edges: validEdges,
    };
  }

  // Unknown version: null (fallback to import)
  console.warn(`Unknown nodeGraph version: ${obj.version}`);
  return null;
}
