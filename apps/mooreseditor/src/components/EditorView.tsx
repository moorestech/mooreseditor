import { useState, useEffect } from "react";

import { useNestedViewScroll } from "../hooks/useNestedViewScroll";

import FormView from "./FormView";
import Sidebar from "./Sidebar";
import { TableView } from "./TableView";

import type { Column } from "../hooks/useJson";
import type { Schema } from "@mooreseditor/plugin-sdk";

type NestedView = {
  type: "form" | "table";
  schema: any;
  data: any;
  path: string[];
};

interface EditorViewProps {
  menuToFileMap: Record<string, string>;
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemas: Record<string, Schema>;
  loadSchema: (schemaName: string) => Promise<Schema | null>;
  loadJsonFile: (
    menuItem: string,
    columnIndex: number,
    schema: Schema | null,
  ) => Promise<void>;
  openProjectDir: () => void;
  isPreloading: boolean;
  isEditing: boolean;
  hasUnsavedChanges: boolean;
  onMarkDirty: () => void;
}

export default function EditorView({
  menuToFileMap,
  jsonData,
  setJsonData,
  schemas,
  loadSchema,
  loadJsonFile,
  openProjectDir,
  isPreloading,
  isEditing,
  hasUnsavedChanges,
  onMarkDirty,
}: EditorViewProps) {
  const [nestedViews, setNestedViews] = useState<NestedView[]>([]);
  const [selectedSchema, setSelectedSchema] = useState<string | null>(null);

  const { scrollContainerRef, openNestedView } = useNestedViewScroll(
    nestedViews,
    setNestedViews,
  );

  // Find the currently selected data from jsonData
  const currentData = jsonData.find((item) => item.title === selectedSchema);

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

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "calc(100vh - 48px)",
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
          const existingData = jsonData.find((item) => item.title === menuItem);
          if (existingData) {
            console.log(`${menuItem} is already loaded. Using cached data.`);
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
        hasUnsavedChanges={hasUnsavedChanges}
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
        ref={scrollContainerRef}
      >
        {nestedViews.map((view, index) => (
          <div
            key={index}
            style={{
              borderRight:
                index < nestedViews.length - 1 ? "1px solid #E2E2E2" : "none",
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
                  if (!currentData) {
                    return [];
                  }
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

                  const updatedItem = {
                    ...updatedJsonData[targetIndex],
                  };

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
                  onMarkDirty();
                }}
                onRowSelect={(rowIndex) => {
                  // Get data from currentData
                  let dataRef: any = currentData?.data;
                  for (const key of view.path) {
                    dataRef = dataRef?.[key];
                  }
                  const selectedRowData = dataRef?.[rowIndex];
                  if (selectedRowData && view.schema.items?.type === "object") {
                    openNestedView(
                      index,
                      {
                        type: "form",
                        schema: view.schema.items,
                        data: selectedRowData,
                        path: [...view.path, rowIndex.toString()],
                      },
                      { forceScroll: true },
                    );
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

                  const updatedItem = {
                    ...updatedJsonData[targetIndex],
                  };

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
                  onMarkDirty();
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

                  const nextView: NestedView = {
                    type: "table",
                    schema: schema,
                    data: dataAtPath || [],
                    path: fullPath,
                  };

                  openNestedView(index, nextView);
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
