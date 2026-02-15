import { Stack, Text } from "@mantine/core";

import FormView from "../../../components/FormView";

import type { Column } from "../../../hooks/useJson";
import type { Schema } from "../../../libs/schema/types";
import type { SchemaMeta } from "../../utils/schemaMeta";


interface RecordPropertiesProps {
  schemaId: string;
  masterGuid: string;
  meta: SchemaMeta;
  jsonData: Column[];
  onRecordChange: (newRecordData: any) => void;
  onObjectArrayClick?: (path: string[], schema: Schema) => void;
}

export default function RecordProperties({
  schemaId,
  masterGuid,
  meta,
  jsonData,
  onRecordChange,
  onObjectArrayClick,
}: RecordPropertiesProps) {
  // Find the record in jsonData
  const col = jsonData.find((c) => c.title === schemaId);
  const dataArray = col?.data?.[meta.dataArrayPath];
  if (!Array.isArray(dataArray) || !meta.guidField) {
    return (
      <Text size="sm" c="dimmed">
        No data available
      </Text>
    );
  }

  const record = dataArray.find(
    (r: any) => r[meta.guidField!] === masterGuid,
  );
  if (!record) {
    return (
      <Text size="sm" c="dimmed">
        Record not found: {masterGuid.substring(0, 8)}...
      </Text>
    );
  }

  // Use the element schema for the form
  const elementSchema = meta.elementSchema;
  if (!elementSchema) {
    return (
      <Text size="sm" c="dimmed">
        No element schema
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      <Text size="sm" fw={600}>
        {schemaId}: {meta.nameField ? record[meta.nameField] : masterGuid.substring(0, 8)}
      </Text>
      <FormView
        schema={elementSchema as Schema}
        data={record}
        jsonData={jsonData}
        onDataChange={onRecordChange}
        onObjectArrayClick={onObjectArrayClick}
        autoOpenObjectArrays={false}
      />
    </Stack>
  );
}
