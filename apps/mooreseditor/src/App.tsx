import { useState } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import { save } from "@tauri-apps/plugin-dialog";
import { writeTextFile } from "@tauri-apps/plugin-fs";

import DataSidebar from "./components/DataSidebar";
import DataTableView from "./components/DataTableView";
import EditView from "./components/EditView";
import FormView from "./components/FormView";
import { TableView } from "./components/TableView";
import Sidebar from "./components/Sidebar";
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
  const [selectedData, setSelectedData] = useState<any | null>(null);
  const [editData, setEditData] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [showFormView, setShowFormView] = useState(true);

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
        navbar={{ width: 300, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Header>
          {/* Header content if needed */}
        </AppShell.Header>
        
        <AppShell.Navbar p="md">
          <Sidebar
            menuToFileMap={menuToFileMap}
            selectedFile={null}
            loadFileData={async (menuItem) => {
              await loadJsonFile(menuItem, projectDir);
              await loadSchema(menuItem, schemaDir);
              setSelectedSchema(menuItem);
              setShowFormView(true);
              setNestedViews([]);
            }}
            openProjectDir={openProjectDir}
            isEditing={isEditing}
          />
        </AppShell.Navbar>
        
        <AppShell.Main>
          <div style={{ display: 'flex', gap: '1rem', height: '100%', overflowX: 'auto' }}>

            {!showFormView && jsonData.length > 0 && (
              <>
                <div
                  style={{
                    minWidth: "400px",
                    height: "100%",
                    overflowY: "auto",
                    padding: "1rem",
                    borderRight: "1px solid #E2E2E2",
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
                    minWidth: "400px",
                    height: "100%",
                    overflowY: "auto",
                    padding: "1rem",
                    borderRight: "1px solid #E2E2E2",
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
              </>
            )}

            {showFormView && selectedSchema && schemas[selectedSchema] && jsonData.length > 0 && (
              <div
                style={{
                  minWidth: "400px",
                  height: "100%",
                  overflowY: "auto",
                  padding: "1rem",
                }}
              >
            <FormView
              schema={schemas[selectedSchema]}
              data={{ data: jsonData[jsonData.length - 1].data }}
              onDataChange={(newData) => {
                const updatedJsonData = [...jsonData];
                updatedJsonData[updatedJsonData.length - 1].data = newData.data;
                setJsonData(updatedJsonData);
                setIsEditing(true);
              }}
              onObjectArrayClick={(path, schema) => {
                // Get data at path
                let dataAtPath = { data: jsonData[jsonData.length - 1].data };
                for (const key of path) {
                  dataAtPath = dataAtPath?.[key];
                }
                
                setNestedViews([{
                  type: 'table',
                  schema: schema,
                  data: dataAtPath || [],
                  path: path
                }]);
              }}
            />
              </div>
            )}

            {nestedViews.map((view, index) => (
              <div
                key={index}
                style={{
                  minWidth: "400px",
                  height: "100%",
                  overflowY: "auto",
                  padding: "1rem",
                  borderRight: "1px solid #E2E2E2",
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
                  // Update data in jsonData
                  const updatedJsonData = [...jsonData];
                  let dataRef = { data: updatedJsonData[updatedJsonData.length - 1].data };
                  for (let i = 0; i < view.path.length - 1; i++) {
                    dataRef = dataRef[view.path[i]];
                  }
                  dataRef[view.path[view.path.length - 1]] = newData;
                  setJsonData(updatedJsonData);
                  setIsEditing(true);
                }}
                onObjectArrayClick={(subPath, schema) => {
                  // Handle nested object arrays
                  let dataAtPath = view.data;
                  for (const key of subPath) {
                    dataAtPath = dataAtPath?.[key];
                  }
                  
                  setNestedViews(prev => [
                    ...prev.slice(0, index + 1),
                    {
                      type: 'table',
                      schema: schema,
                      data: dataAtPath || [],
                      path: [...view.path, ...subPath]
                    }
                  ]);
                }}
                  />
                )}
              </div>
            ))}

            {editData && !showFormView && (
              <div
                style={{
                  minWidth: "400px",
                  height: "100%",
                  overflowY: "auto",
                  padding: "1rem",
                  borderRight: "1px solid #E2E2E2",
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
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
