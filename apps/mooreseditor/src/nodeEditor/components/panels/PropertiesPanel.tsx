import { useCallback, useState } from "react";

import { ScrollArea, Stack, Text } from "@mantine/core";

import { createRecordUpdater } from "../../utils/schemaAdapter";
import ObjectArrayDialog from "../dialogs/ObjectArrayDialog";

import NoteProperties from "./NoteProperties";
import RecordProperties from "./RecordProperties";

import type { Column } from "../../../hooks/useJson";
import type { ArraySchema, Schema } from "../../../libs/schema/types";
import type { SchemaMeta } from "../../utils/schemaMeta";
import type { Node as ReactFlowNode } from "@xyflow/react";

interface ObjectArrayEditorState {
  path: string[];
  schema: ArraySchema;
  label: string;
  schemaId: string;
  masterGuid: string;
}

// Map node type to schema ID
const nodeTypeToSchemaId: Record<string, string> = {
  item: "items",
  block: "blocks",
  research: "research",
};

interface PropertiesPanelProps {
  selectedNode: ReactFlowNode | null;
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemas: Record<string, Schema>;
  schemaMetas: Map<string, SchemaMeta>;
  onMarkDirty: () => void;
  onNodeDataChange: (nodeId: string, data: Record<string, unknown>) => void;
}

export default function PropertiesPanel({
  selectedNode,
  jsonData,
  setJsonData,
  schemas,
  schemaMetas,
  onMarkDirty,
  onNodeDataChange,
}: PropertiesPanelProps) {
  const [objectArrayEditor, setObjectArrayEditor] =
    useState<ObjectArrayEditorState | null>(null);

  const handleObjectArrayClick = useCallback(
    (path: string[], schema: Schema, schemaId: string, masterGuid: string) => {
      if ("type" in schema && schema.type === "array") {
        const label = path[path.length - 1] || "items";
        setObjectArrayEditor({
          path,
          schema: schema as ArraySchema,
          label,
          schemaId,
          masterGuid,
        });
      }
    },
    [],
  );

  const handleObjectArrayClose = useCallback(() => {
    setObjectArrayEditor(null);
  }, []);

  const handleObjectArrayDataChange = useCallback(
    (newArrayData: any[]) => {
      if (!objectArrayEditor) return;
      const { schemaId, masterGuid, path } = objectArrayEditor;
      const meta = schemaMetas.get(schemaId);
      if (!meta?.guidField) return;

      setJsonData((prev) => {
        const colIndex = prev.findIndex((c) => c.title === schemaId);
        if (colIndex === -1) return prev;

        const col = prev[colIndex];
        const dataArray = col.data?.[meta.dataArrayPath];
        if (!Array.isArray(dataArray)) return prev;

        const recordIndex = dataArray.findIndex(
          (r: any) => r[meta.guidField!] === masterGuid,
        );
        if (recordIndex === -1) return prev;

        const updatedRecord = { ...dataArray[recordIndex] };
        // Navigate to the nested path within the record
        // path is like ["consumeItems"], we need to set this on the record
        let target: any = updatedRecord;
        for (let i = 0; i < path.length - 1; i++) {
          target[path[i]] = Array.isArray(target[path[i]])
            ? [...target[path[i]]]
            : { ...target[path[i]] };
          target = target[path[i]];
        }
        target[path[path.length - 1]] = newArrayData;

        const updatedArray = [...dataArray];
        updatedArray[recordIndex] = updatedRecord;

        const updatedCol = {
          ...col,
          data: { ...col.data, [meta.dataArrayPath]: updatedArray },
        };

        const result = [...prev];
        result[colIndex] = updatedCol;
        return result;
      });
      onMarkDirty();
    },
    [objectArrayEditor, schemaMetas, setJsonData, onMarkDirty],
  );

  // Get current array data for the dialog
  const getDialogData = (): any[] => {
    if (!objectArrayEditor) return [];
    const { schemaId, masterGuid, path } = objectArrayEditor;
    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField) return [];

    const col = jsonData.find((c) => c.title === schemaId);
    const dataArray = col?.data?.[meta.dataArrayPath];
    if (!Array.isArray(dataArray)) return [];

    const record = dataArray.find(
      (r: any) => r[meta.guidField!] === masterGuid,
    );
    if (!record) return [];

    let result: any = record;
    for (const key of path) {
      result = result?.[key];
    }
    return Array.isArray(result) ? result : [];
  };

  if (!selectedNode) {
    return (
      <div
        style={{
          width: 320,
          borderLeft: "1px solid #e0e0e0",
          padding: 16,
          background: "#fafafa",
          height: "100%",
        }}
      >
        <Text size="sm" c="dimmed">
          Select a node to view properties
        </Text>
      </div>
    );
  }

  const nodeType = selectedNode.type;

  return (
    <>
      <div
        style={{
          width: 320,
          borderLeft: "1px solid #e0e0e0",
          background: "#fafafa",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ScrollArea style={{ flex: 1 }}>
          <Stack gap="md" p="md">
            {nodeType === "note" || nodeType === "placeholder" ? (
              <NoteProperties
                text={(selectedNode.data.text as string) || ""}
                onTextChange={(text) => {
                  onNodeDataChange(selectedNode.id, {
                    ...selectedNode.data,
                    text,
                  });
                  onMarkDirty();
                }}
                label={nodeType === "placeholder" ? "Placeholder" : "Memo"}
              />
            ) : nodeType && nodeTypeToSchemaId[nodeType] ? (
              (() => {
                const schemaId = nodeTypeToSchemaId[nodeType];
                const meta = schemaMetas.get(schemaId);
                const schema = schemas[schemaId];
                if (!meta || !schema) {
                  return (
                    <Text size="sm" c="dimmed">
                      Schema not loaded for {schemaId}
                    </Text>
                  );
                }
                const masterGuid = selectedNode.data.masterGuid as string;
                const updater = createRecordUpdater(
                  meta,
                  masterGuid,
                  setJsonData,
                  onMarkDirty,
                );
                return (
                  <RecordProperties
                    schemaId={schemaId}
                    masterGuid={masterGuid}
                    meta={meta}
                    jsonData={jsonData}
                    onRecordChange={updater}
                    onObjectArrayClick={(path, arraySchema) => {
                      handleObjectArrayClick(
                        path,
                        arraySchema,
                        schemaId,
                        masterGuid,
                      );
                    }}
                  />
                );
              })()
            ) : (
              <Text size="sm" c="dimmed">
                Unknown node type: {nodeType}
              </Text>
            )}
          </Stack>
        </ScrollArea>
      </div>
      {objectArrayEditor && (
        <ObjectArrayDialog
          opened={true}
          onClose={handleObjectArrayClose}
          label={objectArrayEditor.label}
          schema={objectArrayEditor.schema}
          data={getDialogData()}
          jsonData={jsonData}
          onDataChange={handleObjectArrayDataChange}
        />
      )}
    </>
  );
}
