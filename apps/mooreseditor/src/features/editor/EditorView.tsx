/**
 * EditorView — prop-free, reads all state from Zustand stores.
 *
 * Replaces the old components/EditorView.tsx which received 11 props.
 * FormView and TableView still receive props (migrated in Phase 5).
 */

import { useEffect, useCallback } from "react";

import FormView from "../../components/FormView";
import { TableView } from "../../components/TableView";
import { updateColumnAtPath, getValueAtPath } from "../../domain/data/types";
import { useNestedViewScroll } from "../../hooks/useNestedViewScroll";
import { useDataStore } from "../../stores/dataStore";
import { useEditorStore } from "../../stores/editorStore";
import { useSchemaStore } from "../../stores/schemaStore";
import Sidebar from "./components/Sidebar";

import type { NestedView } from "../../stores/editorStore";
import type { JsonValue } from "../../domain/data/types";
import type { ArraySchema } from "../../domain/schema/types";

export default function EditorView() {
  const selectedSchema = useEditorStore((s) => s.selectedSchema);
  const nestedViews = useEditorStore((s) => s.nestedViews);
  const setNestedViews = useEditorStore((s) => s.setNestedViews);
  const columns = useDataStore((s) => s.columns);
  const markDirty = useDataStore((s) => s.markDirty);
  const schemas = useSchemaStore((s) => s.schemas);

  const { scrollContainerRef, openNestedView } = useNestedViewScroll(
    nestedViews,
    setNestedViews,
  );

  // Find the currently selected data from columns
  const currentData = columns.find((item) => item.title === selectedSchema);

  // Auto-initialize nested views when schema is selected
  useEffect(() => {
    if (
      selectedSchema &&
      schemas[selectedSchema] &&
      currentData &&
      nestedViews.length === 0
    ) {
      const schema = schemas[selectedSchema];
      const data = currentData.data;

      if ("type" in schema && schema.type === "array") {
        setNestedViews([{ type: "table", schema, data, path: [] }]);
      } else {
        setNestedViews([{ type: "form", schema, data, path: [] }]);
      }
    }
  }, [
    selectedSchema,
    schemas,
    currentData,
    nestedViews.length,
    setNestedViews,
  ]);

  /** Unified data change handler — replaces duplicated immutable-update logic. */
  const handleDataChange = useCallback(
    (view: NestedView, newData: JsonValue) => {
      if (!selectedSchema) return;

      const updatedColumns = updateColumnAtPath(
        useDataStore.getState().columns,
        selectedSchema,
        view.path,
        newData,
      );
      useDataStore.getState().setColumns(updatedColumns);
      markDirty();
    },
    [selectedSchema, markDirty],
  );

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
      <Sidebar />

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
                schema={view.schema as ArraySchema}
                jsonData={columns}
                data={(() => {
                  if (!currentData) return [];
                  if (view.path.length === 0)
                    return currentData.data as unknown[];
                  return (getValueAtPath(currentData.data, view.path) ??
                    []) as unknown[];
                })()}
                onDataChange={(newData) =>
                  handleDataChange(view, newData as JsonValue)
                }
                onRowSelect={(rowIndex) => {
                  if (!currentData) return;
                  const arraySchema = view.schema as ArraySchema;
                  const parentData =
                    view.path.length === 0
                      ? currentData.data
                      : getValueAtPath(currentData.data, view.path);
                  const selectedRowData = Array.isArray(parentData)
                    ? parentData[rowIndex]
                    : undefined;
                  if (selectedRowData && arraySchema.items?.type === "object") {
                    openNestedView(
                      index,
                      {
                        type: "form",
                        schema: arraySchema.items,
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
                jsonData={columns}
                data={(() => {
                  if (!currentData) return undefined;
                  if (view.path.length === 0) return currentData.data;
                  return getValueAtPath(currentData.data, view.path);
                })()}
                path={view.path}
                rootData={currentData?.data}
                onDataChange={(newData) =>
                  handleDataChange(view, newData as JsonValue)
                }
                onObjectArrayClick={(fullPath, schema) => {
                  const rootData = currentData?.data;
                  if (!rootData) return;
                  const dataAtPath = getValueAtPath(rootData, fullPath) ?? [];
                  openNestedView(index, {
                    type: "table",
                    schema,
                    data: dataAtPath,
                    path: fullPath,
                  });
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
