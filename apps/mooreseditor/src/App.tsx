import { useState } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
  ScrollArea,
} from "@mantine/core";
import * as path from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile, readDir } from "@tauri-apps/plugin-fs";
import YAML from "yaml";

import DataSidebar from "./components/DataSidebar";
import DataTableView from "./components/DataTableView";
import EditView from "./components/EditView";
import Sidebar from "./components/Sidebar";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [schemaDir, setSchemaDir] = useState<string | null>(null);
  const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>(
    {}
  );
  const [columns, setColumns] = useState<Column[]>([]);
  const [nestedView, setNestedView] = useState<Record<string, any> | null>(
    null
  );
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  async function openProjectDir() {
    setLoading(true);
    try {
      const openedDir = await open({ directory: true });
      if (!openedDir) {
        console.error("No directory selected.");
        setLoading(false);
        return;
      }

      setProjectDir(openedDir as string);

      const configPath = await path.join(
        openedDir as string,
        "mooreseditor.config.yml"
      );
      const configContents = await readTextFile(configPath);

      const configData = parseYaml(configContents);
      if (!configData || !configData.schemaPath) {
        console.error(
          "Invalid or missing schemaPath in mooreseditor.config.yml"
        );
        setLoading(false);
        return;
      }

      const resolvedSchemaPath = await path.resolve(
        openedDir as string,
        configData.schemaPath
      );

      setSchemaDir(resolvedSchemaPath);

      const files = await readDir(resolvedSchemaPath, { recursive: false });
      const yamlFiles: Record<string, string> = {};

      for (const file of files) {
        if (file.name && file.name.endsWith(".yml")) {
          yamlFiles[file.name.replace(".yml", "")] = await path.join(
            resolvedSchemaPath,
            file.name
          );
        }
      }

      if (Object.keys(yamlFiles).length === 0) {
        console.error("No YAML files found in the schemaPath.");
        setLoading(false);
        return;
      }

      console.log("Menu to File Map:", yamlFiles);
      setMenuToFileMap(yamlFiles);

      setColumns([
        {
          title: "Menu",
          data: Object.keys(yamlFiles).map((name) => ({ name })),
        },
      ]);
    } catch (error) {
      console.error("Error opening project directory:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFileData(menuItem: string, columnIndex: number = 0) {
    console.log("Selected menu item:", menuItem);

    if (!schemaDir) {
      console.error("Schema directory is not set.");
      return;
    }

    try {
      const jsonFilePath = await path.join(
        projectDir!,
        "master",
        `${menuItem}.json`
      );
      const jsonContents = await readTextFile(jsonFilePath);
      const jsonData = JSON.parse(jsonContents);

      if (!jsonData || !Array.isArray(jsonData.data)) {
        console.error(`Invalid JSON format in file: ${menuItem}.json`);
        return;
      }

      const newColumns = [
        ...columns.slice(0, columnIndex + 1),
        { title: menuItem, data: jsonData.data },
      ];
      setColumns(newColumns);
    } catch (error) {
      console.error(`Error loading file data for ${menuItem}:`, error);
    }
  }

  function handleRowExpand(nestedData: any) {
    if (typeof nestedData === "object" && nestedData !== null) {
      console.log("Expanding nested data:", nestedData);
      setNestedView(nestedData); 
    }
  }

  function parseYaml(yamlText: string): any {
    try {
      return YAML.parse(yamlText);
    } catch (error) {
      console.error("Error parsing YAML:", error);
      return null;
    }
  }

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 64 }}
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
          gap: "3px",
          paddingTop: "16px",
          overflowX: "auto",
        }}
      >
        <div style={{ flexShrink: 0, width: "200px" }}>
          <Sidebar
            menuToFileMap={menuToFileMap}
            selectedFile={null}
            loadFileData={loadFileData}
            openProjectDir={openProjectDir}
          />
        </div>
        <div style={{ flexShrink: 0, width: "200px" }}>
          {columns.map((column, columnIndex) => (
            <DataSidebar
              key={columnIndex}
              fileData={column.data}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
            />
          ))}
        </div>
        <ScrollArea style={{ flex: 1 }}>
          <DataTableView
            fileData={
              columns.length > 0 ? columns[columns.length - 1].data : []
            }
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            setEditData={setEditData}
            onRowsReordered={(newOrder) => {
              console.log("Rows reordered:", newOrder);
            }}
            onRowExpand={handleRowExpand}
          />
        </ScrollArea>
        {nestedView && (
          <ScrollArea style={{ flex: 1 }}>
            <DataTableView
              fileData={Array.isArray(nestedView) ? nestedView : [nestedView]}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              setEditData={setEditData}
              onRowsReordered={(newOrder) => {
                console.log("Rows reordered:", newOrder);
              }}
              onRowExpand={handleRowExpand}
            />
          </ScrollArea>
        )}
        {editData && (
          <div style={{ flexShrink: 0, width: "300px" }}>
            <EditView editData={editData} setEditData={setEditData} />
          </div>
        )}
      </AppShell>
    </MantineProvider>
  );
}

export default App;
