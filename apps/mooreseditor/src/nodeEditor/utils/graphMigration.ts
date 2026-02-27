import type { NodeGraphFile } from "../types/nodeGraph";

export function validateAndMigrate(data: unknown): NodeGraphFile | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as any;

  // version check
  if (obj.version === undefined || obj.version === 1) {
    // v1: current format. Basic validation
    if (!Array.isArray(obj.nodes) || !Array.isArray(obj.edges)) return null;

    // Validate required node fields
    const validNodes = obj.nodes.filter(
      (n: any) =>
        n.id &&
        n.type &&
        n.position?.x !== undefined &&
        n.position?.y !== undefined,
    );

    // Validate required edge fields and normalize recipe edge payload
    const validEdges = obj.edges
      .filter((e: any) => e.id && e.source && e.target && e.edgeType)
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
