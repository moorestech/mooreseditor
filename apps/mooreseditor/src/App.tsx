import { useState, useEffect } from "react";

import {
  AppShell,
  MantineProvider,
  createTheme,
} from "@mantine/core";
import * as path from "@tauri-apps/api/path";
import { writeTextFile } from "@tauri-apps/plugin-fs";

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
  const { projectDir, schemaDir, menuToFileMap, openProjectDir } = useProject();
  const { jsonData, setJsonData, loadJsonFile } = useJson();
  const { schemas, loadSchema } = useSchema();

  const [nestedViews, setNestedViews] = useState<
    Array<{ type: 'form' | 'table'; schema: any; data: any; path: string[] }>
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);
  const [isShowFormView, setIsShowFormView] = useState(false);

  useEffect(() => {
    if (isShowFormView && selectedSchema && schemas[selectedSchema] && jsonData.length > 0 && nestedViews.length === 0) {
      const schema = schemas[selectedSchema];
      const data = jsonData[jsonData.length - 1].data;
      
      // Check if the schema is an array type
      if ('type' in schema && schema.type === 'array') {
        // For array schemas, show TableView directly
        setNestedViews([{
          type: 'table',
          schema: schema,
          data: data,
          path: []
        }]);
      } else {
        // For object schemas, show FormView
        setNestedViews([{
          type: 'form',
          schema: schema,
          data: data,
          path: []
        }]);
      }
    }
  }, [isShowFormView, selectedSchema, schemas, jsonData]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault(); // Prevent browser's save dialog
        
        if (isEditing && jsonData.length > 0) {
          // Save the current jsonData
          handleSave(jsonData);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing, jsonData]);

  async function handleSave(_data: any) {
    try {
      // Check if we have jsonData and project directory
      if (!jsonData.length || !projectDir) {
        console.error("保存に必要な情報が不足しています");
        return;
      }

      // For development environment with sample project
      if (projectDir === "SampleProject") {
        console.log("サンプルプロジェクトのため、保存はスキップされました");
        // Log all data for debugging
        jsonData.forEach(column => {
          console.log(`${column.title}:`, JSON.stringify({ data: column.data }, null, 2));
        });
        setIsEditing(false);
        return;
      }

      // Save all loaded JSON files
      for (const column of jsonData) {
        try {
          // Build the JSON file path for each data column
          const jsonFilePath = await path.join(
            projectDir,
            "master",
            `${column.title}.json`
          );

          // Prepare the data in the original format
          const dataToSave = column.data;

          // Save to the JSON file
          await writeTextFile(jsonFilePath, JSON.stringify(dataToSave, null, 2));
          console.log(`データが保存されました: ${jsonFilePath}`);
        } catch (columnError) {
          console.error(`${column.title}.json の保存中にエラーが発生しました:`, columnError);
        }
      }
      
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
              // Load schema first
              const loadedSchema = await loadSchema(menuItem, schemaDir);
              // Pass the loaded schema to loadJsonFile for auto-generation if needed
              await loadJsonFile(menuItem, projectDir, 0, loadedSchema);
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
                data={(() => {
                  // Always get the latest data from jsonData
                  if (view.path.length === 0) {
                    return jsonData[jsonData.length - 1]?.data;
                  } else {
                    let dataRef: any = jsonData[jsonData.length - 1]?.data;
                    for (const key of view.path) {
                      dataRef = dataRef?.[key];
                    }
                    return dataRef;
                  }
                })()}
                onDataChange={(newData) => {
                  console.log('TableView onDataChange:', { newData, viewPath: view.path });
                  // Update the data through the same unified process
                  const updatedJsonData = [...jsonData];
                  const lastItem = { ...updatedJsonData[updatedJsonData.length - 1] };
                  
                  if (view.path.length === 0) {
                    lastItem.data = newData;
                  } else {
                    // Deep copy for nested data
                    lastItem.data = { ...lastItem.data };
                    let ref: any = lastItem.data;
                    
                    // Navigate to the parent of the target
                    for (let i = 0; i < view.path.length - 1; i++) {
                      const key = view.path[i];
                      ref[key] = Array.isArray(ref[key]) 
                        ? [...ref[key]] 
                        : { ...ref[key] };
                      ref = ref[key];
                    }
                    
                    // Update the final value
                    ref[view.path[view.path.length - 1]] = newData;
                  }
                  
                  updatedJsonData[updatedJsonData.length - 1] = lastItem;
                  console.log('Setting new jsonData:', updatedJsonData);
                  setJsonData(updatedJsonData);
                  setIsEditing(true);
                }}
                onRowSelect={(rowIndex) => {
                  // Get the latest data for row selection
                  let currentData: any = jsonData[jsonData.length - 1]?.data;
                  for (const key of view.path) {
                    currentData = currentData?.[key];
                  }
                  const selectedRowData = currentData?.[rowIndex];
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
                data={(() => {
                  // Always get the latest data from jsonData
                  if (view.path.length === 0) {
                    return jsonData[jsonData.length - 1]?.data;
                  } else {
                    let dataRef: any = jsonData[jsonData.length - 1]?.data;
                    for (const key of view.path) {
                      dataRef = dataRef?.[key];
                    }
                    return dataRef;
                  }
                })()}
                path={view.path}
                rootData={jsonData[jsonData.length - 1]?.data}
                onDataChange={(newData) => {
                  // 統一的なデータ更新処理
                  const updatedJsonData = [...jsonData];
                  const lastItem = { ...updatedJsonData[updatedJsonData.length - 1] };
                  
                  if (view.path.length === 0) {
                    // ルートレベルの場合、dataを直接置き換え
                    lastItem.data = newData;
                  } else {
                    // ネストされたデータの更新
                    // イミュータブルに更新するために各レベルをコピー
                    lastItem.data = { ...lastItem.data };
                    let ref: any = lastItem.data;
                    
                    // パスの最後の要素以外を辿る
                    for (let i = 0; i < view.path.length - 1; i++) {
                      const key = view.path[i];
                      ref[key] = Array.isArray(ref[key]) 
                        ? [...ref[key]] 
                        : { ...ref[key] };
                      ref = ref[key];
                    }
                    
                    // 最後の要素を新しい値で更新
                    ref[view.path[view.path.length - 1]] = newData;
                  }
                  
                  updatedJsonData[updatedJsonData.length - 1] = lastItem;
                  setJsonData(updatedJsonData);
                  setIsEditing(true);
                }}
                onObjectArrayClick={(fullPath, schema) => {
                  console.log('FormView onObjectArrayClick:', {
                    fullPath,
                    schema,
                    viewData: view.data,
                    viewPath: view.path,
                    index
                  });
                  
                  // Always get fresh data from jsonData to ensure consistency
                  const rootData = jsonData[jsonData.length - 1]?.data;
                  let dataAtPath: any = rootData;
                  
                  // Navigate from the root data using the full path
                  // If the root data has the same structure as the schema expects, navigate accordingly
                  for (const key of fullPath) {
                    dataAtPath = dataAtPath?.[key];
                  }
                  
                  console.log('Data to display:', dataAtPath);
                  
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
          </div>
        </div>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
