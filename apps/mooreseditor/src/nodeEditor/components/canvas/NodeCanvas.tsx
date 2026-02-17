import { useCallback, useMemo } from "react";

import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";

import DependencyEdge from "../edges/DependencyEdge";
import RecipeEdge from "../edges/RecipeEdge";
import BlockNode from "../nodes/BlockNode";
import ItemNode from "../nodes/ItemNode";
import MemoNode from "../nodes/MemoNode";
import ResearchNode from "../nodes/ResearchNode";

import CanvasControls from "./CanvasControls";

import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  Connection,
  Viewport,
} from "@xyflow/react";

const nodeTypes = {
  item: ItemNode,
  block: BlockNode,
  research: ResearchNode,
  note: MemoNode,
};

const edgeTypes = {
  recipe: RecipeEdge,
  arrow: DependencyEdge,
};

interface NodeCanvasProps {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: (connection: Connection) => void;
  onNodeSelect: (node: ReactFlowNode | null) => void;
  onEdgeDoubleClick?: (event: React.MouseEvent, edge: ReactFlowEdge) => void;
  onPaneContextMenu?: (event: MouseEvent | React.MouseEvent) => void;
  onPaneClick?: (event: MouseEvent | React.MouseEvent) => void;
  onNodeClick?: (event: React.MouseEvent, node: ReactFlowNode) => void;
  onEdgeClick?: (event: React.MouseEvent, edge: ReactFlowEdge) => void;
  viewport: Viewport;
  onViewportChange: (viewport: Viewport) => void;
}

export default function NodeCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeSelect,
  onEdgeDoubleClick,
  onPaneContextMenu,
  onPaneClick,
  onNodeClick,
  onEdgeClick,
  viewport,
  onViewportChange,
}: NodeCanvasProps) {
  const handleSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: ReactFlowNode[] }) => {
      if (selectedNodes.length === 1) {
        onNodeSelect(selectedNodes[0]);
      } else {
        onNodeSelect(null);
      }
    },
    [onNodeSelect],
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: "arrow",
      markerEnd: { type: MarkerType.ArrowClosed },
      data: { edgeType: "dependency" },
    }),
    [],
  );

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect as OnConnect}
      onSelectionChange={handleSelectionChange}
      onEdgeDoubleClick={onEdgeDoubleClick}
      onPaneContextMenu={onPaneContextMenu}
      onPaneClick={onPaneClick}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      defaultEdgeOptions={defaultEdgeOptions}
      defaultViewport={viewport}
      onMoveEnd={(_event, vp) => onViewportChange(vp)}
      fitView={!viewport.zoom}
      snapToGrid
      snapGrid={[20, 20]}
      deleteKeyCode="Delete"
      style={{ width: "100%", height: "100%" }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
      <CanvasControls />
      <svg>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="10"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#888" />
          </marker>
        </defs>
      </svg>
    </ReactFlow>
  );
}
