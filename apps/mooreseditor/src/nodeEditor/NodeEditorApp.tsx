import { useCallback, useMemo } from "react";

import "@xyflow/react/dist/style.css";
import {
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";


import NodeCanvas from "./components/canvas/NodeCanvas";
import EdgeTypeDialog from "./components/dialogs/EdgeTypeDialog";
import PropertiesPanel from "./components/panels/PropertiesPanel";
import NodeToolbar from "./components/toolbar/NodeToolbar";
import { useNodeEditorContext } from "./context/NodeEditorContext";
import { useNodeGraph } from "./hooks/useNodeGraph";
import { useNodeOperations } from "./hooks/useNodeOperations";
import {
  resolveDisplayNames,
  resolveEdgeRecipeLabels,
} from "./utils/nodeRenderResolvers";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { NodeEditorViewProps } from "./types/props";
import type {
  OnNodesChange,
  OnEdgesChange,
  Node as ReactFlowNode,
} from "@xyflow/react";

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
  const resolvedEdges = useMemo(
    () => resolveEdgeRecipeLabels(state.edges, props.jsonData, schemaMetas),
    [state.edges, props.jsonData, schemaMetas],
  );

  const {
    addNode,
    deleteSelected,
    onConnect,
    updateNodeData,
    hasSelection,
    pendingConnection,
    confirmConnection,
    cancelConnection,
  } = useNodeOperations();

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
  const handleMarkDirty = useCallback(() => {
    props.onMarkDirty();
    dispatch({ type: "SET_DIRTY", dirty: true });
  }, [props, dispatch]);

  const selectedNode = state.selectedNodeId
    ? resolvedNodes.find((n) => n.id === state.selectedNodeId) ?? null
    : null;
  const sourceNode = pendingConnection?.source
    ? resolvedNodes.find((node) => node.id === pendingConnection.source) ?? null
    : null;
  const targetNode = pendingConnection?.target
    ? resolvedNodes.find((node) => node.id === pendingConnection.target) ?? null
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
          edges={resolvedEdges}
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
      <EdgeTypeDialog
        opened={pendingConnection !== null}
        onConfirm={confirmConnection}
        onCancel={cancelConnection}
        jsonData={props.jsonData}
        setJsonData={props.setJsonData}
        schemaMetas={schemaMetas}
        sourceNode={sourceNode}
        targetNode={targetNode}
        onMarkDirty={handleMarkDirty}
      />
    </div>
  );
}
