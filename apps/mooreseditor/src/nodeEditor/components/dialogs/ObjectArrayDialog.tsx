import { useCallback, useState } from "react";

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

  const handleClose = useCallback(() => {
    setSelectedRowIndex(null);
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

  const hasItemSchema =
    schema.items && "type" in schema.items && schema.items.type === "object";

  return (
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
        {selectedRowIndex !== null && hasItemSchema && data?.[selectedRowIndex] && (
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
              autoOpenObjectArrays={false}
            />
          </div>
        )}
      </Stack>
    </Modal>
  );
}
