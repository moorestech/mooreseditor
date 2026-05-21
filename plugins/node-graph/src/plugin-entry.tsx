import { createColumnDispatch } from "@mooreseditor/plugin-sdk";

import { NODE_GRAPH_RELATIVE_PATH } from "./constants";
import { pluginMetadata } from "./pluginMetadata";

import NodeEditorView from "./index";

import type { NodeEditorHandle } from "./NodeEditorInner";
import type { NodeGraphFile } from "./types/nodeGraph";
import type {
  Column,
  HostAPI,
  PluginManifest,
  PluginView,
} from "@mooreseditor/plugin-sdk";

const manifest: PluginManifest = {
  ...pluginMetadata,
  createView(host: HostAPI): PluginView {
    // NodeEditorView は forwardRef。React コンポーネント外なので createRef では
    // なく素のミュータブルコンテナ + コールバック ref で handle を保持する。
    const handleRef: { current: NodeEditorHandle | null } = { current: null };

    const setJsonData = createColumnDispatch(host);

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
                path: NODE_GRAPH_RELATIVE_PATH,
                content: JSON.stringify(nodeGraph, null, 2),
              },
            ]
          : [],
      );
    };

    return {
      render: () => (
        <NodeEditorView
          ref={(h) => {
            handleRef.current = h;
          }}
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
        // NodeEditorHandle.focusSearchMatch は boolean（フォーカス成功可否）を
        // 返すが、PluginView 契約は void。戻り値は意図的に破棄する。
        handleRef.current?.focusSearchMatch(element);
      },
    };
  },
};

export default manifest;
