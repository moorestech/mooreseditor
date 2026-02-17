import { useCallback, useEffect, useState } from "react";

import { Modal, Stack } from "@mantine/core";

import FormView from "../../../components/FormView";
import { TableView } from "../../../components/TableView";

import type { Column } from "../../../hooks/useJson";
import type { ArraySchema, Schema } from "../../../libs/schema/types";

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
  const [nestedArrayState, setNestedArrayState] = useState<{
    path: string[];
    schema: ArraySchema;
    label: string;
  } | null>(null);

  const handleClose = useCallback(() => {
    setSelectedRowIndex(null);
    setNestedArrayState(null);
    onClose();
  }, [onClose]);

  const handleRowSelect = useCallback((rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
  }, []);

  // Reset nested state when selected row changes
  useEffect(() => {
    setNestedArrayState(null);
  }, [selectedRowIndex]);

  const handleRowDataChange = useCallback(
    (newRowData: any) => {
      if (selectedRowIndex === null) return;
      const newData = [...data];
      newData[selectedRowIndex] = newRowData;
      onDataChange(newData);
    },
    [data, selectedRowIndex, onDataChange],
  );

  const handleNestedObjectArrayClick = useCallback(
    (path: string[], nestedSchema: Schema) => {
      if ("type" in nestedSchema && nestedSchema.type === "array") {
        setNestedArrayState({
          path,
          schema: nestedSchema as ArraySchema,
          label: path[path.length - 1] || "items",
        });
      }
    },
    [],
  );

  const getNestedData = useCallback((): any[] => {
    if (!nestedArrayState || selectedRowIndex === null) return [];
    const rowData = data[selectedRowIndex];
    let result: any = rowData;
    for (const key of nestedArrayState.path) {
      result = result?.[key];
    }
    return Array.isArray(result) ? result : [];
  }, [nestedArrayState, selectedRowIndex, data]);

  const handleNestedDataChange = useCallback(
    (newNestedData: any[]) => {
      if (!nestedArrayState || selectedRowIndex === null) return;
      const currentRowData = data[selectedRowIndex];
      const updatedRowData = { ...currentRowData };

      // Navigate to the nested path and update the value
      let target: any = updatedRowData;
      for (let i = 0; i < nestedArrayState.path.length - 1; i++) {
        const key = nestedArrayState.path[i];
        target[key] = Array.isArray(target[key])
          ? [...target[key]]
          : { ...target[key] };
        target = target[key];
      }
      target[nestedArrayState.path[nestedArrayState.path.length - 1]] =
        newNestedData;

      handleRowDataChange(updatedRowData);
    },
    [nestedArrayState, selectedRowIndex, data, handleRowDataChange],
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
      {nestedArrayState && (
        <ObjectArrayDialog
          opened={true}
          onClose={() => setNestedArrayState(null)}
          label={nestedArrayState.label}
          schema={nestedArrayState.schema}
          data={getNestedData()}
          jsonData={jsonData}
          onDataChange={handleNestedDataChange}
        />
      )}
    </>
  );
}
