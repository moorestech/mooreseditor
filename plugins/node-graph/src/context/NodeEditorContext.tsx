import type { ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";

import type {
  Node as ReactFlowNode,
  Edge as ReactFlowEdge,
  Viewport,
} from "@xyflow/react";

interface NodeEditorState {
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  viewport: Viewport;
  isDirty: boolean;
  selectedNodeId: string | null;
}

type Action =
  | { type: "SET_NODES"; nodes: ReactFlowNode[]; markDirty?: boolean }
  | { type: "SET_EDGES"; edges: ReactFlowEdge[]; markDirty?: boolean }
  | { type: "SET_VIEWPORT"; viewport: Viewport }
  | { type: "SET_DIRTY"; dirty: boolean }
  | { type: "SET_SELECTED_NODE"; nodeId: string | null }
  | { type: "UPDATE_NODE_DATA"; nodeId: string; data: Record<string, unknown> }
  | {
      type: "LOAD_GRAPH";
      nodes: ReactFlowNode[];
      edges: ReactFlowEdge[];
      viewport: Viewport;
    };

function reducer(state: NodeEditorState, action: Action): NodeEditorState {
  switch (action.type) {
    case "SET_NODES":
      return {
        ...state,
        nodes: action.nodes,
        isDirty: action.markDirty === false ? state.isDirty : true,
      };
    case "SET_EDGES":
      return {
        ...state,
        edges: action.edges,
        isDirty: action.markDirty === false ? state.isDirty : true,
      };
    case "SET_VIEWPORT":
      return { ...state, viewport: action.viewport };
    case "SET_DIRTY":
      return { ...state, isDirty: action.dirty };
    case "SET_SELECTED_NODE":
      return { ...state, selectedNodeId: action.nodeId };
    case "UPDATE_NODE_DATA":
      return {
        ...state,
        nodes: state.nodes.map((n) =>
          n.id === action.nodeId ? { ...n, data: action.data } : n,
        ),
        isDirty: true,
      };
    case "LOAD_GRAPH":
      return {
        ...state,
        nodes: action.nodes,
        edges: action.edges,
        viewport: action.viewport,
        isDirty: false,
      };
    default:
      return state;
  }
}

const initialState: NodeEditorState = {
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  isDirty: false,
  selectedNodeId: null,
};

interface NodeEditorContextType {
  state: NodeEditorState;
  dispatch: React.Dispatch<Action>;
  setNodes: (nodes: ReactFlowNode[]) => void;
  setEdges: (edges: ReactFlowEdge[]) => void;
}

const NodeEditorContext = createContext<NodeEditorContextType | undefined>(
  undefined,
);

export function NodeEditorProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setNodes = useCallback(
    (nodes: ReactFlowNode[]) => dispatch({ type: "SET_NODES", nodes }),
    [],
  );

  const setEdges = useCallback(
    (edges: ReactFlowEdge[]) => dispatch({ type: "SET_EDGES", edges }),
    [],
  );

  return (
    <NodeEditorContext.Provider value={{ state, dispatch, setNodes, setEdges }}>
      {children}
    </NodeEditorContext.Provider>
  );
}

export function useNodeEditorContext() {
  const context = useContext(NodeEditorContext);
  if (!context) {
    throw new Error(
      "useNodeEditorContext must be used within NodeEditorProvider",
    );
  }
  return context;
}
