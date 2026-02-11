import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";

import AddNodeMenu from "./AddNodeMenu";

import type { Column } from "../../../hooks/useJson";
import type { SchemaMeta } from "../../utils/schemaMeta";


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
}

export default function NodeToolbar({
  jsonData,
  schemaMetas,
  onAddNode,
  onDeleteSelected,
  hasSelection,
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
      />
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
