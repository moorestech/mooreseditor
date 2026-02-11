import { useCallback, useMemo } from "react";

import "@xyflow/react/dist/style.css";
import {
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";


import NodeCanvas from "./components/canvas/NodeCanvas";
import PropertiesPanel from "./components/panels/PropertiesPanel";
import NodeToolbar from "./components/toolbar/NodeToolbar";
import { useNodeEditorContext } from "./context/NodeEditorContext";
import { useNodeGraph } from "./hooks/useNodeGraph";
import { useNodeOperations } from "./hooks/useNodeOperations";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { NodeEditorViewProps } from "./types/props";
import type { SchemaMeta } from "./utils/schemaMeta";
import type { Column } from "../hooks/useJson";
import type { OnNodesChange, OnEdgesChange, Node as ReactFlowNode } from "@xyflow/react";

/**
 * Resolve display names from master data at render time.
 * This ensures names are always up-to-date even if data loads after the graph.
 */
function resolveDisplayNames(
  nodes: ReactFlowNode[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): ReactFlowNode[] {
  return nodes.map((node) => {
    if (node.type === "note" || !node.data.masterGuid) return node;

    // Map node type to schema ID dynamically
    const schemaId = findSchemaIdForNodeType(node.type!, schemaMetas);
    if (!schemaId) return node;

    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField || !meta?.nameField) return node;

    const col = jsonData.find((c) => c.title === schemaId);
    const arr = col?.data?.[meta.dataArrayPath];
    if (!Array.isArray(arr)) return node;

    const record = arr.find(
      (r: any) => r[meta.guidField!] === node.data.masterGuid,
    );
    if (!record) return node;

    const displayName = record[meta.nameField!];
    if (!displayName || displayName === node.data.displayName) return node;

    return { ...node, data: { ...node.data, displayName } };
  });
}

/**
 * Find the schema ID that corresponds to a node type by checking
 * which schema contains a record matching the node type convention.
 */
function findSchemaIdForNodeType(
  nodeType: string,
  schemaMetas: Map<string, SchemaMeta>,
): string | null {
  // Try exact match first (e.g., "research" -> "research")
  if (schemaMetas.has(nodeType)) return nodeType;
  // Try pluralized (e.g., "item" -> "items", "block" -> "blocks")
  const plural = nodeType + "s";
  if (schemaMetas.has(plural)) return plural;
  return null;
}

export default function NodeEditorApp(props: NodeEditorViewProps) {
  const { state, dispatch } = useNodeEditorContext();
  const schemaMetas = useMemo(
    () => buildSchemaMetaMap(props.schemas),
    [props.schemas],
  );

  // Load graph data
  useNodeGraph(props.projectDir, props.jsonData, schemaMetas);

  // Resolve display names at render time so they stay current with loaded data
  const resolvedNodes = useMemo(
    () => resolveDisplayNames(state.nodes, props.jsonData, schemaMetas),
    [state.nodes, props.jsonData, schemaMetas],
  );

  const { addNode, deleteSelected, onConnect, updateNodeData, hasSelection } =
    useNodeOperations();

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => {
      const newNodes = applyNodeChanges(changes, state.nodes);
      dispatch({ type: "SET_NODES", nodes: newNodes });
      props.onMarkDirty();
    },
    [state.nodes, dispatch, props],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      const newEdges = applyEdgeChanges(changes, state.edges);
      dispatch({ type: "SET_EDGES", edges: newEdges });
      props.onMarkDirty();
    },
    [state.edges, dispatch, props],
  );

  const handleNodeSelect = useCallback(
    (node: ReactFlowNode | null) => {
      dispatch({ type: "SET_SELECTED_NODE", nodeId: node?.id ?? null });
    },
    [dispatch],
  );

  const handleViewportChange = useCallback(
    (viewport: { x: number; y: number; zoom: number }) => {
      dispatch({ type: "SET_VIEWPORT", viewport });
    },
    [dispatch],
  );

  const selectedNode = state.selectedNodeId
    ? resolvedNodes.find((n) => n.id === state.selectedNodeId) ?? null
    : null;

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 48px)",
        width: "100%",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <NodeToolbar
          jsonData={props.jsonData}
          schemaMetas={schemaMetas}
          onAddNode={addNode}
          onDeleteSelected={deleteSelected}
          hasSelection={hasSelection}
        />
        <NodeCanvas
          nodes={resolvedNodes}
          edges={state.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeSelect={handleNodeSelect}
          viewport={state.viewport}
          onViewportChange={handleViewportChange}
        />
      </div>
      <PropertiesPanel
        selectedNode={selectedNode}
        jsonData={props.jsonData}
        setJsonData={props.setJsonData}
        schemas={props.schemas}
        schemaMetas={schemaMetas}
        onMarkDirty={props.onMarkDirty}
        onNodeDataChange={updateNodeData}
      />
    </div>
  );
}
