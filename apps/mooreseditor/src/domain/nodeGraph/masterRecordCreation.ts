import { createInitialValue } from "../data/initialValue";

import type { SchemaMeta } from "./schemaMeta";
import { asJsonObject } from "../data/types";
import type { Column, JsonValue } from "../data/types";

type CreatableNodeType = "item" | "research";

interface CreateMasterRecordResult {
  updatedColumns: Column[];
  masterGuid: string;
  displayName: string;
}

const NODE_TYPE_TO_SCHEMA_ID: Record<CreatableNodeType, string> = {
  item: "items",
  research: "research",
};

const NODE_TYPE_TO_DEFAULT_NAME: Record<CreatableNodeType, string> = {
  item: "New Item",
  research: "New Research",
};

function getSchemaIdForNodeType(nodeType: CreatableNodeType): string {
  return NODE_TYPE_TO_SCHEMA_ID[nodeType];
}

function normalizeRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return { ...(value as Record<string, unknown>) };
  }
  return {};
}

function getUniqueName(baseName: string, existingNames: string[]): string {
  const used = new Set(existingNames);
  if (!used.has(baseName)) {
    return baseName;
  }

  let suffix = 2;
  while (used.has(`${baseName} ${suffix}`)) {
    suffix += 1;
  }
  return `${baseName} ${suffix}`;
}

function resolveSchemaMeta(
  nodeType: CreatableNodeType,
  schemaMetas: Map<string, SchemaMeta>,
): SchemaMeta | null {
  const schemaId = getSchemaIdForNodeType(nodeType);
  const schemaMeta = schemaMetas.get(schemaId);
  if (!schemaMeta?.elementSchema || !schemaMeta.guidField) {
    return null;
  }
  return schemaMeta;
}

export function canCreateMasterRecordForNode(
  nodeType: CreatableNodeType,
  columns: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): boolean {
  const schemaMeta = resolveSchemaMeta(nodeType, schemaMetas);
  if (!schemaMeta) return false;

  const schemaId = getSchemaIdForNodeType(nodeType);
  return columns.some((col) => col.title === schemaId);
}

export function createMasterRecordForNode(
  nodeType: CreatableNodeType,
  columns: Column[],
  schemaMetas: Map<string, SchemaMeta>,
): CreateMasterRecordResult | null {
  const schemaMeta = resolveSchemaMeta(nodeType, schemaMetas);
  if (!schemaMeta) return null;

  const schemaId = getSchemaIdForNodeType(nodeType);
  const columnIndex = columns.findIndex((col) => col.title === schemaId);
  if (columnIndex === -1) return null;

  const targetColumn = columns[columnIndex];
  const dataObj = asJsonObject(targetColumn.data);
  const existingValue = dataObj?.[schemaMeta.dataArrayPath];
  const existingRecords = Array.isArray(existingValue)
    ? [...existingValue]
    : [];

  const initialRecord = createInitialValue(
    schemaMeta.elementSchema,
    existingRecords,
    false,
  );
  const newRecord = normalizeRecord(initialRecord);

  const currentGuidValue = newRecord[schemaMeta.guidField];
  let masterGuid: string;
  if (
    typeof currentGuidValue === "string" &&
    currentGuidValue.trim().length > 0
  ) {
    masterGuid = currentGuidValue;
  } else {
    masterGuid = crypto.randomUUID();
    newRecord[schemaMeta.guidField] = masterGuid;
  }

  let displayName: string = masterGuid;
  if (schemaMeta.nameField) {
    const currentName = newRecord[schemaMeta.nameField];
    if (typeof currentName === "string" && currentName.trim().length > 0) {
      displayName = currentName;
    } else {
      const existingNames = existingRecords
        .map((record) => {
          if (!record || typeof record !== "object" || Array.isArray(record)) {
            return null;
          }
          const nameValue = (record as Record<string, unknown>)[
            schemaMeta.nameField
          ];
          return typeof nameValue === "string" && nameValue.trim().length > 0
            ? nameValue
            : null;
        })
        .filter((name): name is string => name !== null);

      const generatedName = getUniqueName(
        NODE_TYPE_TO_DEFAULT_NAME[nodeType],
        existingNames,
      );
      newRecord[schemaMeta.nameField] = generatedName;
      displayName = generatedName;
    }
  }

  const updatedColumns = [...columns];
  const currentData = asJsonObject(targetColumn.data) ?? {};

  updatedColumns[columnIndex] = {
    ...targetColumn,
    data: {
      ...currentData,
      [schemaMeta.dataArrayPath]: [...existingRecords, newRecord] as JsonValue,
    } as JsonValue,
  };

  return {
    updatedColumns,
    masterGuid,
    displayName,
  };
}
