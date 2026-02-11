import React, { useState, useEffect, useRef } from "react";

import {
  AppShell,
  MantineProvider,
  SegmentedControl,
  createTheme,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import * as path from "@tauri-apps/api/path";
import { writeTextFile, exists, mkdir } from "@tauri-apps/plugin-fs";

import EditorView from "./components/EditorView";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSchema } from "./hooks/useSchema";

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
  const [nodeEditorMounted, setNodeEditorMounted] = useState(false);
  const nodeEditorRef = useRef<NodeEditorHandle>(null);

  // Preload all data when menuToFileMap changes (after File Open)
  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  // Keep NodeEditorView mounted once it's been visited
  useEffect(() => {
    if (mode === "node" && !nodeEditorMounted) {
      setNodeEditorMounted(true);
    }
  }, [mode, nodeEditorMounted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault(); // Prevent browser's save dialog

        if (mode === "editor") {
          if ((isEditing || hasUnsavedChanges) && jsonData.length > 0) {
            saveAll(jsonData);
          }
        } else if (mode === "node") {
          nodeEditorRef.current?.save();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditing, hasUnsavedChanges, jsonData, mode]);

  async function saveAll(
    columns: Column[],
    nodeGraphData?: NodeGraphFile | null,
  ) {
    if (!columns.length || !projectDir) {
      console.error("保存に必要な情報が不足しています");
      return;
    }

    // For development environment with sample project
    if (projectDir === "SampleProject") {
      console.log("サンプルプロジェクトのため、保存はスキップされました");
      columns.forEach((column) => {
        console.log(
          `${column.title}:`,
          JSON.stringify({ data: column.data }, null, 2),
        );
      });
      if (nodeGraphData) {
        console.log("nodeGraph:", JSON.stringify(nodeGraphData, null, 2));
      }
      setIsEditing(false);
      clearUnsavedChanges();
      return;
    }

    const errors: string[] = [];

    // Save all loaded JSON files
    for (const column of columns) {
      try {
        if (!masterDir) {
          errors.push(`${column.title}.json: Master directory is not set.`);
          continue;
        }
        const jsonFilePath = await path.join(
          masterDir,
          `${column.title}.json`,
        );
        await writeTextFile(
          jsonFilePath,
          JSON.stringify(column.data, null, 2),
        );
        console.log(`データが保存されました: ${jsonFilePath}`);
      } catch (err) {
        errors.push(`${column.title}.json: ${err}`);
      }
    }

    // Save nodeGraph
    if (nodeGraphData) {
      try {
        const mooreseditorDir = await path.join(projectDir, ".mooreseditor");
        const isDirExists = await exists(mooreseditorDir);
        if (!isDirExists) {
          await mkdir(mooreseditorDir, { recursive: true });
        }
        const nodeGraphPath = await path.join(
          mooreseditorDir,
          "nodeGraph.v1.json",
        );
        await writeTextFile(
          nodeGraphPath,
          JSON.stringify(nodeGraphData, null, 2),
        );
        console.log(`nodeGraphが保存されました: ${nodeGraphPath}`);
      } catch (err) {
        errors.push(`nodeGraph: ${err}`);
      }
    }

    // Only clear dirty on full success
    if (errors.length === 0) {
      setIsEditing(false);
      clearUnsavedChanges();
    } else {
      console.error("保存中にエラー:", errors);
    }
  }

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
              onChange={(v) => setMode(v as "editor" | "node")}
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
          {nodeEditorMounted && (
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
