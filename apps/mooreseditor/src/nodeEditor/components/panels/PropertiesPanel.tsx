import { ScrollArea, Stack, Text } from "@mantine/core";

import { createRecordUpdater } from "../../utils/schemaAdapter";

import NoteProperties from "./NoteProperties";
import RecordProperties from "./RecordProperties";

import type { Column } from "../../../hooks/useJson";
import type { Schema } from "../../../libs/schema/types";
import type { SchemaMeta } from "../../utils/schemaMeta";
import type { Node as ReactFlowNode } from "@xyflow/react";

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
          {nodeType === "note" ? (
            <NoteProperties
              text={(selectedNode.data.text as string) || ""}
              onTextChange={(text) => {
                onNodeDataChange(selectedNode.id, { ...selectedNode.data, text });
                onMarkDirty();
              }}
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
  );
}
