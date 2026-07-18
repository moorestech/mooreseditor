import { Stack, Text } from "@mantine/core";
import { TableView } from "@moorestech/mooreseditor-plugin-sdk";

import { isBuildCostArrayProperty } from "../../../utils/buildCostEdgeLabels";
import { findSchemaIdForNodeType } from "../../../utils/nodeTypeSchema";

import type { CostSnapshot } from "./types";
import type { SchemaMeta } from "../../../utils/schemaMeta";
import type { ArraySchema, Column } from "@moorestech/mooreseditor-plugin-sdk";
import type { Node as ReactFlowNode } from "@xyflow/react";

interface BuildCostSectionProps {
  targetNode: ReactFlowNode | null;
  jsonData: Column[];
  setJsonData: React.Dispatch<React.SetStateAction<Column[]>>;
  schemaMetas: Map<string, SchemaMeta>;
  onMarkDirty: () => void;
  onRegisterCostSnapshot: (snapshot: CostSnapshot) => void;
}

// ターゲットのマスタレコードとrequiredItems系配列プロパティを特定して直接編集する
// Locate the target's master record and edit its requiredItems-like arrays in place
export default function BuildCostSection({
  targetNode,
  jsonData,
  setJsonData,
  schemaMetas,
  onMarkDirty,
  onRegisterCostSnapshot,
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

  // ラベル導出と同じ述語で対象プロパティを決め、表示と編集の乖離を防ぐ
  // Share the label-derivation predicate so display and editing never diverge
  const costProperties = (meta?.elementSchema?.properties ?? []).filter(
    isBuildCostArrayProperty,
  );

  if (
    !record ||
    !schemaId ||
    !guidField ||
    !dataArrayPath ||
    !masterGuid ||
    costProperties.length === 0
  ) {
    return (
      <Text size="xs" c="dimmed">
        Cost is derived from the target&apos;s requiredItems. Edit them in the
        Properties panel.
      </Text>
    );
  }

  const handleCostChange = (propertyKey: string, nextArray: unknown[]) => {
    // Cancel復元用に編集前の値を登録（同一プロパティは初回のみ保持される）
    // Register the pre-edit value for cancel restore (first edit wins per property)
    onRegisterCostSnapshot({
      schemaId,
      dataArrayPath,
      guidField,
      guid: masterGuid,
      propertyKey,
      original: record[propertyKey] ?? [],
    });
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
        Edits the target&apos;s cost (shared by every build-cost edge of this
        target). Cancel reverts edits made here.
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
