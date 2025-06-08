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
  const [lastSavedFilePath, setLastSavedFilePath] = useState<string | null>(
    null
  );
  const { projectDir, menuToFileMap, openProjectDir } = useProject();
  const { jsonData, loadJsonFile } = useJson();

  const [nestedViews, setNestedViews] = useState<
    Array<{ key: string; data: any }>
  >([]);
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  async function handleSave(data: any) {
    try {
      let filePath = lastSavedFilePath;

      if (!filePath) {
        filePath = await save({
          filters: [
            { name: "JSON Files", extensions: ["json"] },
            { name: "All Files", extensions: ["*"] },
          ],
        });

        if (!filePath) {
          console.log("保存がキャンセルされました");
          return;
        }

        setLastSavedFilePath(filePath);
      }

      await writeTextFile(filePath, JSON.stringify(data, null, 2));
      console.log("データが保存されました:", filePath);
      setIsEditing(false);
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
    }
  }

  function handleRowExpand(nestedData: any) {
    if (typeof nestedData === "object" && nestedData !== null) {
      setNestedViews((prev) => [
        ...prev,
        { key: "Nested Data", data: nestedData },
      ]);
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
        <div
          style={{
            marginTop: "16px",
            borderTop: "1px solid #E2E2E2",
            borderLeft: "1px solid #E2E2E2",
            paddingTop: "16px",
            paddingLeft: "16px",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <Sidebar
            menuToFileMap={menuToFileMap}
            selectedFile={null}
            loadFileData={(menuItem) => loadJsonFile(menuItem, projectDir)}
            openProjectDir={openProjectDir}
            isEditing={isEditing}
          />
        </div>

        <div
          style={{
            marginTop: "16px",
            borderTop: "1px solid #E2E2E2",
            borderLeft: "1px solid #E2E2E2",
            paddingTop: "16px",
            paddingLeft: "16px",
            minWidth: "400px",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          {jsonData.map((column, columnIndex) => (
            <DataSidebar
              key={columnIndex}
              fileData={column.data}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: "16px",
            borderTop: "1px solid #E2E2E2",
            borderLeft: "1px solid #E2E2E2",
            paddingTop: "16px",
            paddingLeft: "16px",
            minWidth: "400px",
            height: "100vh",
            overflowY: "auto",
          }}
        >
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
        </div>

        {nestedViews.map((view, index) => (
          <div
            key={index}
            style={{
              marginTop: "16px",
              borderTop: "1px solid #E2E2E2",
              borderLeft: "1px solid #E2E2E2",
              paddingTop: "16px",
              paddingLeft: "16px",
              minWidth: "400px",
              height: "100vh",
              overflowY: "auto",
            }}
          >
            <DataTableView
              fileData={Array.isArray(view.data) ? view.data : [view.data]}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              setEditData={setEditData}
              onRowsReordered={(newOrder) => {
                console.log("Rows reordered:", newOrder);
              }}
              onRowExpand={handleRowExpand}
            />
          </div>
        ))}

        {editData && (
          <div
            style={{
              marginTop: "16px",
              borderTop: "1px solid #E2E2E2",
              borderLeft: "1px solid #E2E2E2",
              paddingTop: "16px",
              paddingLeft: "16px",
              minWidth: "400px",
              height: "100vh",
              overflowY: "auto",
            }}
          >
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
