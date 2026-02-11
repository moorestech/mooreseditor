import { useState } from "react";

import {
  ActionIcon,
  Menu,
  TextInput,
  Text,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import type { Column } from "../../../hooks/useJson";
import type { SchemaMeta } from "../../utils/schemaMeta";

interface AddNodeMenuProps {
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  onAddNode: (
    type: "item" | "block" | "research" | "note",
    masterGuid?: string,
    displayName?: string,
  ) => void;
}

export default function AddNodeMenu({
  jsonData,
  schemaMetas,
  onAddNode,
}: AddNodeMenuProps) {
  const [search, setSearch] = useState("");

  // Get records for a given schema type
  function getRecords(schemaId: string) {
    const meta = schemaMetas.get(schemaId);
    if (!meta?.guidField) return [];
    const col = jsonData.find((c) => c.title === schemaId);
    const arr = col?.data?.[meta.dataArrayPath];
    if (!Array.isArray(arr)) return [];
    return arr
      .map((r: any) => ({
        guid: r[meta.guidField!] as string,
        name: (meta.nameField ? r[meta.nameField] : r[meta.guidField!]) as string,
      }))
      .filter((r) => r.guid);
  }

  const nodeTypes = [
    { label: "Item", type: "item" as const, schemaId: "items" },
    { label: "Block", type: "block" as const, schemaId: "blocks" },
    { label: "Research", type: "research" as const, schemaId: "research" },
  ];

  return (
    <Menu shadow="md" width={280} position="bottom-start">
      <Menu.Target>
        <ActionIcon variant="filled" size="lg" color="blue">
          <IconPlus size={18} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <TextInput
          placeholder="Search records..."
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          size="xs"
          mb="xs"
        />
        <ScrollArea.Autosize mah={400}>
          {nodeTypes.map(({ label, type, schemaId }) => {
            const records = getRecords(schemaId).filter((r) =>
              search ? r.name?.toLowerCase().includes(search.toLowerCase()) : true,
            );
            if (records.length === 0 && search) return null;
            return (
              <div key={type}>
                <Menu.Label>{label}</Menu.Label>
                {records.length === 0 ? (
                  <Text size="xs" c="dimmed" px="sm">
                    No records
                  </Text>
                ) : (
                  <Stack gap={0}>
                    {records.map((r) => (
                      <Menu.Item
                        key={r.guid}
                        onClick={() => onAddNode(type, r.guid, r.name)}
                      >
                        <Text size="xs" truncate>
                          {r.name || r.guid.substring(0, 8)}
                        </Text>
                      </Menu.Item>
                    ))}
                  </Stack>
                )}
              </div>
            );
          })}
          <Menu.Divider />
          <Menu.Item onClick={() => onAddNode("note")}>
            <Text size="xs">Add Note</Text>
          </Menu.Item>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
