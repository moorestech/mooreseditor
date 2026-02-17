import type { Node as ReactFlowNode } from "@xyflow/react";

let nodeIdCounter = 0;

function generateNodeId(): string {
  nodeIdCounter++;
  return `node-${Date.now()}-${nodeIdCounter}`;
}

export function createItemNode(
  masterGuid: string,
  position: { x: number; y: number },
  displayName?: string,
): ReactFlowNode {
  return {
    id: generateNodeId(),
    type: "item",
    position,
    data: { masterGuid, displayName: displayName || masterGuid },
  };
}

export function createBlockNode(
  masterGuid: string,
  position: { x: number; y: number },
  displayName?: string,
): ReactFlowNode {
  return {
    id: generateNodeId(),
    type: "block",
    position,
    data: { masterGuid, displayName: displayName || masterGuid },
  };
}

export function createResearchNode(
  masterGuid: string,
  position: { x: number; y: number },
  displayName?: string,
): ReactFlowNode {
  return {
    id: generateNodeId(),
    type: "research",
    position,
    data: { masterGuid, displayName: displayName || masterGuid },
  };
}

export function createNoteNode(
  position: { x: number; y: number },
  text: string = "",
): ReactFlowNode {
  return {
    id: generateNodeId(),
    type: "note",
    position,
    data: { text, width: 200, height: 150 },
    style: { width: 200, height: 150 },
  };
}

export function createPlaceholderNode(
  position: { x: number; y: number },
  text: string = "",
): ReactFlowNode {
  return {
    id: generateNodeId(),
    type: "placeholder",
    position,
    data: { text },
  };
}
