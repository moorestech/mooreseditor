import React, { useCallback, useEffect, useRef, useState } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import EditorView from "./components/EditorView";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSaveShortcut } from "./hooks/useSaveShortcut";
import { useSchema } from "./hooks/useSchema";
import { saveProjectData } from "./utils/saveProjectData";

import type { Column } from "./hooks/useJson";
import type { NodeEditorHandle } from "./nodeEditor";
import type { NodeGraphFile } from "./nodeEditor/types/nodeGraph";

const NodeEditorView = React.lazy(() => import("./nodeEditor"));

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
  const [mode, setMode] = useState<"editor" | "node">("editor");
  const [isNodeEditorMounted, setIsNodeEditorMounted] = useState(false);
  const nodeEditorRef = useRef<NodeEditorHandle>(null);

  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  useEffect(() => {
    if (mode === "node" && !isNodeEditorMounted) {
      setIsNodeEditorMounted(true);
    }
  }, [mode, isNodeEditorMounted]);

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

  useSaveShortcut({
    mode,
    canSaveEditor: (isEditing || hasUnsavedChanges) && jsonData.length > 0,
    onSaveEditor: () => {
      void saveAll(jsonData);
    },
    onSaveNode: () => {
      nodeEditorRef.current?.save();
    },
  });

  const markDirty = () => {
    setIsEditing(true);
    setHasUnsavedChanges(true);
  };

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
            <SegmentedControl
              size="sm"
              value={mode}
              onChange={(value) => setMode(value as "editor" | "node")}
              data={[
                { label: "Editor", value: "editor" },
                {
                  label: "Node Graph",
                  value: "node",
                  disabled: isPreloading,
                },
              ]}
            />
          </div>
        </AppShell.Header>
        <AppShell.Main>
          <div style={{ display: mode === "editor" ? "block" : "none" }}>
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
          </div>
          {isNodeEditorMounted && (
            <div style={{ display: mode === "node" ? "block" : "none" }}>
              <React.Suspense
                fallback={
                  <div style={{ padding: 16 }}>Loading Node Editor...</div>
                }
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
              </React.Suspense>
            </div>
          )}
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
