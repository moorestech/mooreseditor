import { useCallback, useState } from "react";

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
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
  const [nestedDialog, setNestedDialog] = useState<NestedDialogState | null>(
    null,
  );

  const handleClose = useCallback(() => {
    setSelectedRowIndex(null);
    setNestedDialog(null);
    onClose();
  }, [onClose]);

  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
  }, []);

  const handleRowDataChange = useCallback(
    (newRowData: any) => {
      if (selectedRowIndex === null) return;
      const newData = [...data];
      newData[selectedRowIndex] = newRowData;
      onDataChange(newData);
    },
    [data, selectedRowIndex, onDataChange],
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
    if (selectedRowIndex === null || !nestedDialog) return [];
    let current: any = data[selectedRowIndex];
    for (const key of nestedDialog.path) {
      if (current == null) return [];
      current = current[key];
    }
    return Array.isArray(current) ? current : [];
  }, [data, selectedRowIndex, nestedDialog]);

  // Handle data changes in the nested dialog
  const handleNestedDataChange = useCallback(
    (newNestedData: any[]) => {
      if (selectedRowIndex === null || !nestedDialog) return;
      const rowData = { ...data[selectedRowIndex] };
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
      newData[selectedRowIndex] = rowData;
      onDataChange(newData);
    },
    [data, selectedRowIndex, nestedDialog, onDataChange],
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
          {selectedRowIndex !== null &&
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
