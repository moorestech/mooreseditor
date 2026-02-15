import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconNote, IconTrash } from "@tabler/icons-react";

import AddNodeMenu from "./AddNodeMenu";

import type { Column } from "../../../hooks/useJson";
import type { SchemaMeta } from "../../utils/schemaMeta";

const ITEM_NODE_TYPES = [
  { label: "Item", type: "item" as const, schemaId: "items" },
  { label: "Block", type: "block" as const, schemaId: "blocks" },
];

const RESEARCH_NODE_TYPES = [
  { label: "Research", type: "research" as const, schemaId: "research" },
];

interface NodeToolbarProps {
  jsonData: Column[];
  schemaMetas: Map<string, SchemaMeta>;
  onAddNode: (
    type: "item" | "block" | "research" | "note",
    masterGuid?: string,
    displayName?: string,
  ) => void;
  onDeleteSelected: () => void;
  hasSelection: boolean;
  existingNodeGuids: Set<string>;
}

export default function NodeToolbar({
  jsonData,
  schemaMetas,
  onAddNode,
  onDeleteSelected,
  hasSelection,
  existingNodeGuids,
}: NodeToolbarProps) {
  return (
    <Group
      gap="xs"
      style={{
        position: "absolute",
        top: 10,
        left: 10,
        zIndex: 5,
        background: "rgba(255,255,255,0.9)",
        padding: "6px 10px",
        borderRadius: 8,
        boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
      }}
    >
      <AddNodeMenu
        jsonData={jsonData}
        schemaMetas={schemaMetas}
        onAddNode={onAddNode}
        nodeTypes={ITEM_NODE_TYPES}
        color="blue"
        tooltip="Add Item / Block"
        existingNodeGuids={existingNodeGuids}
      />
      <AddNodeMenu
        jsonData={jsonData}
        schemaMetas={schemaMetas}
        onAddNode={onAddNode}
        nodeTypes={RESEARCH_NODE_TYPES}
        color="cyan"
        tooltip="Add Research"
        existingNodeGuids={existingNodeGuids}
      />
      <Tooltip label="Add Memo">
        <ActionIcon
          variant="light"
          color="yellow"
          size="lg"
          aria-label="Add Memo"
          onClick={() => onAddNode("note")}
        >
          <IconNote size={18} />
        </ActionIcon>
      </Tooltip>
      <Tooltip label="Delete selected">
        <ActionIcon
          variant="light"
          color="red"
          size="lg"
          disabled={!hasSelection}
          onClick={onDeleteSelected}
        >
          <IconTrash size={18} />
        </ActionIcon>
      </Tooltip>
    </Group>
  );
}
