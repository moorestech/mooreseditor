import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

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
import { showNotification } from "./utils/notification";
import { saveProjectData } from "./utils/saveProjectData";

import type { Column } from "./hooks/useJson";
import type { ViewCapabilities, ViewDescriptor } from "./viewHost/types";
import type {
  NodeEditorHandle,
  NodeGraphFile,
} from "@mooreseditor/plugin-node-graph";

const NodeEditorView = lazy(() => import("@mooreseditor/plugin-node-graph"));

const theme = createTheme({
  primaryColor: "orange",
});

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

  const [isEditing, setIsEditing] = useState(false);
  const [activeViewId, setActiveViewId] = useState("editor");
  const searchTargetRef = useRef<HTMLElement>(null);
  const nodeEditorRef = useRef<NodeEditorHandle>(null);

  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  const saveAll = useCallback(
    async (columns: Column[], nodeGraphData?: NodeGraphFile | null) => {
      await saveProjectData({
        columns,
        nodeGraphData,
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

  // ビューレジストリ。Editor と Node Graph の 2 ビュー。
  const views: ViewDescriptor[] = useMemo(
    () => [
      {
        id: "editor",
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
      },
      {
        id: "node-graph",
        label: "Node Graph",
        disabled: isPreloading,
        render: () => (
          <Suspense
            fallback={<div style={{ padding: 16 }}>Loading Node Editor...</div>}
          >
            <NodeEditorView
              ref={nodeEditorRef}
              jsonData={jsonData}
              setJsonData={setJsonData}
              schemas={schemas}
              loadSchema={loadSchema}
              projectDir={projectDir}
              masterDir={masterDir}
              onMarkDirty={() => setHasUnsavedChanges(true)}
              onRequestSave={saveAll}
            />
          </Suspense>
        ),
      },
    ],
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
      projectDir,
      masterDir,
      setHasUnsavedChanges,
      saveAll,
    ],
  );

  // アクティブビューがホストへ公開する能力を解決する。
  const capabilities: ViewCapabilities = useMemo(() => {
    if (activeViewId === "editor") {
      return {
        canSave: (isEditing || hasUnsavedChanges) && jsonData.length > 0,
        onSave: () => saveAll(jsonData),
      };
    }
    if (activeViewId === "node-graph") {
      return {
        canSave: true,
        onSave: () => nodeEditorRef.current?.save() ?? Promise.resolve(),
        focusSearchMatch: (element) =>
          nodeEditorRef.current?.focusSearchMatch(element),
      };
    }
    return { canSave: false, onSave: () => {} };
  }, [activeViewId, isEditing, hasUnsavedChanges, jsonData, saveAll]);

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
            {views.map((view) => (
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
