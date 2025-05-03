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
  const [menuToFileMap, setMenuToFileMap] = useState<Record<string, string>>(
    {}
  );
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);

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
        console.log("Parsed configData:", configData);
        setLoading(false);
        return;
      }

      const resolvedSchemaPath = await path.resolve(
        openedDir as string,
        configData.schemaPath
      );

      const files = await readDir(resolvedSchemaPath, { recursive: false });
      const yamlFiles: Record<string, string> = {};

      for (const file of files) {
        if (file.name && file.name.endsWith(".yml")) {
          yamlFiles[file.name.replace(".yml", "")] = file.path;
        }
      }

      if (Object.keys(yamlFiles).length === 0) {
        console.error("No YAML files found in the schemaPath.");
        setLoading(false);
        return;
      }

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
    if (!menuToFileMap[menuItem]) {
      console.error(`No file mapping found for menu item: ${menuItem}`);
      return;
    }

    try {
      const yamlFilePath = menuToFileMap[menuItem];
      const yamlContents = await readTextFile(yamlFilePath);

      const yamlData = parseYaml(yamlContents);

      if (!yamlData || typeof yamlData !== "object") {
        console.error(`Invalid YAML format in file: ${menuItem}`);
        return;
      }

      if (yamlData.id) {
        const jsonFilePath = await path.join(
          projectDir!,
          "master",
          `${yamlData.id}.json`
        );
        const jsonContents = await readTextFile(jsonFilePath);
        const jsonData = JSON.parse(jsonContents);

        if (!jsonData || !Array.isArray(jsonData.data)) {
          console.error(`Invalid JSON format in file: ${yamlData.id}.json`);
          return;
        }

        const newColumns = [
          ...columns.slice(0, columnIndex + 1),
          { title: menuItem, data: jsonData.data },
        ];
        setColumns(newColumns);
      }

      setSelectedFile(menuItem);
      setSelectedData(null);
      setEditData(null);
    } catch (error) {
      console.error(`Error loading file data for ${menuItem}:`, error);
    }
  }

  function parseYaml(yamlText: string): any {
    try {
      return YAML.parse(yamlText);
    } catch (error) {
      console.error("Error parsing YAML:", error);
      console.log("YAML Text:", yamlText);
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
            selectedFile={selectedFile}
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
              setSelectedData={(data) => {
                setSelectedData(data);
                loadFileData(data.name as string, columnIndex + 1);
              }}
            />
          ))}
        </div>
        <ScrollArea style={{ flex: 1 }}>
          <DataTableView
            fileData={fileData}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            setEditData={setEditData}
            onRowsReordered={function (): void {
              throw new Error("Function not implemented.");
            }}
          />
        </ScrollArea>
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
