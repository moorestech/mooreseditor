import { useCallback, useEffect, useRef } from "react";

import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";


import { useNodeEditorContext } from "../context/NodeEditorContext";
import { validateAndMigrate } from "../utils/graphMigration";
import { importResearchFromMaster } from "../utils/importFromMaster";
import { normalizeRecipeRefsFromEdgeData } from "../utils/recipeEdge";

import type { Column } from "../../hooks/useJson";
import type {
  GraphNode,
  GraphEdge,
  NodeGraphFile,
} from "../types/nodeGraph";
import type { SchemaMeta } from "../utils/schemaMeta";
import type { Node as ReactFlowNode, Edge as ReactFlowEdge } from "@xyflow/react";

/**
 * Map edgeType to React Flow component type key
 */
function mapEdgeType(edgeType: string): string {
  if (
    edgeType === "recipe" ||
    edgeType === "craftRecipe" ||
    edgeType === "machineRecipe"
  ) {
    return "recipe";
  }
  return "arrow";
}

/**
 * Convert persistent GraphNode[] to React Flow nodes
 */
function toReactFlowNodes(
  graphNodes: GraphNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowNode[] {
  return graphNodes.map((gn) => {
    if (gn.type === "note") {
      return {
        id: gn.id,
        type: "note",
        position: gn.position,
        data: { text: gn.text },
      };
    }

    // Look up display name from master data
    const schemaId =
      gn.type === "item" ? "items" : gn.type === "block" ? "blocks" : "research";
    const meta = schemaMetas.get(schemaId);
    let displayName = gn.masterGuid.substring(0, 8);
    if (meta?.guidField && meta?.nameField) {
      const col = jsonData.find((c) => c.title === schemaId);
      const arr = col?.data?.[meta.dataArrayPath];
      if (Array.isArray(arr)) {
        const record = arr.find(
          (r: any) => r[meta.guidField!] === gn.masterGuid,
        );
        if (record && meta.nameField) {
          displayName = record[meta.nameField] || displayName;
        }
      }
    }

    return {
      id: gn.id,
      type: gn.type,
      position: gn.position,
      data: { masterGuid: gn.masterGuid, displayName },
    };
  });
}

/**
 * Convert persistent GraphEdge[] to React Flow edges
 */
function toReactFlowEdges(graphEdges: GraphEdge[]): ReactFlowEdge[] {
  return graphEdges.map((ge) => {
    const recipeRefs = normalizeRecipeRefsFromEdgeData(ge);
    const isRecipe = recipeRefs.length > 0;
    return {
      id: ge.id,
      source: ge.source,
      target: ge.target,
      type: mapEdgeType(ge.edgeType),
      data: {
        edgeType: isRecipe ? "recipe" : ge.edgeType,
        ...(isRecipe ? { recipeRefs } : {}),
      },
    };
  });
}

export function useNodeGraph(
  projectDir: string | null,
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
) {
  const { dispatch } = useNodeEditorContext();
  const hasLoaded = useRef(false);

  const loadGraph = useCallback(async () => {
    if (!projectDir || hasLoaded.current) return;
    hasLoaded.current = true;

    let graphFile: NodeGraphFile | null = null;

    try {
      // Production: Tauri FS
      const mooreseditorDir = await path.join(projectDir, ".mooreseditor");
      const filePath = await path.join(mooreseditorDir, "nodeGraph.v1.json");
      const content = await readTextFile(filePath);
      graphFile = validateAndMigrate(JSON.parse(content));
    } catch {
      // File doesn't exist yet — will fall through to importFromMaster
    }

    if (graphFile) {
      const nodes = toReactFlowNodes(graphFile.nodes, jsonData, schemaMetas);
      const edges = toReactFlowEdges(graphFile.edges);
      dispatch({
        type: "LOAD_GRAPH",
        nodes,
        edges,
        viewport: graphFile.viewport,
      });
    } else {
      // Import from master data (research nodes)
      const importedNodes = importResearchFromMaster(jsonData, schemaMetas);
      dispatch({
        type: "LOAD_GRAPH",
        nodes: importedNodes,
        edges: [],
        viewport: { x: 0, y: 0, zoom: 0.8 },
      });
    }
  }, [projectDir, jsonData, schemaMetas, dispatch]);

  useEffect(() => {
    if (projectDir && jsonData.length > 0 && schemaMetas.size > 0) {
      loadGraph();
    }
  }, [projectDir, jsonData.length, schemaMetas.size, loadGraph]);

  return { reload: () => { hasLoaded.current = false; loadGraph(); } };
}
