import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import EditorView from "./components/EditorView";
import { SearchOverlay } from "./components/SearchOverlay";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSaveShortcut } from "./hooks/useSaveShortcut";
import { useSchema } from "./hooks/useSchema";
import { saveProjectData } from "./utils/saveProjectData";

import type { Column } from "./hooks/useJson";
import type { ViewCapabilities, ViewDescriptor } from "./viewHost/types";

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

  // ビューレジストリ。Phase 1 は組み込みの Editor のみ。
  // Phase 3 でプラグインビューがこの配列に追加される。
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
    ],
  );

  // アクティブビューがホストへ公開する能力を解決する。
  // Phase 1 は editor のみ。Phase 3 ではプラグインが登録した能力を引く。
  const capabilities: ViewCapabilities = useMemo(() => {
    if (activeViewId === "editor") {
      return {
        canSave: (isEditing || hasUnsavedChanges) && jsonData.length > 0,
        onSave: () => saveAll(jsonData),
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
    </MantineProvider>
  );
}

export default App;
