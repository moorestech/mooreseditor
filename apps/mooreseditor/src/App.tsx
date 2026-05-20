import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { NotificationProvider } from "@mooreseditor/plugin-sdk";

import EditorView from "./components/EditorView";
import { SearchOverlay } from "./components/SearchOverlay";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSaveShortcut } from "./hooks/useSaveShortcut";
import { useSchema } from "./hooks/useSchema";
import { createHostApi } from "./pluginHost/hostApi";
import { usePlugins } from "./pluginHost/usePlugins";
import { showNotification } from "./utils/notification";
import { saveProjectData } from "./utils/saveProjectData";

import type { Column } from "./hooks/useJson";
import type { ViewCapabilities, ViewDescriptor } from "./viewHost/types";

const theme = createTheme({
  primaryColor: "orange",
});

const EDITOR_VIEW_ID = "editor";

/** 能力を解決できなかった場合のフォールバック（保存不可）。 */
const NO_CAPABILITIES: ViewCapabilities = {
  canSave: false,
  onSave: () => {},
};

function App() {
  const { projectDir, schemaDir, masterDir, menuToFileMap, openProjectDir } =
    useProject();
  const {
    jsonData,
    setJsonData,
    loadJsonFile,
    preloadAllData,
    isPreloading,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    clearUnsavedChanges,
  } = useJson();
  const { schemas, loadSchema } = useSchema();
  const { plugins } = usePlugins();

  const [isEditing, setIsEditing] = useState(false);
  const [activeViewId, setActiveViewId] = useState(EDITOR_VIEW_ID);
  const searchTargetRef = useRef<HTMLElement>(null);

  // --- 負債③: 揮発性 state を ref で追い、安定参照の getter から最新値を返す ---
  // hostApi / pluginViews の useMemo deps から jsonData（毎キーストローク変化）を
  // 排除し、manifest.createView が再実行されてプラグインが remount するのを防ぐ。
  const jsonDataRef = useRef(jsonData);
  jsonDataRef.current = jsonData;

  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  const saveAll = useCallback(
    async (columns: Column[]) => {
      await saveProjectData({
        columns,
        projectDir,
        masterDir,
        onSuccess: () => {
          setIsEditing(false);
          clearUnsavedChanges();
        },
      });
    },
    [projectDir, masterDir, clearUnsavedChanges],
  );

  const markDirty = useCallback(() => {
    setIsEditing(true);
    setHasUnsavedChanges(true);
  }, [setHasUnsavedChanges]);

  // --- 負債③: HostAPI に渡す関数群を安定参照にする ---
  // getColumns は jsonData をクロージャに閉じ込めず ref から読むため、
  // 毎レンダーで同一参照のまま常に最新 columns を返せる。
  const getColumns = useCallback(() => jsonDataRef.current, []);
  const setColumns = useCallback(
    (updater: (columns: Column[]) => Column[]) => {
      setJsonData((prev) => updater(prev));
    },
    [setJsonData],
  );

  // hostApi は projectDir / masterDir / schemas / loadSchema が変わったときのみ
  // 再生成される。getColumns / setColumns / markDirty は安定参照なので
  // 毎キーストロークでは再生成されない。
  const hostApi = useMemo(
    () =>
      createHostApi({
        getColumns,
        setColumns,
        schemas,
        loadSchema,
        projectDir,
        masterDir,
        markDirty,
      }),
    [
      getColumns,
      setColumns,
      schemas,
      loadSchema,
      projectDir,
      masterDir,
      markDirty,
    ],
  );

  // --- 負債①/③: createView は manifest と hostApi が安定な限り 1 回だけ呼ぶ ---
  // 得た PluginView を保持し、render() を繰り返し呼ぶ。hostApi が安定なため
  // タブ切替や編集（jsonData 更新）では再生成されず、プラグインは remount しない。
  const pluginInstances = useMemo(
    () =>
      plugins.map((manifest) => ({
        manifest,
        view: manifest.createView(hostApi),
      })),
    [plugins, hostApi],
  );

  // Editor の能力解決（従来ロジック）。
  const editorGetCapabilities = useCallback(
    (): ViewCapabilities => ({
      canSave: (isEditing || hasUnsavedChanges) && jsonData.length > 0,
      onSave: () => saveAll(jsonData),
    }),
    [isEditing, hasUnsavedChanges, jsonData, saveAll],
  );

  const editorView: ViewDescriptor = useMemo(
    () => ({
      id: EDITOR_VIEW_ID,
      label: "Editor",
      render: () => (
        <EditorView
          menuToFileMap={menuToFileMap}
          jsonData={jsonData}
          setJsonData={setJsonData}
          schemas={schemas}
          loadSchema={loadSchema}
          loadJsonFile={loadJsonFile}
          openProjectDir={openProjectDir}
          isPreloading={isPreloading}
          isEditing={isEditing}
          hasUnsavedChanges={hasUnsavedChanges}
          onMarkDirty={markDirty}
        />
      ),
      getCapabilities: editorGetCapabilities,
    }),
    [
      menuToFileMap,
      jsonData,
      setJsonData,
      schemas,
      loadSchema,
      loadJsonFile,
      openProjectDir,
      isPreloading,
      isEditing,
      hasUnsavedChanges,
      markDirty,
      editorGetCapabilities,
    ],
  );

  // --- 負債②: プラグインビューも getCapabilities で同一パスで能力を返す ---
  const pluginViews: ViewDescriptor[] = useMemo(
    () =>
      pluginInstances.map(({ manifest, view }) => {
        const resolveCapabilities = (): ViewCapabilities => {
          const isDirty = view.isDirty?.();
          return {
            // isDirty を実装するプラグインはそれに従う。
            // 未実装なら従来どおり常時 true（保存可能）とする。
            canSave: isDirty ?? true,
            onSave: () => view.save?.() ?? Promise.resolve(),
            focusSearchMatch: view.focusSearchMatch
              ? (element) => view.focusSearchMatch?.(element)
              : undefined,
          };
        };
        return {
          id: manifest.id,
          label: manifest.name,
          render: () => view.render(),
          getCapabilities: resolveCapabilities,
        };
      }),
    [pluginInstances],
  );

  const views = useMemo(
    () => [editorView, ...pluginViews],
    [editorView, pluginViews],
  );

  // --- 負債②: Editor / プラグインを区別せず単一パスで能力を解決する ---
  const capabilities: ViewCapabilities = useMemo(() => {
    const active = views.find((view) => view.id === activeViewId);
    return active?.getCapabilities?.() ?? NO_CAPABILITIES;
  }, [views, activeViewId]);

  useSaveShortcut({
    canSave: capabilities.canSave,
    onSave: capabilities.onSave,
  });

  const handleActiveSearchMatchChange = useCallback(
    (element: HTMLElement | null) => {
      capabilities.focusSearchMatch?.(element);
    },
    [capabilities],
  );

  // --- 負債①: 遅延マウント ---
  // 全ビュー常時マウント + display:none では、@xyflow/react がコンテナサイズ 0 で
  // 初期化されレイアウトが崩れる。初回アクティブ化されるまで DOM へ追加せず、
  // 一度表示された ID は以後マウントを維持（display:none で隠す）して
  // プラグイン内部状態（編集中のノード等）を保持する。
  const [mountedViewIds, setMountedViewIds] = useState<Set<string>>(
    () => new Set([EDITOR_VIEW_ID]),
  );
  useEffect(() => {
    setMountedViewIds((prev) => {
      if (prev.has(activeViewId)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(activeViewId);
      return next;
    });
  }, [activeViewId]);

  return (
    <MantineProvider theme={theme}>
      <NotificationProvider showNotification={showNotification}>
        <Notifications
          position="bottom-left"
          zIndex={2000}
          autoClose={4000}
          limit={5}
        />
        <AppShell header={{ height: 48 }} padding={0}>
          <AppShell.Header>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                height: 48,
                padding: "0 16px",
                gap: 16,
              }}
            >
              {views.length > 1 && (
                <SegmentedControl
                  size="sm"
                  value={activeViewId}
                  onChange={setActiveViewId}
                  data={views.map((view) => ({
                    label: view.label,
                    value: view.id,
                    disabled: view.disabled,
                  }))}
                />
              )}
            </div>
          </AppShell.Header>
          <AppShell.Main ref={searchTargetRef}>
            {views
              .filter((view) => mountedViewIds.has(view.id))
              .map((view) => (
                <div
                  key={view.id}
                  style={{
                    display: view.id === activeViewId ? "block" : "none",
                  }}
                >
                  {view.render()}
                </div>
              ))}
            <SearchOverlay
              targetRef={searchTargetRef}
              onActiveMatchChange={handleActiveSearchMatchChange}
            />
          </AppShell.Main>
        </AppShell>
      </NotificationProvider>
    </MantineProvider>
  );
}

export default App;
