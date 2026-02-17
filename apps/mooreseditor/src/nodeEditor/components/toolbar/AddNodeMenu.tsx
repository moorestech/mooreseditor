import { useState } from "react";

import {
  ActionIcon,
  Menu,
  TextInput,
  Text,
  ScrollArea,
  Stack,
  Tooltip,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

import { getRecords } from "../../utils/recordLookup";

import type { Column } from "../../../hooks/useJson";
import type { SchemaMeta } from "../../utils/schemaMeta";

type NodeType = "item" | "block" | "research" | "note";

interface NodeTypeEntry {
  label: string;
  type: NodeType;
  schemaId: string;
}

const FILTERABLE_TYPES: ReadonlySet<string> = new Set(["item", "research"]);

interface AddNodeMenuProps {
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  onAddNode: (
    type: NodeType,
    masterGuid?: string,
    displayName?: string,
  ) => void;
  nodeTypes: NodeTypeEntry[];
  color: string;
  tooltip: string;
  showNoteOption?: boolean;
  existingNodeGuids: Set<string>;
}

export default function AddNodeMenu({
  jsonData,
  schemaMetas,
  onAddNode,
  nodeTypes,
  color,
  tooltip,
  showNoteOption = false,
  existingNodeGuids,
}: AddNodeMenuProps) {
  const [search, setSearch] = useState("");

  return (
    <Menu shadow="md" width={280} position="bottom-start">
      <Menu.Target>
        <Tooltip label={tooltip}>
          <ActionIcon variant="filled" size="lg" color={color}>
            <IconPlus size={18} />
          </ActionIcon>
        </Tooltip>
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
            const records = getRecords(schemaId, jsonData, schemaMetas).filter(
              (r) => {
                if (FILTERABLE_TYPES.has(type) && existingNodeGuids.has(r.guid))
                  return false;
                if (
                  search &&
                  !r.name?.toLowerCase().includes(search.toLowerCase())
                )
                  return false;
                return true;
              },
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
          {showNoteOption && (
            <>
              <Menu.Divider />
              <Menu.Item onClick={() => onAddNode("note")}>
                <Text size="xs">Add Memo</Text>
              </Menu.Item>
            </>
          )}
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
