import { useCallback, useMemo, useState } from "react";

import { useReactFlow } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import {
  canCreateMasterRecordForNode,
  createMasterRecordForNode,
} from "../utils/masterRecordCreation";

import type { Column } from "../../hooks/useJson";
import type { ContextMenuPosition } from "../components/canvas/CanvasContextMenu";
import type { SchemaMeta } from "../utils/schemaMeta";

interface UseContextMenuParams {
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  onMarkDirty: () => void;
  addNode: (
    type: "item" | "block" | "research" | "note" | "placeholder",
    masterGuid?: string,
    displayName?: string,
    position?: { x: number; y: number },
  ) => void;
}

export function useContextMenu({
  jsonData,
  schemaMetas,
  setJsonData,
  onMarkDirty,
  addNode,
}: UseContextMenuParams) {
  const { state } = useNodeEditorContext();
  const { screenToFlowPosition } = useReactFlow();

  const [contextMenuPos, setContextMenuPos] =
    useState<ContextMenuPosition | null>(null);

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
      canCreateMasterRecordForNode("item", jsonData, schemaMetas) ||
      canCreateMasterRecordForNode("research", jsonData, schemaMetas),
    [jsonData, schemaMetas],
  );

  const handleCreateAndAddNode = useCallback(
    (type: "item" | "research", position: { x: number; y: number }) => {
      const created = createMasterRecordForNode(type, jsonData, schemaMetas);
      if (!created) {
        return false;
      }

      setJsonData(created.updatedColumns);
      addNode(type, created.masterGuid, created.displayName, position);
      onMarkDirty();
      return true;
    },
    [jsonData, onMarkDirty, setJsonData, schemaMetas, addNode],
  );

  return {
    contextMenuPos,
    handlePaneContextMenu,
    closeContextMenu,
    existingNodeGuids,
    hasCreatableNodesInContextMenu,
    handleCreateAndAddNode,
  };
}
