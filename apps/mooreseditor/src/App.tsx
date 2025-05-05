import { useState } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
  ScrollArea,
} from "@mantine/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import DataSidebar from "./components/DataSidebar";
import DataTableView from "./components/DataTableView";
import EditView from "./components/EditView";
import Sidebar from "./components/Sidebar";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const { projectDir, menuToFileMap, openProjectDir } = useProject();
  const { jsonData, loadJsonFile } = useJson();

  const [nestedView, setNestedView] = useState<Record<string, any> | null>(
    null
  );
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave(data: any) {
    try {
      const filePath = await save({
        filters: [
          { name: "JSON Files", extensions: ["json"] },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (filePath) {
        await writeTextFile(filePath, JSON.stringify(data, null, 2));
        console.log("データが保存されました:", filePath);
        setIsEditing(false);
      } else {
        console.log("保存がキャンセルされました");
      }
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
    }
  }

  function handleRowExpand(nestedData: any) {
    if (typeof nestedData === "object" && nestedData !== null) {
      console.log("Expanding nested data:", nestedData);
      setNestedView(nestedData);
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
            loadFileData={(menuItem) => loadJsonFile(menuItem, projectDir)}
            openProjectDir={openProjectDir}
            isEditing={isEditing}
          />
        </div>
        <div style={{ flexShrink: 0, width: "200px" }}>
          {jsonData.map((column, columnIndex) => (
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
              jsonData.length > 0 ? jsonData[jsonData.length - 1].data : []
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
            <EditView
              editData={editData}
              setEditData={setEditData}
              setIsEditing={setIsEditing}
              onSave={handleSave}
            />
          </div>
        )}
      </AppShell>
    </MantineProvider>
  );
}

export default App;
