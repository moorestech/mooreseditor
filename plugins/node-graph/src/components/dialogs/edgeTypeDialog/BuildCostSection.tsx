import { Stack, Text } from "@mantine/core";
import { TableView } from "@moorestech/mooreseditor-plugin-sdk";

import { findSchemaIdForNodeType } from "../../../utils/nodeTypeSchema";
import { INPUT_KEY_RE } from "../../../utils/recipeEdgeConstants";

import type { SchemaMeta } from "../../../utils/schemaMeta";
import type { ArraySchema, Column } from "@moorestech/mooreseditor-plugin-sdk";
import type { Node as ReactFlowNode } from "@xyflow/react";

interface BuildCostSectionProps {
  targetNode: ReactFlowNode | null;
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemaMetas: Map<string, SchemaMeta>;
  onMarkDirty: () => void;
}

// ターゲットのマスタレコードとrequiredItems系配列プロパティを特定して直接編集する
// Locate the target's master record and edit its requiredItems-like arrays in place
export default function BuildCostSection({
  targetNode,
  jsonData,
  setJsonData,
  schemaMetas,
  onMarkDirty,
}: BuildCostSectionProps) {
  const schemaId = targetNode?.type
    ? findSchemaIdForNodeType(targetNode.type, schemaMetas)
    : null;
  const meta = schemaId ? schemaMetas.get(schemaId) : undefined;
  const masterGuid =
    typeof targetNode?.data?.masterGuid === "string"
      ? targetNode.data.masterGuid
      : null;

  const guidField = meta?.guidField;
  const dataArrayPath = meta?.dataArrayPath;
  const column = jsonData.find((c) => c.title === schemaId);
  const rows =
    dataArrayPath && Array.isArray(column?.data?.[dataArrayPath])
      ? (column.data[dataArrayPath] as Record<string, unknown>[])
      : null;
  const record =
    rows && guidField && masterGuid
      ? rows.find((r) => r && typeof r === "object" && r[guidField] === masterGuid)
      : undefined;

  const costProperties = (meta?.elementSchema?.properties ?? []).filter(
    (p) =>
      "type" in p &&
      p.type === "array" &&
      INPUT_KEY_RE.test(p.key) &&
      "items" in p &&
      !!p.items &&
      p.items.type === "object",
  );

  if (!record || !schemaId || !guidField || !dataArrayPath || costProperties.length === 0) {
    return (
      <Text size="xs" c="dimmed">
        Cost is derived from the target&apos;s requiredItems. Edit them in the
        Properties panel.
      </Text>
    );
  }

  const handleCostChange = (propertyKey: string, nextArray: unknown[]) => {
    setJsonData((prev) =>
      prev.map((c) =>
        c.title !== schemaId
          ? c
          : {
              ...c,
              data: {
                ...c.data,
                [dataArrayPath]: (
                  c.data[dataArrayPath] as Record<string, unknown>[]
                ).map((r) =>
                  r && typeof r === "object" && r[guidField] === masterGuid
                    ? { ...r, [propertyKey]: nextArray }
                    : r,
                ),
              },
            },
      ),
    );
    onMarkDirty();
  };

  return (
    <Stack gap="xs">
      <Text size="xs" c="dimmed">
        Edits the target&apos;s cost directly (shared by every build-cost edge
        of this target).
      </Text>
      {costProperties.map((property) => (
        <Stack key={property.key} gap={4}>
          <Text size="sm" fw={600}>
            {property.key}
          </Text>
          <TableView
            schema={property as unknown as ArraySchema}
            data={(record[property.key] as unknown[]) ?? []}
            jsonData={jsonData}
            onDataChange={(nextArray) =>
              handleCostChange(property.key, nextArray as unknown[])
            }
          />
        </Stack>
      ))}
    </Stack>
  );
}
