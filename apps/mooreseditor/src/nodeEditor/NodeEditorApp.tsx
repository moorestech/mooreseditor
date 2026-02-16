import { useMemo } from "react";

import "@xyflow/react/dist/style.css";

import CanvasContextMenu from "./components/canvas/CanvasContextMenu";
import NodeCanvas from "./components/canvas/NodeCanvas";
import EdgeTypeDialog from "./components/dialogs/EdgeTypeDialog";
import PropertiesPanel from "./components/panels/PropertiesPanel";
import NodeToolbar from "./components/toolbar/NodeToolbar";
import { EdgeEditContext } from "./context/EdgeEditContext";
import { useNodeEditorContext } from "./context/NodeEditorContext";
import { useContextMenu } from "./hooks/useContextMenu";
import { useDeleteHandler } from "./hooks/useDeleteHandler";
import { useEdgeEditing } from "./hooks/useEdgeEditing";
import { useGraphChangeHandlers } from "./hooks/useGraphChangeHandlers";
import { useNodeGraph } from "./hooks/useNodeGraph";
import { useNodeOperations } from "./hooks/useNodeOperations";
import {
  resolveDisplayNames,
  resolveEdgeRecipeLabels,
} from "./utils/nodeRenderResolvers";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { NodeEditorViewProps } from "./types/props";

export default function NodeEditorApp(props: NodeEditorViewProps) {
  const { state } = useNodeEditorContext();
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

  // Core operations
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

  // Graph change handlers
  const {
    onNodesChange,
    onEdgesChange,
    handleNodeSelect,
    handleViewportChange,
    handleMarkDirty,
  } = useGraphChangeHandlers({
    schemaMetas,
    setJsonData: props.setJsonData,
    onMarkDirty: props.onMarkDirty,
  });

  // Edge editing + dialog state
  const {
    handleEdgeDoubleClick,
    handleRequestEditEdge,
    isEdgeDialogOpen,
    dialogSourceNode,
    dialogTargetNode,
    dialogInitialRecipeRefs,
    handleDialogConfirm,
    handleDialogCancel,
  } = useEdgeEditing({
    resolvedNodes,
    pendingConnection,
    confirmConnection,
    cancelConnection,
    onMarkDirty: handleMarkDirty,
  });

  // Delete handler + keyboard shortcut
  const { handleDeleteSelected } = useDeleteHandler({
    schemaMetas,
    setJsonData: props.setJsonData,
    deleteSelected,
    hasSelection,
    isDialogOpen: isEdgeDialogOpen,
  });

  // Context menu + node creation
  const {
    contextMenuPos,
    handlePaneContextMenu,
    closeContextMenu,
    existingNodeGuids,
    hasCreatableNodesInContextMenu,
    handleCreateAndAddNode,
  } = useContextMenu({
    jsonData: props.jsonData,
    schemaMetas,
    setJsonData: props.setJsonData,
    onMarkDirty: props.onMarkDirty,
    addNode,
  });

  const selectedNode = state.selectedNodeId
    ? (resolvedNodes.find((n) => n.id === state.selectedNodeId) ?? null)
    : null;

  return (
    <EdgeEditContext.Provider value={handleRequestEditEdge}>
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
            onDeleteSelected={handleDeleteSelected}
            hasSelection={hasSelection}
            existingNodeGuids={existingNodeGuids}
          />
          <NodeCanvas
            nodes={resolvedNodes}
            edges={resolvedEdges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeSelect={handleNodeSelect}
            onEdgeDoubleClick={handleEdgeDoubleClick}
            onPaneContextMenu={handlePaneContextMenu}
            onPaneClick={closeContextMenu}
            onNodeClick={closeContextMenu}
            onEdgeClick={closeContextMenu}
            viewport={state.viewport}
            onViewportChange={handleViewportChange}
          />
          <CanvasContextMenu
            position={contextMenuPos}
            onClose={closeContextMenu}
            jsonData={props.jsonData}
            schemaMetas={schemaMetas}
            onAddNode={addNode}
            onCreateAndAddNode={
              hasCreatableNodesInContextMenu ? handleCreateAndAddNode : undefined
            }
            existingNodeGuids={existingNodeGuids}
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
          opened={isEdgeDialogOpen}
          onConfirm={handleDialogConfirm}
          onCancel={handleDialogCancel}
          jsonData={props.jsonData}
          setJsonData={props.setJsonData}
          schemaMetas={schemaMetas}
          sourceNode={dialogSourceNode}
          targetNode={dialogTargetNode}
          onMarkDirty={handleMarkDirty}
          initialRecipeRefs={dialogInitialRecipeRefs}
        />
      </div>
    </EdgeEditContext.Provider>
  );
}
