import { createRef } from "react";

import NodeEditorView from "./index";

import type { NodeEditorHandle } from "./NodeEditorInner";
import type { NodeGraphFile } from "./types/nodeGraph";
import type {
  Column,
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

/**
 * ノードグラフのプラグイン専用ファイルの相対パス。
 * `useNodeGraph` が `.mooreseditor/nodeGraph.v1.json` から読み込むのと一致させる。
 */
const NODE_GRAPH_FILE_PATH = ".mooreseditor/nodeGraph.v1.json";

const manifest: PluginManifest = {
  id: "node-graph",
  name: "Node Graph",
  version: "0.1.0",
  createView(host: HostAPI): PluginView {
    // NodeEditorView は forwardRef なので handle を保持する ref を用意する。
    const handleRef = createRef<NodeEditorHandle>();

    // HostAPI.setColumns は updater 関数のみ受け付けるため、
    // React の SetStateAction（関数 or 値）を updater へ正規化する。
    const setJsonData: React.Dispatch<React.SetStateAction<Column[]>> = (
      action,
    ) => {
      host.setColumns((columns) =>
        typeof action === "function"
          ? (action as (prev: Column[]) => Column[])(columns)
          : action,
      );
    };

    // onRequestSave: master カラム + nodeGraph ファイルを 1 操作で永続化する。
    const onRequestSave = async (
      columns: Column[],
      nodeGraph: NodeGraphFile | null,
    ): Promise<void> => {
      await host.saveProject(
        columns,
        nodeGraph
          ? [
              {
                path: NODE_GRAPH_FILE_PATH,
                content: JSON.stringify(nodeGraph, null, 2),
              },
            ]
          : [],
      );
    };

    return {
      render: () => (
        <NodeEditorView
          ref={handleRef}
          jsonData={host.getColumns()}
          setJsonData={setJsonData}
          schemas={host.schemas}
          loadSchema={host.loadSchema}
          projectDir={host.projectDir}
          masterDir={host.masterDir}
          onMarkDirty={host.markDirty}
          onRequestSave={onRequestSave}
        />
      ),
      save: async () => {
        handleRef.current?.save();
      },
      focusSearchMatch: (element: HTMLElement | null) => {
        handleRef.current?.focusSearchMatch(element);
      },
    };
  },
};

export default manifest;
