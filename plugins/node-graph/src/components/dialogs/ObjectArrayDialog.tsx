import { useCallback, useEffect, useState } from "react";

import { Modal, Stack } from "@mantine/core";
import { FormView, TableView } from "@moorestech/mooreseditor-plugin-sdk";

import type { Column, ArraySchema, Schema } from "@moorestech/mooreseditor-plugin-sdk";

interface NestedDialogState {
  label: string;
  schema: ArraySchema;
  path: string[];
}

interface ObjectArrayDialogProps {
  opened: boolean;
  onClose: () => void;
  label: string;
  schema: ArraySchema;
  data: any[];
  jsonData: Column[];
  onDataChange: (newData: any[]) => void;
}

export default function ObjectArrayDialog({
  opened,
  onClose,
  label,
  schema,
  data,
  jsonData,
  onDataChange,
}: ObjectArrayDialogProps) {
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [nestedDialog, setNestedDialog] = useState<NestedDialogState | null>(
    null,
  );

  const selectedRowIndex = selectedRow === null ? -1 : data.indexOf(selectedRow);

  useEffect(() => {
    if (selectedRow !== null && !data.includes(selectedRow)) {
      setSelectedRow(null);
      setNestedDialog(null);
    }
  }, [data, selectedRow]);

  const handleClose = useCallback(() => {
    setSelectedRow(null);
    setNestedDialog(null);
    onClose();
  }, [onClose]);

  const handleRowSelect = useCallback(
    (rowIndex: number) => {
      setSelectedRow(data[rowIndex] ?? null);
    },
    [data],
  );

  const handleRowDataChange = useCallback(
    (newRowData: any) => {
      const currentIndex = selectedRow === null ? -1 : data.indexOf(selectedRow);
      if (currentIndex === -1) {
        setSelectedRow(null);
        return;
      }
      const newData = [...data];
      newData[currentIndex] = newRowData;
      setSelectedRow(newRowData);
      onDataChange(newData);
    },
    [data, selectedRow, onDataChange],
  );

  // Handler for nested object array clicks within the FormView
  const handleNestedObjectArrayClick = useCallback(
    (path: string[], nestedSchema: Schema) => {
      if (
        "type" in nestedSchema &&
        nestedSchema.type === "array" &&
        "items" in nestedSchema
      ) {
        const fieldLabel = path[path.length - 1] || "items";
        setNestedDialog({
          label: fieldLabel,
          schema: nestedSchema as ArraySchema,
          path,
        });
      }
    },
    [],
  );

  // Get nested data from the selected row using the nested dialog path
  const getNestedData = useCallback((): any[] => {
    const currentIndex = selectedRow === null ? -1 : data.indexOf(selectedRow);
    if (currentIndex === -1 || !nestedDialog) return [];
    let current: any = data[currentIndex];
    for (const key of nestedDialog.path) {
      if (current == null) return [];
      current = current[key];
    }
    return Array.isArray(current) ? current : [];
  }, [data, selectedRow, nestedDialog]);

  // Handle data changes in the nested dialog
  const handleNestedDataChange = useCallback(
    (newNestedData: any[]) => {
      const currentIndex = selectedRow === null ? -1 : data.indexOf(selectedRow);
      if (currentIndex === -1 || !nestedDialog) {
        setSelectedRow(null);
        return;
      }
      const rowData = { ...data[currentIndex] };
      // Navigate to the parent and set the data at the last key
      let current: any = rowData;
      const pathKeys = nestedDialog.path;
      for (let i = 0; i < pathKeys.length - 1; i++) {
        if (current[pathKeys[i]] == null) {
          current[pathKeys[i]] = {};
        } else {
          current[pathKeys[i]] = { ...current[pathKeys[i]] };
        }
        current = current[pathKeys[i]];
      }
      current[pathKeys[pathKeys.length - 1]] = newNestedData;

      const newData = [...data];
      newData[currentIndex] = rowData;
      setSelectedRow(rowData);
      onDataChange(newData);
    },
    [data, selectedRow, nestedDialog, onDataChange],
  );

  const hasItemSchema =
    schema.items && "type" in schema.items && schema.items.type === "object";

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={`Edit ${label}`}
        size="xl"
        centered
      >
        <Stack gap="md">
          <TableView
            schema={schema}
            data={data || []}
            jsonData={jsonData}
            onDataChange={onDataChange}
            onRowSelect={hasItemSchema ? handleRowSelect : undefined}
          />
          {selectedRowIndex !== -1 &&
            hasItemSchema &&
            data?.[selectedRowIndex] && (
              <div
                style={{
                  borderTop: "1px solid #e0e0e0",
                  paddingTop: 16,
                }}
              >
                <FormView
                  schema={schema.items as Schema}
                  data={data[selectedRowIndex]}
                  jsonData={jsonData}
                  onDataChange={handleRowDataChange}
                  onObjectArrayClick={handleNestedObjectArrayClick}
                  autoOpenObjectArrays={false}
                />
              </div>
            )}
        </Stack>
      </Modal>
      {nestedDialog && (
        <ObjectArrayDialog
          opened={nestedDialog !== null}
          onClose={() => setNestedDialog(null)}
          label={nestedDialog.label}
          schema={nestedDialog.schema}
          data={getNestedData()}
          jsonData={jsonData}
          onDataChange={handleNestedDataChange}
        />
      )}
    </>
  );
}
