import { useState, useEffect } from "react";

import { AppShell, MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
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
  const { projectDir, schemaDir, masterDir, menuToFileMap, openProjectDir } =
    useProject();
  const { jsonData, setJsonData, loadJsonFile, preloadAllData, isPreloading } =
    useJson();
  const { schemas, loadSchema } = useSchema();

  const [nestedViews, setNestedViews] = useState<
    Array<{ type: "form" | "table"; schema: any; data: any; path: string[] }>
  >([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);

  // Find the currently selected data from jsonData
  const currentData = jsonData.find((item) => item.title === selectedSchema);

  // Preload all data when menuToFileMap changes (after File Open)
  useEffect(() => {
    preloadAllData(loadSchema);
  }, [menuToFileMap, projectDir, masterDir, schemaDir]);

  useEffect(() => {
    if (
      selectedSchema &&
      schemas[selectedSchema] &&
      currentData &&
      nestedViews.length === 0
    ) {
      const schema = schemas[selectedSchema];
      const data = currentData.data;

      // Check if the schema is an array type
      if ("type" in schema && schema.type === "array") {
        // For array schemas, show TableView directly
        setNestedViews([
          {
            type: "table",
            schema: schema,
            data: data,
            path: [],
          },
        ]);
      } else {
        // For object schemas, show FormView
        setNestedViews([
          {
            type: "form",
            schema: schema,
            data: data,
            path: [],
          },
        ]);
      }
    }
  }, [selectedSchema, schemas, currentData, nestedViews.length]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+S (Windows/Linux) or Cmd+S (Mac)
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault(); // Prevent browser's save dialog

        if (isEditing && jsonData.length > 0) {
          // Save the current jsonData
          handleSave(jsonData);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
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
        jsonData.forEach((column) => {
          console.log(
            `${column.title}:`,
            JSON.stringify({ data: column.data }, null, 2),
          );
        });
        setIsEditing(false);
        return;
      }

      // Save all loaded JSON files
      for (const column of jsonData) {
        try {
          // Build the JSON file path for each data column
          if (!masterDir) {
            console.error("Master directory is not set.");
            continue;
          }
          const jsonFilePath = await path.join(
            masterDir,
            `${column.title}.json`,
          );

          // Prepare the data in the original format
          const dataToSave = column.data;

          // Save to the JSON file
          await writeTextFile(
            jsonFilePath,
            JSON.stringify(dataToSave, null, 2),
          );
          console.log(`データが保存されました: ${jsonFilePath}`);
        } catch (columnError) {
          console.error(
            `${column.title}.json の保存中にエラーが発生しました:`,
            columnError,
          );
        }
      }

      setIsEditing(false);
    } catch (error) {
      console.error("保存中にエラーが発生しました:", error);
    }
  }

  return (
    <MantineProvider theme={theme}>
      <Notifications
        position="bottom-left"
        zIndex={2000}
        autoClose={4000}
        limit={5}
      />
      <AppShell header={{ height: 64 }} padding={0}>
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
            selectedFile={selectedSchema}
            isPreloading={isPreloading}
            loadFileData={async (menuItem) => {
              // Check if already loaded
              const existingData = jsonData.find(
                (item) => item.title === menuItem,
              );
              if (existingData) {
                console.log(
                  `${menuItem} is already loaded. Using cached data.`,
                );
                setSelectedSchema(menuItem);
                setNestedViews([]);
                return;
              }
              // Load schema first
              const loadedSchema = await loadSchema(menuItem);
              // Pass the loaded schema to loadJsonFile for auto-generation if needed
              await loadJsonFile(menuItem, jsonData.length, loadedSchema);
              setSelectedSchema(menuItem);
              setNestedViews([]);
            }}
            openProjectDir={openProjectDir}
            isEditing={isEditing}
            schemas={schemas}
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
                  borderRight:
                    index < nestedViews.length - 1
                      ? "1px solid #E2E2E2"
                      : "none",
                  padding: "16px",
                  width: "fit-content",
                  height: "100%",
                  overflowY: "auto",
                  flexShrink: 0,
                }}
              >
                {view.type === "table" ? (
                  <TableView
                    schema={view.schema}
                    jsonData={jsonData}
                    data={(() => {
                      // Get data from currentData
                      if (view.path.length === 0) {
                        return currentData?.data;
                      } else {
                        let dataRef: any = currentData?.data;
                        for (const key of view.path) {
                          dataRef = dataRef?.[key];
                        }
                        return dataRef;
                      }
                    })()}
                    onDataChange={(newData) => {
                      console.log("TableView onDataChange:", {
                        newData,
                        viewPath: view.path,
                      });
                      // Find and update the correct item in jsonData
                      const updatedJsonData = [...jsonData];
                      const targetIndex = updatedJsonData.findIndex(
                        (item) => item.title === selectedSchema,
                      );
                      if (targetIndex === -1) return;

                      const updatedItem = { ...updatedJsonData[targetIndex] };

                      if (view.path.length === 0) {
                        updatedItem.data = newData;
                      } else {
                        // Deep copy for nested data
                        updatedItem.data = { ...updatedItem.data };
                        let ref: any = updatedItem.data;

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

                      updatedJsonData[targetIndex] = updatedItem;
                      console.log("Setting new jsonData:", updatedJsonData);
                      setJsonData(updatedJsonData);
                      setIsEditing(true);
                    }}
                    onRowSelect={(rowIndex) => {
                      // Get data from currentData
                      let dataRef: any = currentData?.data;
                      for (const key of view.path) {
                        dataRef = dataRef?.[key];
                      }
                      const selectedRowData = dataRef?.[rowIndex];
                      if (
                        selectedRowData &&
                        view.schema.items?.type === "object"
                      ) {
                        setNestedViews((prev) => [
                          ...prev.slice(0, index + 1),
                          {
                            type: "form",
                            schema: view.schema.items,
                            data: selectedRowData,
                            path: [...view.path, rowIndex.toString()],
                          },
                        ]);
                      }
                    }}
                  />
                ) : (
                  <FormView
                    schema={view.schema}
                    jsonData={jsonData}
                    data={(() => {
                      // Get data from currentData
                      if (view.path.length === 0) {
                        return currentData?.data;
                      } else {
                        let dataRef: any = currentData?.data;
                        for (const key of view.path) {
                          dataRef = dataRef?.[key];
                        }
                        return dataRef;
                      }
                    })()}
                    path={view.path}
                    rootData={currentData?.data}
                    onDataChange={(newData) => {
                      // Find and update the correct item in jsonData
                      const updatedJsonData = [...jsonData];
                      const targetIndex = updatedJsonData.findIndex(
                        (item) => item.title === selectedSchema,
                      );
                      if (targetIndex === -1) return;

                      const updatedItem = { ...updatedJsonData[targetIndex] };

                      if (view.path.length === 0) {
                        // ルートレベルの場合、dataを直接置き換え
                        updatedItem.data = newData;
                      } else {
                        // ネストされたデータの更新
                        // イミュータブルに更新するために各レベルをコピー
                        updatedItem.data = { ...updatedItem.data };
                        let ref: any = updatedItem.data;

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

                      updatedJsonData[targetIndex] = updatedItem;
                      setJsonData(updatedJsonData);
                      setIsEditing(true);
                    }}
                    onObjectArrayClick={(fullPath, schema) => {
                      console.log("FormView onObjectArrayClick:", {
                        fullPath,
                        schema,
                        viewData: view.data,
                        viewPath: view.path,
                        index,
                      });

                      // Get fresh data from currentData
                      const rootData = currentData?.data;
                      let dataAtPath: any = rootData;

                      // Navigate from the root data using the full path
                      // If the root data has the same structure as the schema expects, navigate accordingly
                      for (const key of fullPath) {
                        dataAtPath = dataAtPath?.[key];
                      }

                      console.log("Data to display:", dataAtPath);

                      setNestedViews((prev) => [
                        ...prev.slice(0, index + 1),
                        {
                          type: "table",
                          schema: schema,
                          data: dataAtPath || [],
                          path: fullPath,
                        },
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
