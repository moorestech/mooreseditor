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
import type { OnNodesChange, OnEdgesChange, Node as ReactFlowNode } from "@xyflow/react";

export default function NodeEditorApp(props: NodeEditorViewProps) {
  const { state, dispatch } = useNodeEditorContext();
  const schemaMetas = useMemo(
    () => buildSchemaMetaMap(props.schemas),
    [props.schemas],
  );

  // Load graph data
  useNodeGraph(props.projectDir, props.jsonData, schemaMetas);

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
    ? state.nodes.find((n) => n.id === state.selectedNodeId) ?? null
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
          nodes={state.nodes}
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
