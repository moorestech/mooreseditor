import { useCallback, useMemo, useState } from "react";

import { useReactFlow } from "@xyflow/react";

import { useNodeEditorContext } from "../context/NodeEditorContext";
import {
  canCreateMasterRecordForNode,
  createMasterRecordForNode,
} from "../utils/masterRecordCreation";
import { MASTER_NODE_TYPE_SECTIONS } from "../utils/nodeTypeCatalog";

import type { ContextMenuPosition } from "../components/canvas/CanvasContextMenu";
import type { GraphNodeType } from "../types/nodeGraph";
import type { MasterNodeType } from "../utils/nodeTypeCatalog";
import type { SchemaMeta } from "../utils/schemaMeta";
import type { Column } from "@moorestech/mooreseditor-plugin-sdk";

interface UseContextMenuParams {
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  onMarkDirty: () => void;
  addNode: (
    type: GraphNodeType,
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

  // 配置済みマスタ参照ノードのGUID集合（全型対象、重複配置の抑止に使う）
  // GUIDs of placed master-backed nodes (all types), used for dedup
  const existingNodeGuids = useMemo(() => {
    const guids = new Set<string>();
    for (const node of state.nodes) {
      if (typeof node.data?.masterGuid === "string") {
        guids.add(node.data.masterGuid);
      }
    }
    return guids;
  }, [state.nodes]);

  // 新規masterレコードを作成できるノード型の集合
  // Node types for which a new master record can be created
  const creatableNodeTypes = useMemo(() => {
    const types = new Set<MasterNodeType>();
    for (const entry of MASTER_NODE_TYPE_SECTIONS) {
      if (canCreateMasterRecordForNode(entry.type, jsonData, schemaMetas)) {
        types.add(entry.type);
      }
    }
    return types;
  }, [jsonData, schemaMetas]);

  const handleCreateAndAddNode = useCallback(
    (type: MasterNodeType, position: { x: number; y: number }) => {
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
    creatableNodeTypes,
    handleCreateAndAddNode,
  };
}
