import { useState } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
  ScrollArea,
} from "@mantine/core";
import * as path from "@tauri-apps/api/path";
import { open } from "@tauri-apps/plugin-dialog";
import { readTextFile } from "@tauri-apps/plugin-fs";

import DataTableView from "./components/DataTableView";
import EditView from "./components/EditView";
import Sidebar from "./components/Sidebar";
import DataSidebar from "./components/DataSidebar";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const [projectDir, setProjectDir] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileData, setFileData] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [columns, setColumns] = useState<Column[]>([]);

  const menuToFileMap: Record<string, string> = {
    Item: "items.json",
    Block: "blocks.json",
    MapObjects: "mapObjects.json",
    MachineRecipes: "machineRecipes.json",
    Challenges: "challenges.json",
  };

  async function openProjectDir() {
    setLoading(true);
    try {
      const openedDir = await open({ directory: true });
      if (!openedDir) {
        setLoading(false);
        return;
      }
      setProjectDir(openedDir as string);
    } catch (error) {
      console.error("Error opening project directory:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadFileData(menuItem: string, columnIndex: number = 0) {
    if (!projectDir) {
      console.error("Project directory is not set.");
      return;
    }

    const fileName = menuToFileMap[menuItem];
    if (!fileName) {
      console.error(`No file mapping found for menu item: ${menuItem}`);
      return;
    }

    try {
      const filePath = await path.join(projectDir, "master", fileName);
      const contents = await readTextFile(filePath);
      const jsonData = JSON.parse(contents);

      if (!jsonData || !Array.isArray(jsonData.data)) {
        console.error(`Invalid data format in file: ${fileName}`);
        console.log("Loaded data:", jsonData);
        return;
      }

      if (columnIndex === 0) {
        setColumns([{ title: menuItem, data: jsonData.data }]);
      } else {
        const newColumns = columns.slice(0, columnIndex + 1);
        newColumns.push({ title: menuItem, data: jsonData.data });
        setColumns(newColumns);
      }

      setSelectedFile(menuItem);
      setFileData(jsonData.data);
      setSelectedData(null);
      setEditData(null);

      console.log(`Successfully loaded data for ${menuItem}:`, jsonData.data);
    } catch (error) {
      console.error(`Error loading file data for ${menuItem}:`, error);
    }
  }

  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 64 }}
        navbar={{
          width: 194,
          breakpoint: "xs",
        }}
        style={{
          marginLeft: "375px",
          padding: "16px",
          overflowX: "auto",
          display: "flex",
          gap: "16px",
        }}
      >
        <Sidebar
          menuToFileMap={menuToFileMap}
          selectedFile={selectedFile}
          loadFileData={loadFileData}
          openProjectDir={openProjectDir}
        />
        {columns.map((column, columnIndex) => (
          <div key={columnIndex}>
            <DataSidebar
              fileData={column.data}
              selectedData={selectedData}
              setSelectedData={(data) => {
                setSelectedData(data);
                loadFileData(data.name as string, columnIndex + 1);
              }}
            />
          </div>
        ))}
        <ScrollArea>
          <DataTableView
            fileData={fileData}
            selectedData={selectedData}
            setSelectedData={setSelectedData}
            setEditData={setEditData}
          />
        </ScrollArea>
        {editData && <EditView editData={editData} setEditData={setEditData} />}
      </AppShell>
    </MantineProvider>
  );
}

export default App;
