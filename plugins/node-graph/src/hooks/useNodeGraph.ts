import { useCallback, useEffect, useRef } from "react";

import { invoke } from "@tauri-apps/api/core";
import * as path from "@tauri-apps/api/path";
import { readTextFile } from "@tauri-apps/plugin-fs";

import { NODE_GRAPH_DIR, NODE_GRAPH_FILE_NAME } from "../constants";
import { useNodeEditorContext } from "../context/NodeEditorContext";
import { validateAndMigrate } from "../utils/graphMigration";
import { importResearchFromMaster } from "../utils/importFromMaster";
import { normalizeNoteColor } from "../utils/noteColor";
import { extractRecipeRefsFromGraphEdge } from "../utils/recipeEdge";

import type { GraphNode, GraphEdge, NodeGraphFile } from "../types/nodeGraph";
import type { SchemaMeta } from "../utils/schemaMeta";
import type { Column } from "@mooreseditor/plugin-sdk";
import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";

const isDev = import.meta.env.DEV;

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
      const w = gn.width ?? 200;
      const h = gn.height ?? 150;
      const color = normalizeNoteColor(gn.color);
      return {
        id: gn.id,
        type: "note",
        position: gn.position,
        data: { text: gn.text, color, width: w, height: h },
        style: { width: w, height: h },
      };
    }

    if (gn.type === "placeholder") {
      return {
        id: gn.id,
        type: "placeholder",
        position: gn.position,
        data: { text: gn.text },
      };
    }

    // Look up display name from master data
    const schemaId =
      gn.type === "item"
        ? "items"
        : gn.type === "block"
          ? "blocks"
          : "research";
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
    const recipeRefs = extractRecipeRefsFromGraphEdge(ge);
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
  const isLoading = useRef(false);
  const prevProjectDir = useRef<string | null>(null);

  const loadGraph = useCallback(async () => {
    if (!projectDir || hasLoaded.current || isLoading.current) {
      return;
    }
    isLoading.current = true;
    try {
      let graphFile: NodeGraphFile | null = null;

      try {
        // Production: Tauri FS
        const mooreseditorDir = await path.join(projectDir, NODE_GRAPH_DIR);
        const filePath = await path.join(mooreseditorDir, NODE_GRAPH_FILE_NAME);
        try {
          await invoke("add_project_to_scope", {
            projectPath: mooreseditorDir,
          });
        } catch {
          // Scope addition failed — likely in dev/browser environment
        }
        const content = await readTextFile(filePath);
        const parsed = JSON.parse(content);
        graphFile = validateAndMigrate(parsed);
      } catch {
        // Tauri FS failed — try dev HTTP fallback
        if (isDev && projectDir === "SampleProject") {
          try {
            const response = await fetch(
              "/src/sample/.mooreseditor/nodeGraph.v1.json",
            );
            if (response.ok) {
              const parsed = await response.json();
              graphFile = validateAndMigrate(parsed);
            }
          } catch {
            // HTTP fetch also failed — will fall through to importFromMaster
          }
        }
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
        hasLoaded.current = true;
      } else {
        // Import from master data (research nodes)
        const importedNodes = importResearchFromMaster(jsonData, schemaMetas);
        dispatch({
          type: "LOAD_GRAPH",
          nodes: importedNodes,
          edges: [],
          viewport: { x: 0, y: 0, zoom: 0.8 },
        });
        hasLoaded.current = true;
      }
    } finally {
      isLoading.current = false;
    }
  }, [projectDir, jsonData, schemaMetas, dispatch]);

  useEffect(() => {
    if (prevProjectDir.current !== projectDir) {
      prevProjectDir.current = projectDir;
      hasLoaded.current = false;
      isLoading.current = false;
    }
  }, [projectDir]);

  useEffect(() => {
    if (projectDir && jsonData.length > 0 && schemaMetas.size > 0) {
      loadGraph();
    }
  }, [projectDir, jsonData.length, schemaMetas.size, loadGraph]);

  return {
    reload: () => {
      hasLoaded.current = false;
      loadGraph();
    },
  };
}
