import React, { useEffect, useRef } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import EditorView from "./features/editor/EditorView";
import { useEditorKeyboard } from "./features/editor/hooks/useEditorKeyboard";
import { useAppStore } from "./stores/appStore";
import { useDataStore } from "./stores/dataStore";
import { useProjectStore } from "./stores/projectStore";
import { useSchemaStore } from "./stores/schemaStore";

import type { NodeEditorHandle } from "./nodeEditor";

const NodeEditorView = React.lazy(() => import("./nodeEditor"));

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const menuToFileMap = useProjectStore((s) => s.menuToFileMap);
  const projectDir = useProjectStore((s) => s.projectDir);
  const masterDir = useProjectStore((s) => s.masterDir);
  const schemaDir = useProjectStore((s) => s.schemaDir);

  const columns = useDataStore((s) => s.columns);
  const isPreloading = useDataStore((s) => s.isPreloading);
  const schemas = useSchemaStore((s) => s.schemas);

  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  const isNodeEditorMounted = useAppStore((s) => s.isNodeEditorMounted);

  const nodeEditorRef = useRef<NodeEditorHandle>(null);

  // Preload all data when project config changes
  useEffect(() => {
    const { loadSchema } = useSchemaStore.getState();
    void useDataStore
      .getState()
      .preloadAllData(
        menuToFileMap,
        projectDir || "",
        masterDir,
        schemaDir,
        loadSchema,
      );
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  // Ctrl+S / Cmd+S keyboard shortcut
  useEditorKeyboard(nodeEditorRef);

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
            <EditorView />
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
                  jsonData={columns}
                  setJsonData={(action) => {
                    if (typeof action === "function") {
                      const prev = useDataStore.getState().columns;
                      useDataStore.getState().setColumns(action(prev));
                    } else {
                      useDataStore.getState().setColumns(action);
                    }
                  }}
                  schemas={schemas}
                  loadSchema={(name) =>
                    useSchemaStore.getState().loadSchema(name, schemaDir || "")
                  }
                  projectDir={projectDir}
                  masterDir={masterDir}
                  onMarkDirty={() => useDataStore.getState().markDirty()}
                  onRequestSave={async (cols, nodeGraphData) => {
                    await useAppStore.getState().saveAll({
                      columns: cols,
                      nodeGraphData,
                      projectDir,
                      masterDir,
                    });
                    useDataStore.getState().clearUnsavedChanges();
                  }}
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
