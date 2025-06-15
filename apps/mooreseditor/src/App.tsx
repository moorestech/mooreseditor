import { useState, useEffect } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import EditView from "./components/EditView";
import FormView from "./components/FormView";
import Sidebar from "./components/Sidebar";
import { TableView } from "./components/TableView";
import { useJson } from "./hooks/useJson";
import { useProject } from "./hooks/useProject";
import { useSchema } from "./hooks/useSchema";

const theme = createTheme({
  primaryColor: "orange",
});

function App() {
  const [lastSavedFilePath, setLastSavedFilePath] = useState<string | null>(
    null
  );
  const { projectDir, schemaDir, menuToFileMap, openProjectDir } = useProject();
  const { jsonData, setJsonData, loadJsonFile } = useJson();
  const { schemas, loadSchema } = useSchema();

  const [nestedViews, setNestedViews] = useState<
    Array<{ type: 'form' | 'table'; schema: any; data: any; path: string[] }>
  >([]);
  const [editData, setEditData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [isShowFormView, setIsShowFormView] = useState(false);

  useEffect(() => {
    if (isShowFormView && selectedSchema && schemas[selectedSchema] && jsonData.length > 0 && nestedViews.length === 0) {
      setNestedViews([{
        type: 'form',
        schema: schemas[selectedSchema],
        data: { data: jsonData[jsonData.length - 1].data },
        path: []
      }]);
    }
  }, [isShowFormView, selectedSchema, schemas, jsonData]);

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


  return (
    <MantineProvider theme={theme}>
      <AppShell
        header={{ height: 64 }}
        padding={0}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            height: "100vh",
            overflow: "hidden",
            padding: "16px",
            gap: "16px",
          }}
        >
          <Sidebar
            menuToFileMap={menuToFileMap}
            selectedFile={null}
            loadFileData={async (menuItem) => {
              await loadJsonFile(menuItem, projectDir);
              await loadSchema(menuItem, schemaDir);
              setSelectedSchema(menuItem);
              setIsShowFormView(true);
              setNestedViews([]);
            }}
            openProjectDir={openProjectDir}
            isEditing={isEditing}
          />

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              overflowX: "auto",
              height: "100%",
            }}
          >
            {nestedViews.map((view, index) => (
              <div
                key={index}
                style={{
                  borderRight: index < nestedViews.length - 1 ? "1px solid #E2E2E2" : "none",
                  padding: "16px",
                  minWidth: "400px",
                  height: "100%",
                  overflowY: "auto",
                  flexShrink: 0,
                }}
              >
            {view.type === 'table' ? (
              <TableView
                schema={view.schema}
                data={view.data}
                onRowSelect={(rowIndex) => {
                  const selectedRowData = view.data[rowIndex];
                  if (selectedRowData && view.schema.items?.type === 'object') {
                    setNestedViews(prev => [
                      ...prev.slice(0, index + 1),
                      {
                        type: 'form',
                        schema: view.schema.items,
                        data: selectedRowData,
                        path: [...view.path, rowIndex.toString()]
                      }
                    ]);
                  }
                }}
              />
            ) : (
              <FormView
                schema={view.schema}
                data={view.data}
                onDataChange={(newData) => {
                  if (index === 0 && view.path.length === 0) {
                    // Root FormView
                    const updatedJsonData = [...jsonData];
                    updatedJsonData[updatedJsonData.length - 1].data = newData.data;
                    setJsonData(updatedJsonData);
                    setIsEditing(true);
                  } else {
                    // Nested FormView
                    const updatedJsonData = [...jsonData];
                    let dataRef: any = { data: updatedJsonData[updatedJsonData.length - 1].data };
                    for (let i = 0; i < view.path.length - 1; i++) {
                      dataRef = dataRef[view.path[i]];
                    }
                    dataRef[view.path[view.path.length - 1]] = newData;
                    setJsonData(updatedJsonData);
                    setIsEditing(true);
                  }
                }}
                onObjectArrayClick={(subPath, schema) => {
                  let dataAtPath = view.data;
                  for (const key of subPath) {
                    dataAtPath = dataAtPath?.[key];
                  }
                  
                  // For root FormView (index 0), use direct path
                  const fullPath = index === 0 && view.path.length === 0 
                    ? subPath 
                    : [...view.path, ...subPath];
                  
                  setNestedViews(prev => [
                    ...prev.slice(0, index + 1),
                    {
                      type: 'table',
                      schema: schema,
                      data: dataAtPath || [],
                      path: fullPath
                    }
                  ]);
                }}
              />
            )}
              </div>
            ))}

            {editData && (
              <div
                style={{
                  padding: "16px",
                  minWidth: "400px",
                  height: "100%",
                  overflowY: "auto",
                  flexShrink: 0,
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
          </div>
        </div>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
