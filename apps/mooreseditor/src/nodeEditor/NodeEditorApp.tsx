import { useCallback, useMemo, useState } from "react";

import "@xyflow/react/dist/style.css";
import {
  applyNodeChanges,
  applyEdgeChanges,
  useReactFlow,
} from "@xyflow/react";


import CanvasContextMenu from "./components/canvas/CanvasContextMenu";
import NodeCanvas from "./components/canvas/NodeCanvas";
import EdgeTypeDialog from "./components/dialogs/EdgeTypeDialog";
import PropertiesPanel from "./components/panels/PropertiesPanel";
import NodeToolbar from "./components/toolbar/NodeToolbar";
import { EdgeEditContext } from "./context/EdgeEditContext";
import { useNodeEditorContext } from "./context/NodeEditorContext";
import { useNodeGraph } from "./hooks/useNodeGraph";
import { useNodeOperations } from "./hooks/useNodeOperations";
import {
  canCreateMasterRecordForNode,
  createMasterRecordForNode,
} from "./utils/masterRecordCreation";
import {
  resolveDisplayNames,
  resolveEdgeRecipeLabels,
} from "./utils/nodeRenderResolvers";
import { RECIPE_SCHEMA_MAP, normalizeRecipeRefsFromEdgeData } from "./utils/recipeEdge";
import { buildSchemaMetaMap } from "./utils/schemaMeta";

import type { Column } from "../hooks/useJson";
import type { ContextMenuPosition } from "./components/canvas/CanvasContextMenu";
import type { ConnectionDecision } from "./types/connection";
import type { NodeEditorViewProps } from "./types/props";
import type { SchemaMeta } from "./utils/schemaMeta";
import type {
  OnNodesChange,
  OnEdgesChange,
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
} from "@xyflow/react";

/**
 * Remove recipe records from jsonData for the given edges.
 * Only removes recipes that are not referenced by any other remaining edge.
 */
function removeRecipesFromJsonData(
  edgesToRemove: ReactFlowEdge[],
  allEdges: ReactFlowEdge[],
  jsonData: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): Column[] {
  const refsToRemove = edgesToRemove.flatMap((e) =>
    normalizeRecipeRefsFromEdgeData(e.data),
  );
  if (refsToRemove.length === 0) return jsonData;

  // Collect recipe refs still in use by other edges
  const removingIds = new Set(edgesToRemove.map((e) => e.id));
  const refsStillInUse = new Set<string>();
  for (const edge of allEdges) {
    if (removingIds.has(edge.id)) continue;
    for (const ref of normalizeRecipeRefsFromEdgeData(edge.data)) {
      refsStillInUse.add(`${ref.edgeType}:${ref.masterGuid}`);
    }
  }

  const refsToActuallyRemove = refsToRemove.filter(
    (ref) => !refsStillInUse.has(`${ref.edgeType}:${ref.masterGuid}`),
  );
  if (refsToActuallyRemove.length === 0) return jsonData;

  let result = [...jsonData];
  for (const ref of refsToActuallyRemove) {
    const schemaId = RECIPE_SCHEMA_MAP[ref.edgeType];
    const schemaMeta = schemaMetas.get(schemaId);
    if (!schemaMeta?.guidField) continue;

    const colIndex = result.findIndex((col) => col.title === schemaId);
    if (colIndex === -1) continue;

    const col = result[colIndex];
    const rows = Array.isArray(col.data?.[schemaMeta.dataArrayPath])
      ? (col.data[schemaMeta.dataArrayPath] as Record<string, unknown>[])
      : [];
    const filteredRows = rows.filter(
      (row) =>
        row &&
        typeof row === "object" &&
        (row as Record<string, unknown>)[schemaMeta.guidField!] !==
          ref.masterGuid,
    );

    result = [...result];
    result[colIndex] = {
      ...col,
      data: { ...col.data, [schemaMeta.dataArrayPath]: filteredRows },
    };
  }

  return result;
}

export default function NodeEditorApp(props: NodeEditorViewProps) {
  const { state, dispatch } = useNodeEditorContext();
  const schemaMetas = useMemo(
    () => buildSchemaMetaMap(props.schemas),
    [props.schemas],
  );

  // State for editing an existing edge
  const [editingEdge, setEditingEdge] = useState<ReactFlowEdge | null>(null);

  // State for right-click context menu
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPosition | null>(null);
  const { screenToFlowPosition } = useReactFlow();

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
      // Delete associated recipes when edges are removed
      const removeChanges = changes.filter((c) => c.type === "remove");
      if (removeChanges.length > 0) {
        const edgesToRemove = removeChanges
          .map((c) => state.edges.find((e) => e.id === c.id))
          .filter((e): e is ReactFlowEdge => e != null);
        if (edgesToRemove.length > 0) {
          props.setJsonData((prev) =>
            removeRecipesFromJsonData(edgesToRemove, state.edges, prev, schemaMetas),
          );
        }
      }

      const newEdges = applyEdgeChanges(changes, state.edges);
      dispatch({ type: "SET_EDGES", edges: newEdges });
      props.onMarkDirty();
    },
    [state.edges, dispatch, props, schemaMetas],
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

  // --- Edge double-click to edit ---
  const handleEdgeDoubleClick = useCallback(
    (_event: React.MouseEvent, edge: ReactFlowEdge) => {
      if (edge.type === "recipe") {
        setEditingEdge(edge);
      }
    },
    [],
  );

  // Callback for RecipeEdge label double-click (via context)
  const handleRequestEditEdge = useCallback(
    (edgeId: string) => {
      const edge = state.edges.find((e) => e.id === edgeId);
      if (edge?.type === "recipe") {
        setEditingEdge(edge);
      }
    },
    [state.edges],
  );

  const handleEdgeEditConfirm = useCallback(
    (decision: ConnectionDecision) => {
      if (!editingEdge) return;

      if (decision.edgeType === "recipe" && decision.recipeRefs.length > 0) {
        const updatedEdges = state.edges.map((e) =>
          e.id === editingEdge.id
            ? {
                ...e,
                type: "recipe",
                data: {
                  edgeType: "recipe",
                  recipeRefs: decision.recipeRefs,
                },
              }
            : e,
        );
        dispatch({ type: "SET_EDGES", edges: updatedEdges });
      }

      setEditingEdge(null);
      handleMarkDirty();
    },
    [editingEdge, state.edges, dispatch, handleMarkDirty],
  );

  const handleEdgeEditCancel = useCallback(() => {
    setEditingEdge(null);
  }, []);

  // --- Context menu ---
  const handlePaneContextMenu = useCallback(
    (event: MouseEvent | React.MouseEvent) => {
      event.preventDefault();
      const flowPos = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      setContextMenuPos({
        screenX: event.clientX,
        screenY: event.clientY,
        flowX: flowPos.x,
        flowY: flowPos.y,
      });
    },
    [screenToFlowPosition],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenuPos(null);
  }, []);

  // --- Delete selected (toolbar) with recipe cleanup ---
  const handleDeleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(
      state.nodes.filter((n) => n.selected).map((n) => n.id),
    );
    const selectedEdgeIds = new Set(
      state.edges.filter((e) => e.selected).map((e) => e.id),
    );

    const edgesToRemove = state.edges.filter(
      (e) =>
        selectedEdgeIds.has(e.id) ||
        selectedNodeIds.has(e.source) ||
        selectedNodeIds.has(e.target),
    );

    if (edgesToRemove.length > 0) {
      props.setJsonData((prev) =>
        removeRecipesFromJsonData(edgesToRemove, state.edges, prev, schemaMetas),
      );
    }

    deleteSelected();
  }, [state.nodes, state.edges, deleteSelected, props, schemaMetas]);

  // --- Dialog state ---
  const isEdgeDialogOpen = pendingConnection !== null || editingEdge !== null;

  const dialogSourceNode = editingEdge
    ? (resolvedNodes.find((n) => n.id === editingEdge.source) ?? null)
    : pendingConnection?.source
      ? (resolvedNodes.find((n) => n.id === pendingConnection.source) ?? null)
      : null;

  const dialogTargetNode = editingEdge
    ? (resolvedNodes.find((n) => n.id === editingEdge.target) ?? null)
    : pendingConnection?.target
      ? (resolvedNodes.find((n) => n.id === pendingConnection.target) ?? null)
      : null;

  const dialogInitialRecipeRefs = editingEdge
    ? normalizeRecipeRefsFromEdgeData(editingEdge.data)
    : undefined;

  const handleDialogConfirm = useCallback(
    (decision: ConnectionDecision) => {
      if (editingEdge) {
        handleEdgeEditConfirm(decision);
      } else {
        confirmConnection(decision);
      }
    },
    [editingEdge, handleEdgeEditConfirm, confirmConnection],
  );

  const handleDialogCancel = useCallback(() => {
    if (editingEdge) {
      handleEdgeEditCancel();
    } else {
      cancelConnection();
    }
  }, [editingEdge, handleEdgeEditCancel, cancelConnection]);

  // Collect masterGuids of item/research nodes already on the graph
  const existingNodeGuids = useMemo(() => {
    const guids = new Set<string>();
    for (const node of state.nodes) {
      if (
        (node.type === "item" || node.type === "research") &&
        node.data?.masterGuid
      ) {
        guids.add(node.data.masterGuid as string);
      }
    }
    return guids;
  }, [state.nodes]);

  const hasCreatableNodesInContextMenu = useMemo(
    () =>
      canCreateMasterRecordForNode("item", props.jsonData, schemaMetas) ||
      canCreateMasterRecordForNode("research", props.jsonData, schemaMetas),
    [props.jsonData, schemaMetas],
  );

  const handleCreateAndAddNode = useCallback(
    (type: "item" | "research", position: { x: number; y: number }) => {
      const created = createMasterRecordForNode(type, props.jsonData, schemaMetas);
      if (!created) {
        return false;
      }

      props.setJsonData(created.updatedColumns);
      addNode(type, created.masterGuid, created.displayName, position);
      props.onMarkDirty();
      return true;
    },
    [props.jsonData, props.onMarkDirty, props.setJsonData, schemaMetas, addNode],
  );

  const selectedNode = state.selectedNodeId
    ? resolvedNodes.find((n) => n.id === state.selectedNodeId) ?? null
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
